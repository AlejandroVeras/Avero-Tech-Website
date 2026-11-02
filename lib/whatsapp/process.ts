import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createServiceClient } from "@/lib/supabase/admin"
import { downloadMedia, markReadAndTyping, sendTemplate, sendText, type WaInbound } from "@/lib/whatsapp/cloud"
import { bubbleGapMs, cleanForWhatsApp, splitBubbles, typingDelayMs } from "@/lib/whatsapp/humanize"
import { estimateCost, openaiConfigured, transcribe, type InputItem } from "@/lib/ai/openai"
import { loadCatalog } from "@/lib/ai/catalog-tools"
import { customerConfirmed, priceOrder } from "@/lib/ai/order"
import { includesPrivacyNotice, runSalesAgent, type OrderArgs } from "@/lib/ai/sales-agent"
import { displayPhone, isWebPhone, normalizePhone } from "@/lib/chat/phone"
import { emailConfigured, sendEmail } from "@/lib/email"
import { CONTACT_EMAIL, SITE_URL, formatDOP } from "@/lib/site"

const DEBOUNCE_MS = 4000
const HISTORY_LIMIT = 30
const MAX_INBOUND_PER_10_MIN = 20
const MAX_REPLIES_PER_DAY = 30

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type Conversation = {
  id: string
  phone: string
  name: string | null
  status: "bot" | "humano" | "cerrada"
  memory: Record<string, unknown>
  privacy_notice_sent: boolean
  is_test: boolean
}

const testNumbers = () => (process.env.WHATSAPP_TEST_NUMBERS ?? "").split(",").map((s) => s.trim()).filter(Boolean)

// Step 1 (inside the webhook request): store the message. Returns null for duplicates (Meta retries).
export async function storeInbound(msg: WaInbound, profileName?: string) {
  const supabase = createServiceClient()
  const now = new Date().toISOString()
  const { data: conv, error } = await supabase
    .from("wa_conversations")
    .upsert(
      { phone: msg.from, ...(profileName ? { name: profileName } : {}), last_message_at: now, last_inbound_at: now, updated_at: now, is_test: testNumbers().includes(msg.from) },
      { onConflict: "phone" },
    )
    .select("id, phone, name, status, memory, privacy_notice_sent, is_test")
    .single()
  if (error || !conv) throw new Error(`No se pudo guardar la conversación: ${error?.message}`)

  const { type, content } = describeInbound(msg)
  const { error: insertError } = await supabase
    .from("wa_messages")
    .insert({ conversation_id: conv.id, direction: "in", type, content, wa_message_id: msg.id, author: "cliente" })
  if (insertError?.code === "23505") return null
  if (insertError) throw new Error(`No se pudo guardar el mensaje: ${insertError.message}`)
  return conv as Conversation
}

function describeInbound(msg: WaInbound): { type: "text" | "audio" | "image" | "other"; content: string } {
  if (msg.type === "text") return { type: "text", content: msg.text?.body ?? "" }
  if (msg.type === "audio" && msg.audio) return { type: "audio", content: `[audio:${msg.audio.id}]` }
  if (msg.type === "image" && msg.image) return { type: "image", content: `[foto:${msg.image.id}] ${msg.image.caption ?? ""}`.trim() }
  if (msg.type === "button") return { type: "text", content: msg.button?.text ?? "" }
  if (msg.type === "interactive") return { type: "text", content: msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title ?? "" }
  return { type: "other", content: `[${msg.type}]` }
}

