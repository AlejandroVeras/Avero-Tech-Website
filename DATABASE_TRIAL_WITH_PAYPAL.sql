-- ============================================================================
-- AVERO TECHNOLOGY — LA PRUEBA DE AVERO INVENTARIO PIDE PAYPAL (octubre 2026)
-- ----------------------------------------------------------------------------
-- Reemplaza DATABASE_TRIAL_NO_CARD.sql. Las cuentas nuevas quedan "incomplete"
-- (pantalla de activación) hasta que autorizan el pago con PayPal; los días
-- gratis los da el propio plan de PayPal y el cobro empieza solo al terminar.
-- Las cuentas que ya estaban en prueba sin tarjeta no se tocan.
-- Se puede correr varias veces sin problema.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.start_trial_for_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, system_id, plan_id, status, current_period_end, notes)
  SELECT NEW.id, s.id, 'trial', 'incomplete', NULL, 'Pendiente: debe autorizar el pago con PayPal para empezar la prueba'
  FROM public.systems s
  WHERE s.slug = 'gestion'
  ON CONFLICT (user_id, system_id) DO NOTHING;
  RETURN NEW;
END;
$$;

SELECT position('incomplete' in prosrc) > 0 AS pide_paypal FROM pg_proc WHERE proname = 'start_trial_for_new_user';
