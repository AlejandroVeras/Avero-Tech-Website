-- ============================================================================
-- AVERO TECHNOLOGY — SISTEMAS EN SU PROPIO DOMINIO (Condominios)
-- ----------------------------------------------------------------------------
-- * Agrega a cada sistema un "enlace externo" opcional. Si lo tiene, su tarjeta
--   en /sistemas lleva directo a ese sitio y /sistemas/<slug> redirige ahí.
-- * Publica "Avero Condominios" como próximamente, enlazado a
--   https://condominios.averotechnology.com
-- Se puede correr varias veces sin problema.
-- ============================================================================

ALTER TABLE public.systems ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE public.systems DROP CONSTRAINT IF EXISTS systems_external_url_check;
ALTER TABLE public.systems ADD CONSTRAINT systems_external_url_check
  CHECK (external_url IS NULL OR external_url ~ '^https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/\S*)?$');

INSERT INTO public.systems (slug, name, tagline, description, audience, features, plans, status, published, sort_order, external_url)
VALUES (
  'condominios',
  'Avero Condominios',
  'Cuotas, gas, pagos y reservas de tu edificio, claros para todos.',
  'Factura el mantenimiento y el gas de cada apartamento, recibe los comprobantes de transferencia, cobra a tiempo y muestra en qué se usa cada peso. Los propietarios pagan y reservan desde el celular, sin descargar nada.',
  'Administradores y empresas que administran condominios, torres y residenciales en República Dominicana.',
  '[
    {"icon": "receipt", "title": "Cuotas y gas", "description": "Mantenimiento, gas común o medido y cargos extra, en un clic."},
    {"icon": "credit-card", "title": "Pagos sin enredos", "description": "Comprobantes de transferencia conciliados y recibos al instante."},
    {"icon": "bar-chart", "title": "Transparencia", "description": "Cada gasto con su factura, visible para los propietarios."},
    {"icon": "calendar", "title": "Reservas", "description": "Áreas sociales con foto, calendario y precio."},
    {"icon": "users", "title": "Propietarios e inquilinos", "description": "Cada quien ve solo lo suyo, desde el celular."},
    {"icon": "ticket", "title": "Averías y visitas", "description": "Reportes con foto y códigos para la garita."}
  ]'::jsonb,
  '[]'::jsonb,
  'proximamente',
  true,
  1,
  'https://condominios.averotechnology.com'
)
ON CONFLICT (slug) DO NOTHING;
