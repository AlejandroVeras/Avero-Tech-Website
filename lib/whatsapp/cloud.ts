import "server-only"

// WhatsApp Cloud API (Meta Graph API). Docs: developers.facebook.com/docs/whatsapp/cloud-api
const GRAPH = "https://graph.facebook.com"
const version = () => process.env.WHATSAPP_API_VERSION ?? "v26.0"

export function whatsappConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_APP_SECRET)
}

async function graph(path: string, body?: unknown) {
  const res = await fetch(`${GRAPH}/${version()}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  return json as Record<string, unknown>
}

const messages = (body: Record<string, unknown>) =>
  graph(`${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, { messaging_product: "whatsapp", ...body })

// Blue ticks + "escribiendo..." in one call. The indicator lasts up to 25 s or until we reply.
export async function markReadAndTyping(messageId: string) {
  await messages({ status: "read", message_id: messageId, typing_indicator: { type: "text" } })
}

export async function sendText(to: string, text: string) {
  const json = await messages({ recipient_type: "individual", to, type: "text", text: { preview_url: false, body: text } })
  return (json.messages as { id: string }[] | undefined)?.[0]?.id ?? null
}

export async function sendTemplate(to: string, name: string, params: string[], language = "es") {
  const json = await messages({
    to,
    type: "template",
    template: {
      name,
      language: { code: language },
      components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text: text.slice(0, 1000) })) }],
    },
  })
  return (json.messages as { id: string }[] | undefined)?.[0]?.id ?? null
}

// Voice notes and photos arrive as a media id; the URL it resolves to needs the same token.
export async function downloadMedia(mediaId: string) {
  const meta = await graph(mediaId)
  const url = meta.url as string | undefined
  if (!url) throw new Error("Meta no devolvió la URL del archivo")
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }, cache: "no-store" })
  if (!res.ok) throw new Error(`No se pudo descargar el archivo (${res.status})`)
  return { bytes: new Uint8Array(await res.arrayBuffer()), mimeType: (meta.mime_type as string) ?? "application/octet-stream" }
}

// Shapes of the webhook payload we use (entry[].changes[].value).
export type WaInbound = {
  id: string
  from: string
  timestamp: string
  type: "text" | "audio" | "image" | "button" | "interactive" | string
  text?: { body: string }
  audio?: { id: string; mime_type?: string }
  image?: { id: string; mime_type?: string; caption?: string }
  button?: { text: string }
  interactive?: { button_reply?: { title: string }; list_reply?: { title: string } }
}

export type WaWebhookBody = {
  object?: string
  entry?: {
    changes?: {
      field?: string
      value?: {
        metadata?: { phone_number_id?: string }
        contacts?: { wa_id: string; profile?: { name?: string } }[]
        messages?: WaInbound[]
        statuses?: unknown[]
      }
    }[]
  }[]
}
