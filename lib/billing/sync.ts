import "server-only"

import { createServiceClient } from "@/lib/supabase/admin"
import { getSubscription, paypalConfig } from "@/lib/billing/paypal"
import { paymentFromSale, planForPlanId, subscriptionRow, type PpSale, type PpSubscription } from "@/lib/billing/paypal-mapping"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Db = ReturnType<typeof createServiceClient>

async function gestionSystemId(db: Db) {
  const { data, error } = await db.from("systems").select("id").eq("slug", "gestion").single()
  if (error || !data) throw new Error("No existe el sistema 'gestion'")
  return data.id as string
}

function planOf(planId: string) {
  const { plans, plansNoTrial } = paypalConfig()
  return planForPlanId(planId, plans, plansNoTrial)
}

// The account comes from custom_id (set by us when creating the subscription); falls back
// to a subscription already linked.
async function resolveUser(db: Db, customId: string | undefined, externalId: string): Promise<string | null> {
  if (customId && UUID.test(customId)) {
    const { data } = await db.from("profiles").select("id").eq("id", customId).maybeSingle()
    if (data) return customId
  }
  const { data } = await db
    .from("subscriptions")
    .select("user_id")
    .eq("provider", "paypal")
    .eq("external_subscription_id", externalId)
    .maybeSingle()
  return (data?.user_id as string | undefined) ?? null
}

export async function applySubscription(sub: PpSubscription, expectedUserId?: string): Promise<string | null> {
  const db = createServiceClient()
  const userId = await resolveUser(db, sub.custom_id, sub.id)
  if (!userId) return null
  // When the customer comes back from PayPal, only link subscriptions created for them.
  if (expectedUserId && userId !== expectedUserId) return null

  const plan = planOf(sub.plan_id)
  const row = subscriptionRow(sub, plan)
  const { data: current } = await db
    .from("subscriptions")
    .select("status, trial_ends_at, external_subscription_id")
    .eq("user_id", userId)
    .maybeSingle()
  // Approved but not active yet: don't touch an account that may already have access.
  if (row.status === "incomplete" && current && current.status !== "incomplete") return userId
  // A late event from an older, replaced subscription must not lock the current one.
  const replaced = current?.external_subscription_id && current.external_subscription_id !== sub.id
  if (replaced && row.status !== "trialing" && row.status !== "active") return userId
  // Cancelled during the free trial: PayPal gives no end date, but the trial was promised in full.
  if (row.status === "canceled" && current?.trial_ends_at && new Date(current.trial_ends_at) > new Date(row.current_period_end ?? 0)) {
    row.current_period_end = current.trial_ends_at
    row.trial_ends_at = current.trial_ends_at
  }

  const { error } = await db
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        system_id: await gestionSystemId(db),
        plan_id: plan ?? "monthly",
        ...row,
        notes: "Cobro automático (PayPal)",
      },
      { onConflict: "user_id,system_id" },
    )
  if (error) throw new Error(`No se pudo guardar la suscripción: ${error.message}`)
  return userId
}

export async function refreshSubscription(externalId: string, expectedUserId?: string) {
  return applySubscription(await getSubscription(externalId), expectedUserId)
}

export async function recordSale(sale: PpSale): Promise<string | null> {
  if (!sale.billing_agreement_id) return null
  const db = createServiceClient()
  const { data: sub } = await db
    .from("subscriptions")
    .select("id, user_id, plan_id")
    .eq("provider", "paypal")
    .eq("external_subscription_id", sale.billing_agreement_id)
    .maybeSingle()
  if (!sub) return null

  const payment = paymentFromSale(sale, sub.plan_id === "annual" ? "annual" : "monthly")
  if (!payment) return sub.user_id as string

  const { error } = await db
    .from("subscription_payments")
    .upsert(
      { subscription_id: sub.id, user_id: sub.user_id, ...payment },
      { onConflict: "provider,external_id", ignoreDuplicates: true },
    )
  if (error) throw new Error(`No se pudo registrar el pago: ${error.message}`)
  return sub.user_id as string
}

export async function logBillingEvent(entry: {
  eventName: string
  externalId?: string
  userId?: string | null
  testMode: boolean
  payload: unknown
  error?: string
}) {
  try {
    await createServiceClient()
      .from("billing_events")
      .insert({
        provider: "paypal",
        event_name: entry.eventName,
        external_id: entry.externalId ?? null,
        user_id: entry.userId ?? null,
        test_mode: entry.testMode,
        payload: entry.payload,
        error: entry.error ?? null,
      })
  } catch (e) {
    console.error("logBillingEvent:", e)
  }
}
