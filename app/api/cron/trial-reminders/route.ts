import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/admin"
import { emailConfigured, sendEmail, trialEndingEmail } from "@/lib/email"
import { toSystem } from "@/lib/systems"
import { SITE_URL, formatUSD } from "@/lib/site"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const REMIND_DAYS_BEFORE = 3
const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", timeZone: "America/Santo_Domingo" })

// Runs daily (vercel.json). PayPal doesn't warn subscribers before the first charge after a
// free trial, so we do: it avoids surprise charges and the chargebacks that follow.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  if (!emailConfigured()) return NextResponse.json({ sent: 0, skipped: "correo no configurado" })

  const db = createServiceClient()
  const now = new Date()
  const limit = new Date(now.getTime() + REMIND_DAYS_BEFORE * 86_400_000)

  const { data: due, error } = await db
    .from("subscriptions")
    .select("id, user_id, plan_id, trial_ends_at")
    .eq("provider", "paypal")
    .eq("status", "trialing")
    .is("trial_reminder_sent_at", null)
    .gt("trial_ends_at", now.toISOString())
    .lte("trial_ends_at", limit.toISOString())
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: systemRow } = await db.from("systems").select("*").eq("slug", "gestion").maybeSingle()
  const plan = systemRow ? toSystem(systemRow).plans[0] : undefined

  let sent = 0
  const failures: string[] = []
  for (const sub of due ?? []) {
    try {
      const { data: userData } = await db.auth.admin.getUserById(sub.user_id)
      const email = userData.user?.email
      if (!email) continue
      const { data: profile } = await db.from("profiles").select("business_name").eq("id", sub.user_id).maybeSingle()
      const annual = sub.plan_id === "annual"
      const amount = plan ? formatUSD(annual && plan.annual_usd ? plan.annual_usd : plan.monthly_usd) : "el monto de tu plan"
      const message = trialEndingEmail({
        businessName: profile?.business_name ?? "",
        chargeDate: dateFormat.format(new Date(sub.trial_ends_at)),
        amount,
        period: annual ? "año" : "mes",
        manageUrl: `${SITE_URL}/dashboard/suscripcion`,
      })
      await sendEmail({ to: email, ...message })
      await db.from("subscriptions").update({ trial_reminder_sent_at: new Date().toISOString() }).eq("id", sub.id)
      sent++
    } catch (e) {
      failures.push(`${sub.user_id}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  if (failures.length) console.error("trial-reminders:", failures)
  return NextResponse.json({ sent, failed: failures.length })
}
