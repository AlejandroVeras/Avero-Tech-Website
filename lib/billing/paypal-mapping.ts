// Pure translation from PayPal Subscriptions objects to rows of public.subscriptions /
// public.subscription_payments. No imports so it can be tested in isolation.

export type PpStatus = "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED"

export interface PpCycleExecution {
  tenure_type: "TRIAL" | "REGULAR"
  sequence: number
  cycles_completed: number
  cycles_remaining?: number
  total_cycles?: number
}

export interface PpSubscription {
  id: string
  status: PpStatus
  plan_id: string
  custom_id?: string
  start_time?: string
  status_update_time?: string
  subscriber?: { email_address?: string; payer_id?: string }
  billing_info?: {
    next_billing_time?: string
    last_payment?: { amount?: { value: string; currency_code: string }; time?: string }
    failed_payments_count?: number
    cycle_executions?: PpCycleExecution[]
  }
}

export interface PpSale {
  id: string
  state: string
  amount: { total: string; currency: string }
  billing_agreement_id?: string
  create_time: string
}

export type LocalStatus = "incomplete" | "trialing" | "active" | "inactive" | "past_due" | "canceled"
export type LocalPlan = "monthly" | "annual"
type PlanIds = { monthly?: string; annual?: string }

// PayPal charges on next_billing_time and the update can take a while to arrive;
// a small buffer keeps a paying customer from flickering into read-only mode.
export const RENEWAL_BUFFER_DAYS = 1
// We configure payment_failure_threshold = 3; PayPal retries roughly every 5 days.
export const DUNNING_GRACE_DAYS = 15

const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * 86_400_000).toISOString()
const addMonths = (iso: string, months: number) => {
  const d = new Date(iso)
  d.setUTCMonth(d.getUTCMonth() + months)
  return d.toISOString()
}

export function planForPlanId(planId: string, ...groups: PlanIds[]): LocalPlan | null {
  for (const g of groups) {
    if (g.annual && planId === g.annual) return "annual"
    if (g.monthly && planId === g.monthly) return "monthly"
  }
  return null
}

export function inTrial(s: PpSubscription): boolean {
  const trial = s.billing_info?.cycle_executions?.find((c) => c.tenure_type === "TRIAL")
  if (!trial) return false
  if (typeof trial.cycles_remaining === "number") return trial.cycles_remaining > 0
  return typeof trial.total_cycles === "number" ? trial.cycles_completed < trial.total_cycles : false
}

export function mapSubscription(
  s: PpSubscription,
  plan: LocalPlan | null,
  now: Date = new Date(),
): { status: LocalStatus; current_period_end: string | null; trial_ends_at: string | null } {
  const next = s.billing_info?.next_billing_time ?? null
  const nowIso = now.toISOString()

  switch (s.status) {
    case "APPROVAL_PENDING":
    case "APPROVED":
      // Not billable yet; PayPal sends ACTIVATED moments later.
      return { status: "incomplete", current_period_end: null, trial_ends_at: null }
    case "ACTIVE": {
      if ((s.billing_info?.failed_payments_count ?? 0) > 0) {
        return { status: "past_due", current_period_end: addDays(next ?? nowIso, DUNNING_GRACE_DAYS), trial_ends_at: null }
      }
      if (inTrial(s)) {
        return { status: "trialing", current_period_end: next ? addDays(next, RENEWAL_BUFFER_DAYS) : null, trial_ends_at: next }
      }
      return { status: "active", current_period_end: next ? addDays(next, RENEWAL_BUFFER_DAYS) : null, trial_ends_at: null }
    }
    case "CANCELLED": {
      // Access continues until the end of what was already paid (or the trial, if it was in trial).
      const lastPaid = s.billing_info?.last_payment?.time
      const paidThrough = lastPaid ? addMonths(lastPaid, plan === "annual" ? 12 : 1) : null
      const end = next ?? paidThrough ?? s.status_update_time ?? nowIso
      return { status: "canceled", current_period_end: end > nowIso ? end : nowIso, trial_ends_at: null }
    }
    case "SUSPENDED":
    case "EXPIRED":
    default:
      return { status: "inactive", current_period_end: nowIso, trial_ends_at: null }
  }
}

export function subscriptionRow(s: PpSubscription, plan: LocalPlan | null, now: Date = new Date()) {
  const mapped = mapSubscription(s, plan, now)
  return {
    provider: "paypal" as const,
    external_subscription_id: s.id,
    external_customer_id: s.subscriber?.payer_id ?? null,
    external_variant_id: s.plan_id,
    external_status: s.status,
    status: mapped.status,
    current_period_end: mapped.current_period_end,
    trial_ends_at: mapped.trial_ends_at,
    next_billing_at: s.status === "ACTIVE" ? (s.billing_info?.next_billing_time ?? null) : null,
    ...(plan ? { plan_id: plan } : {}),
    updated_at: now.toISOString(),
  }
}

export function paymentFromSale(sale: PpSale, plan: LocalPlan | null) {
  const amount = Number(sale.amount.total)
  if (sale.state !== "completed" || !(amount > 0)) return null
  const months = plan === "annual" ? 12 : 1
  const start = sale.create_time
  return {
    provider: "paypal" as const,
    external_id: sale.id,
    amount,
    currency: sale.amount.currency === "DOP" ? "DOP" : "USD",
    method: "PayPal",
    reference: sale.billing_agreement_id ?? null,
    notes: "Cobro automático",
    months,
    period_start: new Date(start).toISOString(),
    period_end: addMonths(start, months),
  }
}
