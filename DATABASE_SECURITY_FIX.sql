-- =====================================================
-- AVERO TECHNOLOGY — CORRECCIONES DE SEGURIDAD (FASE 0)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_STORE_OWNER_UPDATE.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- =====================================================


-- ─── 1. SUSCRIPCIONES: nadie puede activarse una suscripción ──────────
-- La política anterior usaba USING (true) WITH CHECK (true) para TODAS las
-- operaciones y sin restringir el rol, así que cualquier usuario podía
-- insertar o modificar suscripciones (activarse el plan gratis).
-- El service_role de Supabase ignora RLS, así que no necesita política:
-- basta con eliminarla. Los usuarios conservan solo la lectura de la suya.
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;


-- ─── 2. PRODUCTOS: el público no debe ver el costo ────────────────────
-- La política pública sobre la tabla dejaba leer la fila COMPLETA de los
-- productos públicos (incluido `cost`, `sku` y el stock exacto) con la
-- clave publicable. Se elimina y se reemplaza por una vista que solo
-- expone columnas seguras.
DROP POLICY IF EXISTS "Los visitantes pueden ver productos públicos" ON public.products;

-- La vista corre con los permisos de su dueño (no security_invoker) a
-- propósito: el filtro is_public = true vive dentro de la vista y es lo
-- único que el público puede ver.
CREATE OR REPLACE VIEW public.public_products AS
SELECT
  p.id,
  p.user_id AS store_id,
  p.name,
  p.description,
  p.price,
  p.category,
  (p.track_inventory = false OR p.stock_quantity > 0) AS in_stock,
  p.created_at
FROM public.products p
WHERE p.is_public = true;

REVOKE ALL ON public.public_products FROM PUBLIC;
GRANT SELECT ON public.public_products TO anon, authenticated;


-- ─── 3. PERFIL DEL DUEÑO DE LA TIENDA: solo datos de vitrina ──────────
-- DATABASE_STORE_OWNER_UPDATE.sql abría la fila completa del perfil del
-- dueño de la tienda (dirección, RNC, teléfono). Se reemplaza por una vista
-- con solo lo necesario para mostrar la tienda.
DROP POLICY IF EXISTS "Cualquiera puede ver el perfil de la tienda pública" ON public.profiles;

CREATE OR REPLACE VIEW public.public_stores AS
SELECT
  pr.id,
  pr.business_name,
  pr.logo_url,
  pr.is_store_owner
FROM public.profiles pr
WHERE pr.is_store_owner = true;

REVOKE ALL ON public.public_stores FROM PUBLIC;
GRANT SELECT ON public.public_stores TO anon, authenticated;


-- ─── 4. ADMINISTRADORES DE PLATAFORMA ────────────────────────────────
-- El rol de administrador vive en su propia tabla, NO en profiles: la RLS
-- de profiles permite a cada usuario editar su propia fila, así que un
-- campo "role" ahí permitiría autopromoverse.
-- Sin políticas de INSERT/UPDATE/DELETE: solo se modifica desde aquí o con
-- la clave secreta en el servidor.
CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cada usuario puede ver si es administrador" ON public.platform_admins;
CREATE POLICY "Cada usuario puede ver si es administrador"
  ON public.platform_admins
  FOR SELECT
  USING (auth.uid() = user_id);

INSERT INTO public.platform_admins (user_id)
SELECT id FROM auth.users WHERE email = 'verasetanislao21@gmail.com'
ON CONFLICT (user_id) DO NOTHING;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
