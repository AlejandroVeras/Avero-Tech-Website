"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createCheckout, getSubscription, lemonConfig, listSubscriptionsByEmail } from "@/lib/billing/lemonsqueezy"
import { applySubscription } from "@/lib/billing/sync"
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

// Only brand-new accounts (never activated) get the free trial; everyone else pays from day one.
async function trialEligible(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("subscriptions")
    .select("status, systems!inner(slug)")
    .eq("user_id", userId)
    .eq("systems.slug", "gestion")
    .maybeSingle()
  return !data || data.status === "incomplete"
}

export async function getCheckoutMode(): Promise<{ ready: boolean; withTrial: boolean }> {
  const config = lemonConfig()
  const { supabase, user } = await currentUser()
  const eligible = await trialEligible(supabase, user.id)
  const hasNoTrialVariants = !!(config.variantsNoTrial.monthly || config.variantsNoTrial.annual)
  // Without no-trial variants Lemon Squeezy would still grant the trial, so say so honestly.
  return { ready: config.ready, withTrial: eligible || !hasNoTrialVariants }
}

export async function startCheckout(formData: FormData): Promise<{ error?: string }> {
  const plan = formData.get("plan") === "annual" ? "annual" : "monthly"
  const config = lemonConfig()
  if (!config.ready) {
    return { error: "Los pagos con tarjeta todavía no están activos. Escríbenos por WhatsApp y te activamos la cuenta." }
  }

  const { supabase, user } = await currentUser()
  const group = (await trialEligible(supabase, user.id)) ? config.variants : config.variantsNoTrial
  const variantId =
    group[plan] ?? group.monthly ?? group.annual ?? config.variants[plan] ?? config.variants.monthly ?? config.variants.annual
  if (!variantId) return { error: "No hay un plan configurado para cobrar. Escríbenos por WhatsApp." }
  const { data: profile } = await supabase.from("profiles").select("business_name").eq("id", user.id).maybeSingle()

  let url: string
  try {
    url = await createCheckout({
      variantId,
      email: user.email!,
      name: profile?.business_name ?? user.email!,
      userId: user.id,
      redirectUrl: `${await baseUrl()}/dashboard/suscripcion?activando=1`,
    })
  } catch (e) {
    console.error("startCheckout:", e)
    return { error: "No pudimos abrir la página de pago. Intenta de nuevo en unos minutos." }
  }
  redirect(url)
}

export async function openBillingPortal(): Promise<{ error?: string }> {
  const { supabase, user } = await currentUser()
  const { data } = await supabase
    .from("subscriptions")
    .select("external_subscription_id, provider, systems!inner(slug)")
    .eq("user_id", user.id)
    .eq("systems.slug", "gestion")
    .eq("provider", "lemonsqueezy")
    .maybeSingle()
  if (!data?.external_subscription_id) return { error: "No tienes una suscripción con tarjeta." }

  let portal: string | undefined
  try {
    const sub = await getSubscription(data.external_subscription_id)
    portal = sub.attributes.urls?.customer_portal
  } catch (e) {
    console.error("openBillingPortal:", e)
  }
  if (!portal) return { error: "No pudimos abrir el portal de pagos. Intenta de nuevo en unos minutos." }
  redirect(portal)
}

// Called when the customer comes back from checkout, in case the webhook hasn't arrived yet.
export async function syncMySubscription(): Promise<{ synced: boolean }> {
  if (!lemonConfig().ready) return { synced: false }
  const { user } = await currentUser()
  try {
    const subs = await listSubscriptionsByEmail(user.email!)
    const latest = subs.sort((a, b) => Number(b.id) - Number(a.id))[0]
    if (!latest) return { synced: false }
    const linked = await applySubscription(latest.id, latest.attributes, user.id)
    if (linked) revalidatePath("/dashboard", "layout")
    return { synced: !!linked }
  } catch (e) {
    console.error("syncMySubscription:", e)
    return { synced: false }
  }
}
