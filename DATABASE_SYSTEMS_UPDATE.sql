-- =====================================================
-- AVERO TECHNOLOGY — SISTEMAS SaaS, PRUEBA GRATIS Y SOLO LECTURA (FASE 3)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_CATALOG_UPDATE.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Cómo deshacer el modo solo lectura si algo sale mal:
--   ejecutar la sección "DESHACER" al final de este archivo.
-- =====================================================


-- ─── 1. AJUSTES DE LA PLATAFORMA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Días de prueba gratis para cada negocio nuevo (editable desde /admin).
INSERT INTO public.platform_settings (key, value) VALUES ('trial_days', '14'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
$$;

DROP POLICY IF EXISTS "Cualquiera ve los días de prueba" ON public.platform_settings;
CREATE POLICY "Cualquiera ve los días de prueba"
  ON public.platform_settings FOR SELECT
  USING (key = 'trial_days');

DROP POLICY IF EXISTS "Administradores gestionan los ajustes" ON public.platform_settings;
CREATE POLICY "Administradores gestionan los ajustes"
  ON public.platform_settings FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());


-- ─── 2. CATÁLOGO DE SISTEMAS ─────────────────────────────────────────
-- Cada fila es un software que Avero vende. Agregar un sistema nuevo es
-- insertar una fila (o crearlo desde /admin), sin tocar código.
CREATE TABLE IF NOT EXISTS public.systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  audience TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(features) = 'array'),
  plans JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(plans) = 'array'),
  status TEXT NOT NULL DEFAULT 'proximamente' CHECK (status IN ('disponible', 'proximamente')),
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquiera ve los sistemas publicados" ON public.systems;
CREATE POLICY "Cualquiera ve los sistemas publicados"
  ON public.systems FOR SELECT
  USING (published = true OR public.is_platform_admin());

DROP POLICY IF EXISTS "Administradores gestionan los sistemas" ON public.systems;
CREATE POLICY "Administradores gestionan los sistemas"
  ON public.systems FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Primer sistema: el de gestión que ya existe. Solo se inserta si no está,
-- para no pisar cambios hechos después desde /admin.
INSERT INTO public.systems (slug, name, tagline, description, audience, features, plans, status, published, sort_order)
VALUES (
  'gestion',
  'Sistema de gestión',
  'Inventario, ventas a crédito, facturas y tu catálogo en línea, en un solo lugar.',
  'Deja la libreta y el Excel. Controla lo que tienes, lo que vendes, lo que te deben y lo que gastas, desde el navegador del celular o la computadora, sin instalar nada.',
  'Colmados, tiendas de celulares y accesorios, ferreterías, boutiques y pequeños negocios en República Dominicana.',
  '[
    {"icon": "package", "title": "Inventario", "description": "Productos, precios y existencias. El stock baja solo cuando facturas."},
    {"icon": "credit-card", "title": "Ventas a crédito", "description": "Sabe cuánto te debe cada cliente y registra cada abono."},
    {"icon": "file-text", "title": "Facturas y cotizaciones", "description": "En PDF, con ITBIS y RNC, listas para enviar por WhatsApp."},
    {"icon": "store", "title": "Tu catálogo en línea", "description": "Un link con tus productos para mandarle a tus clientes."},
    {"icon": "receipt", "title": "Gastos", "description": "Registra en qué se va el dinero del negocio."},
    {"icon": "bar-chart", "title": "Reportes", "description": "Ingresos, gastos y ganancia de cada mes."},
    {"icon": "users", "title": "Clientes", "description": "Contactos e historial de compras de cada cliente."},
    {"icon": "ticket", "title": "Tickets de soporte", "description": "Da seguimiento a reparaciones y solicitudes de tus clientes."}
  ]'::jsonb,
  '[
    {"id": "profesional", "name": "Plan Profesional", "monthly_usd": 15, "annual_usd": 150,
     "description": "Todo lo que necesitas para administrar tu negocio",
     "features": ["Inventario con control de stock", "Ventas a crédito y cobros", "Facturas y cotizaciones con ITBIS", "Catálogo en línea para tus clientes", "Clientes, gastos y reportes", "Tickets de soporte", "Acceso desde el celular o la computadora"]}
  ]'::jsonb,
  'disponible',
  true,
  0
)
ON CONFLICT (slug) DO NOTHING;


-- ─── 3. SUSCRIPCIONES POR SISTEMA ────────────────────────────────────
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS system_id UUID REFERENCES public.systems(id) ON DELETE RESTRICT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.subscriptions
SET system_id = (SELECT id FROM public.systems WHERE slug = 'gestion')
WHERE system_id IS NULL;

ALTER TABLE public.subscriptions ALTER COLUMN system_id SET NOT NULL;

