import "server-only"

import { createServiceClient } from "@/lib/supabase/admin"
import { lemonConfig } from "@/lib/billing/lemonsqueezy"
import {
  paymentFromInvoice,
  planForVariant,
  subscriptionRow,
  type LsInvoiceAttributes,
  type LsSubscriptionAttributes,
} from "@/lib/billing/lemonsqueezy-mapping"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function gestionSystemId(db: ReturnType<typeof createServiceClient>) {
  const { data, error } = await db.from("systems").select("id").eq("slug", "gestion").single()
  if (error || !data) throw new Error("No existe el sistema 'gestion'")
  return data.id as string
}

// Prefers the user id sent at checkout; falls back to a subscription already linked.
async function resolveUser(
  db: ReturnType<typeof createServiceClient>,
  customUserId: unknown,
  externalSubscriptionId: string,
): Promise<string | null> {
  if (typeof customUserId === "string" && UUID.test(customUserId)) {
    const { data } = await db.from("profiles").select("id").eq("id", customUserId).maybeSingle()
    if (data) return customUserId
  }
  const { data } = await db
    .from("subscriptions")
    .select("user_id")
    .eq("provider", "lemonsqueezy")
    .eq("external_subscription_id", externalSubscriptionId)
    .maybeSingle()
  return (data?.user_id as string | undefined) ?? null
}

export async function applySubscription(
  externalId: string,
  attributes: LsSubscriptionAttributes,
  customUserId: unknown,
): Promise<string | null> {
  const db = createServiceClient()
  const userId = await resolveUser(db, customUserId, externalId)
  if (!userId) return null
  const systemId = await gestionSystemId(db)
  const { variants, variantsNoTrial } = lemonConfig()
  const plan = planForVariant(String(attributes.variant_id), variants, variantsNoTrial)
  const row = subscriptionRow(externalId, attributes, plan)

  const { error } = await db
    .from("subscriptions")
    .upsert(
      { user_id: userId, system_id: systemId, plan_id: plan ?? "monthly", ...row, notes: "Cobro automático (Lemon Squeezy)" },
      { onConflict: "user_id,system_id" },
    )
  if (error) throw new Error(`No se pudo guardar la suscripción: ${error.message}`)
  return userId
}

export async function recordInvoice(
  externalInvoiceId: string,
  attributes: LsInvoiceAttributes,
  customUserId: unknown,
): Promise<string | null> {
  const db = createServiceClient()
  const userId = await resolveUser(db, customUserId, String(attributes.subscription_id))
  if (!userId) return null
  const { data: sub } = await db
    .from("subscriptions")
    .select("id, plan_id")
    .eq("user_id", userId)
    .eq("system_id", await gestionSystemId(db))
    .maybeSingle()
  if (!sub) return userId

  const payment = paymentFromInvoice(externalInvoiceId, attributes, sub.plan_id === "annual" ? "annual" : "monthly")
  if (!payment) return userId

  const { error } = await db
    .from("subscription_payments")
    .upsert({ subscription_id: sub.id, user_id: userId, ...payment }, { onConflict: "provider,external_id", ignoreDuplicates: true })
  if (error) throw new Error(`No se pudo registrar el pago: ${error.message}`)
  return userId
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
        provider: "lemonsqueezy",
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
