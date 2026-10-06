-- =====================================================
-- AVERO TECHNOLOGY — PANEL DE PLATAFORMA /admin (FASE 5)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_TENANT_STORES.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Todas las funciones de este archivo verifican primero que quien las
-- llama esté en platform_admins. La app las usa con la sesión normal del
-- administrador: no hace falta la clave secreta en el servidor.
-- =====================================================


-- ─── 1. PAGOS DE SUSCRIPCIONES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'DOP')),
  method TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  months INTEGER NOT NULL CHECK (months BETWEEN 1 AND 36),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscription_payments_user ON public.subscription_payments (user_id, created_at DESC);

ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cada negocio ve sus pagos" ON public.subscription_payments;
CREATE POLICY "Cada negocio ve sus pagos"
  ON public.subscription_payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_platform_admin());


-- ─── 2. LISTA DE NEGOCIOS (solo administradores) ─────────────────────
CREATE OR REPLACE FUNCTION public.admin_list_accounts()
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
  last_payment_at TIMESTAMP WITH TIME ZONE
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
    (SELECT max(sp.created_at) FROM public.subscription_payments sp WHERE sp.user_id = u.id)
  FROM auth.users u
  LEFT JOIN public.profiles pr ON pr.id = u.id
  LEFT JOIN public.subscriptions s
    ON s.user_id = u.id AND s.system_id = (SELECT sy.id FROM public.systems sy WHERE sy.slug = 'gestion')
  ORDER BY u.created_at DESC;
END;
$$;


-- ─── 3. REGISTRAR UN PAGO Y EXTENDER LA SUSCRIPCIÓN ──────────────────
-- Si la suscripción sigue vigente, los meses se suman al final del
-- período actual; si ya venció, empiezan a contar desde hoy.
CREATE OR REPLACE FUNCTION public.admin_record_payment(
  account UUID,
  months INTEGER,
  plan TEXT,
  amount NUMERIC,
  currency TEXT,
  method TEXT,
  reference TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_variable
DECLARE
  sys UUID;
  sub public.subscriptions%ROWTYPE;
  starts TIMESTAMP WITH TIME ZONE;
  ends TIMESTAMP WITH TIME ZONE;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Solo administradores de plataforma' USING ERRCODE = '42501';
  END IF;
  IF months IS NULL OR months < 1 OR months > 36 THEN
    RAISE EXCEPTION 'Los meses deben estar entre 1 y 36';
  END IF;
  IF plan NOT IN ('monthly', 'annual', 'courtesy') THEN
    RAISE EXCEPTION 'Plan inválido';
  END IF;

  SELECT id INTO sys FROM public.systems WHERE slug = 'gestion';

  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end)
  VALUES (account, sys, plan, 'inactive', NULL)
  ON CONFLICT (user_id, system_id) DO NOTHING;

  SELECT * INTO sub FROM public.subscriptions WHERE user_id = account AND system_id = sys FOR UPDATE;

  starts := CASE
    WHEN sub.status IN ('active', 'trialing') AND sub.current_period_end > now() AND sub.plan_id <> 'trial'
      THEN sub.current_period_end
    ELSE now()
  END;
  ends := starts + make_interval(months => months);

  UPDATE public.subscriptions
  SET status = 'active', plan_id = plan, current_period_end = ends, updated_at = now()
  WHERE id = sub.id;

  INSERT INTO public.subscription_payments
    (subscription_id, user_id, amount, currency, method, reference, notes, months, period_start, period_end, recorded_by)
  VALUES
    (sub.id, account, amount, currency, method, NULLIF(reference, ''), NULLIF(notes, ''), months, starts, ends, auth.uid());

  RETURN ends;
END;
$$;


-- ─── 4. CAMBIAR EL ESTADO (suspender / reactivar / cortesía) ─────────
CREATE OR REPLACE FUNCTION public.admin_set_subscription(
  account UUID,
  new_status TEXT,
  new_plan TEXT DEFAULT NULL,
  new_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  keep_end BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
#variable_conflict use_column
DECLARE
  sys UUID;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Solo administradores de plataforma' USING ERRCODE = '42501';
  END IF;
  IF new_status NOT IN ('trialing', 'active', 'inactive', 'past_due', 'canceled') THEN
    RAISE EXCEPTION 'Estado inválido';
  END IF;

  SELECT id INTO sys FROM public.systems WHERE slug = 'gestion';

  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end)
  VALUES (account, sys, COALESCE(new_plan, 'courtesy'), new_status, new_end)
  ON CONFLICT (user_id, system_id) DO UPDATE
  SET status = EXCLUDED.status,
      plan_id = COALESCE(new_plan, public.subscriptions.plan_id),
      current_period_end = CASE WHEN keep_end THEN public.subscriptions.current_period_end ELSE new_end END,
      updated_at = now();
END;
$$;


-- ─── 5. PERMISOS DE EJECUCIÓN ────────────────────────────────────────
REVOKE ALL ON FUNCTION public.admin_list_accounts() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_record_payment(UUID, INTEGER, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_subscription(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_record_payment(UUID, INTEGER, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_subscription(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, BOOLEAN) TO authenticated;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
