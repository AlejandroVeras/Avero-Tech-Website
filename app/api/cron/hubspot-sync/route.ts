import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/admin"
import { contactLeadSchema, type LeadService } from "@/lib/contact-lead"
import { hubspotConfig, hubspotPayload, submitToHubSpot } from "@/lib/hubspot"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_ATTEMPTS = 10

// Runs daily (vercel.json): resends to HubSpot the contacts that failed when they were submitted.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const config = hubspotConfig()
  if (!config) return NextResponse.json({ synced: 0, skipped: "HubSpot no configurado" })

  const db = createServiceClient()
  const { data: pending, error } = await db
    .from("contact_leads")
    .select("*")
    .is("hubspot_synced_at", null)
    .lt("hubspot_attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let synced = 0
  let failed = 0
  for (const row of pending ?? []) {
    const parsed = contactLeadSchema.safeParse({
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company ?? "",
      service: row.service as LeadService,
      message: row.message,
      consent: true,
      language: row.language,
      pageUri: row.page_uri ?? "",
      pageName: row.page_name ?? "",
      utm: row.utm ?? {},
    })
    if (!parsed.success) {
      await db.from("contact_leads").update({ hubspot_attempts: MAX_ATTEMPTS, hubspot_error: "Datos inválidos" }).eq("id", row.id)
      failed++
      continue
    }
    const lead = parsed.data
    const res = await submitToHubSpot(config, hubspotPayload({ ...lead, hutk: row.hutk }, new Date(row.created_at).getTime()))
    await db
      .from("contact_leads")
      .update(
        res.ok
          ? { hubspot_synced_at: new Date().toISOString(), hubspot_attempts: row.hubspot_attempts + 1, hubspot_error: null }
          : { hubspot_attempts: row.hubspot_attempts + 1, hubspot_error: res.error },
      )
      .eq("id", row.id)
    if (res.ok) synced++
    else failed++
  }
  return NextResponse.json({ synced, failed })
}
