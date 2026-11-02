import "server-only"

import { requireAdmin } from "@/lib/data/admin-queries"

// Orders and chats from the WhatsApp sales bot (DATABASE_WHATSAPP_LEADS.sql). Admin only.

export const LEAD_STATUSES = ["nuevo", "interesado", "confirmado", "en_ruta", "entregado", "cancelado"] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  interesado: "Interesado",
  confirmado: "Confirmado",
  en_ruta: "En ruta",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

export const LEAD_STYLES: Record<LeadStatus, string> = {
  nuevo: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  interesado: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  confirmado: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100",
  en_ruta: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  entregado: "bg-emerald-200 text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-100",
  cancelado: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
}

export type LeadItem = { slug: string; name: string; quantity: number; unitPrice: number; subtotal: number }

export type Lead = {
  id: string
  code: string
  conversationId: string | null
  status: LeadStatus
  items: LeadItem[]
  total: number
  customerName: string | null
  phone: string
  address: string | null
  sector: string | null
  city: string | null
  landmark: string | null
  paymentMethod: string | null
  deliveryWindow: string | null
  notes: string | null
  interestedSlugs: string[]
  isTest: boolean
  confirmedAt: string | null
  createdAt: string
  botStatus?: "bot" | "humano" | "cerrada"
}

export type ChatMessage = { id: string; direction: "in" | "out"; type: string; content: string; author: string; createdAt: string }

type LeadRow = {
  id: string
  code: string
  conversation_id: string | null
  status: LeadStatus
  items: LeadItem[] | null
  total: number | string
  customer_name: string | null
  phone: string
  address: string | null
  sector: string | null
  city: string | null
  landmark: string | null
  payment_method: string | null
  delivery_window: string | null
  notes: string | null
  interested_slugs: string[] | null
  is_test: boolean
  confirmed_at: string | null
  created_at: string
  wa_conversations?: { status: "bot" | "humano" | "cerrada" } | null
}

function toLead(r: LeadRow): Lead {
  return {
    id: r.id,
    code: r.code,
    conversationId: r.conversation_id,
    status: r.status,
    items: r.items ?? [],
    total: Number(r.total),
    customerName: r.customer_name,
    phone: r.phone,
    address: r.address,
    sector: r.sector,
    city: r.city,
    landmark: r.landmark,
    paymentMethod: r.payment_method,
    deliveryWindow: r.delivery_window,
    notes: r.notes,
    interestedSlugs: r.interested_slugs ?? [],
    isTest: r.is_test,
    confirmedAt: r.confirmed_at,
    createdAt: r.created_at,
    botStatus: r.wa_conversations?.status,
  }
}

export async function listLeads(status?: LeadStatus): Promise<{ leads: Lead[]; error?: string }> {
  const { supabase } = await requireAdmin()
  let query = supabase.from("leads").select("*, wa_conversations(status)").order("created_at", { ascending: false }).limit(200)
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { leads: [], error: error.code === "42P01" ? "Falta correr DATABASE_WHATSAPP_LEADS.sql" : error.message }
  return { leads: (data as LeadRow[]).map(toLead) }
}

export async function getLead(id: string) {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from("leads").select("*, wa_conversations(status)").eq("id", id).maybeSingle()
  if (!data) return null
  const lead = toLead(data as LeadRow)
  const { data: conv } = lead.conversationId
    ? await supabase.from("wa_conversations").select("last_inbound_at").eq("id", lead.conversationId).maybeSingle()
    : { data: null }
  const { data: messages }: { data: { id: string; direction: "in" | "out"; type: string; content: string; author: string; created_at: string }[] | null } = lead.conversationId
    ? await supabase
        .from("wa_messages")
        .select("id, direction, type, content, author, created_at")
        .eq("conversation_id", lead.conversationId)
        .order("created_at", { ascending: true })
        .limit(500)
    : { data: null }
  const lastInbound = conv?.last_inbound_at ? new Date(conv.last_inbound_at as string).getTime() : 0
  return {
    lead,
    windowOpen: Date.now() - lastInbound < 24 * 3600_000,
    messages: (messages ?? []).map(
      (m): ChatMessage => ({ id: m.id, direction: m.direction, type: m.type, content: m.content, author: m.author, createdAt: m.created_at }),
    ),
  }
}

export async function usageSummary() {
  const { supabase } = await requireAdmin()
  const since = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10)
  const { data } = await supabase.from("wa_usage_daily").select("day, cost_usd, messages_out").gte("day", since)
  return {
    costUsd: (data ?? []).reduce((s, d) => s + Number(d.cost_usd), 0),
    messagesOut: (data ?? []).reduce((s, d) => s + Number(d.messages_out), 0),
  }
}
