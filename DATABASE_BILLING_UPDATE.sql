-- =====================================================
-- AVERO TECHNOLOGY — COBRO AUTOMÁTICO CON PAYPAL
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_SUPPORT_UPDATE.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Qué cambia:
-- * Las cuentas NUEVAS quedan "pendientes" (incomplete) hasta que autorizan
--   el pago automático en PayPal (cuenta PayPal o tarjeta); ahí empieza la
--   prueba gratis y al terminar se cobra solo. Sin tarjeta, la cuenta no puede escribir (y la app la
--   bloquea por completo).
-- * Las cuentas que ya existen NO cambian (cortesía, pagos manuales, etc.).
-- * Un cobro fallido (past_due) mantiene el acceso mientras PayPal
--   reintenta; una suscripción cancelada lo mantiene hasta el final del
--   período pagado.
-- =====================================================


-- ─── 1. DATOS DEL PROCESADOR EN LA SUSCRIPCIÓN ───────────────────────
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS external_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS external_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS external_variant_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS external_status TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS card_brand TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS card_last_four TEXT;
-- Fecha real del próximo cobro según el procesador (la de acceso lleva un margen).
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMP WITH TIME ZONE;
-- Cuándo se le avisó por correo que su prueba gratis está por terminar.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_provider_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_provider_check CHECK (provider IN ('manual', 'paypal'));

-- Índices únicos completos (no parciales): PostgREST los necesita para los
-- upsert con on_conflict. Varios NULL siguen permitidos.
DROP INDEX IF EXISTS public.subscriptions_external_id_unique;
CREATE UNIQUE INDEX subscriptions_external_id_unique
  ON public.subscriptions (provider, external_subscription_id);

-- Nuevo estado: "incomplete" = cuenta creada que todavía no puso su tarjeta.
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('incomplete', 'trialing', 'active', 'inactive', 'past_due', 'canceled'));


-- ─── 2. PAGOS AUTOMÁTICOS EN EL HISTORIAL ────────────────────────────
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS external_id TEXT;

DROP INDEX IF EXISTS public.subscription_payments_external_unique;
CREATE UNIQUE INDEX subscription_payments_external_unique
  ON public.subscription_payments (provider, external_id);


-- ─── 3. REGISTRO DE AVISOS (WEBHOOKS) DEL PROCESADOR ─────────────────
-- Sirve para auditar qué mandó PayPal y depurar problemas. Solo lo
-- escribe el servidor (clave secreta); solo lo leen los administradores.
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  event_name TEXT NOT NULL,
  external_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_mode BOOLEAN NOT NULL DEFAULT false,
  payload JSONB NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_billing_events_created ON public.billing_events (created_at DESC);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Administradores ven los avisos de pago" ON public.billing_events;
CREATE POLICY "Administradores ven los avisos de pago"
  ON public.billing_events FOR SELECT
  USING (public.is_platform_admin());


-- ─── 4. ¿QUIÉN TIENE ACCESO? ─────────────────────────────────────────
-- past_due y canceled conservan el acceso mientras la fecha de fin no pase
-- (la app la pone en el fin del período pagado, o en el plazo de
-- reintentos de cobro).
CREATE OR REPLACE FUNCTION public.account_has_access(account UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (
      SELECT x.status IN ('active', 'trialing', 'past_due', 'canceled')
             AND (x.current_period_end IS NULL OR x.current_period_end > now())
      FROM public.subscriptions x
      JOIN public.systems s ON s.id = x.system_id
      WHERE x.user_id = account AND s.slug = 'gestion'
      LIMIT 1
    ),
    true
  )
$$;


-- ─── 5. CUENTAS NUEVAS: PENDIENTES HASTA PONER LA TARJETA ────────────
CREATE OR REPLACE FUNCTION public.start_trial_for_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, notes)
  SELECT NEW.id, s.id, 'trial', 'incomplete', NULL, 'Pendiente: debe poner su tarjeta para empezar la prueba'
  FROM public.systems s
  WHERE s.slug = 'gestion'
  ON CONFLICT (user_id, system_id) DO NOTHING;
  RETURN NEW;
END;
$$;


-- ─── 6. LISTA DE NEGOCIOS PARA /admin CON DATOS DEL COBRO ────────────
DROP FUNCTION IF EXISTS public.admin_list_accounts();
CREATE FUNCTION public.admin_list_accounts()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  business_name TEXT,
  slug TEXT,
  store_enabled BOOLEAN,
  signed_up_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  subscription_id UUID,
  status TEXT,
  plan_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  has_access BOOLEAN,
  products INTEGER,
  public_products INTEGER,
  last_payment_at TIMESTAMP WITH TIME ZONE,
  provider TEXT,
  card_brand TEXT,
  card_last_four TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Solo administradores de plataforma' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    pr.business_name,
    pr.slug,
    COALESCE(pr.store_enabled, false),
    u.created_at,
    u.last_sign_in_at,
    s.id,
    s.status,
    s.plan_id,
    s.current_period_end,
    public.account_has_access(u.id),
    (SELECT count(*)::INTEGER FROM public.products p WHERE p.user_id = u.id),
    (SELECT count(*)::INTEGER FROM public.products p WHERE p.user_id = u.id AND p.is_public),
    (SELECT max(sp.created_at) FROM public.subscription_payments sp WHERE sp.user_id = u.id),
    s.provider,
    s.card_brand,
    s.card_last_four,
    s.trial_ends_at
  FROM auth.users u
  LEFT JOIN public.profiles pr ON pr.id = u.id
  LEFT JOIN public.subscriptions s
    ON s.user_id = u.id AND s.system_id = (SELECT sy.id FROM public.systems sy WHERE sy.slug = 'gestion')
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts() TO authenticated;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