// Step 2 (after the 200 response): wait for the customer to finish typing, then answer once.
export async function processConversation(conv: Conversation, msg: WaInbound) {
  const supabase = createServiceClient()
  if (conv.status !== "bot") return

  await markReadAndTyping(msg.id).catch(() => {})
  await sleep(DEBOUNCE_MS)

  // Only the newest message of a burst answers; the others step aside.
  const { data: newest } = await supabase
    .from("wa_messages")
    .select("wa_message_id")
    .eq("conversation_id", conv.id)
    .eq("direction", "in")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (newest?.wa_message_id !== msg.id) return

  let locked = false
  for (let i = 0; i < 4 && !locked; i++) {
    const { data } = await supabase.rpc("wa_try_lock", { p_conversation: conv.id, p_seconds: 55 })
    locked = data === true
    if (!locked) await sleep(5000)
  }
  if (!locked) return

  try {
    await reply(supabase, conv, msg)
  } catch (e) {
    console.error("[whatsapp] error respondiendo", conv.phone, e)
    await logSystem(supabase, conv.id, `Error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 500))
    await sendText(conv.phone, "Disculpe, tuve un inconveniente. Ya le aviso a alguien del equipo para que le escriba.").catch(() => {})
    await handoff(supabase, conv, "Error técnico del asistente").catch(() => {})
  } finally {
    await supabase.from("wa_conversations").update({ processing_until: null }).eq("id", conv.id)
  }
}

async function reply(supabase: SupabaseClient, conv: Conversation, msg: WaInbound) {
  // Re-read: a person may have taken the chat during the pause.
  const { data: fresh } = await supabase.from("wa_conversations").select("status, memory, privacy_notice_sent").eq("id", conv.id).single()
  if (!fresh || fresh.status !== "bot") return
  conv = { ...conv, ...fresh }

  const since10 = new Date(Date.now() - 10 * 60_000).toISOString()
  const since24 = new Date(Date.now() - 24 * 3600_000).toISOString()
  const [{ count: inbound10 }, { count: replies24 }] = await Promise.all([
    supabase.from("wa_messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("direction", "in").gte("created_at", since10),
    supabase.from("wa_messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("author", "bot").gte("created_at", since24),
  ])
  if ((inbound10 ?? 0) > MAX_INBOUND_PER_10_MIN) return
  if ((replies24 ?? 0) >= MAX_REPLIES_PER_DAY) return handoff(supabase, conv, "Límite diario de respuestas del asistente")

  const budget = Number(process.env.AI_DAILY_BUDGET_USD ?? 2)
  const { data: usage } = await supabase.from("wa_usage_daily").select("cost_usd").order("day", { ascending: false }).limit(1).maybeSingle()
  if (!openaiConfigured() || Number(usage?.cost_usd ?? 0) >= budget) {
    await sendText(conv.phone, "¡Gracias por escribirnos! En breve alguien del equipo le responde.")
    return handoff(supabase, conv, openaiConfigured() ? "Se alcanzó el tope de gasto diario de IA" : "La IA no está configurada")
  }

  const history = await buildHistory(supabase, conv.id)
  const lastCustomerText = [...history].reverse().find((h) => "role" in h && h.role === "user") as { content: unknown } | undefined
  const lastText = typeof lastCustomerText?.content === "string" ? lastCustomerText.content : JSON.stringify(lastCustomerText?.content ?? "")
  const products = await loadCatalog(supabase)

  const result = await runSalesAgent({
    history,
    products,
    context: { channel: "whatsapp", privacyNoticeSent: conv.privacy_notice_sent, memory: conv.memory ?? {} },
    effects: agentEffects(supabase, conv, lastText),
  })

  const cost = estimateCost(result.model, result.usage)
  const bubbles = splitBubbles(cleanForWhatsApp(result.text), result.orderCode ? 3 : 2)
  for (const [i, bubble] of bubbles.entries()) {
    if (i > 0) {
      await markReadAndTyping(msg.id).catch(() => {})
      await sleep(bubbleGapMs())
    }
    await sleep(typingDelayMs(bubble))
    const waId = await sendText(conv.phone, bubble)
    await supabase.from("wa_messages").insert({
      conversation_id: conv.id,
      direction: "out",
      type: "text",
      content: bubble,
      wa_message_id: waId,
      author: "bot",
      ...(i === 0 ? { tokens_in: result.usage.input, tokens_out: result.usage.output, model: result.model } : {}),
    })
  }

  await supabase
    .from("wa_conversations")
    .update({
      last_message_at: new Date().toISOString(),
      privacy_notice_sent: conv.privacy_notice_sent || includesPrivacyNotice(result.text),
      updated_at: new Date().toISOString(),
    })
    .eq("id", conv.id)
  await supabase.rpc("wa_add_usage", { p_tokens_in: result.usage.input, p_tokens_out: result.usage.output, p_cost: cost, p_messages: bubbles.length })
}

// What the agent's tools do to the database. Shared by WhatsApp and the web chat.
export function agentEffects(supabase: SupabaseClient, conv: Conversation, lastCustomerText: string) {
  return {
    registerInterest: (slug: string) => registerInterest(supabase, conv, slug),
    remember: async (facts: Record<string, string | number | null>) => {
      const memory = { ...conv.memory, ...Object.fromEntries(Object.entries(facts).filter(([, v]) => v != null)) }
      await supabase.from("wa_conversations").update({ memory, ...(facts.nombre ? { name: facts.nombre } : {}) }).eq("id", conv.id)
    },
    createOrder: (args: OrderArgs) => createConfirmedOrder(supabase, conv, args, lastCustomerText),
    handoff: (reason: string) => handoff(supabase, conv, reason),
  }
}

type UserContent = string | ({ type: "input_text"; text: string } | { type: "input_image"; image_url: string })[]

// The last messages as Responses API input. Voice notes are transcribed once and the text is saved.
export async function buildHistory(supabase: SupabaseClient, conversationId: string): Promise<InputItem[]> {
  const { data } = await supabase
    .from("wa_messages")
    .select("id, direction, type, content, author")
    .eq("conversation_id", conversationId)
    .neq("author", "sistema")
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT)
  const rows = (data ?? []).reverse()
  const lastOut = rows.map((r) => r.direction).lastIndexOf("out")

  const items: InputItem[] = []
  for (const [i, r] of rows.entries()) {
    if (r.direction === "out") {
      items.push({ role: "assistant", content: r.content })
      continue
    }
    let content: UserContent = r.content
    const audio = /^\[audio:([^\]]+)\]$/.exec(r.content)
    if (audio) {
      const text = await transcribeVoiceNote(audio[1])
      content = text ? `(nota de voz) ${text}` : "(nota de voz que no se pudo entender)"
      await supabase.from("wa_messages").update({ content }).eq("id", r.id)
    }
    const photo = /^\[foto:([^\]]+)\]\s*(.*)$/s.exec(r.content)
    if (photo) {
      // Only photos the bot has not answered yet are sent as images; older ones stay as text.
      if (i > lastOut) {
        const media: Awaited<ReturnType<typeof downloadMedia>> | null = await downloadMedia(photo[1]).catch((): null => null)
        content = media
          ? [
              { type: "input_text", text: photo[2] ? `(foto) ${photo[2]}` : "(el cliente envió esta foto)" },
              { type: "input_image", image_url: `data:${media.mimeType};base64,${Buffer.from(media.bytes).toString("base64")}` },
            ]
          : "(foto que no se pudo abrir)"
      } else {
        content = photo[2] ? `(foto) ${photo[2]}` : "(foto)"
      }
    }
    items.push({ role: "user", content })
  }
  return items
}

async function transcribeVoiceNote(mediaId: string) {
  try {
    const media = await downloadMedia(mediaId)
    const text = await transcribe(media.bytes, media.mimeType)
    return text.length >= 2 ? text : null
  } catch (e) {
    console.error("[whatsapp] transcripción", e)
    return null
  }
}

async function openLead(supabase: SupabaseClient, conv: Conversation) {
  const { data } = await supabase
    .from("leads")
    .select("id, interested_slugs")
    .eq("conversation_id", conv.id)
    .in("status", ["nuevo", "interesado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as { id: string; interested_slugs: string[] } | null
}

async function registerInterest(supabase: SupabaseClient, conv: Conversation, slug: string) {
  const lead = await openLead(supabase, conv)
  if (lead) {
    const slugs = Array.from(new Set([...(lead.interested_slugs ?? []), slug]))
    await supabase.from("leads").update({ status: "interesado", interested_slugs: slugs, updated_at: new Date().toISOString() }).eq("id", lead.id)
  } else {
    await supabase.from("leads").insert({ conversation_id: conv.id, phone: conv.phone, customer_name: conv.name, status: "interesado", interested_slugs: [slug], is_test: conv.is_test })
  }
}

async function createConfirmedOrder(supabase: SupabaseClient, conv: Conversation, args: OrderArgs, lastCustomerText: string) {
  if (args.confirmado !== true || !customerConfirmed(lastCustomerText)) {
    return { ok: false as const, error: "El cliente todavía no confirmó el resumen. Envía el resumen y espera un sí claro." }
  }
  // The web chat has no phone of its own, so the customer's WhatsApp is required there.
  const phone = isWebPhone(conv.phone) ? normalizePhone(args.telefono) : conv.phone
  if (!phone) return { ok: false as const, error: "Falta un número de WhatsApp válido del cliente para coordinar la entrega. Pídeselo." }
  const catalog = new Map((await loadCatalog(supabase)).map((p) => [p.slug, p]))
  const priced = priceOrder(args.items, catalog)
  if (priced.problems.length) return { ok: false as const, error: priced.problems.join(". ") }

  const now = new Date().toISOString()
  const row = {
    conversation_id: conv.id,
    phone,
    status: "confirmado",
    items: priced.items,
    total: priced.total,
    customer_name: args.nombre.slice(0, 120),
    address: args.direccion.slice(0, 300),
    sector: args.sector.slice(0, 120),
    city: args.ciudad.slice(0, 120),
    landmark: args.referencia?.slice(0, 300) ?? null,
    payment_method: args.metodo_pago.slice(0, 60),
    delivery_window: args.horario?.slice(0, 120) ?? null,
    notes: args.notas?.slice(0, 500) ?? null,
    is_test: conv.is_test,
    confirmed_at: now,
    updated_at: now,
  }
  const existing = await openLead(supabase, conv)
  const { data, error } = existing
    ? await supabase.from("leads").update(row).eq("id", existing.id).select("id, code").single()
    : await supabase.from("leads").insert(row).select("id, code").single()
  if (error || !data) return { ok: false as const, error: "No se pudo registrar el pedido. Ofrece pasar con alguien del equipo." }

  await notifyOwnerOfOrder({ ...row, id: data.id, code: data.code }).catch((e) => console.error("[whatsapp] aviso de pedido", e))
  return { ok: true as const, code: data.code as string, total: priced.total }
}

export async function handoff(supabase: SupabaseClient, conv: Conversation, reason: string) {
  await supabase.from("wa_conversations").update({ status: "humano", updated_at: new Date().toISOString() }).eq("id", conv.id)
  // /admin/pedidos lists leads, so a chat without one would be invisible there.
  if (!(await openLead(supabase, conv))) {
    await supabase.from("leads").insert({ conversation_id: conv.id, phone: conv.phone, customer_name: conv.name, status: "nuevo", is_test: conv.is_test })
  }
  await logSystem(supabase, conv.id, `Pasó a una persona: ${reason}`)
  const link = `${SITE_URL}/admin/pedidos?chat=${conv.id}`
  const owner = process.env.OWNER_WHATSAPP
  if (owner) await sendTemplate(owner, "aviso_pasar_a_humano", [conv.name ?? "Cliente", displayPhone(conv.phone), reason, link]).catch((e) => console.error("[whatsapp] aviso humano", e))
  const who = `${conv.name ?? "Cliente"} (${displayPhone(conv.phone)})`
  await notifyByEmail(`Un cliente pidió hablar con una persona: ${who}`, `${who}\nMotivo: ${reason}\n\nAbrir: ${link}`)
}

export async function logSystem(supabase: SupabaseClient, conversationId: string, content: string) {
  await supabase.from("wa_messages").insert({ conversation_id: conversationId, direction: "out", type: "system", content, author: "sistema" })
}

type LeadForNotice = {
  id: string
  code: string
  customer_name: string
  phone: string
  items: { name: string; quantity: number }[]
  total: number
  address: string
  sector: string
  city: string
  landmark: string | null
  delivery_window: string | null
  payment_method: string
  is_test: boolean
}

async function notifyOwnerOfOrder(lead: LeadForNotice) {
  const products = lead.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")
  const delivery = [lead.address, lead.sector, lead.city, lead.landmark ? `ref. ${lead.landmark}` : null, lead.delivery_window].filter(Boolean).join(", ")
  const link = `${SITE_URL}/admin/pedidos/${lead.id}`
  const prefix = lead.is_test ? "[PRUEBA] " : ""
  const owner = process.env.OWNER_WHATSAPP
  if (owner) {
    await sendTemplate(owner, "aviso_pedido_confirmado", [
      `${prefix}${lead.code}`,
      lead.customer_name,
      `+${lead.phone}`,
      products,
      lead.total.toLocaleString("en-US"),
      delivery,
      lead.payment_method,
      link,
    ]).catch((e) => console.error("[whatsapp] plantilla de pedido", e))
  }
  await notifyByEmail(
    `${prefix}Nuevo pedido confirmado ${lead.code} · ${formatDOP(lead.total)}`,
    `Cliente: ${lead.customer_name} (+${lead.phone})\nProductos: ${products}\nTotal: ${formatDOP(lead.total)}\nEntrega: ${delivery}\nPago: ${lead.payment_method}\n\nVer pedido: ${link}`,
  )
}

async function notifyByEmail(subject: string, text: string) {
  if (!emailConfigured()) return
  const to = process.env.LEADS_NOTIFY_EMAIL ?? CONTACT_EMAIL
  const html = `<pre style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;white-space:pre-wrap">${text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>`
  await sendEmail({ to, subject, text, html }).catch((e) => console.error("[whatsapp] correo", e))
}
