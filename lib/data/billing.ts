"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { cancelSubscription, createSubscription, paypalConfig } from "@/lib/billing/paypal"
import { refreshSubscription } from "@/lib/billing/sync"
import { SITE_URL } from "@/lib/site"

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) throw new Error("Unauthorized")
  return { supabase, user }
}

// Return to the same host the visitor is on, so local and preview environments work too.
async function baseUrl() {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  if (!host) return SITE_URL
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

async function mySubscription(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, provider, external_subscription_id, systems!inner(slug)")
    .eq("user_id", userId)
    .eq("systems.slug", "gestion")
    .maybeSingle()
  return data
}

// Only brand-new accounts (never activated) get the free trial; everyone else pays from day one.
async function trialEligible(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const sub = await mySubscription(supabase, userId)
  return !sub || sub.status === "incomplete"
}

export async function getCheckoutMode(): Promise<{ ready: boolean; withTrial: boolean }> {
  const config = paypalConfig()
  const { supabase, user } = await currentUser()
  const eligible = await trialEligible(supabase, user.id)
  const hasNoTrialPlans = !!(config.plansNoTrial.monthly || config.plansNoTrial.annual)
  // Without no-trial plans PayPal would still grant the trial, so say so honestly.
  return { ready: config.ready, withTrial: eligible || !hasNoTrialPlans }
}

export async function startCheckout(formData: FormData): Promise<{ error?: string }> {
  const plan = formData.get("plan") === "annual" ? "annual" : "monthly"
  const config = paypalConfig()
  if (!config.ready) {
    return { error: "Los pagos automáticos todavía no están activos. Escríbenos por WhatsApp y te activamos la cuenta." }
  }

  const { supabase, user } = await currentUser()
  const group = (await trialEligible(supabase, user.id)) ? config.plans : config.plansNoTrial
  const planId = group[plan] ?? group.monthly ?? group.annual ?? config.plans[plan] ?? config.plans.monthly ?? config.plans.annual
  if (!planId) return { error: "No hay un plan configurado para cobrar. Escríbenos por WhatsApp." }
  const { data: profile } = await supabase.from("profiles").select("business_name").eq("id", user.id).maybeSingle()

  const base = await baseUrl()
  let approveUrl: string
  try {
    approveUrl = await createSubscription({
      planId,
      userId: user.id,
      email: user.email!,
      businessName: profile?.business_name ?? "Mi negocio",
      returnUrl: `${base}/dashboard/suscripcion?paypal=ok`,
      cancelUrl: `${base}/dashboard/suscripcion?paypal=cancelado`,
    })
  } catch (e) {
    console.error("startCheckout:", e)
    return { error: "No pudimos conectar con PayPal. Intenta de nuevo en unos minutos." }
  }
  redirect(approveUrl)
}

// PayPal sends the customer back with ?subscription_id=...; confirm it right away instead of
// waiting for the webhook. Only subscriptions created for this account are accepted.
export async function confirmPayPalReturn(subscriptionId: string): Promise<{ synced: boolean }> {
  if (!paypalConfig().ready || !/^I-[A-Z0-9]{6,}$/.test(subscriptionId)) return { synced: false }
  const { user } = await currentUser()
  try {
    const linked = await refreshSubscription(subscriptionId, user.id)
    if (linked) revalidatePath("/dashboard", "layout")
    return { synced: !!linked }
  } catch (e) {
    console.error("confirmPayPalReturn:", e)
    return { synced: false }
  }
}

export async function cancelMySubscription(): Promise<{ error?: string }> {
  const { supabase, user } = await currentUser()
  const sub = await mySubscription(supabase, user.id)
  if (sub?.provider !== "paypal" || !sub.external_subscription_id) return { error: "No tienes un pago automático activo." }
  try {
    await cancelSubscription(sub.external_subscription_id, "Cancelada por el cliente desde Avero")
    await refreshSubscription(sub.external_subscription_id, user.id)
  } catch (e) {
    console.error("cancelMySubscription:", e)
    return { error: "No pudimos cancelar en PayPal. Intenta de nuevo o cancélala desde tu cuenta de PayPal." }
  }
  revalidatePath("/dashboard", "layout")
  return {}
}
