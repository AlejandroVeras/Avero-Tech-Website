-- ============================================================================
-- AVERO INVENTARIO — CORREO DEL NEGOCIO (noviembre 2026)
-- ----------------------------------------------------------------------------
-- profiles.business_email: el correo que sale en facturas y cotizaciones.
-- Si está vacío, el sistema usa el correo con el que la persona inicia sesión.
-- Se puede correr varias veces sin problema.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_email TEXT;

NOTIFY pgrst, 'reload schema';

SELECT count(*) FILTER (WHERE business_email IS NOT NULL) AS negocios_con_correo FROM public.profiles;
