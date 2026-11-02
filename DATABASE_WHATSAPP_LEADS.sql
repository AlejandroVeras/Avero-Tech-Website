-- ============================================================================
-- AVERO TECHNOLOGY — VENDEDOR DE IA POR WHATSAPP (ADR-003)
-- ----------------------------------------------------------------------------
-- * wa_conversations: una por número de WhatsApp. Estado bot/humano/cerrada,
--   memoria corta del cliente y un candado para no responder dos veces.
-- * wa_messages: cada mensaje recibido y enviado; wa_message_id es único para
--   ignorar los reintentos de Meta.
-- * leads: pedidos del bot. Solo pasan a "confirmado" cuando el cliente dijo
--   que sí; los precios los calcula el servidor, nunca la IA.
-- * wa_usage_daily: tokens y costo estimado por día para el tope de gasto.
-- * RLS: solo el administrador de la plataforma lee y escribe desde el panel;
--   el webhook usa la service key (que salta RLS) desde el servidor.
-- * No toca invoices ni el stock de products.
-- Se puede correr varias veces sin problema.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'bot' CHECK (status IN ('bot', 'humano', 'cerrada')),
  memory JSONB NOT NULL DEFAULT '{}'::jsonb,
  misunderstandings INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_inbound_at TIMESTAMPTZ,
  processing_until TIMESTAMPTZ,
  privacy_notice_sent BOOLEAN NOT NULL DEFAULT false,
  is_test BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'audio', 'image', 'system', 'template', 'other')),
  content TEXT NOT NULL DEFAULT '',
  wa_message_id TEXT UNIQUE,
  author TEXT NOT NULL DEFAULT 'cliente' CHECK (author IN ('cliente', 'bot', 'humano', 'sistema')),
  tokens_in INTEGER,
  tokens_out INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_conversation ON public.wa_messages (conversation_id, created_at);

CREATE SEQUENCE IF NOT EXISTS public.leads_code_seq START 1001;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE DEFAULT ('AV-' || nextval('public.leads_code_seq')),
  conversation_id UUID REFERENCES public.wa_conversations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'interesado', 'confirmado', 'en_ruta', 'entregado', 'cancelado')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  customer_name TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  sector TEXT,
  city TEXT,
  landmark TEXT,
  payment_method TEXT,
  delivery_window TEXT,
  notes TEXT,
  interested_slugs TEXT[] NOT NULL DEFAULT '{}',
  is_test BOOLEAN NOT NULL DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_conversation ON public.leads (conversation_id);

CREATE TABLE IF NOT EXISTS public.wa_usage_daily (
  day DATE PRIMARY KEY,
  tokens_in BIGINT NOT NULL DEFAULT 0,
  tokens_out BIGINT NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  messages_out INTEGER NOT NULL DEFAULT 0
);

-- Suma uso del día de forma atómica (lo llama el webhook con la service key).
CREATE OR REPLACE FUNCTION public.wa_add_usage(p_tokens_in BIGINT, p_tokens_out BIGINT, p_cost NUMERIC, p_messages INTEGER)
RETURNS NUMERIC
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.wa_usage_daily AS u (day, tokens_in, tokens_out, cost_usd, messages_out)
  VALUES ((now() AT TIME ZONE 'America/Santo_Domingo')::date, p_tokens_in, p_tokens_out, p_cost, p_messages)
  ON CONFLICT (day) DO UPDATE SET
    tokens_in = u.tokens_in + EXCLUDED.tokens_in,
    tokens_out = u.tokens_out + EXCLUDED.tokens_out,
    cost_usd = u.cost_usd + EXCLUDED.cost_usd,
    messages_out = u.messages_out + EXCLUDED.messages_out
  RETURNING cost_usd
$$;
REVOKE ALL ON FUNCTION public.wa_add_usage(BIGINT, BIGINT, NUMERIC, INTEGER) FROM PUBLIC, anon, authenticated;

-- Candado: toma la conversación por unos segundos si nadie más la está procesando.
CREATE OR REPLACE FUNCTION public.wa_try_lock(p_conversation UUID, p_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH t AS (
    UPDATE public.wa_conversations
    SET processing_until = now() + make_interval(secs => p_seconds)
    WHERE id = p_conversation AND (processing_until IS NULL OR processing_until < now())
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM t)
$$;
REVOKE ALL ON FUNCTION public.wa_try_lock(UUID, INTEGER) FROM PUBLIC, anon, authenticated;

ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_usage_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo admin: conversaciones" ON public.wa_conversations;
CREATE POLICY "Solo admin: conversaciones" ON public.wa_conversations
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Solo admin: mensajes" ON public.wa_messages;
CREATE POLICY "Solo admin: mensajes" ON public.wa_messages
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Solo admin: pedidos" ON public.leads;
CREATE POLICY "Solo admin: pedidos" ON public.leads
  FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Solo admin: uso" ON public.wa_usage_daily;
CREATE POLICY "Solo admin: uso" ON public.wa_usage_daily
  FOR SELECT TO authenticated USING (public.is_platform_admin());

SELECT 'wa_conversations' AS tabla, count(*) FROM public.wa_conversations
UNION ALL SELECT 'wa_messages', count(*) FROM public.wa_messages
UNION ALL SELECT 'leads', count(*) FROM public.leads;
