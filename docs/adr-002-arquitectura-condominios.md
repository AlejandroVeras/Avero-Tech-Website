# ADR-002 — Arquitectura de Avero Condominios (Fase 0)

- **Estado:** propuesta, pendiente de aprobación del dueño
- **Fecha:** 7 de octubre de 2026
- **Alcance:** decisiones de arquitectura. No se escribió código del producto.
- **Fuente de verdad funcional:** "Avero Condominios — Qué incluye el sistema" (documento y PDF del 7/10/2026).

## Resumen de decisiones

| # | Decisión | Recomendación |
|---|---|---|
| 1 | Dónde vive el producto | **App aparte** (repo propio y proyecto de Supabase propio), misma marca, en `condominios.averotechnology.com` |
| 2 | Dinero | **Libro contable inmutable** por unidad; el saldo se calcula, nunca se escribe |
| 3 | Reglas de cobro | Tablas de configuración tipadas por edificio, con valores por defecto |
| 4 | Escrituras financieras | Solo mediante funciones SQL (`SECURITY DEFINER`) con permisos por rol; el navegador nunca inserta movimientos |
| 5 | Reservas | Choques imposibles por **restricción de exclusión** en la base (probado: 50 intentos simultáneos → 1 confirmada) |
| 6 | Login del propietario | Teléfono + código por WhatsApp con el **hook de envío de SMS de Supabase Auth**; respaldo por correo |
| 7 | WhatsApp | API oficial de Meta (Cloud API), un número de Avero, plantillas de categoría "utility" y "authentication" |
| 8 | Trabajos en segundo plano | **Bandeja de salida en la base** + `pg_cron` de Supabase, idempotente |
| 9 | Lectura de comprobantes y medidores | Claude con visión y salida estructurada, **más validaciones deterministas**; nunca se aplica un pago dudoso |
| 10 | Cobro de Avero | Por unidad al mes con PayPal (suscripción con cantidad = unidades) |

---

## 1. Dónde vive el producto

**Opción A — dentro del repo actual de Avero.**
- A favor: reutiliza diseño, login y cobro sin copiar nada; un solo despliegue.
- En contra:
  - Mezcla datos de residentes (miles de personas, datos financieros del hogar) con los de las pymes en la misma base.
  - Un error de permisos en un sistema expone al otro.
  - El modelo de usuario es distinto: negocios con correo y contraseña frente a residentes con teléfono y código.
  - Cada despliegue de condominios arriesga el sitio comercial y el sistema de gestión, que ya tienen clientes.
  - El plan gratis de Supabase (500 MB, 1 GB de archivos) se agota rápido con fotos de medidores y facturas.

**Opción B — app aparte (recomendada).**
- A favor:
  - Aislamiento total de datos y de permisos.
  - Despliegues independientes.
  - Plan de Supabase dimensionado para este producto.
  - Se puede vender, auditar o escalar por separado.
- En contra:
  - Hay que copiar los tokens de diseño y componentes base.
  - El cobro con PayPal se reutiliza copiando el módulo `lib/billing/`, no compartiéndolo.

**Recomendación: B.**
- Repo nuevo `avero-condominios` con Next.js 16, Supabase, Tailwind v4 y shadcn (la misma pila).
- Se copian los tokens de `globals.css` y DESIGN.md.
- Más adelante, si hay un tercer sistema, se extrae un paquete compartido de interfaz.
- El sitio averotechnology.com enlaza a `/sistemas/condominios` (página comercial) y la app vive en `condominios.averotechnology.com`.

**Costo de infraestructura:**
- Supabase Pro (US$25/mes) desde el primer edificio real: el plan gratis pausa el proyecto tras una semana sin uso y tiene 1 GB de archivos.
- **Estimación de archivos** (hay que medirla), con fotos comprimidas a WebP de unos 150 KB, por edificio de 40 unidades:
  - 40 fotos de medidores al mes → 6 MB;
  - unos 60 comprobantes y facturas al mes → 9 MB;
  - **total: unos 180 MB al año.**

## 2. Modelo de datos

### Jerarquía
```
organizations (empresa administradora, o la junta si se autoadministra)
 └─ buildings (moneda, zona horaria, idioma, país)
     ├─ towers (opcional; pueden tener presupuesto propio)
     └─ units (código, tipo, m², % de áreas comunes, torre)
         └─ unit_people (persona + relación con la unidad)
```

### Tablas principales

