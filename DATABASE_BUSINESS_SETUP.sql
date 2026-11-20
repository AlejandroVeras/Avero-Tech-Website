-- ============================================================================
-- AVERO INVENTARIO — TIPO DE NEGOCIO Y VENTA RÁPIDA (noviembre 2026)
-- ----------------------------------------------------------------------------
-- * Cada negocio guarda qué tipo de negocio es y cómo vende. Con eso el sistema
--   muestra u oculta opciones (Vender, Cotizaciones, Clientes).
-- * Las cuentas que ya existen quedan marcadas como configuradas, así no ven la
--   pantalla de bienvenida y todo les sigue igual.
-- * Las facturas guardan la forma de pago, lo recibido y si el ITBIS va
--   incluido en el precio (venta rápida de tiendas).
-- * adjust_product_stock() suma o resta existencias en una sola operación, para
--   que dos ventas al mismo tiempo no dejen el conteo mal.
-- Se puede correr varias veces sin problema.
-- ============================================================================

-- ─── 1. PERFIL DEL NEGOCIO ──────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sales_mode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sells_on_credit BOOLEAN;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS itbis_mode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_business_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_business_type_check
  CHECK (business_type IS NULL OR business_type IN ('ropa', 'colmado', 'ferreteria', 'distribuidora', 'servicios', 'otro'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sales_mode_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_sales_mode_check
  CHECK (sales_mode IS NULL OR sales_mode IN ('counter', 'invoice', 'both'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_itbis_mode_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_itbis_mode_check
  CHECK (itbis_mode IS NULL OR itbis_mode IN ('included', 'added', 'none'));

-- Las cuentas que existían antes de este cambio no ven la bienvenida.
-- Solo corre la primera vez (queda anotado en platform_settings).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.platform_settings WHERE key = 'business_setup_backfill') THEN
    UPDATE public.profiles SET setup_completed_at = now() WHERE setup_completed_at IS NULL;
    INSERT INTO public.platform_settings (key, value) VALUES ('business_setup_backfill', to_jsonb(now()));
  END IF;
END $$;

-- ─── 2. FACTURAS: FORMA DE PAGO E ITBIS INCLUIDO ────────────────────────────
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount_received NUMERIC(12, 2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS itbis_included BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_payment_method_check;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('cash', 'card', 'transfer'));

-- ─── 3. EXISTENCIAS EN UNA SOLA OPERACIÓN ───────────────────────────────────
-- SECURITY INVOKER: corre con los permisos (y la RLS) del usuario que vende.
CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id UUID, p_delta NUMERIC)
RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.products
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_delta
  WHERE id = p_product_id AND track_inventory = true;
$$;

REVOKE ALL ON FUNCTION public.adjust_product_stock(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, NUMERIC) TO authenticated;

-- Comprobación
SELECT count(*) FILTER (WHERE setup_completed_at IS NOT NULL) AS configurados,
       count(*) FILTER (WHERE setup_completed_at IS NULL) AS pendientes
FROM public.profiles;
