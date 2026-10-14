# Guion de video: Sistema de gestión e inventario (Avero)

Fase 1: guion de narración. Todavía no se graba nada.
Duración meta: **2:55** (versión larga) y **0:40** (versión vertical).
Negocio de demostración: **Celulares Doña Rosa** (Los Alcarrizos). Todos los datos son ficticios.

---

## (a) Lo que existe / lo que no

Esto se verificó contra el código el 14 de octubre de 2026. El guion solo promete lo que existe.

### Lo que existe (y se usa en el video)

| Paso | Cómo se ve en la app | Archivos |
|---|---|---|
| Registro | `/signup` → "Crear cuenta". Campos: "Nombre del Negocio", "Correo Electrónico", "Contraseña". Botón "Crear Cuenta". | `components/signup-form.tsx`, `app/signup/page.tsx` |
| Activar prueba | Pantalla "Activa tu prueba gratis, {negocio}". Opciones "Mensual" y "Anual", el texto "Hoy no se te cobra nada." y el botón "Continuar con PayPal y empezar la prueba". La prueba dura 30 días. | `components/billing/activation-screen.tsx`, `components/billing/plan-checkout.tsx`, `DATABASE_PRICING_2026_10.sql` (trial_days = 30) |
| Menú lateral | Dashboard, Clientes, Productos, Mi tienda, Cotizaciones, Facturas, Gastos, Tickets, Reportes, Configuración, Mi suscripción. En el móvil se abre con el ícono de menú. | `components/dashboard-sidebar.tsx`, `components/dashboard-header.tsx` |
| Productos | Página "Productos y Servicios" con el botón "Nuevo Producto". El formulario tiene "Nombre del Producto *", "SKU / Código", "Categoría", "Precio de Venta (RD$) *" y "Costo (RD$)". El costo lleva la nota "Privado: nunca se muestra en la tienda." Además están las casillas "Controlar inventario" y "Visible en la tienda", el campo "Cantidad disponible en stock", la tarjeta "Detalles para la tienda en línea" (con "Fotos", "Marca", "Condición", "Garantía (meses)" y "Destacado") y el botón "Crear Producto". La lista muestra la etiqueta "📦 N unidades en stock". | `components/product-form.tsx`, `components/products-list.tsx` |
| Facturar | Botón "Nueva Factura". Tarjeta "Información del Cliente" con "Cliente / Seleccionar cliente", "Nombre del Cliente *", "Fecha de Emisión *", "Fecha de Vencimiento" y "Estado" (Borrador/Enviada/Pagada/Vencida/Cancelada). Tarjeta "Items" con "Producto *", "Cant." y "Precio Unitario (del producto)". La casilla "Aplicar ITBIS (18%)" viene marcada. Abajo están "Subtotal", "ITBIS (18%)", "Total a Pagar:" y el botón "Crear Factura". | `components/invoice-form.tsx` |
| El inventario baja solo | Al guardar una factura se resta la cantidad de cada producto que tenga "Controlar inventario". | `lib/data/invoices.ts` líneas 288–294 |
| Factura en PDF | En el detalle de la factura (ícono "Ver detalle y exportar") están "Descargar PDF" y "Enviar por Email". | `components/invoice-pdf.tsx`, `app/dashboard/invoices/[id]/detail/page.tsx` |
| Crédito al cliente | Ficha del cliente, tarjeta "Financiamiento": casilla "Habilitar financiamiento para este cliente", "Límite de Financiamiento (DOP) *" y "Tasa de Interés Mensual (%)". En la factura aparece el recuadro "💳 Financiamiento Disponible" (LÍMITE / USADO / DISPONIBLE) y la casilla "Aplicar a Financiamiento del Cliente". | `components/customer-form.tsx`, `components/invoice-form.tsx`, `lib/data/invoices.ts` |
| Abono | Detalle de la factura, tarjeta "Registrar Pago": "Monto a abonar", "Método" (Efectivo/Transferencia/Tarjeta) y botón "Aplicar Pago". Después se ven "Historial de Pagos", "Total Pagado:" y "Balance Pendiente:", y el recibo tiene "Imprimir". En una factura a crédito, el abono también baja la deuda del cliente. Hay otra vía en la ficha del cliente: "Agregar Pago" → "Registrar Pago". | `app/dashboard/invoices/[id]/detail/page.tsx`, `lib/data/payments.ts`, `components/payment-receipt-pdf.tsx`, `components/financing-payment-form.tsx` |
| Tienda en línea | "Mi tienda en línea": "Datos de la tienda", "Tienda activa", "Dirección de tu tienda *" (prefijo `inventario.averotechnology.com/t/`), "WhatsApp para pedidos *", "Descripción corta", "Logo" y botón "Guardar". En "Tu enlace" están "Copiar", "Ver tienda" y "Descargar QR" ("Imprímelo y ponlo en tu mostrador."). | `components/store-settings-form.tsx`, `app/dashboard/tienda/page.tsx` |
| Catálogo público | `/t/{tienda}` tiene buscador ("Buscar por nombre, marca o categoría..."), filtros, "Disponible"/"Agotado" y, en cada producto, el botón "Consultar por WhatsApp". | `app/t/[store]/page.tsx`, `components/site/catalog.tsx`, `components/site/product-card.tsx`, `components/site/product-detail.tsx` |
| Resumen del mes | En la pantalla de inicio: "Ingresos del Mes", "Ganancia Neta" ("Utilidad del mes"), "Facturas Pendientes", "Clientes Activos" y "Actividad Reciente". | `components/dashboard-stats.tsx`, `components/recent-activity.tsx` |
| Reportes | "Reportes y Análisis" con "Ingresos Totales", "Gastos Totales", "Ganancia Neta", "Facturas Pendientes", la gráfica "Ingresos vs Gastos (Últimos 6 Meses)", "Gastos por Categoría" y el botón "Exportar Reporte" (descarga un CSV que abre en Excel). | `app/dashboard/reports/page.tsx`, `lib/data/reports.ts`, `components/export-reports-button.tsx` |
| Extras (no salen en el video largo) | "Nueva Cotización" (se puede convertir en factura), "Nuevo Gasto", "Tickets de Soporte" (reparaciones), "Configuración Comercial" (logo y datos) y "Mi suscripción". | `app/dashboard/quotes`, `app/dashboard/expenses`, `app/dashboard/tickets`, `app/dashboard/settings` |

