-- ============================================================================
-- AVERO INVENTARIO — HERRAMIENTAS DEL NEGOCIO Y PRODUCTOS DE EJEMPLO (nov. 2026)
-- ----------------------------------------------------------------------------
-- * profiles.enabled_tools: lo que el negocio prende o apaga a mano en
--   Configuración → Herramientas (Vender, Cotizaciones, Clientes, Órdenes de
--   servicio). Solo guarda lo que difiere de lo que sugiere su tipo de negocio.
-- * products.is_sample: productos de ejemplo para probar el sistema; se borran
--   juntos con un clic.
-- Se puede correr varias veces sin problema.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enabled_tools JSONB;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;

NOTIFY pgrst, 'reload schema';

SELECT
  (SELECT count(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'enabled_tools') AS columna_herramientas,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_sample') AS columna_ejemplos;
