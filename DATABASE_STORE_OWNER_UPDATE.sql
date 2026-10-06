-- =====================================================
-- AVERO TECHNOLOGY — STORE OWNER FIX
-- Ejecutar en Supabase SQL Editor
--
-- Qué arregla:
-- 1. La cuenta de Avero Technology (verasetanislao21@gmail.com) no tiene fila
--    en public.profiles (el trigger de creación de perfil no corrió para esa
--    cuenta), así que el storefront público no puede identificarla como
--    dueña de la tienda.
-- 2. public.profiles solo permite leer la fila propia (auth.uid() = id), así
--    que un visitante anónimo nunca podía resolver "quién es el dueño de la
--    tienda" — por eso el catálogo público siempre devolvía 0 productos,
--    sin importar qué tan flexible fuera el filtro por nombre de negocio.
-- 3. El filtro anterior (`business_name ILIKE '%avero%'`) era fragil y
--    dependía de que el nombre del negocio contuviera "avero" literalmente.
-- =====================================================

-- 1. Columna explícita para marcar qué tenant es el dueño de la tienda pública
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_store_owner BOOLEAN NOT NULL DEFAULT false;

-- 2. Crear la fila de perfil que falta para cualquier usuario que ya tenga
-- cuenta pero nunca recibió su fila en profiles (backfill seguro, no toca
-- las filas que ya existen)
INSERT INTO public.profiles (id, business_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'businessName', u.raw_user_meta_data->>'business_name', 'Mi Negocio')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3. Marcar la cuenta de Avero Technology como dueña de la tienda pública
UPDATE public.profiles
SET is_store_owner = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'verasetanislao21@gmail.com');

-- 4. Permitir que cualquier visitante (anónimo o no) pueda leer ÚNICAMENTE
-- la fila marcada como dueña de la tienda — necesario para que
-- getPublicProducts() pueda resolver el tenant público sin exponer al resto
-- de los negocios que usan el sistema.
DROP POLICY IF EXISTS "Cualquiera puede ver el perfil de la tienda pública" ON public.profiles;
CREATE POLICY "Cualquiera puede ver el perfil de la tienda pública"
    ON public.profiles
    FOR SELECT
    USING (is_store_owner = true);

-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
