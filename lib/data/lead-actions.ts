"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isPlatformAdmin } from "@/lib/data/access"
import { sendText, whatsappConfigured } from "@/lib/whatsapp/cloud"
import { LEAD_STATUSES } from "@/lib/data/leads"
import { isWebPhone } from "@/lib/chat/phone"

async function adminClient() {
  if (!(await isPlatformAdmin())) throw new Error("Solo administradores de plataforma")
  return createClient()
}

const uuid = z.string().uuid()

export async function setLeadStatus(formData: FormData) {
  const id = uuid.parse(formData.get("id"))
  const status = z.enum(LEAD_STATUSES).parse(formData.get("status"))
  const supabase = await adminClient()
  await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
  revalidatePath("/admin/pedidos", "layout")
}

// "humano" pauses the bot so you can write yourself; "bot" hands the chat back.
export async function setBotStatus(formData: FormData) {
  const conversationId = uuid.parse(formData.get("conversationId"))
  const status = z.enum(["bot", "humano", "cerrada"]).parse(formData.get("status"))
  const supabase = await adminClient()
  await supabase.from("wa_conversations").update({ status, misunderstandings: 0, updated_at: new Date().toISOString() }).eq("id", conversationId)
  revalidatePath("/admin/pedidos", "layout")
}

// Free-form WhatsApp replies only work inside the 24-hour window that opens with each customer message.
// Web chat replies are just stored; the bubble on the site polls for them.
export async function sendHumanReply(formData: FormData) {
  const conversationId = uuid.parse(formData.get("conversationId"))
  const text = z.string().trim().min(1).max(1000).parse(formData.get("text"))
  const supabase = await adminClient()
  const { data: conv } = await supabase.from("wa_conversations").select("phone, last_inbound_at").eq("id", conversationId).single()
  if (!conv) throw new Error("Conversación no encontrada")
  const web = isWebPhone(conv.phone)
  if (!web && !whatsappConfigured()) throw new Error("WhatsApp no está configurado")
  if (!web && Date.now() - new Date(conv.last_inbound_at).getTime() > 24 * 3600_000) {
    throw new Error("Pasaron más de 24 horas desde el último mensaje del cliente: solo se pueden enviar plantillas")
  }
  const waId = web ? null : await sendText(conv.phone, text)
  await supabase.from("wa_conversations").update({ status: "humano", last_message_at: new Date().toISOString() }).eq("id", conversationId)
  await supabase.from("wa_messages").insert({ conversation_id: conversationId, direction: "out", type: "text", content: text, wa_message_id: waId, author: "humano" })
  revalidatePath("/admin/pedidos", "layout")
}
