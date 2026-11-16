"use server"

import { createHash } from "node:crypto"
import { cookies, headers } from "next/headers"
import { createServiceClient } from "@/lib/supabase/admin"
import { emailConfigured, newLeadEmail, sendEmail } from "@/lib/email"
import { LEAD_SERVICES, parseContactLead, RATE_LIMITS, type ContactLeadInput } from "@/lib/contact-lead"
import { hubspotConfig, hubspotPayload, submitToHubSpot } from "@/lib/hubspot"
import { CONTACT_EMAIL } from "@/lib/site"

export type ContactResult = { ok: boolean; error?: string }

const BUSY = "Estamos recibiendo muchos mensajes; escríbenos por WhatsApp y te respondemos al momento."

function hashIp(ip: string) {
  const salt = process.env.SUPABASE_SECRET_KEY ?? "avero"
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32)
}

// Order: validate → save in Supabase → send to HubSpot → email the owner.
// The visitor sees success as long as the lead landed somewhere we can read it.
export async function submitContactLead(input: ContactLeadInput): Promise<ContactResult> {
  const parsed = parseContactLead(input)
  if (!parsed.ok) return parsed.spam ? { ok: true } : { ok: false, error: parsed.error }
  const lead = parsed.lead!

  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || ""
  const ipHash = ip ? hashIp(ip) : null
  const hutk = (await cookies()).get("hubspotutk")?.value ?? null

  // 1. Supabase (rate limit + durable copy)
  let leadId: string | null = null
  let db: ReturnType<typeof createServiceClient> | null = null
  try {
    db = createServiceClient()
    const since = new Date(Date.now() - 3_600_000).toISOString()
    const count = async (col?: "ip_hash" | "email", value?: string) => {
      let q = db!.from("contact_leads").select("id", { count: "exact", head: true }).gt("created_at", since)
      if (col && value) q = q.eq(col, value)
      const { count: n } = await q
      return n ?? 0
    }
    if ((ipHash && (await count("ip_hash", ipHash)) >= RATE_LIMITS.perIp) || (await count("email", lead.email)) >= RATE_LIMITS.perEmail) {
      return { ok: false, error: "Ya recibimos varios mensajes tuyos en la última hora; te contactaremos pronto." }
    }
    if ((await count()) >= RATE_LIMITS.global) return { ok: false, error: BUSY }

    const { data, error } = await db
      .from("contact_leads")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company || null,
        service: lead.service,
        message: lead.message,
        consent: lead.consent,
        language: lead.language,
        page_uri: lead.pageUri || null,
        page_name: lead.pageName || null,
        utm: lead.utm,
        hutk,
        ip_hash: ipHash,
      })
      .select("id")
      .single()
    if (error) throw new Error(error.message)
    leadId = data.id
  } catch (e) {
    console.error("contact_leads:", e instanceof Error ? e.message : e)
  }

  // 2. HubSpot
  let synced = false
  const config = hubspotConfig()
  if (config) {
    const res = await submitToHubSpot(config, hubspotPayload({ ...lead, hutk }))
    synced = res.ok
    if (!res.ok) console.error("hubspot:", res.error)
    if (db && leadId) {
      await db
        .from("contact_leads")
        .update(res.ok ? { hubspot_synced_at: new Date().toISOString(), hubspot_attempts: 1 } : { hubspot_attempts: 1, hubspot_error: res.error })
        .eq("id", leadId)
    }
  }

  // 3. Email to the owner
  let emailed = false
  if (emailConfigured()) {
    try {
      await sendEmail({ to: process.env.LEADS_NOTIFY_EMAIL || CONTACT_EMAIL, ...newLeadEmail({ ...lead, service: LEAD_SERVICES[lead.service] }) })
      emailed = true
    } catch (e) {
      console.error("contact email:", e instanceof Error ? e.message : e)
    }
  }

  if (!leadId && !synced && !emailed) {
    return { ok: false, error: "No pudimos enviar tu mensaje. Escríbenos por WhatsApp y te respondemos al momento." }
  }
  return { ok: true }
}
