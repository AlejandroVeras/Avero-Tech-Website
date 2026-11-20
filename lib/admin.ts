import type { SaasSystem } from "@/lib/systems"

export interface AdminAccount {
  userId: string
  email: string
  businessName: string
  slug?: string
  storeEnabled: boolean
  signedUpAt: string
  lastSignInAt?: string
  subscriptionId?: string
  status?: string
  planId?: string
  periodEnd?: string
  hasAccess: boolean
  products: number
  publicProducts: number
  lastPaymentAt?: string
  provider?: "manual" | "paypal"
  cardBrand?: string
  cardLastFour?: string
}

export interface AdminPayment {
  id: string
  userId: string
  amount: number
  currency: "USD" | "DOP"
  method: string
  reference?: string
  notes?: string
  months: number
  periodStart: string
  periodEnd: string
  createdAt: string
}

export type AccountState = "pagando" | "cortesia" | "prueba" | "pendiente" | "vencido"

export const STATE_LABELS: Record<AccountState, string> = {
  pagando: "Pagando",
  cortesia: "Cortesía",
  prueba: "En prueba",
  pendiente: "Sin activar (pendiente)",
  vencido: "Vencido / suspendido",
}

export const PLAN_LABELS: Record<string, string> = {
  monthly: "Mensual",
  annual: "Anual",
  trial: "Prueba",
  courtesy: "Cortesía",
}

export function accountState(a: AdminAccount): AccountState {
  if (a.status === "incomplete") return "pendiente"
  if (!a.hasAccess) return "vencido"
  if (a.status === "trialing") return "prueba"
  if (a.planId === "courtesy" || !a.planId) return "cortesia"
  return "pagando"
}

export function daysUntil(date?: string) {
  if (!date) return null
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)
}

export function saasMetrics(accounts: AdminAccount[], system: SaasSystem | null, payments: AdminPayment[]) {
  const plan = system?.plans[0]
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const states = accounts.map(accountState)

  const paying = accounts.filter((a, i) => states[i] === "pagando")
  const mrrUsd = plan
    ? paying.reduce((sum, a) => {
        if (a.planId === "annual" && plan.annual_usd) return sum + plan.annual_usd / 12
        if (a.planId === "monthly") return sum + plan.monthly_usd
        return sum
      }, 0)
    : 0

  const monthPayments = payments.filter((p) => new Date(p.createdAt) >= monthStart)
  return {
    total: accounts.length,
    paying: paying.length,
    courtesy: states.filter((s) => s === "cortesia").length,
    trialing: states.filter((s) => s === "prueba").length,
    expired: states.filter((s) => s === "vencido").length,
    trialsEndingSoon: accounts.filter((a, i) => {
      const d = daysUntil(a.periodEnd)
      return states[i] === "prueba" && d !== null && d <= 7
    }),
    signupsThisMonth: accounts.filter((a) => new Date(a.signedUpAt) >= monthStart).length,
    mrrUsd,
    collectedThisMonth: {
      USD: monthPayments.filter((p) => p.currency === "USD").reduce((s, p) => s + p.amount, 0),
      DOP: monthPayments.filter((p) => p.currency === "DOP").reduce((s, p) => s + p.amount, 0),
    },
  }
}

// ─── Acceso que el administrador le da a un negocio ──────────────────
// No imports beyond types: tests/admin-access.test.ts runs this file directly.

export type AccessKind = "paid" | "courtesy" | "trial"
export type PaidPlan = "monthly" | "annual"

export const ACCESS_KINDS: { id: AccessKind; label: string; hint: string }[] = [
  { id: "paid", label: "Pagó", hint: "Plan mensual o anual, con acceso hasta la fecha que pongas." },
  { id: "courtesy", label: "Cortesía", hint: "Gratis. Sin fecha, o hasta la fecha que pongas." },
  { id: "trial", label: "Prueba", hint: "Prueba gratis hasta la fecha que pongas." },
]

/** "2026-12-31" → the last second of that day in Santo Domingo (UTC−4, no daylight saving). */
export function endOfDaySantoDomingo(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const d = new Date(`${date}T23:59:59-04:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** Arguments for public.admin_set_subscription (DATABASE_ADMIN_UPDATE.sql). */
export function accessToSubscription(
  account: string,
  input: { kind?: AccessKind; plan?: PaidPlan; until?: string | null },
): { args: { account: string; new_status: string; new_plan: string; new_end: string | null; keep_end: boolean } } | { error: string } {
  if (!input.kind) return { error: "Elige el tipo de acceso" }
  const end = input.until ? endOfDaySantoDomingo(input.until) : null
  if (input.until && !end) return { error: "Fecha inválida" }
  if (input.kind !== "courtesy" && !end) return { error: "Pon hasta qué fecha tiene acceso" }

  const new_plan = input.kind === "paid" ? (input.plan ?? "monthly") : input.kind === "trial" ? "trial" : "courtesy"
  const new_status = input.kind === "trial" ? "trialing" : "active"
  return { args: { account, new_status, new_plan, new_end: end, keep_end: false } }
}
