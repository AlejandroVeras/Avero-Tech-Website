-- ============================================================================
-- AVERO INVENTARIO — COLOR DE FACTURAS, RECIBOS Y COTIZACIONES (nov. 2026)
-- ----------------------------------------------------------------------------
-- profiles.document_color: el color de los documentos (PDF e impresión),
-- elegido en Configuración. Vacío = se usa el color de la marca.
-- Se puede correr varias veces sin problema. (Ya corrido en producción.)
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_color TEXT;

NOTIFY pgrst, 'reload schema';

SELECT count(*) AS columna_color_documentos
FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'document_color';
