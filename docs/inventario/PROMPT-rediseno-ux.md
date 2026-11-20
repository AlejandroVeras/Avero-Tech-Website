# Prompt: rediseño de experiencia de Avero Inventario (factores humanos + UI/UX)

> Pega este prompt completo en una sesión nueva de Claude Code abierta en el repo `Avero-Tech-Website`.

---

## Rol

Actúa como especialista sénior en **ingeniería de factores humanos** y en **diseño UI/UX de software de gestión para pequeños negocios**. Tienes experiencia con usuarios de baja alfabetización digital, que trabajan desde el celular, con el cliente esperando en el mostrador. Tu trabajo es que cualquier dueño o empleado de un negocio dominicano entre a **Avero Inventario** por primera vez y, sin manual ni llamada de soporte, sepa:

1. qué es cada cosa,
2. qué hacer primero, y
3. cómo hacer su tarea diaria más común en pocos toques.

El resultado no puede ser un sistema "de juguete": tiene que conservar la potencia actual (inventario, ventas a crédito, cotizaciones, facturas con ITBIS, gastos, reportes, catálogo en línea), pero mostrarla **en el momento en que hace falta y no antes** (divulgación progresiva).

## Contexto del producto (léelo antes de tocar nada)

- **Avero Inventario** es la app `/dashboard` de este repo (Next.js 16 + Supabase). Las migraciones son los `DATABASE_*.sql` de la raíz y se corren a mano en el SQL Editor de Supabase. Se publica en `inventario.averotechnology.com`.
- **Es multinegocio:** cada cuenta es un negocio distinto y ve solo sus datos.
- **La cuenta de Avero Technology es especial** (`profiles.is_store_owner = true`, además de administrador de plataforma en `platform_admins`):
  - sus productos públicos alimentan el **catálogo de la web** `averotechnology.com/catalogo`;
  - usa **Tickets** para su servicio de soporte técnico de TI;
  - ve **Administración** (`/admin`): negocios, pagos manuales, sistemas, ajustes.
  - **Ninguna otra cuenta** administra el catálogo de la web: cada negocio tiene su propia tienda en `/t/<slug>` ("Mi tienda").
- **Tipo de negocio** (`lib/business-setup.ts`, pantalla `/dashboard/bienvenida`, también en Configuración): ropa, colmado, ferretería, distribuidora, servicios u otro. Además se pregunta cómo vende (mostrador, factura a clientes fijos o las dos), si vende a crédito y cómo cobra el ITBIS. Hoy eso solo decide tres cosas (`featuresFor`): si aparece **Vender**, **Cotizaciones** y **Clientes**. El formulario de producto se adapta con `productFormFor`.
- **Menú actual** (`components/dashboard-nav.ts`), igual para casi todos: Vender*, Dashboard, Clientes*, Productos, Mi tienda, Cotizaciones*, Facturas / Ventas y facturas, Gastos, **Tickets**, Reportes, Configuración, Mi suscripción, Administración (solo admin). Los marcados con * dependen del tipo de negocio.
- **Cobro:** el sistema da 14 días de prueba sin tarjeta y la mensualidad se cobra a mano (PayPal está apagado con `PAYPAL_CHECKOUT_ENABLED` en `lib/features.ts`). "Mi suscripción" explica cómo pagar por WhatsApp.
- **Documentos:** las facturas y cotizaciones salen en un PDF vectorial con el logo y el color del negocio (`lib/document-pdf.ts`). Se imprimen con el mismo diseño en HTML (`lib/invoice-document.ts`).

## Problemas detectados (diagnóstico de factores humanos)

Verifícalos tú mismo en la app con una cuenta de prueba de cada tipo de negocio antes de proponer nada. Agrega los que encuentres.

