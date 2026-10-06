-- =====================================================
-- AVERO TECHNOLOGY — SOLICITUDES DE SOPORTE DESDE LA WEB (FASE 6)
-- Ejecutar en Supabase SQL Editor DESPUÉS de DATABASE_ADMIN_UPDATE.sql
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- El formulario de /soporte crea un ticket en la cuenta de Avero sin que
-- el visitante tenga sesión. La función solo puede hacer eso, valida los
-- datos y limita los envíos para evitar spam.
-- =====================================================

ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'dashboard';

ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_source_check;
ALTER TABLE public.tickets ADD CONSTRAINT tickets_source_check CHECK (source IN ('dashboard', 'web'));

CREATE INDEX IF NOT EXISTS idx_tickets_web_recent ON public.tickets (created_at) WHERE source = 'web';

CREATE OR REPLACE FUNCTION public.submit_support_request(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_problem_type TEXT,
  p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  owner UUID;
  ticket UUID;
  clean_email TEXT := lower(trim(p_email));
BEGIN
  IF char_length(trim(coalesce(p_name, ''))) NOT BETWEEN 2 AND 120 THEN
    RAISE EXCEPTION 'Nombre inválido' USING ERRCODE = '22023';
  END IF;
  IF clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR char_length(clean_email) > 200 THEN
    RAISE EXCEPTION 'Correo inválido' USING ERRCODE = '22023';
  END IF;
  IF char_length(trim(coalesce(p_description, ''))) NOT BETWEEN 10 AND 4000 THEN
    RAISE EXCEPTION 'Describe el problema (entre 10 y 4000 caracteres)' USING ERRCODE = '22023';
  END IF;
  IF p_problem_type NOT IN ('hardware', 'software', 'network', 'server', 'security', 'other') THEN
    RAISE EXCEPTION 'Tipo de problema inválido' USING ERRCODE = '22023';
  END IF;

  IF (SELECT count(*) FROM public.tickets
      WHERE source = 'web' AND lower(customer_email) = clean_email AND created_at > now() - interval '1 hour') >= 3 THEN
    RAISE EXCEPTION 'Ya recibimos varias solicitudes tuyas en la última hora; te contactaremos pronto' USING ERRCODE = '54000';
  END IF;
  IF (SELECT count(*) FROM public.tickets WHERE source = 'web' AND created_at > now() - interval '1 hour') >= 30 THEN
    RAISE EXCEPTION 'Estamos recibiendo muchas solicitudes; escríbenos por WhatsApp' USING ERRCODE = '54000';
  END IF;

  SELECT id INTO owner FROM public.profiles WHERE is_store_owner = true LIMIT 1;
  IF owner IS NULL THEN
    RAISE EXCEPTION 'No hay cuenta de soporte configurada';
  END IF;

  INSERT INTO public.tickets (user_id, customer_name, customer_email, customer_phone, subject, description, problem_type, status, priority, source)
  VALUES (
    owner,
    trim(p_name),
    clean_email,
    NULLIF(left(trim(coalesce(p_phone, '')), 40), ''),
    left('Web: ' || trim(p_description), 80),
    trim(p_description),
    p_problem_type,
    'open',
    'medium',
    'web'
  )
  RETURNING id INTO ticket;

  RETURN ticket;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_support_request(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_support_request(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;


-- Refrescar el caché del schema
NOTIFY pgrst, 'reload schema';
