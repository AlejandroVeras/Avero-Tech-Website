-- ============================================================================
-- AVERO TECHNOLOGY — NOMBRES Y FUNCIONES EN /sistemas (octubre 2026)
-- * El sistema de gestión se presenta como "Avero Inventario", en línea con
--   Avero Citas y Avero Condominios. El slug sigue siendo 'gestion'.
-- * Condominios ya no muestra "Próximamente" como si fuera una función: lo que
--   viene en camino se menciona en la descripción.
-- Se puede correr varias veces sin problema.
-- ============================================================================

UPDATE public.systems SET name = 'Avero Inventario', updated_at = now() WHERE slug = 'gestion';

UPDATE public.systems
SET features = (SELECT jsonb_agg(f) FROM jsonb_array_elements(features) f WHERE f->>'title' <> 'Próximamente'),
    description = 'Factura el mantenimiento y el gas de cada apartamento, recibe los comprobantes de transferencia y entrega recibos al instante. Los propietarios ven su estado de cuenta desde el celular. Próximamente: reservas de áreas sociales, averías y visitas.',
    updated_at = now()
WHERE slug = 'condominios';

SELECT slug, name, jsonb_path_query_array(features, '$[*].title') AS funciones FROM public.systems ORDER BY sort_order;