### Lo que NO existe o funciona distinto a lo planeado

1. **No se puede decir "sin tarjeta" porque es falso.** Las cuentas nuevas nacen en estado `incomplete` y la app queda bloqueada en la pantalla de activación hasta que el usuario autoriza el pago con PayPal (cuenta PayPal o tarjeta). Lo que sí es cierto es "Hoy no se te cobra nada" durante los 30 días. Referencias: `DATABASE_BILLING_UPDATE.sql` (start_trial_for_new_user, "Pendiente: debe poner su tarjeta…"), `app/dashboard/layout.tsx` (ActivationScreen) y `components/signup-form.tsx` ("Te pediremos autorizar el pago con PayPal…"). El trigger de `DATABASE_SYSTEMS_UPDATE.sql` (14 días, `trialing`) ya quedó reemplazado. Solo si PayPal no está configurado aparece "Activar por WhatsApp".
2. **"Reportes" no tiene filtro por mes.** Las tarjetas de Reportes suman todo el historial, porque `getFinancialSummary()` se llama sin fechas. Las cifras del mes salen en la pantalla de inicio ("Ingresos del Mes"). La gráfica cubre los últimos 6 meses. Por eso el capítulo "reporte del mes" usa la pantalla de inicio más la gráfica.
3. **El inventario baja con cualquier factura, aunque sea "Borrador".** El código no revisa el estado (`lib/data/invoices.ts` 288–294). Al grabar, nunca guardes una factura de prueba en borrador, porque descuadra el conteo.
4. **El crédito solo se aplica si la factura no está en "Borrador".** El estado por defecto es "Borrador", así que la venta a crédito debe guardarse como **"Enviada"**. Además, el cliente debe tener antes "Habilitar financiamiento para este cliente"; si no, la casilla "Aplicar a Financiamiento del Cliente" no aparece.
5. **La factura no tiene NCF ni comprobante fiscal.** Nada en el código maneja NCF ni e-CF. No digas "factura fiscal" ni "válida para la DGII". El ITBIS sí se calcula al 18%.
6. **La tienda en línea no tiene carrito ni pagos.** El catálogo usa `showCart={false}` y los pedidos llegan por "Consultar por WhatsApp". El producto debe tener "Visible en la tienda" y la tienda "Tienda activa".
7. **Etiquetas en pantalla que contradicen la narración.** El menú dice literalmente "Dashboard" y la narración dice "pantalla de inicio" (puedes taparlo en edición). En el formulario de producto, "Dirección web" muestra el prefijo `/catalogo/`, pero en la tienda del cliente la ruta real es `/t/{tienda}/{producto}`, así que no hagas zoom ahí.
8. **El reporte se exporta en CSV, no en PDF ni Excel nativo.** Decir "lo abres en Excel" es correcto.

