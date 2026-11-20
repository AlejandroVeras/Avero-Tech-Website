-- ============================================================================
-- AVERO INVENTARIO — MARCA, PORTADA DEL CATÁLOGO E INICIO DEL DASHBOARD
-- (noviembre 2026)
-- ----------------------------------------------------------------------------
-- * brand_color: color del negocio en su dashboard, su catálogo, sus facturas
--   y sus tickets.
-- * store_*: portada, horario, dirección, redes y categorías destacadas del
--   catálogo público (/t/<negocio>).
-- * dashboard_widgets: qué tarjetas ve cada negocio al entrar y en qué orden.
-- * La vista public_stores suma las columnas nuevas del catálogo (sin tocar
--   las que ya tenía ni quién puede verla).
-- Correr DESPUÉS de DATABASE_TENANT_STORES.sql. Se puede correr varias veces.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_cover_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_hours TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_instagram TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_facebook TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_tiktok TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_featured_categories TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dashboard_widgets JSONB;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_brand_color_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_brand_color_format
  CHECK (brand_color IS NULL OR brand_color ~ '^#[0-9a-f]{6}$');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_store_text_lengths;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_text_lengths
  CHECK (
    coalesce(length(store_hours), 0) <= 200
    AND coalesce(length(store_address), 0) <= 200
    AND coalesce(length(store_instagram), 0) <= 60
    AND coalesce(length(store_facebook), 0) <= 120
    AND coalesce(length(store_tiktok), 0) <= 60
    AND coalesce(array_length(store_featured_categories, 1), 0) <= 8
  );

-- Las columnas nuevas van al final: CREATE OR REPLACE VIEW solo permite agregar.
CREATE OR REPLACE VIEW public.public_stores AS
SELECT
  pr.id,
  pr.slug,
  pr.business_name,
  pr.logo_url,
  pr.store_description,
  pr.whatsapp_phone,
  pr.is_store_owner,
  pr.brand_color,
  pr.store_cover_url,
  pr.store_hours,
  pr.store_address,
  pr.store_instagram,
  pr.store_facebook,
  pr.store_tiktok,
  pr.store_featured_categories
FROM public.profiles pr
WHERE pr.is_store_owner = true
   OR (pr.store_enabled = true AND public.account_has_access(pr.id));

NOTIFY pgrst, 'reload schema';

-- Comprobación: debe listar las columnas nuevas.
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'public_stores'
ORDER BY ordinal_position;
