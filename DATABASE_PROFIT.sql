-- ============================================================================
-- AVERO INVENTARIO — GANANCIA REAL E INVENTARIO SIN NEGATIVOS (noviembre 2026)
-- ----------------------------------------------------------------------------
-- * invoice_items.unit_cost: el costo del producto en el momento de la venta.
--   Con eso la ganancia resta lo que costó la mercancía vendida, aunque el
--   costo del producto cambie después.
-- * Las ventas que ya existen toman el costo actual de su producto.
-- * adjust_product_stock() ya no deja existencias por debajo de 0, y los
--   productos que quedaron en negativo pasan a 0.
-- Correr DESPUÉS de DATABASE_BUSINESS_SETUP.sql. Se puede correr varias veces.
-- ============================================================================

ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12, 2);

UPDATE public.invoice_items ii
SET unit_cost = p.cost
FROM public.products p
WHERE ii.product_id = p.id
  AND ii.unit_cost IS NULL
  AND p.cost IS NOT NULL;

-- Vender más de lo que hay deja el producto en 0, no en negativo.
CREATE OR REPLACE FUNCTION public.adjust_product_stock(p_product_id UUID, p_delta NUMERIC)
RETURNS void
LANGUAGE sql SECURITY INVOKER SET search_path = public AS $$
  UPDATE public.products
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) + p_delta)
  WHERE id = p_product_id AND track_inventory = true;
$$;

REVOKE ALL ON FUNCTION public.adjust_product_stock(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, NUMERIC) TO authenticated;

UPDATE public.products SET stock_quantity = 0 WHERE stock_quantity < 0;

NOTIFY pgrst, 'reload schema';

-- Comprobación: ventas con costo y productos en negativo (debe ser 0).
SELECT
  (SELECT count(*) FROM public.invoice_items WHERE unit_cost IS NOT NULL) AS lineas_con_costo,
  (SELECT count(*) FROM public.products WHERE stock_quantity < 0) AS productos_en_negativo;