| Área | Tablas |
|---|---|
| Personas y acceso | `profiles` (teléfono, nombre, idioma), `organization_members` (rol en la empresa), `building_staff` (rol en el edificio), `unit_people` (relación: propietario, inquilino, apoderado, Airbnb, emergencia; recibe cobros sí/no; puede pagar sí/no) |
| Configuración de cobro | `charge_types` (un cargo y su forma de cálculo), `billing_settings` (vencimiento, gracia, recargo, pronto pago, orden de aplicación de pagos parciales, a quién se cobra) |
| Medidores | `meters` (unidad, tipo gas, unidad de medida), `meter_readings` (lectura, foto, lectura propuesta por la IA, confianza, estado, precio del período) |
| Libro contable | `ledger_entries` (inmutable): cargo, pago, ajuste, nota de crédito, recargo, depósito, devolución; monto con signo `numeric(14,2)`, moneda, período, origen |
| Facturas | `billing_periods` (borrador → emitido → cerrado), `invoices` (número, unidad, período, total, PDF), `invoice_lines` (apuntan a movimientos) |
| Pagos | `payments` (monto, método, banco, referencia, fecha, evidencia, estado: por revisar / aplicado / rechazado), `payment_allocations` (qué cargo cubre cada parte del pago), `bank_imports` y `bank_import_lines` |
| Cobranza | `payment_plans` y `payment_plan_installments` (acuerdos de pago), `collection_steps` (recordatorios y cartas enviadas) |
| Gastos | `suppliers`, `expenses` (con foto de factura y estado de aprobación), `expense_approvals`, `budget_lines`, `reserve_fund_entries` |
| Reservas | `amenities` (fotos, capacidad, reglas, modo, precios, dinero reembolsable o no, cancelación, límites, aprobación, bloqueo a morosos), `amenity_blackouts`, `reservations` (rango de tiempo, estado, tarifa, depósito, estado del depósito, invitados), `reservation_inspections` (fotos de entrega y recibo) |
| Operación | `tickets` y `ticket_updates` (averías), `visitor_passes` (código guardado como hash, vigencia), `packages`, `announcements` (audiencia), `maintenance_tasks` |
| Gobierno | `assemblies`, `agenda_items`, `votes` (con peso por % de áreas comunes), `documents` |
| Mensajería | `message_outbox` (canal, plantilla, destino, datos, llave de idempotencia única, estado, intentos), `message_inbound` (crudo, para auditoría), `message_preferences` (bajas) |
| Auditoría | `audit_log` (solo agregar) |

### Cómo se representa cada regla configurable

| Regla del documento | Representación |
|---|---|
| Gas dentro del mantenimiento o medido | `charge_types.calc_method` = `included` o `metered`; con `included`, el gas es una partida de `budget_lines` y de `expenses`, no un cargo aparte |
| Formas de calcular la cuota | `calc_method` ∈ `fixed`, `share_pct`, `per_m2`, `per_unit_type`, `split_equal`, `metered`; los parámetros van en columnas tipadas, no en JSON libre |
| Planta eléctrica, agua y camiones | Más `charge_types` con su método (`included`, `split_equal`, `share_pct`, `metered`) |
| Recargo por mora | `billing_settings`: tipo (porcentaje o fijo), valor, día de inicio y tope; desactivado por defecto |
| Orden de pagos parciales | `billing_settings.allocation_order` (arreglo de categorías); por defecto: recargos → gas → cuota |
| Reserva: tarifa y depósito | `amenities.fee_amount`, `fee_refundable` (sí/no), `deposit_amount` (0 = sin depósito), `cancellation_hours`, `cancellation_refund_pct` |
| A quién se cobra | `billing_settings.bill_to` (propietario, inquilino o ambos) + `unit_people.receives_billing` |

**Por qué columnas tipadas y no un JSON de configuración:** estas reglas mueven dinero. Las columnas permiten restricciones `CHECK` en la base y errores claros. Un JSON libre deja pasar configuraciones imposibles.

### El libro contable
- Cada cargo, pago, ajuste y nota de crédito es una fila de `ledger_entries`. Un trigger bloquea `UPDATE` y `DELETE`.
- Una factura emitida no se toca. Para corregirla se crea una nota de crédito y un cargo nuevo.
- El saldo de una unidad es la suma de sus movimientos, mediante una vista (`unit_balances`).
- Montos en `numeric(14,2)` en la base y aritmética decimal en el código; nunca `float`. Redondeo comercial al centavo, en un solo lugar del código.
- **Prueba obligatoria:** para cada unidad, saldo = suma de cargos − suma de pagos aplicados, después de miles de operaciones aleatorias.

