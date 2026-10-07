import "server-only"

import { cache } from "react"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isPlatformAdmin } from "@/lib/data/access"
import { toSystem, type SaasSystem } from "@/lib/systems"
import type { AdminAccount, AdminPayment } from "@/lib/admin"

// Every admin page calls this first; the database functions check again on their own.
export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  if (!(await isPlatformAdmin())) notFound()
  return { supabase, user }
})

type AccountRow = {
  user_id: string
  email: string | null
  business_name: string | null
  slug: string | null
  store_enabled: boolean | null
  signed_up_at: string
  last_sign_in_at: string | null
  subscription_id: string | null
  status: string | null
  plan_id: string | null
  current_period_end: string | null
  has_access: boolean
  products: number
  public_products: number
  last_payment_at: string | null
  provider?: string | null
  card_brand?: string | null
  card_last_four?: string | null
}

export const listAccounts = cache(async (): Promise<{ accounts: AdminAccount[]; error?: string }> => {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase.rpc("admin_list_accounts")
  if (error) return { accounts: [], error: error.message }
  return {
    accounts: (data as AccountRow[]).map((r) => ({
      userId: r.user_id,
      email: r.email ?? "",
      businessName: r.business_name ?? "Sin nombre",
      slug: r.slug ?? undefined,
      storeEnabled: !!r.store_enabled,
      signedUpAt: r.signed_up_at,
      lastSignInAt: r.last_sign_in_at ?? undefined,
      subscriptionId: r.subscription_id ?? undefined,
      status: r.status ?? undefined,
      planId: r.plan_id ?? undefined,
      periodEnd: r.current_period_end ?? undefined,
      hasAccess: r.has_access,
      products: r.products,
      publicProducts: r.public_products,
      lastPaymentAt: r.last_payment_at ?? undefined,
      provider: r.provider === "paypal" ? "paypal" : "manual",
      cardBrand: r.card_brand ?? undefined,
      cardLastFour: r.card_last_four ?? undefined,
    })),
  }
})

type PaymentRow = {
  id: string
  user_id: string
  amount: number | string
  currency: "USD" | "DOP"
  method: string
  reference: string | null
  notes: string | null
  months: number
  period_start: string
  period_end: string
  created_at: string
}

function toPayment(r: PaymentRow): AdminPayment {
  return {
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount),
    currency: r.currency,
    method: r.method,
    reference: r.reference ?? undefined,
    notes: r.notes ?? undefined,
    months: r.months,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    createdAt: r.created_at,
  }
}

export async function listPayments(options: { userId?: string; limit?: number } = {}): Promise<AdminPayment[]> {
  const { supabase } = await requireAdmin()
  let query = supabase.from("subscription_payments").select("*").order("created_at", { ascending: false })
  if (options.userId) query = query.eq("user_id", options.userId)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) return []
  return (data as PaymentRow[]).map(toPayment)
}

export async function listAllSystems(): Promise<SaasSystem[]> {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) return []
  return data.map(toSystem)
}

export async function getSystemById(id: string): Promise<SaasSystem | null> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from("systems").select("*").eq("id", id).maybeSingle()
  return data ? toSystem(data) : null
}
