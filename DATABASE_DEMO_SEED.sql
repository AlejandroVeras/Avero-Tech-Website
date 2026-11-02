-- ============================================================================
-- AVERO TECHNOLOGY — INVENTARIO DE PRUEBA DEL CATÁLOGO (QA, noviembre 2026)
-- ----------------------------------------------------------------------------
-- * 20 productos de tecnología en la cuenta is_store_owner, todos con
--   slug "demo-…" para poder borrarlos sin tocar los productos reales.
-- * Solo inserta en products. Las fotos (Wikimedia Commons, ver
--   docs/demo-credits.md) se suben con scripts/seed-demo-images.mjs --apply,
--   que también ejecuta lo equivalente a este archivo. Úsalo solo si quieres
--   los productos sin fotos.
-- * No crea facturas, cotizaciones, pagos, clientes, financiamientos,
--   tickets ni gastos.
-- * Idempotente: si el producto demo ya existe, lo actualiza.
-- Generado con: node scripts/seed-demo-images.mjs --write-sql
-- ============================================================================

WITH owner AS (
  SELECT id FROM public.profiles WHERE is_store_owner = true LIMIT 1
),
demo (slug, name, brand, category, condition, price, warranty_months, featured, stock_quantity, description, specs) AS (
  VALUES
  ('demo-lenovo-ideapad-flex-14', 'Lenovo IdeaPad Flex 14 2 en 1 Core i5', 'Lenovo', 'Laptop', 'reacondicionado', 32900, 6, true, 3, 'Laptop convertible con pantalla táctil que gira 360°: úsala como laptop o como tablet. Revisada, con batería en buen estado y Windows 11 activado.', '[{"label":"Procesador","value":"Intel Core i5-8265U"},{"label":"Memoria","value":"8 GB DDR4"},{"label":"Almacenamiento","value":"256 GB SSD"},{"label":"Pantalla","value":"14\" Full HD táctil"},{"label":"Sistema","value":"Windows 11 Home"},{"label":"Peso","value":"1.65 kg"}]'::jsonb),
  ('demo-hp-probook-14-core-i5', 'HP ProBook 14" Core i5', 'HP', 'Laptop', 'usado', 14500, 3, false, 2, 'Laptop de oficina resistente, ideal para facturar, navegar y trabajar con Office. Tiene marcas de uso en la tapa.', '[{"label":"Procesador","value":"Intel Core i5 (2.ª generación)"},{"label":"Memoria","value":"8 GB DDR3"},{"label":"Almacenamiento","value":"240 GB SSD"},{"label":"Pantalla","value":"14\" HD"},{"label":"Sistema","value":"Windows 10 Pro"}]'::jsonb),
  ('demo-macbook-air-m2-13', 'MacBook Air M2 13" 256 GB', 'Apple', 'Laptop', 'nuevo', 69900, 12, true, 2, 'La MacBook Air con chip M2: rápida, silenciosa (no tiene ventilador) y con batería para todo el día. Sellada en su caja.', '[{"label":"Chip","value":"Apple M2 de 8 núcleos"},{"label":"Memoria","value":"8 GB unificada"},{"label":"Almacenamiento","value":"256 GB SSD"},{"label":"Pantalla","value":"13.6\" Liquid Retina"},{"label":"Batería","value":"Hasta 18 horas"},{"label":"Peso","value":"1.24 kg"},{"label":"Puertos","value":"2 × Thunderbolt, MagSafe 3"}]'::jsonb),
  ('demo-hp-laptop-15-da1xxx-core-i5-16gb-512gb', 'HP Laptop 15-da1xxx Intel Core i5 de 8.ª generación con 16 GB de RAM, 512 GB SSD y Windows 11 Home, color negro jet', 'HP', 'Laptop', 'nuevo', 36500, 12, false, 4, 'Laptop de 15.6" para estudios y trabajo, con teclado numérico completo.', '[{"label":"Procesador","value":"Intel Core i5-8265U"},{"label":"Memoria","value":"16 GB DDR4"},{"label":"Almacenamiento","value":"512 GB SSD"},{"label":"Pantalla","value":"15.6\" HD"},{"label":"Sistema","value":"Windows 11 Home"},{"label":"Teclado","value":"Con teclado numérico"}]'::jsonb),
  ('demo-samsung-galaxy-a15-128gb', 'Samsung Galaxy A15 128 GB', 'Samsung', 'Celular', 'nuevo', 11900, 12, false, 6, 'Pantalla Super AMOLED grande y batería de 5,000 mAh que dura todo el día. Desbloqueado para cualquier compañía.', '[{"label":"Pantalla","value":"6.5\" Super AMOLED 90 Hz"},{"label":"Almacenamiento","value":"128 GB"},{"label":"Memoria","value":"4 GB"},{"label":"Batería","value":"5,000 mAh"},{"label":"Cámara","value":"50 MP"},{"label":"Red","value":"4G, desbloqueado"}]'::jsonb),
  ('demo-samsung-galaxy-a54-5g-128gb', 'Samsung Galaxy A54 5G 128 GB', 'Samsung', 'Celular', 'nuevo', 21900, 12, true, 4, 'Gama media alta con 5G, cámara estabilizada y resistencia al agua IP67.', '[{"label":"Pantalla","value":"6.4\" Super AMOLED 120 Hz"},{"label":"Almacenamiento","value":"128 GB"},{"label":"Memoria","value":"8 GB"},{"label":"Cámara","value":"50 MP con OIS"},{"label":"Batería","value":"5,000 mAh"},{"label":"Resistencia","value":"IP67"},{"label":"Red","value":"5G, desbloqueado"}]'::jsonb),
  ('demo-iphone-13-pro-128gb', 'iPhone 13 Pro 128 GB', 'Apple', 'Celular', 'reacondicionado', 39900, 6, true, 2, 'Reacondicionado con batería por encima del 85 % de salud. Pantalla y cámaras sin detalles.', '[{"label":"Pantalla","value":"6.1\" Super Retina XDR 120 Hz"},{"label":"Chip","value":"A15 Bionic"},{"label":"Almacenamiento","value":"128 GB"},{"label":"Cámaras","value":"Triple de 12 MP"},{"label":"Salud de batería","value":"85 % o más"},{"label":"Red","value":"5G, desbloqueado"}]'::jsonb),
  ('demo-xiaomi-redmi-note-11-128gb', 'Xiaomi Redmi Note 11 128 GB', 'Xiaomi', 'Celular', 'nuevo', 12500, 12, false, 5, 'Buen balance entre precio y rendimiento, con carga rápida de 33 W.', '[{"label":"Pantalla","value":"6.43\" AMOLED 90 Hz"},{"label":"Almacenamiento","value":"128 GB"},{"label":"Memoria","value":"4 GB"},{"label":"Batería","value":"5,000 mAh, carga de 33 W"},{"label":"Cámara","value":"50 MP"}]'::jsonb),
  ('demo-samsung-galaxy-s21-ultra-256gb', 'Samsung Galaxy S21 Ultra 256 GB', 'Samsung', 'Celular', 'usado', 24900, 3, false, 0, 'Usado en buen estado, con leves marcas en el marco. Incluye cargador.', '[{"label":"Pantalla","value":"6.8\" Dynamic AMOLED 120 Hz"},{"label":"Almacenamiento","value":"256 GB"},{"label":"Memoria","value":"12 GB"},{"label":"Cámara","value":"108 MP con zoom 10×"},{"label":"Batería","value":"5,000 mAh"}]'::jsonb),
  ('demo-ipad-10-generacion-64gb', 'iPad (10.ª generación) 64 GB Wi-Fi', 'Apple', 'Tablet', 'nuevo', 26900, 12, false, 3, 'El iPad de 10.9" con USB-C, ideal para clases, lectura y ventas en mostrador.', '[{"label":"Pantalla","value":"10.9\" Liquid Retina"},{"label":"Chip","value":"A14 Bionic"},{"label":"Almacenamiento","value":"64 GB"},{"label":"Conexión","value":"Wi-Fi 6"},{"label":"Puerto","value":"USB-C"},{"label":"Cámara frontal","value":"12 MP horizontal"}]'::jsonb),
  ('demo-monitor-dell-20-pulgadas', 'Monitor Dell 20"', 'Dell', 'Monitor', 'usado', 4500, 3, false, 0, 'Monitor de oficina con base ajustable en altura. Perfecto como segunda pantalla.', '[{"label":"Tamaño","value":"20\""},{"label":"Resolución","value":"1600 × 1200"},{"label":"Entradas","value":"VGA y DVI"},{"label":"Base","value":"Ajustable en altura y giro"}]'::jsonb),
  ('demo-logitech-mx-master-3s', 'Mouse Logitech MX Master 3S', 'Logitech', 'Accesorio', 'nuevo', 6400, 12, false, 8, 'Mouse inalámbrico ergonómico con clics silenciosos y rueda electromagnética. Se conecta hasta a 3 equipos.', '[{"label":"Conexión","value":"Bluetooth y receptor Logi Bolt"},{"label":"Sensor","value":"8,000 DPI"},{"label":"Batería","value":"Recargable, hasta 70 días"},{"label":"Carga","value":"USB-C"},{"label":"Compatibilidad","value":"Windows, macOS, Linux, iPad"}]'::jsonb),
  ('demo-logitech-k380', 'Teclado Logitech K380 Bluetooth', 'Logitech', 'Accesorio', 'nuevo', 2700, 6, false, 10, NULL, '[{"label":"Conexión","value":"Bluetooth, hasta 3 equipos"},{"label":"Baterías","value":"2 × AAA, hasta 24 meses"},{"label":"Color","value":"Blanco"},{"label":"Peso","value":"423 g"}]'::jsonb),
  ('demo-cargador-apple-usb-c-96w', 'Cargador Apple USB-C de 96 W', 'Apple', 'Accesorio', 'nuevo', 3900, 0, false, 7, 'Adaptador original para MacBook Pro y MacBook Air. El cable USB-C se vende por separado.', '[{"label":"Potencia","value":"96 W"},{"label":"Conector","value":"USB-C"},{"label":"Compatibilidad","value":"MacBook Air, MacBook Pro, iPad Pro"},{"label":"Incluye","value":"Solo el adaptador"}]'::jsonb),
  ('demo-jbl-flip-3', 'Bocina JBL Flip 3', 'JBL', 'Audio', 'reacondicionado', 3500, 3, false, 3, 'Bocina portátil resistente a salpicaduras con sonido potente para su tamaño.', '[{"label":"Conexión","value":"Bluetooth 4.1"},{"label":"Batería","value":"Hasta 10 horas"},{"label":"Resistencia","value":"A salpicaduras"},{"label":"Micrófono","value":"Sí, para llamadas"}]'::jsonb),
  ('demo-apple-airpods-pro-2', 'Apple AirPods Pro (2.ª generación)', 'Apple', 'Audio', 'nuevo', 14900, 12, false, 0, 'Cancelación activa de ruido y estuche de carga MagSafe con USB-C.', '[{"label":"Cancelación de ruido","value":"Activa"},{"label":"Batería","value":"Hasta 6 horas (30 con estuche)"},{"label":"Estuche","value":"MagSafe con USB-C"},{"label":"Resistencia","value":"IP54"},{"label":"Chip","value":"Apple H2"}]'::jsonb),
  ('demo-tp-link-tl-wr740n', 'Router TP-Link TL-WR740N', 'TP-Link', 'Redes', 'nuevo', 1450, 12, false, 12, 'Router Wi-Fi sencillo para casa u oficina pequeña.', '[{"label":"Velocidad","value":"150 Mbps"},{"label":"Banda","value":"2.4 GHz"},{"label":"Puertos","value":"4 LAN + 1 WAN"},{"label":"Antena","value":"1 fija de 5 dBi"}]'::jsonb),
  ('demo-tp-link-deco-mesh', 'Sistema Wi-Fi Mesh TP-Link Deco', 'TP-Link', 'Redes', 'nuevo', 6900, 12, false, 4, 'Cubre toda la casa con una sola red Wi-Fi, sin zonas muertas. Se configura desde la app Deco.', '[{"label":"Tipo","value":"Wi-Fi mesh de doble banda"},{"label":"Velocidad","value":"Hasta 1,200 Mbps"},{"label":"Cobertura","value":"Hasta 190 m² por unidad"},{"label":"Puertos","value":"2 Gigabit por unidad"},{"label":"Configuración","value":"App Deco"}]'::jsonb),
  ('demo-samsung-980-pro-1tb', 'SSD Samsung 980 PRO 1 TB NVMe', 'Samsung', 'Componente', 'nuevo', 7900, 12, false, 5, 'Disco de estado sólido PCIe 4.0 de alto rendimiento para PC o laptop compatible.', '[{"label":"Capacidad","value":"1 TB"},{"label":"Interfaz","value":"PCIe 4.0 NVMe M.2 2280"},{"label":"Lectura","value":"Hasta 7,000 MB/s"},{"label":"Escritura","value":"Hasta 5,000 MB/s"},{"label":"Garantía del fabricante","value":"5 años"}]'::jsonb),
  ('demo-kingston-hyperx-fury-8gb-ddr3', 'Memoria Kingston HyperX Fury 8 GB DDR3', 'Kingston', 'Componente', 'usado', 1200, 1, false, 6, 'Módulo de memoria para PC de escritorio, probado y funcionando.', '[{"label":"Capacidad","value":"8 GB"},{"label":"Tipo","value":"DDR3 1866 MHz"},{"label":"Formato","value":"DIMM de escritorio"},{"label":"Modelo","value":"HX318C10FB/8"}]'::jsonb)
)
INSERT INTO public.products (user_id, slug, name, brand, category, condition, price, warranty_months, featured, stock_quantity, track_inventory, is_public, description, specs)
SELECT owner.id, d.slug, d.name, d.brand, d.category, d.condition, d.price, d.warranty_months, d.featured, d.stock_quantity, true, true, d.description, d.specs
FROM demo d CROSS JOIN owner
ON CONFLICT (user_id, slug) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, category = EXCLUDED.category, condition = EXCLUDED.condition,
  price = EXCLUDED.price, warranty_months = EXCLUDED.warranty_months, featured = EXCLUDED.featured,
  stock_quantity = EXCLUDED.stock_quantity, is_public = true, description = EXCLUDED.description, specs = EXCLUDED.specs;

SELECT count(*) AS productos_demo FROM public.products WHERE slug LIKE 'demo-%';

-- ROLLBACK -------------------------------------------------------------------
-- Borra los productos de prueba y sus filas de fotos. Los archivos de Storage
-- (carpeta <id del dueño>/demo/ del bucket product-images) se borran con:
--   node --env-file=.env.local scripts/seed-demo-images.mjs --rollback
-- que hace todo esto y además elimina los archivos.
--
-- DELETE FROM public.product_images WHERE product_id IN (SELECT id FROM public.products WHERE slug LIKE 'demo-%');
-- DELETE FROM public.products WHERE slug LIKE 'demo-%';