## 3. Permisos (RLS)

Reglas generales:
- Cada tabla tiene `building_id`.
- Las funciones `is_staff(building, roles[])` y `is_unit_member(unit)` deciden el acceso.
- Las escrituras de dinero solo pasan por funciones SQL: `issue_period`, `register_payment`, `apply_payment`, `record_expense`, `approve_expense`, `book_amenity`, `settle_deposit`, etc. El rol `authenticated` no tiene `INSERT` sobre `ledger_entries`.

| Rol | Finanzas del edificio | Cuenta de una unidad | Configuración | Operación |
|---|---|---|---|---|
| Administrador de la empresa | Todos sus edificios | Todas | Sí | Sí |
| Administrador del edificio | Leer y escribir | Todas | Sí | Sí |
| Junta | Leer y aprobar gastos | Solo totales, sin datos personales | No | Leer |
| Contador | Leer y exportar | Todas | No | No |
| Conserje | No | No | No | Lecturas de medidores, averías asignadas, entregas de áreas |
| Garita | No | No | No | Visitas, invitados, paquetes |
| Propietario o apoderado | Gastos e informes públicos del edificio | Solo las suyas | No | Sus averías, reservas y visitas |
| Inquilino | Gastos públicos | Las suyas, si el propietario lo autoriza | No | Sus averías, reservas y visitas |

**Privacidad entre vecinos:** el calendario de reservas expone una vista sin `unit_id`. La lista de morosos solo la ve el personal autorizado.

## 4. Reservas sin choques (verificado)

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservations ADD CONSTRAINT reservations_no_overlap
  EXCLUDE USING gist (amenity_id WITH =, during WITH &&)
  WHERE (status IN ('pending', 'confirmed'));