---

## (b) Capítulos (para WebVTT)

| # | Inicio | Capítulo |
|---|---|---|
| 1 | 00:00.000 | Introducción |
| 2 | 00:20.000 | Por qué te sirve |
| 3 | 00:40.000 | Crea tu cuenta |
| 4 | 00:55.000 | Agrega productos y existencias |
| 5 | 01:15.000 | Factura en segundos |
| 6 | 01:37.000 | Venta a crédito y abonos |
| 7 | 02:00.000 | Tu catálogo en línea |
| 8 | 02:22.000 | Cómo te fue este mes |
| 9 | 02:40.000 | Pruébalo gratis |

```vtt
WEBVTT

00:00.000 --> 00:20.000
Introducción

00:20.000 --> 00:40.000
Por qué te sirve

00:40.000 --> 00:55.000
Crea tu cuenta

00:55.000 --> 01:15.000
Agrega productos y existencias

01:15.000 --> 01:37.000
Factura en segundos

01:37.000 --> 02:00.000
Venta a crédito y abonos

02:00.000 --> 02:22.000
Tu catálogo en línea

02:22.000 --> 02:40.000
Cómo te fue este mes

02:40.000 --> 02:55.000
Pruébalo gratis
```

---

## (c) Guion: versión larga (2:55)

**Datos de demo que hay que tener cargados antes de grabar**
- Negocio: "Celulares Doña Rosa", con la dirección de tienda `celulares-dona-rosa` y WhatsApp 809-555-0187.
- Producto: "Samsung Galaxy A15 128GB". Precio de venta RD$12,000, costo RD$9,200, 10 en existencia, marca Samsung, condición Nuevo, garantía 3 meses, con foto. También hay 5 o 6 productos más ya visibles en la tienda (fundas, cargadores, Redmi 13C, audífonos).
- Contado: la clienta "María Santos" escrita a mano, con estado "Pagada".
- Crédito: el cliente "Juan Pérez", 809-555-0142, con financiamiento habilitado y límite de RD$20,000.
- Cuentas: 12,000 + ITBIS de 2,160 = **RD$14,160**. Con un abono de RD$5,000 queda un **balance de RD$9,160**. El inventario pasa de 10 a 9 (contado) y de 9 a 8 (crédito).
- Gastos y facturas pagadas de meses anteriores, para que la gráfica de 6 meses tenga datos.

