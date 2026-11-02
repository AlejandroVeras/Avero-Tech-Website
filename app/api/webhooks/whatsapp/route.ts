import { NextResponse, after } from "next/server"
import { verifyMetaSignature } from "@/lib/whatsapp/signature"
import { whatsappConfigured, type WaWebhookBody } from "@/lib/whatsapp/cloud"
import { processConversation, storeInbound } from "@/lib/whatsapp/process"

export const runtime = "nodejs"
// The reply waits for the customer to finish typing and "types" like a person, so it needs time.
export const maxDuration = 60

// Meta calls this once when the webhook is set up in the app dashboard.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } })
  }
  return NextResponse.json({ error: "Token de verificación inválido" }, { status: 403 })
}

export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifyMetaSignature(raw, request.headers.get("x-hub-signature-256"), process.env.WHATSAPP_APP_SECRET)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }
  if (!whatsappConfigured()) return NextResponse.json({ ok: true, ignored: "WhatsApp no configurado" })

  let body: WaWebhookBody
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const ownNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (change.field !== "messages" || !value?.messages?.length) continue
      if (value.metadata?.phone_number_id && value.metadata.phone_number_id !== ownNumberId) continue
      for (const msg of value.messages) {
        const name = value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name
        try {
          const conv = await storeInbound(msg, name)
          // Answer Meta right away; the reply runs after the response is sent.
          if (conv) after(() => processConversation(conv, msg))
        } catch (e) {
          console.error("[whatsapp] webhook", e)
          // A non-2xx makes Meta retry later, and the unique message id keeps it from being stored twice.
          return NextResponse.json({ error: "No se pudo guardar el mensaje" }, { status: 500 })
        }
      }
    }
  }
  return NextResponse.json({ ok: true })
}