1. **Funciones irrelevantes a la vista (ley de Hick, carga cognitiva).** Una tienda de ropa ve "Tickets", que es soporte técnico de TI: Hardware, Software, Red, Servidor, Seguridad. También ve "Gastos" y "Reportes" al mismo nivel que "Vender". El menú tiene hasta 13 entradas sin agrupar ni priorizar.
2. **Modelo mental del sistema y no del usuario.** El menú está organizado por tablas de la base de datos (Productos, Facturas, Gastos, Tickets), no por tareas del negocio (vender, cobrar, reponer mercancía, saber cuánto gané).
3. **Primer ingreso sin guía.** Después de las 3 preguntas de bienvenida, la persona cae en un dashboard vacío con ceros. No hay lista de primeros pasos, ni estados vacíos que enseñen, ni ejemplo de cómo se ve una venta terminada.
4. **Vocabulario técnico, en inglés o contable** (violación de "hablar el idioma del usuario"): "Dashboard", "Tickets", "Items", "SKU", "Importe Gravable", "Coste de lo vendido", "Ventas sin ITBIS", "Dirección web" del producto, "Exportar CSV". Además, unas pantallas escriben en Mayúscula Cada Palabra y otras en frase normal.
5. **Formularios largos sin jerarquía.** El producto pide más de 12 campos con el mismo peso visual. Para "otro" tipo de negocio propone campos de laptop (Procesador, RAM). Cuesta saber qué es obligatorio y qué es opcional.
6. **Retroalimentación débil (visibilidad del estado del sistema).** El botón de guardar producto a veces se queda en "cargando" para siempre y hay que recargar la página. Investígalo: el `router.refresh()` seguido de `router.push()` en `components/product-form.tsx` deja `loading` en `true` en el camino de éxito, y las pestañas que quedan abiertas entre un despliegue y otro llaman a acciones de servidor que ya no existen. Tampoco hay confirmaciones claras de "Guardado" ni una opción de deshacer.
7. **Prevención de errores insuficiente.** Se puede facturar con existencias en 0 sin aviso visible. No queda claro si un precio lleva o no ITBIS. Las acciones de borrar están al lado de editar, con el mismo tamaño.
8. **Mezcla de densidades y estilos.** Unas listas son tarjetas enormes con mucho espacio vacío (Facturas) y otras van muy apretadas (Productos, con el nombre truncado y los íconos pegados). Los botones de acción cambian de lugar de una pantalla a otra.
9. **Celular.** La mayoría vende desde el teléfono. Revisa los objetivos táctiles (mínimo 44 px), la navegación con el pulgar, las tablas que se desbordan y los teclados numéricos en los campos de dinero.

## Lo que debes entregar

### Fase 0: investigación y propuesta (entrega esto antes de escribir código)

1. **Inventario de pantallas y tareas.** Lista cada pantalla y cada acción. Para cada tipo de negocio, marca las **5 tareas más frecuentes** (por ejemplo, ropa: vender en mostrador, ver qué se está agotando, agregar mercancía nueva, compartir el catálogo, cerrar el día).
2. **Recorrido cognitivo** (cognitive walkthrough) de 4 tareas con una persona nueva, paso a paso: ¿sabe qué hacer?, ¿ve el control?, ¿entiende la respuesta del sistema? Hazlo en celular y en computadora, con capturas.
3. **Evaluación heurística** (las 10 de Nielsen más las leyes de Hick, Fitts y Miller) con severidad 0–4 por hallazgo.
4. **Propuesta de arquitectura de información** (abajo) y **wireframes de baja fidelidad** de: primer ingreso, Inicio, Vender, Productos (lista y formulario), Ventas, Configuración. Pueden ser en HTML simple o ASCII.
5. **Plan por fases** con criterios de aceptación medibles.

Espera mi aprobación antes de la Fase 1.

### Arquitectura de información propuesta (punto de partida, mejórala)

Organiza el menú por **tareas** y muéstralo según el **perfil** del negocio:

| Grupo | Entradas | Quién lo ve |
|---|---|---|
| **Principal** | Inicio · Vender (mostrador) · Ventas (facturas y cobros) | Todos; "Vender" solo si vende en mostrador |
| **Mi mercancía** | Productos · Mi tienda en línea | Todos |
| **Clientes** | Clientes · Cotizaciones · Cuentas por cobrar | Si factura a clientes fijos o vende a crédito |
| **Dinero** | Gastos · Reportes ("¿Cuánto gané?") | Todos, en un grupo secundario |
| **Servicio** | Órdenes de servicio (los "Tickets" rediseñados para talleres: equipo recibido, problema, estado, entrega) | Solo tipo "servicios", o si el negocio lo activa |
| **Avero** | Catálogo de la web · Soporte técnico (Tickets actuales) · Administración | **Solo la cuenta de Avero** (`is_store_owner` o admin) |
| **Cuenta** | Configuración · Mi suscripción · Ayuda | Todos, abajo o en el menú del usuario |

Reglas:

- **Nada se borra:** las funciones ocultas se activan en *Configuración → Herramientas del negocio*, con interruptores y una frase que explique para qué sirve cada una. Si alguien entra por URL directa a algo que tiene oculto, la pantalla explica que la herramienta está apagada y ofrece activarla.
- **Máximo 7 entradas visibles** en el primer nivel para un negocio típico. Con más, agrupa.
- **"Tickets" deja de aparecer para quien no es Avero.** Para servicios, se convierte en "Órdenes de servicio", con campos de taller y no de TI.
- En la cuenta de Avero, deja claro **qué productos van a la web** (averotechnology.com) y cuáles solo a su tienda. Otras cuentas nunca ven nada de la web de Avero.

### Primer ingreso (onboarding)