| tiempo | voz | lo que se ve | texto en pantalla | acción del cursor |
|---|---|---|---|---|
| 0:00–0:08 | ¿Vendiste el último celular… y el cuaderno decía que te quedaban tres? | Primer plano de un mostrador con un cuaderno de cuentas tachado. Corte a la lista "Productos y Servicios" con "📦 0 unidades en stock" en rojo. | ¿Tu inventario vive en un cuaderno? | Sin cursor. |
| 0:08–0:20 | Si tienes un colmado, una tienda de celulares, una ferretería o una boutique… esto es para ti. [pausa 0.4s] Tu inventario, tus facturas y tus clientes… en un solo lugar. | Cuatro tomas rápidas: colmado, tienda de celulares, ferretería y boutique. Cierra en la pantalla de inicio de "Celulares Doña Rosa". | Colmados · Celulares · Ferreterías · Boutiques | Sin cursor. |
| 0:20–0:40 | Primero: sabes qué tienes… sin contar a mano. [pausa 0.4s] Segundo: sabes quién te debe… y cuánto. [pausa 0.4s] Tercero: tus clientes ven tus productos en su celular… y te escriben por WhatsApp. [pausa 0.4s] Vamos a verlo paso a paso. | Tres planos cortos: 1) la etiqueta "📦 9 unidades en stock"; 2) el recuadro "💳 Financiamiento Disponible" con LÍMITE / USADO / DISPONIBLE; 3) el catálogo público en un teléfono con el botón "Consultar por WhatsApp". | 1. Inventario al día · 2. Cuentas por cobrar claras · 3. Catálogo con pedidos por WhatsApp | Sin cursor. |
| 0:40–0:55 | Crear tu cuenta toma un minuto. [pausa 0.3s] Escribe el nombre de tu negocio, tu correo y una contraseña. [pausa 0.3s] Luego eliges tu plan… y empiezas tu prueba gratis (sin tarjeta). [pausa 0.3s] Durante treinta días… no se te cobra nada. | Formulario "Crear cuenta". Después, la pantalla "Activa tu prueba gratis, Celulares Doña Rosa" con las opciones "Mensual" y "Anual" y el recuadro "Hoy no se te cobra nada.". | Crea tu cuenta · 30 días gratis · US$12/mes o US$120/año | Escribe en "Nombre del Negocio" → "Celulares Doña Rosa", en "Correo Electrónico" y en "Contraseña". Clic en "Crear Cuenta". Clic en la opción "Mensual" y pasa el cursor sobre "Continuar con PayPal y empezar la prueba" (no hagas clic en cámara). |
| 0:55–1:15 | Ahora, agrega tus productos. [pausa 0.3s] Toca Nuevo Producto… y escribe el nombre: Samsung Galaxy A15. [pausa 0.3s] Pon el precio de venta… y lo que te costó. [pausa 0.3s] Marca Controlar inventario… y escribe cuántos tienes: diez. [pausa 0.3s] El costo es privado… tus clientes nunca lo ven. | Menú "Productos" → "Productos y Servicios" → formulario de producto. Se resalta la nota "Privado: nunca se muestra en la tienda.". Termina en la lista con "📦 10 unidades en stock". | Precio RD$12,000 · Costo RD$9,200 · 10 unidades | Clic en "Productos" y luego en "Nuevo Producto". Escribe en "Nombre del Producto *" → "Samsung Galaxy A15 128GB", en "Precio de Venta (RD$) *" → 12000 y en "Costo (RD$)" → 9200. Marca "Controlar inventario" y escribe en "Cantidad disponible en stock" → 10. Marca "Visible en la tienda". Clic en "Crear Producto". |
| 1:15–1:37 | Llegó una clienta. Toca Nueva Factura. [pausa 0.3s] Escribes su nombre… y escoges el producto. [pausa 0.3s] El precio sale solo. [pausa 0.3s] El ITBIS del dieciocho por ciento… ya viene calculado. [pausa 0.3s] Total: catorce mil ciento sesenta pesos. [pausa 0.4s] Guardas… y el inventario baja solo: de diez a nueve. [pausa 0.3s] Y si quieres, descargas la factura en PDF. | Formulario de factura. Zoom a "Subtotal", "ITBIS (18%)" y "Total a Pagar:". Corte a la lista de productos con "📦 9 unidades en stock". Luego el detalle de la factura con el PDF. | ITBIS 18% automático · Total RD$14,160 · Inventario: 10 → 9 | Clic en "Facturas" y luego en "Nueva Factura". Escribe en "Nombre del Cliente *" → "María Santos". En "Estado" elige "Pagada". En "Producto *" elige "Samsung Galaxy A15 128GB" (aparece "(del producto)"). Pasa el cursor sobre "Aplicar ITBIS (18%)", que ya está marcado. Clic en "Crear Factura". Clic en "Productos" para ver el 9. Vuelve a "Facturas", clic en el ícono "Ver detalle y exportar" y luego en "Descargar PDF". |
| 1:37–2:00 | ¿Y cuando el cliente paga después? [pausa 0.4s] En su ficha, activas el crédito con un límite: veinte mil pesos. [pausa 0.3s] Al facturar, marcas Aplicar a financiamiento del cliente. [pausa 0.3s] Cuando vuelve a pagar, abres la factura… y registras el abono. [pausa 0.3s] Cinco mil pesos. [pausa 0.3s] El balance baja solo… y le imprimes su recibo. | Ficha del cliente con la tarjeta "Financiamiento". Luego la factura con el recuadro "💳 Financiamiento Disponible" y, al final, el detalle con "Registrar Pago", "Historial de Pagos" y "Balance Pendiente:". | Juan Pérez · 809-555-0142 · Límite RD$20,000 · Abono RD$5,000 · Balance RD$9,160 | Clic en "Clientes" y abre "Juan Pérez". Marca "Habilitar financiamiento para este cliente" y escribe en "Límite de Financiamiento (DOP) *" → 20000. Clic en "Actualizar Cliente". Clic en "Facturas" y luego en "Nueva Factura". En "Seleccionar cliente" elige "Juan Pérez" y marca "Aplicar a Financiamiento del Cliente". En "Estado" elige "Enviada" (obligatorio, nunca Borrador). Agrega el A15 y haz clic en "Crear Factura". Abre "Ver detalle y exportar" y escribe en "Monto a abonar" → 5000 con "Método" en "Efectivo". Clic en "Aplicar Pago" y luego en "Imprimir" en el recibo. |
| 2:00–2:22 | Ahora, que tus clientes vean lo que tienes. [pausa 0.3s] En Mi tienda, escoges la dirección de tu tienda… y tu WhatsApp. [pausa 0.3s] Activas la tienda, guardas… y copias tu enlace. [pausa 0.3s] Compártelo en tus estados… o imprime el código QR para el mostrador. [pausa 0.3s] Si algo se agota, la tienda lo marca sola. | "Mi tienda en línea" → tarjeta "Tu enlace" con el QR. Corte a un teléfono con `/t/celulares-dona-rosa`: buscador, tarjetas "Disponible" y una en "Agotado", y el detalle del A15 con "Consultar por WhatsApp". | inventario.averotechnology.com/t/celulares-dona-rosa | Clic en "Mi tienda". Marca "Tienda activa". Escribe en "Dirección de tu tienda *" → celulares-dona-rosa y en "WhatsApp para pedidos *" → 809-555-0187. Clic en "Guardar" (aparece "Tienda guardada y publicada."). Clic en "Copiar", luego en "Descargar QR" y después en "Ver tienda". En el teléfono, toca el A15 y pasa sobre "Consultar por WhatsApp". |
| 2:22–2:40 | Y a fin de mes… ¿cómo te fue? [pausa 0.4s] En la pantalla de inicio ves lo que entró este mes… y tu ganancia. [pausa 0.3s] En Reportes, comparas ingresos y gastos de los últimos seis meses. [pausa 0.3s] Y lo descargas para abrirlo en Excel. | Pantalla de inicio con las tarjetas "Ingresos del Mes", "Ganancia Neta" ("Utilidad del mes") y "Facturas Pendientes". Corte a "Reportes y Análisis" con la gráfica "Ingresos vs Gastos (Últimos 6 Meses)". El CSV se abre en Excel. | Ingresos del mes · Ganancia · Exporta a Excel | Clic en el logo (inicio) y pasa el cursor sobre "Ingresos del Mes". Clic en "Reportes", recorre la gráfica y haz clic en "Exportar Reporte". |
| 2:40–2:55 | Tu negocio en orden… sin cuadernos y sin adivinar. [pausa 0.4s] Pruébalo gratis por treinta días. [pausa 0.3s] Entra a inventario punto averotechnology punto com. [pausa 0.3s] ¿Tienes preguntas? Escríbenos por WhatsApp… al ocho veintinueve… ocho doce… veintiuno cero tres. | Logo de Avero sobre el fondo de marca. La URL y el número quedan fijos en pantalla los últimos 10 s. | 30 días gratis · Hoy no se te cobra nada · inventario.averotechnology.com · WhatsApp (829) 812-2103 · US$12/mes o US$120/año | Sin cursor. |

