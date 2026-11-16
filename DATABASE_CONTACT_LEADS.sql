-- ============================================================================
-- AVERO TECHNOLOGY — FORMULARIO DE CONTACTO (/contacto) Y HUBSPOT
-- ----------------------------------------------------------------------------
-- * contact_leads: cada contacto del formulario del sitio. Se guarda primero
--   aquí para no perder nada si HubSpot falla.
-- * hubspot_synced_at NULL = «sin sincronizar»: la tarea diaria
--   /api/cron/hubspot-sync lo reintenta (hasta 10 intentos).
-- * ip_hash: huella de la IP (SHA-256 con sal) solo para limitar envíos; la IP
--   real no se guarda.
-- * RLS: solo el administrador de la plataforma lee y escribe desde el panel;
--   el servidor usa la service key (que salta RLS).
-- Se puede correr varias veces sin problema.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) <= 200),
  phone TEXT NOT NULL CHECK (char_length(phone) <= 40),
  company TEXT CHECK (char_length(company) <= 120),
  service TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000),
  consent BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'es',
  page_uri TEXT,
  page_name TEXT,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  hutk TEXT,
  ip_hash TEXT,
  hubspot_synced_at TIMESTAMPTZ,
  hubspot_attempts INTEGER NOT NULL DEFAULT 0,
  hubspot_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_leads_created ON public.contact_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_ip ON public.contact_leads (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_leads_unsynced ON public.contact_leads (created_at) WHERE hubspot_synced_at IS NULL;

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admin: contactos" ON public.contact_leads;
CREATE POLICY "Solo admin: contactos" ON public.contact_leads
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

REVOKE ALL ON public.contact_leads FROM anon;

NOTIFY pgrst, 'reload schema';

SELECT 'contact_leads' AS tabla, count(*) FROM public.contact_leads;
