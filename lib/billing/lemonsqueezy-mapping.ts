// Pure translation from Lemon Squeezy objects to rows of public.subscriptions /
// public.subscription_payments. No imports so it can be tested in isolation.

export type LsSubscriptionStatus = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired"

export interface LsSubscriptionAttributes {
  status: LsSubscriptionStatus
  customer_id: number | string
  variant_id: number | string
  trial_ends_at: string | null
  renews_at: string | null
  ends_at: string | null
  card_brand?: string | null
  card_last_four?: string | null
  test_mode?: boolean
}

export interface LsInvoiceAttributes {
  subscription_id: number | string
  billing_reason: "initial" | "renewal" | "updated"
  status: "pending" | "paid" | "void" | "refunded" | "partial_refund"
  currency: string
  total: number
  total_usd: number
  card_brand?: string | null
  card_last_four?: string | null
  created_at: string
  test_mode?: boolean
}

export type LocalStatus = "incomplete" | "trialing" | "active" | "inactive" | "past_due" | "canceled"
export type LocalPlan = "monthly" | "annual"

// Lemon Squeezy retries a failed renewal for about two weeks before giving up.
export const DUNNING_GRACE_DAYS = 14

const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString()

type VariantIds = { monthly?: string; annual?: string }

export function planForVariant(variantId: string, ...groups: VariantIds[]): LocalPlan | null {
  for (const v of groups) {
    if (v.annual && variantId === v.annual) return "annual"
    if (v.monthly && variantId === v.monthly) return "monthly"
  }
  return null
}

export function mapSubscription(
  a: LsSubscriptionAttributes,
  now: Date = new Date(),
): { status: LocalStatus; current_period_end: string | null; trial_ends_at: string | null } {
  switch (a.status) {
    case "on_trial":
      return { status: "trialing", current_period_end: a.trial_ends_at ?? a.renews_at, trial_ends_at: a.trial_ends_at }
    case "active":
      return { status: "active", current_period_end: a.renews_at, trial_ends_at: a.trial_ends_at }
    case "past_due":
      // Keep access while payment retries happen; cut it if they never succeed.
      return {
        status: "past_due",
        current_period_end: addDays(a.renews_at ?? now.toISOString(), DUNNING_GRACE_DAYS),
        trial_ends_at: a.trial_ends_at,
      }
    case "cancelled":
      // Cancelled but already paid until ends_at: access continues until then.
      return { status: "canceled", current_period_end: a.ends_at ?? a.renews_at, trial_ends_at: a.trial_ends_at }
    case "unpaid":
    case "paused":
    case "expired":
    default:
      return { status: "inactive", current_period_end: a.ends_at ?? now.toISOString(), trial_ends_at: a.trial_ends_at }
  }
}

export function subscriptionRow(
  externalId: string,
  a: LsSubscriptionAttributes,
  plan: LocalPlan | null,
  now: Date = new Date(),
) {
  const mapped = mapSubscription(a, now)
  return {
    provider: "lemonsqueezy" as const,
    external_subscription_id: externalId,
    external_customer_id: String(a.customer_id),
    external_variant_id: String(a.variant_id),
    external_status: a.status,
    status: mapped.status,
    current_period_end: mapped.current_period_end,
    trial_ends_at: mapped.trial_ends_at,
    card_brand: a.card_brand || null,
    card_last_four: a.card_last_four || null,
    ...(plan ? { plan_id: plan } : {}),
    updated_at: now.toISOString(),
  }
}

// Only real money counts as a payment: the $0 initial invoice of a trial is skipped.
export function paymentFromInvoice(externalId: string, a: LsInvoiceAttributes, plan: LocalPlan | null) {
  if (a.status !== "paid" || a.total <= 0) return null
  const months = plan === "annual" ? 12 : 1
  const start = new Date(a.created_at)
  const end = new Date(start)
  end.setMonth(end.getMonth() + months)
  const currency = a.currency === "DOP" ? "DOP" : "USD"
  return {
    provider: "lemonsqueezy" as const,
    external_id: externalId,
    amount: (currency === "USD" ? a.total_usd : a.total) / 100,
    currency,
    method: a.card_brand ? `Tarjeta ${a.card_brand}${a.card_last_four ? ` •${a.card_last_four}` : ""}` : "Lemon Squeezy",
    reference: `LS-${a.subscription_id}`,
    notes: a.billing_reason === "renewal" ? "Renovación automática" : "Primer cobro",
    months,
    period_start: start.toISOString(),
    period_end: end.toISOString(),
  }
}