- Bienvenida corta: las mismas preguntas, con **vista previa del menú** que va a quedar ("Así se verá tu sistema").
- Pantalla de Inicio con **"Primeros pasos"**: una lista de 4–5 tareas con progreso, que se marcan solas al cumplirse y se pueden ocultar. Por ejemplo: subir el logo y los datos del negocio, agregar el primer producto, hacer la primera venta de prueba, compartir el enlace de la tienda e invitar a un empleado (si existe).
- **Estados vacíos que enseñan:** cada lista vacía explica en una frase para qué sirve, trae un botón con la acción principal y, si ayuda, una ilustración o un ejemplo.
- **Datos de ejemplo opcionales** ("Probar con productos de ejemplo"), que se borran con un clic.
- **Ayuda contextual:** un ícono "?" junto a los términos difíciles (ITBIS incluido, costo, crédito) con una explicación de una línea y un ejemplo en RD$. Nada de tours de 10 pasos que la gente salta.

### Pantallas clave

- **Inicio:** responde "¿cómo va mi negocio hoy?" y "¿qué debo hacer?". Muestra ventas de hoy, lo que me deben, los productos por agotarse y los accesos a las 3 tareas principales del perfil. Las tarjetas que no aplican no se muestran.
- **Vender:** se completa en 3 toques para el caso común: buscar o escanear, cantidad, cobrar. Confirmación grande con "Enviar recibo por WhatsApp". Aviso claro si no hay existencias.
- **Productos:** lista con foto, nombre completo, precio y existencias legibles en el celular. El formulario se divide en **Lo básico** (nombre, precio, existencias, foto) y **Más detalles** (plegado: costo, código, marca, categoría, especificaciones, garantía, visibilidad en la tienda). Los campos dependen del tipo de negocio.
- **Ventas:** una sola lista con filtros (hoy, por cobrar, pagadas) y acciones consistentes (ver, compartir, cobrar).
- **Reportes:** en lenguaje llano ("Vendiste", "Te costó la mercancía", "Gastaste", "Ganaste") con un comparativo contra el mes anterior.
- **Configuración:** agrupada en Negocio (datos, logo, color, correo), Ventas (ITBIS, tipo de negocio), Herramientas (interruptores), Tienda en línea y Cuenta.

### Lenguaje (microcopy)

- Español dominicano neutro, de **tú**, frases cortas, verbos de acción en los botones ("Guardar producto", "Cobrar RD$1,450").
- Sin inglés ni jerga: Dashboard → Inicio, Items → Productos, SKU → Código, Importe gravable → Monto antes de ITBIS, Coste de lo vendido → Lo que te costó la mercancía.
- Mayúscula solo al inicio de la frase. Montos siempre como `RD$1,450.00`, con `formatDOP`.
- Los errores dicen qué pasó y cómo arreglarlo, sin culpar a la persona.

### Diseño visual

- Mantén la identidad: fondo claro, tarjetas redondeadas, el color de marca de cada negocio (`brandProps`) y la tipografía actual. Moderno pero sobrio y profesional, no infantil.
- Una sola acción primaria por pantalla, siempre en el mismo lugar (arriba a la derecha en computadora; barra inferior fija en el celular).
- Borrar y otras acciones destructivas: secundarias, con confirmación y, donde se pueda, "Deshacer" en un aviso.
- Mismo patrón de lista, tarjeta y formulario en todas las secciones. Estados de carga con esqueletos y no con spinners eternos. Ningún botón puede quedarse "cargando" sin límite.
- Accesibilidad WCAG 2.2 AA: contraste, foco visible, etiquetas, objetivos de 44 px y respeto de `prefers-reduced-motion`. Modo oscuro sin roturas.

## Restricciones técnicas

- No se pierde ningún dato ni se rompe ningún enlace existente. Las URLs actuales siguen funcionando, aunque cambie el nombre en el menú.
- La visibilidad por perfil se decide en un solo lugar (extiende `featuresFor` y `dashboardNavigation`) y lleva pruebas unitarias en `tests/`. Lo que se guarde en la base de datos va en un `DATABASE_*.sql` idempotente.
- La cuenta de Avero se detecta con `is_store_owner` y `isPlatformAdmin()`, nunca por el nombre del negocio.
- Antes de cada entrega: `npx tsc --noEmit`, `npm test`, `npx eslint app components lib`, `npx next build`, y una revisión visual en el navegador, en celular (390 px) y en computadora (1440 px), con capturas de antes y después.
- Commits pequeños por fase, en inglés y en imperativo, como los del repo.

## Cómo sabremos que funciona

- **Prueba con 5 personas reales** (dueños o empleados de tienda de ropa, colmado y taller) antes y después. Tareas: crear un producto, hacer una venta, enviar el recibo por WhatsApp, saber cuánto ganó el mes pasado y compartir la tienda.
- **Métricas:** éxito por tarea ≥ 90 %, tiempo hasta la primera venta < 5 min desde el registro, SUS ≥ 80, 0 preguntas de "¿dónde está…?" en las pruebas, y menos mensajes de soporte por WhatsApp en el primer mes.
- **Criterio de salida por fase:** cada hallazgo de severidad 3–4 de la Fase 0 resuelto y verificado en el navegador.
