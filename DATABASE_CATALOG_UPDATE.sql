-- =====================================================
-- AVERO TECHNOLOGY — CATÁLOGO CON FOTOS Y ESPECIFICACIONES (FASE 2)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_SECURITY_FIX.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- =====================================================


-- ─── 1. NUEVOS CAMPOS DE PRODUCTO (todos opcionales) ─────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS condition TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warranty_months INTEGER;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_condition_check;
ALTER TABLE public.products ADD CONSTRAINT products_condition_check
  CHECK (condition IS NULL OR condition IN ('nuevo', 'reacondicionado', 'usado'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_warranty_check;
ALTER TABLE public.products ADD CONSTRAINT products_warranty_check
  CHECK (warranty_months IS NULL OR warranty_months BETWEEN 0 AND 120);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_specs_is_array;
ALTER TABLE public.products ADD CONSTRAINT products_specs_is_array
  CHECK (jsonb_typeof(specs) = 'array');


-- ─── 2. SLUG (URL amigable) PARA LOS PRODUCTOS EXISTENTES ────────────
-- "Dell Latitude 7400 14\" i5" -> "dell-latitude-7400-14-i5"
UPDATE public.products
SET slug = trim(both '-' from regexp_replace(
      lower(translate(name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
      '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Si dos productos del mismo negocio quedaron con el mismo slug, se le
-- agrega un sufijo corto del id a los repetidos.
WITH dupes AS (
  SELECT id, row_number() OVER (PARTITION BY user_id, slug ORDER BY created_at) AS rn
  FROM public.products
)
UPDATE public.products p
SET slug = p.slug || '-' || left(p.id::text, 6)
FROM dupes d
WHERE p.id = d.id AND d.rn > 1;

UPDATE public.products SET slug = left(id::text, 8) WHERE slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS products_user_slug_unique ON public.products (user_id, slug);


-- ─── 3. GALERÍA DE IMÁGENES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images (product_id, position);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cada negocio administra las imágenes de sus productos" ON public.product_images;
CREATE POLICY "Cada negocio administra las imágenes de sus productos"
  ON public.product_images
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id AND products.user_id = auth.uid()
    )
  );


-- ─── 4. ALMACENAMIENTO DE FOTOS (Supabase Storage) ───────────────────
-- Bucket público de lectura (las fotos se muestran en la web), máximo
-- 5 MB por archivo y solo formatos de imagen.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Cada negocio solo puede subir, cambiar o borrar archivos dentro de su
-- propia carpeta: product-images/<su user id>/...
-- Si DATABASE_SYSTEMS_UPDATE.sql ya se aplicó, la política conserva su
-- bloqueo de modo solo lectura (has_write_access) al volver a correr esto.
DROP POLICY IF EXISTS "Subir fotos a la carpeta propia" ON storage.objects;
DO $$
BEGIN
  IF to_regprocedure('public.has_write_access()') IS NOT NULL THEN
    CREATE POLICY "Subir fotos a la carpeta propia"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'product-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND public.has_write_access()
      );
  ELSE
    CREATE POLICY "Subir fotos a la carpeta propia"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END;
$$;

DROP POLICY IF EXISTS "Actualizar fotos de la carpeta propia" ON storage.objects;
CREATE POLICY "Actualizar fotos de la carpeta propia"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Borrar fotos de la carpeta propia" ON storage.objects;
CREATE POLICY "Borrar fotos de la carpeta propia"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ─── 5. VISTAS PÚBLICAS (solo columnas seguras) ──────────────────────
-- Se recrea public_products con los campos nuevos. Sigue sin exponer
-- cost, sku ni el stock exacto.
-- Si DATABASE_TENANT_STORES.sql ya se aplicó (public_stores tiene slug), se
-- omite: esa versión de las vistas ya incluye todo esto y además filtra por
-- tiendas visibles, así que volver a correr este archivo no la deshace.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'public_stores' AND column_name = 'slug'
  ) THEN
    RAISE NOTICE 'Vistas públicas ya actualizadas por DATABASE_TENANT_STORES.sql; se omiten';
    RETURN;
  END IF;

  DROP VIEW IF EXISTS public.public_product_images;
  DROP VIEW IF EXISTS public.public_products;
  CREATE VIEW public.public_products AS
  SELECT
    p.id,
    p.user_id AS store_id,
    p.slug,
    p.name,
    p.description,
    p.price,
    p.category,
    p.brand,
    p.condition,
    p.warranty_months,
    p.specs,
    p.featured,
    (p.track_inventory = false OR p.stock_quantity > 0) AS in_stock,
    (SELECT i.url FROM public.product_images i
      WHERE i.product_id = p.id ORDER BY i.position, i.created_at LIMIT 1) AS cover_url,
    p.created_at
  FROM public.products p
  WHERE p.is_public = true;

  CREATE VIEW public.public_product_images AS
  SELECT i.product_id, i.url, i.position
  FROM public.product_images i
  JOIN public.products p ON p.id = i.product_id
  WHERE p.is_public = true;

  REVOKE ALL ON public.public_products, public.public_product_images FROM PUBLIC;
  GRANT SELECT ON public.public_products, public.public_product_images TO anon, authenticated;
END;
$$;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