---

## (d) Conteo y duración: versión larga

| Bloque | Palabras de voz |
|---|---|
| Gancho (0:00–0:08) | 12 |
| Para quién (0:08–0:20) | 28 |
| Beneficios (0:20–0:40) | 35 |
| Crea tu cuenta (0:40–0:55) | 35 |
| Productos (0:55–1:15) | 41 |
| Facturar (1:15–1:37) | 50 |
| Crédito y abono (1:37–2:00) | 49 |
| Catálogo en línea (2:00–2:22) | 49 |
| Reporte del mes (2:22–2:40) | 40 |
| Cierre (2:40–2:55) | 34 |
| **Total** | **373 palabras** |

- Al ritmo de 140 palabras por minuto, la voz ocupa unos **2:40**. Las pausas marcadas suman unos 13 s más, para un total cercano a **2:53**, y la edición final dura **2:55**. Cabe dentro del rango de 2:30 a 3:30.
- Hay unos 20 s de respiro para las transiciones. Si la locución sale más lenta, el capítulo de crédito puede estirarse hasta las 2:03 y todo se corre 3 s.
- Los precios (US$12/mes, US$120/año) solo aparecen como texto en pantalla. La voz nunca los dice.

---

## (e) Versión vertical corta (9:16, 0:40)

Graba en el teléfono o recorta la versión de escritorio. En el móvil, el menú se abre con el ícono ☰ del encabezado.

