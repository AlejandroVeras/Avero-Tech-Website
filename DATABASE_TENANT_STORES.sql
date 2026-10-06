-- =====================================================
-- AVERO TECHNOLOGY — TIENDA EN LÍNEA PARA CADA NEGOCIO (FASE 4)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_SYSTEMS_UPDATE.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- =====================================================


-- ─── 0. SEGURIDAD: NADIE PUEDE MARCARSE COMO DUEÑO DE LA TIENDA ──────
-- La RLS de profiles deja a cada negocio editar su propia fila completa.
-- Sin esto, un suscriptor podría ponerse is_store_owner = true y meter
-- sus productos en /catalogo de Avero. Solo el SQL Editor o la clave
-- secreta (service_role) pueden cambiar esa columna.
CREATE OR REPLACE FUNCTION public.protect_store_owner_flag()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_store_owner := false;
    ELSIF NEW.is_store_owner IS DISTINCT FROM OLD.is_store_owner THEN
      RAISE EXCEPTION 'No se puede cambiar is_store_owner desde la aplicación';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_store_owner ON public.profiles;
CREATE TRIGGER profiles_protect_store_owner
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_store_owner_flag();


-- ─── 1. DATOS DE LA TIENDA EN EL PERFIL ──────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_slug_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_slug_format
  CHECK (slug IS NULL OR slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_whatsapp_format;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_whatsapp_format
  CHECK (whatsapp_phone IS NULL OR whatsapp_phone ~ '^[0-9]{10,15}$');

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_store_description_length;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_description_length
  CHECK (store_description IS NULL OR char_length(store_description) <= 300);


-- ─── 2. DIRECCIÓN (SLUG) PARA LOS NEGOCIOS EXISTENTES ────────────────
-- "Colmado La Esquina" -> "colmado-la-esquina". Si se repite, se le
-- agrega un sufijo corto del id.
UPDATE public.profiles
SET slug = NULLIF(trim(both '-' from regexp_replace(
      lower(translate(business_name, 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
      '[^a-z0-9]+', '-', 'g')), '')
WHERE slug IS NULL;

UPDATE public.profiles SET slug = 'negocio-' || left(id::text, 8) WHERE slug IS NULL;

WITH dupes AS (
  SELECT id, row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn FROM public.profiles
)
UPDATE public.profiles p
SET slug = p.slug || '-' || left(p.id::text, 6)
FROM dupes d
WHERE p.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_unique ON public.profiles (slug);

-- Los negocios nuevos también reciben su slug al registrarse.
CREATE OR REPLACE FUNCTION public.assign_profile_slug()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  n INTEGER := 1;
BEGIN
  IF NEW.slug IS NOT NULL THEN
    RETURN NEW;
  END IF;
  base := NULLIF(trim(both '-' from regexp_replace(
    lower(translate(COALESCE(NEW.business_name, ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun')),
    '[^a-z0-9]+', '-', 'g')), '');
  base := COALESCE(left(base, 60), 'negocio');
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = candidate AND id <> NEW.id) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_assign_slug ON public.profiles;
CREATE TRIGGER profiles_assign_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.assign_profile_slug();


-- ─── 3. VISTAS PÚBLICAS ──────────────────────────────────────────────
-- Una tienda es pública si es la de Avero (dueño de la plataforma) o si
-- el negocio la activó y su suscripción está vigente. Solo se exponen
-- datos de vitrina: nada de dirección, RNC ni correo.
DROP VIEW IF EXISTS public.public_product_images;
DROP VIEW IF EXISTS public.public_products;
DROP VIEW IF EXISTS public.public_stores;

CREATE VIEW public.public_stores AS
SELECT
  pr.id,
  pr.slug,
  pr.business_name,
  pr.logo_url,
  pr.store_description,
  pr.whatsapp_phone,
  pr.is_store_owner
FROM public.profiles pr
WHERE pr.is_store_owner = true
   OR (pr.store_enabled = true AND public.account_has_access(pr.id));

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
JOIN public.public_stores s ON s.id = p.user_id
WHERE p.is_public = true;

CREATE VIEW public.public_product_images AS
SELECT i.product_id, i.url, i.position
FROM public.product_images i
JOIN public.public_products p ON p.id = i.product_id;

REVOKE ALL ON public.public_stores, public.public_products, public.public_product_images FROM PUBLIC;
GRANT SELECT ON public.public_stores, public.public_products, public.public_product_images TO anon, authenticated;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
