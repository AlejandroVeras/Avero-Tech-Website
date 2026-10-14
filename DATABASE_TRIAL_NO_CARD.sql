-- ============================================================================
-- AVERO TECHNOLOGY — PRUEBA GRATIS SIN TARJETA (octubre 2026)
-- ----------------------------------------------------------------------------
-- * Las cuentas nuevas del sistema de gestión entran directo a la prueba
--   (platform_settings.trial_days, hoy 30 días), sin autorizar PayPal antes.
-- * Al terminar la prueba el sistema queda en solo lectura hasta que pague
--   (account_has_access ya lo hace con current_period_end).
-- * Libera las cuentas que quedaron esperando la tarjeta ("incomplete").
-- Se puede correr varias veces sin problema.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.start_trial_for_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  days INTEGER;
BEGIN
  SELECT COALESCE((value #>> '{}')::integer, 30) INTO days FROM public.platform_settings WHERE key = 'trial_days';
  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, trial_ends_at, notes)
  SELECT NEW.id, s.id, 'trial', 'trialing', now() + make_interval(days => COALESCE(days, 30)),
         now() + make_interval(days => COALESCE(days, 30)), 'Prueba gratis'
  FROM public.systems s
  WHERE s.slug = 'gestion'
  ON CONFLICT (user_id, system_id) DO NOTHING;
  RETURN NEW;
END;
$$;

UPDATE public.subscriptions x
SET status = 'trialing',
    plan_id = 'trial',
    current_period_end = now() + make_interval(days => COALESCE((SELECT (value #>> '{}')::integer FROM public.platform_settings WHERE key = 'trial_days'), 30)),
    trial_ends_at = now() + make_interval(days => COALESCE((SELECT (value #>> '{}')::integer FROM public.platform_settings WHERE key = 'trial_days'), 30)),
    notes = 'Prueba gratis'
WHERE x.status = 'incomplete';

SELECT status, count(*) FROM public.subscriptions GROUP BY status;
