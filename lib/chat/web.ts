import "server-only"

import { createServiceClient } from "@/lib/supabase/admin"
import { estimateCost, openaiConfigured } from "@/lib/ai/openai"
import { loadCatalog } from "@/lib/ai/catalog-tools"
import { runSalesAgent } from "@/lib/ai/sales-agent"
import { cleanForWhatsApp, splitBubbles } from "@/lib/whatsapp/humanize"
import { agentEffects, buildHistory, handoff, logSystem, type Conversation } from "@/lib/whatsapp/process"
import { WEB_PREFIX } from "@/lib/chat/phone"

// The same sales assistant as WhatsApp, answering the chat bubble on the site. Each browser gets a
// random token in an httpOnly cookie; its conversation is stored as phone = "web:<token>".

const MAX_INBOUND_PER_10_MIN = 20
const MAX_REPLIES_PER_DAY = 30

export type WebChatMessage = { id: string; from: "cliente" | "bot" | "humano"; text: string; at: string }
export type WebChatState = { status: "bot" | "humano" | "cerrada"; messages: WebChatMessage[] }

const COLUMNS = "id, phone, name, status, memory, privacy_notice_sent, is_test"

async function findConversation(token: string) {
  const { data } = await createServiceClient().from("wa_conversations").select(COLUMNS).eq("phone", WEB_PREFIX + token).maybeSingle()
  return data as Conversation | null
}

export async function getWebChat(token: string): Promise<WebChatState> {
  const conv = await findConversation(token)
  if (!conv) return { status: "bot", messages: [] }
  const { data } = await createServiceClient()
    .from("wa_messages")
    .select("id, author, content, created_at")
    .eq("conversation_id", conv.id)
    .in("author", ["cliente", "bot", "humano"])
    .order("created_at", { ascending: true })
    .limit(200)
  return {
    status: conv.status,
    messages: (data ?? []).map((m) => ({ id: m.id, from: m.author as WebChatMessage["from"], text: m.content, at: m.created_at })),
  }
}

export async function sendWebChatMessage(token: string, text: string, page: string | null) {
  const supabase = createServiceClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("wa_conversations")
    .upsert({ phone: WEB_PREFIX + token, last_message_at: now, last_inbound_at: now, updated_at: now }, { onConflict: "phone" })
    .select(COLUMNS)
    .single()
  if (error || !data) throw new Error(`No se pudo guardar la conversación: ${error?.message}`)
  const conv = data as Conversation
  await supabase.from("wa_messages").insert({ conversation_id: conv.id, direction: "in", type: "text", content: text, author: "cliente" })

  // A person took the chat: they answer from /admin/pedidos and the bubble picks it up by polling.
  if (conv.status !== "bot") return { status: conv.status, bubbles: [] as string[] }

  const { data: locked } = await supabase.rpc("wa_try_lock", { p_conversation: conv.id, p_seconds: 55 })
  if (locked !== true) return { status: conv.status, bubbles: [] as string[], busy: true }

  try {
    const since10 = new Date(Date.now() - 10 * 60_000).toISOString()
    const since24 = new Date(Date.now() - 24 * 3600_000).toISOString()
    const [{ count: inbound10 }, { count: replies24 }] = await Promise.all([
      supabase.from("wa_messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("direction", "in").gte("created_at", since10),
      supabase.from("wa_messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("author", "bot").gte("created_at", since24),
    ])
    const budget = Number(process.env.AI_DAILY_BUDGET_USD ?? 2)
    const { data: usage } = await supabase.from("wa_usage_daily").select("cost_usd").order("day", { ascending: false }).limit(1).maybeSingle()
    const reason =
      (inbound10 ?? 0) > MAX_INBOUND_PER_10_MIN
        ? "Demasiados mensajes seguidos en el chat web"
        : (replies24 ?? 0) >= MAX_REPLIES_PER_DAY
          ? "Límite diario de respuestas del asistente"
          : !openaiConfigured()
            ? "La IA no está configurada"
            : Number(usage?.cost_usd ?? 0) >= budget
              ? "Se alcanzó el tope de gasto diario de IA"
              : null
    if (reason) {
      await handoff(supabase, conv, reason)
      return reply(supabase, conv.id, ["Para seguir, escríbanos por WhatsApp con el botón de abajo y le atiende alguien del equipo."], "humano")
    }

    const history = await buildHistory(supabase, conv.id)
    const result = await runSalesAgent({
      history,
      products: await loadCatalog(supabase),
      context: { channel: "web", privacyNoticeSent: true, memory: conv.memory ?? {}, page },
      effects: agentEffects(supabase, conv, text),
    })
    const bubbles = splitBubbles(cleanForWhatsApp(result.text), result.orderCode ? 3 : 2)
    await supabase.rpc("wa_add_usage", {
      p_tokens_in: result.usage.input,
      p_tokens_out: result.usage.output,
      p_cost: estimateCost(result.model, result.usage),
      p_messages: bubbles.length,
    })
    return reply(supabase, conv.id, bubbles, result.handedOff ? "humano" : "bot", result)
  } catch (e) {
    console.error("[webchat] error respondiendo", e)
    await logSystem(supabase, conv.id, `Error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 500))
    await handoff(supabase, conv, "Error técnico del asistente").catch(() => {})
    return reply(supabase, conv.id, ["Disculpe, tuve un inconveniente. Escríbanos por WhatsApp con el botón de abajo y le atendemos enseguida."], "humano")
  } finally {
    await supabase.from("wa_conversations").update({ processing_until: null }).eq("id", conv.id)
  }
}

async function reply(
  supabase: ReturnType<typeof createServiceClient>,
  conversationId: string,
  bubbles: string[],
  status: "bot" | "humano",
  result?: { usage: { input: number; output: number }; model: string },
) {
  await supabase.from("wa_messages").insert(
    bubbles.map((content, i) => ({
      conversation_id: conversationId,
      direction: "out",
      type: "text",
      content,
      author: "bot",
      ...(i === 0 && result ? { tokens_in: result.usage.input, tokens_out: result.usage.output, model: result.model } : {}),
    })),
  )
  await supabase.from("wa_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId)
  return { status, bubbles }
}