```

**Probado el 7/10/2026 en un Postgres local (PGlite con `btree_gist`):**
- 50 inserciones del mismo turno → **1 confirmada y 49 rechazadas** (error `exclusion constraint`).
- Otro turno el mismo día → aceptado.
- Una reserva cancelada no bloquea el turno.

**Pendiente:**
- PGlite usa una sola conexión. La prueba real de concurrencia se repetirá en la Fase 3 contra un Postgres con conexiones paralelas.
- Confirmar que `btree_gist` está habilitado en el proyecto de Supabase. Es una extensión estándar de Postgres, pero hay que verlo en el panel.

## 5. Login del propietario sin contraseña

- **Supabase Auth con teléfono + hook de envío de SMS:**
  - El hook reemplaza el envío por SMS y recibe `user.phone` y `sms.otp` (6 dígitos).
  - Nuestra ruta lo entrega por WhatsApp.
  - El hook se verifica con la firma `standardwebhooks`.
  - La documentación de Supabase muestra justamente este caso: WhatsApp para números de Latinoamérica. [Fuente](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook)
- **Plantilla de autenticación de WhatsApp con botón "copiar código":**
  - Riesgo: Meta documenta estas plantillas para apps móviles y no confirma explícitamente su uso en web. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/authentication-templates/authentication-templates.md)
  - **Mitigación:** probarlo en la Fase 2 con un número de prueba. Si Meta no lo aprueba, el respaldo es un enlace mágico por correo o un SMS con un proveedor.
- **Enlaces desde los mensajes del bot:**
  - Llevan un token firmado de un solo propósito ("ver la factura 2026-10 de la unidad 4B"), válido 7 días.
  - **Ver** una factura o recibo no requiere sesión.
  - **Pagar, reservar o cambiar datos** pide el código si no hay sesión.
  - Así, un mensaje reenviado no entrega la cuenta.
- **Personal** (administradores, contador, conserje): correo y contraseña, o el mismo código por teléfono.

## 6. WhatsApp (Cloud API de Meta)

- **Un número de Avero** con el nombre "Avero Condominios"; cada mensaje dice el edificio. Más adelante, opción premium: número propio para cada empresa administradora.
- **Webhook:**
  - Verificación inicial: `hub.mode=subscribe`, `hub.verify_token` y respuesta con `hub.challenge`.
  - Cada notificación se valida con `X-Hub-Signature-256` (HMAC SHA-256 con el App Secret). [Fuente](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
  - Meta reintenta hasta 7 días si no respondemos 200, así que el procesamiento es idempotente por id de mensaje.
- **Fotos de comprobantes:**
  - El id del archivo dura 7 días y la URL de descarga 5 minutos (con token).
  - Imágenes JPEG o PNG de hasta 5 MB.
  - Se descargan al recibirlas y se guardan en nuestro almacenamiento. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media.md)
- **Categoría de las plantillas:**
  - Los recordatorios de pago, avisos de factura, saldo y vencimiento califican como **utility** ("Account alerts or updates"), siempre que no incluyan promociones. [Fuente](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization.md)
  - Regla de diseño: **ninguna plantilla de cobro lleva ofertas**, o Meta la reclasifica como marketing.
- **Plantillas a aprobar:**

| Plantilla | Categoría | Contenido |
|---|---|---|
| `codigo_acceso` | Authentication | Código de 6 dígitos, vence en 10 minutos |
| `cobro_mensual` | Utility | Unidad, período, total, vencimiento; PDF adjunto; botones Pagar y Ver factura |
| `factura_gas` | Utility | Lecturas, consumo, precio, total; foto del medidor; botón Ver |
| `recordatorio_previo` | Utility | Faltan 3 días para el vencimiento |
| `recordatorio_vencido` | Utility | Saldo vencido y días de atraso; tono configurable entre dos textos aprobados |
| `pago_recibido` | Utility | Monto y fecha; recibo en PDF |
| `reserva_confirmada` / `reserva_recordatorio` / `deposito_liquidado` | Utility | Área, fecha, montos |
| `averia_actualizada` | Utility | Estado nuevo |
| `aviso_edificio` | Utility | Corte de agua, fumigación, asamblea (interrupciones o avisos esenciales) |

- **Costo:**
  - Meta cobra por plantilla entregada. La RD (+1 809/829/849) está en el grupo "Resto de Latinoamérica".
  - Las plantillas utility enviadas con la ventana de 24 horas abierta son gratis.
  - No obtuve la tarifa oficial del grupo (está en la tabla de precios vigente desde el 1/7/2026). Un tercero cita **US$0.0113 por mensaje utility**, lo que daría menos de US$2 al mes en un edificio de 40 unidades. **Hay que confirmarlo con la tabla oficial al crear la cuenta.** [Fuente](https://developers.facebook.com/docs/whatsapp/pricing)
- **Bajas:**
  - Palabra "BAJA" o el webhook `user_preferences`.
  - Se registra en `message_preferences` y se respeta antes de cada envío.
  - Los cobros se siguen viendo en la app.
- **Horario:** ningún recordatorio sale fuera del horario que fije el administrador (por defecto, de 8:00 a 19:00, hora de RD).

## 7. Trabajos en segundo plano

**Por qué no Vercel Cron:** en el plan Hobby de Vercel los cron jobs corren una vez al día (verificar el plan contratado), y esto necesita revisar la cola cada minuto.

**Diseño:**
- **Bandeja de salida en la base:** `message_outbox`, más tareas de emisión y conciliación.
- **`pg_cron` de Supabase cada minuto** llama con `pg_net` a una ruta protegida de la app. Esa ruta procesa un lote con `FOR UPDATE SKIP LOCKED`.
- **Idempotencia:**
  - Cada mensaje tiene una llave única (`cobro:{unidad}:{período}`). Insertarlo dos veces no duplica nada.
  - Reintentos con espera creciente: 1, 5, 30 y 120 minutos. Después de 4 fallos, el mensaje queda "fallido" y aparece en el panel.
- **Emisión del mes:** una función SQL con transacción única. O se emiten todas las facturas del período, o ninguna.

## 8. Lectura de comprobantes y medidores con IA

**Proveedor y forma de llamada:**
- **Modelo por defecto:** Claude Opus 5.5 (`claude-opus-5-5`), con imagen y salida estructurada (`output_config.format` con esquema JSON).
- **Alternativa de menor costo, decisión del dueño:** Claude Haiku 5.5 (`claude-haiku-5-5`). Se puede comparar con un conjunto de prueba de fotos reales antes de decidir.

**Qué devuelve cada lectura:**
- **Comprobante:** monto, moneda, fecha, banco de origen y destino, referencia, cuenta de destino (últimos 4 dígitos), si parece un comprobante o no, y la confianza del modelo.
- **Medidor:** número leído, si la foto es legible, y la confianza del modelo.

**La confianza del modelo no es suficiente. Se combinan validaciones deterministas:**
- **Comprobante:**
  - el monto coincide con un saldo abierto o con una cuota;
  - la fecha no es futura ni muy vieja;
  - la cuenta de destino es la del condominio;
  - la referencia no se ha usado antes (evita reenviar el mismo comprobante dos veces).
- **Medidor:**
  - la lectura es mayor o igual que la anterior;
  - el consumo está dentro de un rango razonable según el promedio de la unidad.

**Se aplica solo** si todo pasa y la confianza es alta. Si no, va a la bandeja de revisión del administrador con la foto al lado. **Nunca se rechaza ni se aplica un pago en silencio.**

**Costo estimado por lectura** (hay que medirlo con `count_tokens` y fotos reales):
- Supuestos:
  - una foto de celular reducida a unos 1,600 tokens;
  - instrucciones de unos 300 tokens;
  - respuesta y razonamiento de unos 400 tokens.
- **Opus 5.5** (US$4 / US$20 por millón): ~US$0.016 por lectura → **~US$1.30 al mes** en un edificio de 40 unidades con 80 lecturas.
- **Haiku 5.5** (US$0.10 / US$0.50 por millón): ~US$0.0004 por lectura → **~US$0.03 al mes** por edificio.
- Las lecturas de medidores pueden ir por lotes (Batches API, 50 % menos), porque no son urgentes.

## 9. Archivos y PDF

- Buckets privados en Supabase Storage, separados por edificio (`building_id/...`), con enlaces firmados de corta duración.
- Compresión a WebP en el navegador antes de subir.
- PDF de facturas, recibos, estado de cuenta anual y certificado de no deuda, generados en el servidor con `@react-pdf/renderer`. Se guardan una sola vez al emitirse, para que el documento no cambie después.

## 10. Cómo cobra Avero

- Precio por unidad al mes. Hipótesis a validar en las entrevistas.
- **Suscripción de PayPal con cantidad = número de unidades.** Se reutiliza el módulo de cobro ya construido en Avero.
- **Por verificar:** que los planes de PayPal permitan cantidad variable (`quantity_supported`) y cómo se cambia la cantidad cuando el edificio agrega unidades.
- La empresa administradora paga por todos sus edificios en una sola suscripción, o el condominio paga la suya.

## 11. Estrategia de pruebas

| Capa | Herramienta | Qué cubre |
|---|---|---|
| Cálculos de cobro | Pruebas unitarias (TypeScript) | Cada forma de cálculo, redondeos, gas medido, recargos con tope, pagos parciales en cada orden, saldo a favor |
| Base de datos | PGlite + un Postgres real para concurrencia | RLS por rol, inmutabilidad del libro, restricción de reservas, funciones de emisión, propiedad "el saldo cuadra" con datos aleatorios |
| WhatsApp | Simulador local de la API de Meta | Firma inválida, reintentos, duplicados, bajas, horario |
| IA | Conjunto de 50 fotos reales anonimizadas | Precisión por campo; cero pagos aplicados mal |
| Interfaz | Navegador automatizado + axe | Flujos completos, accesibilidad AA, móvil a 375 px, modo oscuro |
| Usabilidad | "Prueba de la abuela" | Saldo y pago en 3 toques o menos; reserva en 5 toques o menos |

## 12. Riesgos y preguntas abiertas

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Meta no aprueba la plantilla de código para login web | El login por WhatsApp no funciona | Probar en la Fase 2; respaldo por correo o SMS |
| Tarifa oficial de WhatsApp más alta que la estimada | Costo por edificio | Confirmarla al crear la cuenta; los mensajes dentro de 24 horas son gratis |
| Lecturas de IA erróneas | Pagos mal aplicados | Validaciones deterministas + revisión humana; nunca automático con dudas |
| Reglas de gas o mora distintas en la práctica | Reprogramar cálculos | Todo configurable; validar en entrevistas antes de la Fase 1 |
| Plan de Supabase o Vercel insuficiente | Caídas o límites | Supabase Pro desde el primer cliente; la cola no depende de Vercel Cron |
| Datos personales (Ley 172-13) | Legal | Mínimos datos, acceso por rol, política de privacidad antes del lanzamiento |

## Lo que necesito que decidas

1. **¿App aparte (B, recomendada) o dentro del repo actual (A)?**
2. **¿Modelo de IA para las lecturas?** Opus 5.5 (más preciso, ~US$1.30 al mes por edificio) o Haiku 5.5 (~US$0.03 al mes por edificio). Se puede medir con fotos reales antes de decidir.
3. **¿Contratamos Supabase Pro (US$25/mes) para este proyecto** cuando arranque la Fase 1?
4. **Cuenta de WhatsApp Business de Avero:** hay que crearla y verificar el negocio en Meta, con un número de teléfono dedicado. Eso lo haces tú.
