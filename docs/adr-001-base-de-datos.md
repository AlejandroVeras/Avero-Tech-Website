# ADR-001 — ¿Migrar la base de datos de Supabase a Firebase (plan gratis)?

- **Estado:** propuesta, pendiente de decisión del dueño
- **Fecha:** 6 de octubre de 2026
- **Alcance:** solo análisis. No se escribió código de migración.

## Contexto

Avero Tech corre sobre Supabase: Postgres, autenticación, almacenamiento de fotos y reglas de seguridad por fila (RLS). Varios negocios reales ya usan el sistema de gestión con sus datos (facturas, clientes, inventario, ventas a crédito). Se evaluó pasar a Firebase usando solo el plan gratis (Spark), sin activar el plan de pago por uso (Blaze).

## Lo que ofrece cada plan gratis (verificado en las páginas oficiales el 6/10/2026)

| | Supabase Free | Firebase Spark |
|---|---|---|
| Base de datos | Postgres, 500 MB | Firestore, 1 GiB; 50 000 lecturas, 20 000 escrituras y 20 000 borrados **por día**; 10 GiB de salida al mes |
| Usuarios (auth) | 50 000 activos al mes | 50 000 activos al mes |
| Archivos (fotos de productos, logos) | 1 GB | **No disponible.** Cloud Storage for Firebase exige Blaze para crear buckets, y desde el **3 de febrero de 2026** los proyectos en Spark también pierden el acceso a sus buckets existentes |
| Funciones de servidor | Funciones SQL y triggers dentro de Postgres, sin costo extra | Cloud Functions: solo en Blaze |
| Hosting de la app Next.js | No aplica (la app está en Vercel) | App Hosting: solo en Blaze |
| Límite que más importa | El proyecto **se pausa tras 1 semana sin actividad** | Las cuotas diarias de lecturas y escrituras |

Fuentes: [Firebase pricing](https://firebase.google.com/pricing), [Cambios de Cloud Storage for Firebase (FAQ)](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), [Supabase pricing](https://supabase.com/pricing).

## Qué depende hoy de Postgres y habría que rehacer

Inventario sacado del repositorio:

- **Datos relacionales con joins:** facturas con sus items, cotizaciones con sus items, pagos de facturas, financiamiento de clientes con sus abonos, y reportes que suman por mes y por categoría. Firestore no tiene joins: habría que duplicar datos dentro de cada documento y mantenerlos sincronizados a mano.
- **Seguridad por fila (RLS):** aislamiento por negocio en más de 12 tablas, políticas restrictivas de solo lectura cuando vence la suscripción y vistas públicas que ocultan el costo. Todo esto tendría que reescribirse como reglas de seguridad de Firestore, que trabajan por documento y no pueden consultar otras colecciones de forma flexible.
- **Lógica dentro de la base:**
  - triggers: crear el perfil, iniciar la prueba gratis, asignar la dirección de la tienda, proteger el dueño de la tienda y bloquear borrados sin suscripción;
  - funciones: `has_write_access`, `account_has_access`, `admin_list_accounts`, `admin_record_payment`, `admin_set_subscription` y `submit_support_request`.
  
  En Firebase, el equivalente son Cloud Functions, y esas **solo existen en Blaze**.
- **Fotos de productos y logos:** viven en Supabase Storage. En Spark **no hay dónde guardarlas**.
- **Capa de datos de la app:** 16 de los 18 módulos de `lib/data/` usan el cliente de Supabase directamente (y los reportes dependen de ellos); habría que reescribirlos.
- **Usuarios:** habría que exportar las cuentas y sus contraseñas e importarlas en Firebase Auth. Si la importación de los hashes falla, cada negocio tendría que restablecer su contraseña.

## Riesgo

Migrar implica mover datos de negocios reales que facturan con el sistema. Un error deja facturas sin items, saldos de crédito mal calculados o negocios que no pueden entrar. Haría falta un período con los dos sistemas en paralelo, scripts de exportación e importación probados con copias, y una ventana de corte coordinada con cada negocio.

## Opciones

1. **Quedarse en Supabase Free** y mitigar su punto débil (la pausa por inactividad).
2. **Migrar a Firebase Spark.** No es viable: sin Cloud Storage no hay fotos de productos ni logos, y sin Cloud Functions no hay dónde poner la lógica de suscripciones, administración y soporte.
3. **Migrar a Firebase con Blaze.** Técnicamente posible, pero contradice el objetivo de no usar Blaze, exige reescribir la app completa y no resuelve ningún problema que hoy exista.
4. **Supabase Pro**, cuando el negocio lo justifique. Es el mismo código, sin migración, con más capacidad y sin pausas.

## Recomendación

**Quedarse en Supabase (opción 1) y pasar a Pro (opción 4) cuando aparezca alguno de los disparadores de abajo.**

Firebase gratis no puede alojar el producto tal como está: le faltan las fotos y la lógica del servidor. Además, la migración sería una reescritura completa con riesgo sobre datos reales, a cambio de ningún beneficio concreto. El plan gratis de Supabase cubre de sobra la escala actual: 500 MB de base de datos alcanzan para miles de productos y facturas, y con fotos de unos 150 KB en WebP, 1 GB de almacenamiento da para varios miles.

### Cómo mitigar la pausa por inactividad

- Mientras haya negocios usando el sistema a diario, el proyecto no queda inactivo.
- Como respaldo, se puede programar una consulta liviana diaria; por ejemplo, un cron de Vercel que abra `/catalogo`, que ya consulta la base.
- Hacer un respaldo periódico de la base (por ejemplo `pg_dump` desde una tarea programada) y revisar en la página de precios qué respaldos incluye el plan vigente.

### Cuándo pasar a Supabase Pro

- La base de datos se acerca a 400 MB, o el almacenamiento a 800 MB.
- La salida de datos se acerca a 5 GB al mes.
- Hay suficientes negocios pagando como para que una pausa o la pérdida de un día de datos sea inaceptable.

## Nota relacionada: cobros de suscripciones

Stripe **no acepta** negocios con sede en República Dominicana: en su lista de países de América Latina y el Caribe solo aparecen Brasil y México ([Stripe global](https://stripe.com/global)). PayPal sí permite recibir pagos en RD y retirarlos a Banco Popular ([PayPal RD](https://www.paypal.com/do/webapps/mpp/requesting-payments?locale.x=en_DO)). Las pasarelas locales (Azul, CardNet) requieren un contrato de comercio con el banco o adquirente; hay que confirmar sus condiciones directamente.

Mientras tanto, el panel `/admin` permite registrar pagos por transferencia y activar las suscripciones a mano, que es lo que el sitio ofrece hoy.
