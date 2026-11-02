# Cómo conectar el asistente de ventas de WhatsApp

Guía paso a paso para dejar funcionando el asistente descrito en `docs/adr-003-whatsapp-ventas-ia.md`. Los pasos marcados con 🔑 los haces tú, porque llevan contraseñas, claves, pagos o códigos por SMS.

## Resumen de cómo funciona

1. El cliente escribe al número del bot.
2. Meta llama a `https://averotechnology.com/api/webhooks/whatsapp`. El servidor revisa la firma, guarda el mensaje y responde a Meta enseguida.
3. El asistente marca el mensaje como leído y muestra "escribiendo...". Espera 4 s por si llegan más mensajes seguidos y responde con datos reales del catálogo.
4. Cuando el cliente confirma un pedido, el servidor recalcula precios y stock, lo guarda en `leads` y te avisa por WhatsApp y por correo.
5. Ves todo en **averotechnology.com/admin/pedidos**: el chat, los datos de entrega y los botones de estado. Desde ahí puedes pausar el asistente y escribir tú.

## 1. Base de datos

Corre `DATABASE_WHATSAPP_LEADS.sql` en el editor SQL de Supabase (proyecto del sitio). Se puede correr más de una vez sin problema. Crea las tablas `wa_conversations`, `wa_messages`, `leads` y `wa_usage_daily`, todas con RLS que solo deja entrar al administrador.

## 2. OpenAI

1. 🔑 Entra a platform.openai.com → **API keys** → **Create new secret key**. Ponle de nombre `avero-whatsapp` y de proyecto `Default`.
2. 🔑 Copia la clave y pégala en `.env.local` como `OPENAI_API_KEY=` y en Vercel → Settings → Environment Variables.
3. Recomendado: en **Limits**, pon un tope mensual de US$ 10. El asistente además tiene su propio tope diario (`AI_DAILY_BUDGET_USD`).
4. Saldo: la cuenta tiene US$ 4.99 de crédito y la recarga automática apagada. Con `gpt-6-luna` eso alcanza para unas 1,000 conversaciones.

## 3. Meta (WhatsApp Cloud API)

### 3.1 Portafolio empresarial

Meta exige un portafolio empresarial para usar WhatsApp. Tu cuenta todavía no tiene ninguno.

1. 🔑 Ve a business.facebook.com → **Crear un portafolio**. Nombre: `Avero Technology`. Usa tu correo.
2. La verificación del negocio (documentos) **no hace falta para probar**. Sí hace falta para pasar de 250 conversaciones iniciadas por ti al día y para el check verde.

### 3.2 La app

Ya empecé a crear la app **Avero Asistente de Ventas** con el caso de uso de WhatsApp. Se detuvo en el paso "Empresa" porque falta el portafolio. Cuando lo crees, termina el asistente de creación o avísame y lo continúo.

### 3.3 Número de prueba (gratis, para empezar)

1. En la app → **WhatsApp → Configuración de la API**, Meta da un número de prueba.
2. 🔑 En **Para**, agrega tu celular. Meta te manda un código por WhatsApp para verificarlo. El número de prueba solo puede escribirles a 5 números verificados.
3. Copia el **Identificador del número de teléfono** en `WHATSAPP_PHONE_NUMBER_ID`.

### 3.4 Token permanente

El token de la pantalla de la API dura 24 horas. Para producción:

1. 🔑 business.facebook.com → Configuración → **Usuarios del sistema** → Agregar. Nombre: `avero-bot`, rol Administrador.
2. 🔑 Asígnale la app y la cuenta de WhatsApp con control total.
3. 🔑 **Generar token** con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`, y caducidad **Nunca**.
4. 🔑 Pégalo en `WHATSAPP_TOKEN` (en `.env.local` y en Vercel).

### 3.5 Clave secreta de la app

🔑 App → **Configuración de la app → Básica → Clave secreta** → Mostrar. Pégala en `WHATSAPP_APP_SECRET`. Sin ella, el servidor rechaza todos los webhooks (401).

### 3.6 Webhook

1. App → **WhatsApp → Configuración** → Webhook → Editar:
   - URL de devolución de llamada: `https://averotechnology.com/api/webhooks/whatsapp`
   - Token de verificación: el valor de `WHATSAPP_VERIFY_TOKEN` que ya está en tu `.env.local` (cópialo igual en Vercel).
2. **Verificar y guardar**. Meta llama al servidor y este responde si el token coincide. Por eso el código tiene que estar desplegado antes.
3. En **Campos del webhook**, suscríbete a `messages`.

### 3.7 Plantillas para avisarte

En **WhatsApp Manager → Plantillas de mensajes**, crea estas dos en español, categoría **Utilidad**. Los textos están en el ADR, sección 10.

- `aviso_pedido_confirmado`: 8 variables.
- `aviso_pasar_a_humano`: 4 variables.

Mientras Meta no las apruebe, los avisos te llegan solo por correo. Pon tu número personal en `OWNER_WHATSAPP`.

### 3.8 Pago a Meta

Desde el 1 de octubre de 2026, Meta cobra los mensajes de servicio después de los primeros 1,000 del mes.

- 🔑 Para que se sigan entregando, agrega un método de pago en **Billing Hub**.
- Con menos de unas 100 conversaciones al mes no se llega al tramo pagado.

### 3.9 Número real

Cuando las pruebas estén bien, tienes dos caminos (ver la sección 3 del ADR):

- **Número nuevo** (recomendado): 🔑 agrégalo en **WhatsApp → Números de teléfono** y verifícalo con un SMS o una llamada. No puede estar registrado en ninguna app de WhatsApp.
- **Coexistence con el 829-812-2103**: se conecta desde la app WhatsApp Business del teléfono con un código QR.

Después cambia `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_BOT_NUMBER`.

## 4. Vercel

Agrega todas las variables de la sección "Asistente de ventas por WhatsApp" de `.env.example` en **Production** y redespliega.

## 5. Probar

1. **Sin WhatsApp:** con `pnpm dev -p 3010` corriendo, ejecuta `node scripts/whatsapp-sim.mjs gpt-6-luna gpt-6.1-terra`.
   - Corre las 10 conversaciones con el catálogo real y deja las transcripciones en `docs/whatsapp-sim/resultados.md`.
   - Cuesta unos centavos.
2. **Pruebas de código:** `pnpm test`.
3. **De punta a punta:**
   - Pon tu número en `WHATSAPP_TEST_NUMBERS`.
   - Escribe al número de prueba desde tu celular.
   - El pedido sale con la marca "Prueba" en `/admin/pedidos`.

## 6. Operación diaria

- **Atender tú:** en `/admin/pedidos/<pedido>`, botón **Pausar el asistente y atender yo**. Si escribes desde el panel, el asistente se pausa solo. **Devolver al asistente** lo reactiva.
- **Límites del asistente:**
  - 20 mensajes por cliente cada 10 minutos;
  - 30 respuestas por cliente al día;
  - el tope de gasto diario.

  Al pasar uno de ellos, el chat pasa a ti y te avisa.
- **Cambiar el modelo:** cambia `OPENAI_MODEL` en Vercel. No hace falta tocar código.
- **Gasto:** el encabezado de `/admin/pedidos` muestra los mensajes y el costo de IA de los últimos 30 días.
