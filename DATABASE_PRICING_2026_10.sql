-- ============================================================================
-- AVERO TECHNOLOGY — PRECIOS Y DÍAS GRATIS (octubre 2026)
-- ----------------------------------------------------------------------------
-- * Cada sistema puede tener sus propios días gratis (systems.trial_days).
--   Si está vacío, usa el general (platform_settings.trial_days).
-- * Un plan con monthly_usd = 0 y annual_usd > 0 se vende solo por año.
-- * Gestión e inventario: 30 días gratis, US$12/mes o US$120/año.
-- * Avero Citas: 30 días gratis, US$9 / US$19 / US$35 al mes (año = 10 meses).
-- * Avero Condominios: 60 días gratis y luego anualidad: US$320 / US$560 / US$960.
-- Se puede correr varias veces sin problema.
-- ============================================================================

ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS trial_days INTEGER;
ALTER TABLE public.systems DROP CONSTRAINT IF EXISTS systems_trial_days_check;
ALTER TABLE public.systems ADD CONSTRAINT systems_trial_days_check CHECK (trial_days IS NULL OR trial_days BETWEEN 1 AND 120);

-- Días gratis generales: los usa el sistema de gestión al crear cada cuenta.
INSERT INTO public.platform_settings (key, value) VALUES ('trial_days', '30'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

UPDATE public.systems
SET plans = (SELECT jsonb_agg(p || '{"monthly_usd": 12, "annual_usd": 120}'::jsonb) FROM jsonb_array_elements(plans) p),
    trial_days = NULL,
    updated_at = now()
WHERE slug = 'gestion' AND jsonb_array_length(plans) > 0;

UPDATE public.systems
SET trial_days = 30,
    plans = '[
      {"id": "solo", "name": "Solo", "description": "Para el profesional que trabaja por su cuenta", "monthly_usd": 9, "annual_usd": 90,
       "features": ["1 profesional", "Enlace de reservas", "Confirmación y recordatorio por correo", "Recordar por WhatsApp con un toque", "Turnos de llegada"]},
      {"id": "negocio", "name": "Negocio", "description": "Barberías y salones con equipo", "monthly_usd": 19, "annual_usd": 190,
       "features": ["Hasta 5 profesionales", "Todo lo del plan Solo", "Cobros con propina y comisiones", "Clientes y reportes", "Recepción con su propio acceso"]},
      {"id": "plus", "name": "Plus", "description": "Negocios grandes y consultorios", "monthly_usd": 35, "annual_usd": 350,
       "features": ["Hasta 12 profesionales", "Todo lo del plan Negocio", "Soporte prioritario por WhatsApp"]}
    ]'::jsonb,
    updated_at = now()
WHERE slug = 'citas';

UPDATE public.systems
SET trial_days = 60,
    status = 'disponible',
    plans = '[
      {"id": "edificio", "name": "Edificio", "description": "Hasta 24 unidades", "monthly_usd": 0, "annual_usd": 320,
       "features": ["Cuotas, gas común o medido y cargos extra", "Comprobantes de transferencia y recibos", "Estado de cuenta de cada apartamento", "Propietarios entran con un código, sin contraseña"]},
      {"id": "torre", "name": "Torre", "description": "De 25 a 60 unidades", "monthly_usd": 0, "annual_usd": 560,
       "features": ["Todo lo del plan Edificio", "Te ayudamos a cargar las unidades"]},
      {"id": "residencial", "name": "Residencial", "description": "De 61 a 150 unidades", "monthly_usd": 0, "annual_usd": 960,
       "features": ["Todo lo del plan Torre", "Soporte prioritario por WhatsApp"]}
    ]'::jsonb,
    updated_at = now()
WHERE slug = 'condominios';

-- Funciones que Condominios ya tiene (reservas, averías y visitas siguen en desarrollo).
UPDATE public.systems
SET features = '[
    {"icon": "receipt", "title": "Cuotas y gas", "description": "Mantenimiento, gas común o medido y cargos extra, en un clic."},
    {"icon": "credit-card", "title": "Pagos sin enredos", "description": "Comprobantes de transferencia conciliados y recibos al instante."},
    {"icon": "bar-chart", "title": "Transparencia", "description": "Cada propietario ve sus facturas, pagos y saldo. Nada se borra."},
    {"icon": "users", "title": "Propietarios e inquilinos", "description": "Cada quien ve solo lo suyo, desde el celular."},
    {"icon": "file-text", "title": "Estado de cuenta", "description": "Saldo, facturas y el detalle del gas de cada apartamento."},
    {"icon": "calendar", "title": "Próximamente", "description": "Reservas de áreas sociales, averías y visitas."}
  ]'::jsonb
WHERE slug = 'condominios';

SELECT slug, status, trial_days, jsonb_path_query_array(plans, '$[*].name') AS planes,
       jsonb_path_query_array(plans, '$[*].monthly_usd') AS mensual, jsonb_path_query_array(plans, '$[*].annual_usd') AS anual
FROM public.systems ORDER BY sort_order;
