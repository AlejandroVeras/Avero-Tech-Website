-- ============================================================================
-- AVERO INVENTARIO — PRUEBA DE 14 DÍAS SIN PAYPAL, COBRO MANUAL (noviembre 2026)
-- ----------------------------------------------------------------------------
-- Reemplaza DATABASE_TRIAL_WITH_PAYPAL.sql mientras el cobro es manual.
-- * Las cuentas nuevas entran directo a una prueba de 14 días, sin autorizar
--   PayPal (platform_settings.trial_days = 14).
-- * Al terminar, account_has_access() deja la cuenta en solo lectura hasta que
--   registres el pago desde /admin/negocios (eso mueve current_period_end).
-- * Las cuentas que quedaron esperando PayPal ("incomplete") empiezan hoy su
--   prueba de 14 días.
-- * Las cuentas que ya están en prueba, activas o con PayPal no se tocan.
-- Para volver a PayPal: correr DATABASE_TRIAL_WITH_PAYPAL.sql y poner
-- PAYPAL_CHECKOUT_ENABLED = true en lib/features.ts.
-- Se puede correr varias veces sin problema.
-- ============================================================================

INSERT INTO public.platform_settings (key, value) VALUES ('trial_days', '14'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Avero Inventario usa los días generales (no uno propio).
UPDATE public.systems SET trial_days = NULL, updated_at = now() WHERE slug = 'gestion';

CREATE OR REPLACE FUNCTION public.start_trial_for_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  days INTEGER;
BEGIN
  SELECT COALESCE((value #>> '{}')::integer, 14) INTO days FROM public.platform_settings WHERE key = 'trial_days';
  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, trial_ends_at, notes)
  SELECT NEW.id, s.id, 'trial', 'trialing', now() + make_interval(days => COALESCE(days, 14)),
         now() + make_interval(days => COALESCE(days, 14)), 'Prueba gratis (cobro manual)'
  FROM public.systems s
  WHERE s.slug = 'gestion'
  ON CONFLICT (user_id, system_id) DO NOTHING;
  RETURN NEW;
END;
$$;

UPDATE public.subscriptions x
SET status = 'trialing',
    plan_id = 'trial',
    current_period_end = now() + interval '14 days',
    trial_ends_at = now() + interval '14 days',
    notes = 'Prueba gratis (cobro manual)'
FROM public.systems s
WHERE x.system_id = s.id AND s.slug = 'gestion' AND x.status = 'incomplete';

-- Comprobación
SELECT (SELECT value FROM public.platform_settings WHERE key = 'trial_days') AS dias_prueba,
       position('trialing' in prosrc) > 0 AS prueba_sin_paypal
FROM pg_proc WHERE proname = 'start_trial_for_new_user';
SELECT status, count(*) FROM public.subscriptions GROUP BY status;