| tiempo | voz | lo que se ve | texto en pantalla | acción del cursor |
|---|---|---|---|---|
| 0:00–0:04 | ¿Todavía llevas tu inventario en un cuaderno? | Cuaderno tachado sobre el mostrador. | ¿Inventario en cuaderno? | Sin cursor. |
| 0:04–0:10 | Para colmados, tiendas de celulares, ferreterías y boutiques… hay una forma más fácil. | Cuatro tomas de 1 s cada una y cierre en la pantalla de inicio. | Colmados · Celulares · Ferreterías · Boutiques | Sin cursor. |
| 0:10–0:17 | Agregas tus productos… y el sistema cuenta por ti. | Formulario de producto: "Controlar inventario" → 10. Lista con "📦 10 unidades en stock". | Samsung A15 · 10 unidades | Toque en "Nuevo Producto", luego marca "Controlar inventario" y toca "Crear Producto". |
| 0:17–0:24 | Facturas con ITBIS… y la existencia baja sola. | "Nueva Factura" con "ITBIS (18%)" y "Total a Pagar:" RD$14,160. Corte a "📦 9 unidades en stock". | ITBIS 18% automático · 10 → 9 | Toque en "Crear Factura". |
| 0:24–0:30 | ¿Fiado? Anotas el abono… y sabes cuánto falta. | Detalle de la factura con "Monto a abonar" 5000 → "Aplicar Pago" → "Balance Pendiente:" RD$9,160. | Abono RD$5,000 · Balance RD$9,160 | Toque en "Aplicar Pago". |
| 0:30–0:35 | Y tus clientes ven tu catálogo… y te piden por WhatsApp. | Teléfono en `/t/celulares-dona-rosa` y luego "Consultar por WhatsApp". | tu-negocio en línea + QR | Toque en "Consultar por WhatsApp". |
| 0:35–0:40 | Pruébalo gratis por treinta días. | Logo, URL y número fijos. | 30 días gratis · inventario.averotechnology.com · WhatsApp (829) 812-2103 | Sin cursor. |

**Conteo de la versión corta:** 61 palabras, unos 26 s de voz a 140 por minuto. Con pausas y respiro queda en **0:40**.
