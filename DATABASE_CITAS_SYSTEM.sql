-- ============================================================================
-- AVERO TECHNOLOGY — AVERO CITAS EN /sistemas
-- ----------------------------------------------------------------------------
-- * Publica "Avero Citas", enlazado a https://citas.averotechnology.com
-- * Requiere DATABASE_EXTERNAL_SYSTEMS.sql (columna external_url).
-- Se puede correr varias veces sin problema.
-- ============================================================================

INSERT INTO public.systems (slug, name, tagline, description, audience, features, plans, status, published, sort_order, external_url)
VALUES (
  'citas',
  'Avero Citas',
  'Tus clientes reservan solos y les llega el recordatorio.',
  'Un enlace de reservas para tu Instagram o WhatsApp: el cliente elige servicio, profesional y hora sin crear cuenta. Tú manejas la agenda del equipo, la cola de llegada, los cobros con propina y las comisiones, desde el celular.',
  'Barberías, salones de belleza, spas y consultorios en República Dominicana.',
  '[
    {"icon": "calendar", "title": "Reservas en línea", "description": "Un enlace con tus servicios, tu equipo y las horas libres."},
    {"icon": "ticket", "title": "Recordatorios", "description": "Confirmación y recordatorio por correo, y por WhatsApp con un toque."},
    {"icon": "users", "title": "Agenda del equipo", "description": "Horarios, descansos y feriados de cada profesional, sin citas encimadas."},
    {"icon": "store", "title": "Turnos de llegada", "description": "El cliente sigue su turno desde el celular."},
    {"icon": "credit-card", "title": "Cobros y comisiones", "description": "Cobra con propina y descuento; cada quien ve lo que ganó."},
    {"icon": "bar-chart", "title": "Reportes", "description": "Ingresos, ausencias y servicios más pedidos."}
  ]'::jsonb,
  '[]'::jsonb,
  'disponible',
  true,
  2,
  'https://citas.averotechnology.com'
)
ON CONFLICT (slug) DO UPDATE SET
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published;