-- Una suscripción por negocio y por sistema (antes era una por negocio).
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_system_unique ON public.subscriptions (user_id, system_id);

-- Nuevo estado "trialing" (en prueba) y plan "courtesy" (cortesía).
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('trialing', 'active', 'inactive', 'past_due', 'canceled'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_id_check
  CHECK (plan_id IN ('monthly', 'annual', 'trial', 'courtesy'));

-- Cuentas que ya existen: suscripción activa de cortesía SIN vencimiento
-- (current_period_end NULL), para que nadie pierda acceso con este cambio.
INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, notes)
SELECT u.id, s.id, 'courtesy', 'active', NULL, 'Cortesía: cuenta existente antes de la Fase 3'
FROM auth.users u
CROSS JOIN public.systems s
WHERE s.slug = 'gestion'
  AND NOT EXISTS (
    SELECT 1 FROM public.subscriptions x WHERE x.user_id = u.id AND x.system_id = s.id
  );


-- ─── 4. PRUEBA GRATIS AUTOMÁTICA PARA CUENTAS NUEVAS ─────────────────
-- Trigger aparte del que crea el perfil, para no tocar ese.
CREATE OR REPLACE FUNCTION public.start_trial_for_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  days INTEGER;
BEGIN
  SELECT COALESCE((value #>> '{}')::integer, 14) INTO days FROM public.platform_settings WHERE key = 'trial_days';
  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, notes)
  SELECT NEW.id, s.id, 'trial', 'trialing', now() + make_interval(days => COALESCE(days, 14)), 'Prueba gratis'
  FROM public.systems s
  WHERE s.slug = 'gestion'
  ON CONFLICT (user_id, system_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.start_trial_for_new_user();


-- ─── 5. ¿PUEDE ESCRIBIR ESTE NEGOCIO? ────────────────────────────────
-- true si la suscripción al sistema de gestión está activa o en prueba y
-- no ha vencido. Si el negocio no tiene fila de suscripción, se permite
-- (falla abierto) para no bloquear a nadie por un dato faltante.
CREATE OR REPLACE FUNCTION public.account_has_access(account UUID)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (
      SELECT x.status IN ('active', 'trialing')
             AND (x.current_period_end IS NULL OR x.current_period_end > now())
      FROM public.subscriptions x
      JOIN public.systems s ON s.id = x.system_id
      WHERE x.user_id = account AND s.slug = 'gestion'
      LIMIT 1
    ),
    true
  )
$$;

CREATE OR REPLACE FUNCTION public.has_write_access()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_platform_admin() OR public.account_has_access(auth.uid())
$$;


-- ─── 6. MODO SOLO LECTURA ────────────────────────────────────────────
-- Políticas RESTRICTIVAS: se suman a las que ya existen (no las cambian).
-- Con la suscripción vencida el negocio sigue VIENDO todos sus datos,
-- pero no puede crear, editar ni borrar. Nada se borra.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers', 'products', 'product_images', 'invoices', 'invoice_items', 'payments',
    'quotes', 'quote_items', 'expenses', 'financing_payments', 'tickets', 'ticket_messages'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabla % no existe, se omite', t;
      CONTINUE;
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (insert)" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (update)" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (delete)" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Solo lectura sin suscripción (insert)" ON public.%I AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.has_write_access())', t);
    EXECUTE format('CREATE POLICY "Solo lectura sin suscripción (update)" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.has_write_access()) WITH CHECK (public.has_write_access())', t);
    EXECUTE format('CREATE POLICY "Solo lectura sin suscripción (delete)" ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (public.has_write_access())', t);
  END LOOP;
END;
$$;


-- Las fotos de productos tampoco se pueden subir en modo solo lectura.
DROP POLICY IF EXISTS "Subir fotos a la carpeta propia" ON storage.objects;
CREATE POLICY "Subir fotos a la carpeta propia"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.has_write_access()
  );


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';


-- =====================================================
-- DESHACER EL MODO SOLO LECTURA (solo si hace falta; no se ejecuta solo)
-- Copia y ejecuta este bloque sin los "--" para quitar el bloqueo:
--
-- DO $$
-- DECLARE t TEXT;
-- BEGIN
--   FOREACH t IN ARRAY ARRAY['customers','products','product_images','invoices','invoice_items','payments','quotes','quote_items','expenses','financing_payments','tickets','ticket_messages']
--   LOOP
--     IF to_regclass('public.' || t) IS NOT NULL THEN
--       EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (insert)" ON public.%I', t);
--       EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (update)" ON public.%I', t);
--       EXECUTE format('DROP POLICY IF EXISTS "Solo lectura sin suscripción (delete)" ON public.%I', t);
--     END IF;
--   END LOOP;
-- END $$;
-- =====================================================
