import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export interface BillingInfo {
  provider: "manual" | "paypal"
  planId?: string
  cardBrand?: string
  cardLastFour?: string
  nextChargeAt?: Date
}

export type AccessState =
  | { kind: "active"; endsAt: Date | null; billing: BillingInfo; canceled: boolean; pastDue: boolean }
  | { kind: "trialing"; endsAt: Date; daysLeft: number; billing: BillingInfo }
  | { kind: "expired"; endsAt: Date | null; wasTrial: boolean; billing: BillingInfo }
  | { kind: "incomplete" }
  | { kind: "unknown" }

// Mirrors public.account_has_access() in DATABASE_BILLING_UPDATE.sql, which is what actually
// enforces read-only mode. Fails open: an unreadable or missing subscription never blocks the UI.
export const getAccess = cache(async (): Promise<AccessState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: "unknown" }

  const full = await supabase
    .from("subscriptions")
    .select("status, plan_id, current_period_end, trial_ends_at, next_billing_at, provider, card_brand, card_last_four, systems!inner(slug)")
    .eq("user_id", user.id)
    .eq("systems.slug", "gestion")
    .maybeSingle()
  // Before DATABASE_BILLING_UPDATE.sql the billing columns don't exist yet.
  const { data, error } = full.error
    ? await supabase
        .from("subscriptions")
        .select("status, plan_id, current_period_end, systems!inner(slug)")
        .eq("user_id", user.id)
        .eq("systems.slug", "gestion")
        .maybeSingle()
    : full

  if (error || !data) return { kind: "unknown" }
  if (data.status === "incomplete") return { kind: "incomplete" }

  const row = data as typeof data & {
    provider?: string
    card_brand?: string | null
    card_last_four?: string | null
    trial_ends_at?: string | null
    next_billing_at?: string | null
  }
  const billing: BillingInfo = {
    provider: row.provider === "paypal" ? "paypal" : "manual",
    planId: row.plan_id ?? undefined,
    cardBrand: row.card_brand ?? undefined,
    cardLastFour: row.card_last_four ?? undefined,
    nextChargeAt: row.next_billing_at ? new Date(row.next_billing_at) : undefined,
  }
  const endsAt = data.current_period_end ? new Date(data.current_period_end) : null
  const notExpired = !endsAt || endsAt.getTime() > Date.now()

  if (data.status === "trialing" && endsAt && notExpired) {
    // Show the real charge date; current_period_end carries a small safety buffer.
    const trialEnd = row.trial_ends_at ? new Date(row.trial_ends_at) : endsAt
    const daysLeft = Math.max(1, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000))
    return { kind: "trialing", endsAt: trialEnd, daysLeft, billing }
  }
  if (["active", "trialing", "past_due", "canceled"].includes(data.status) && notExpired) {
    return { kind: "active", endsAt, billing, canceled: data.status === "canceled", pastDue: data.status === "past_due" }
  }
  return { kind: "expired", endsAt, wasTrial: data.plan_id === "trial", billing }
})

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle()
  return !!data
}
