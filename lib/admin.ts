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

export type AccountState = "pagando" | "cortesia" | "prueba" | "vencido"

export const STATE_LABELS: Record<AccountState, string> = {
  pagando: "Pagando",
  cortesia: "Cortesía",
  prueba: "En prueba",
  vencido: "Vencido / suspendido",
}

export const PLAN_LABELS: Record<string, string> = {
  monthly: "Mensual",
  annual: "Anual",
  trial: "Prueba",
  courtesy: "Cortesía",
}

export function accountState(a: AdminAccount): AccountState {
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
