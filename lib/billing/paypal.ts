import "server-only"

import type { PpSubscription } from "@/lib/billing/paypal-mapping"

function apiBase() {
  if (process.env.PAYPAL_API_BASE) return process.env.PAYPAL_API_BASE.replace(/\/$/, "")
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
}

export function paypalConfig() {
  const config = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    webhookId: process.env.PAYPAL_WEBHOOK_ID,
    plans: { monthly: process.env.PAYPAL_PLAN_MONTHLY, annual: process.env.PAYPAL_PLAN_ANNUAL },
    // Same prices without a free trial, for accounts that already used theirs.
    plansNoTrial: { monthly: process.env.PAYPAL_PLAN_MONTHLY_NO_TRIAL, annual: process.env.PAYPAL_PLAN_ANNUAL_NO_TRIAL },
  }
  return {
    ...config,
    ready: !!(config.clientId && config.clientSecret && (config.plans.monthly || config.plans.annual)),
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const { clientId, clientSecret } = paypalConfig()
  if (!clientId || !clientSecret) throw new Error("PayPal no está configurado")
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`PayPal rechazó las credenciales (${res.status})`)
  const json = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return json.access_token
}

async function ppFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`PayPal respondió ${res.status}: ${body.slice(0, 300)}`)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export async function createSubscription(input: {
  planId: string
  userId: string
  email: string
  businessName: string
  returnUrl: string
  cancelUrl: string
  /** First charge date; used to honor the free days left of a trial that started without PayPal. */
  startTime?: Date
}): Promise<string> {
  const res = await ppFetch<{ id: string; links: { rel: string; href: string }[] }>("/v1/billing/subscriptions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      plan_id: input.planId,
      ...(input.startTime ? { start_time: input.startTime.toISOString() } : {}),
      custom_id: input.userId,
      subscriber: { email_address: input.email, name: { given_name: input.businessName.slice(0, 140) } },
      application_context: {
        brand_name: "Avero Technology",
        locale: "es-DO",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  })
  const approve = res.links.find((l) => l.rel === "approve")?.href
  if (!approve) throw new Error("PayPal no devolvió el enlace de aprobación")
  return approve
}

export function getSubscription(id: string) {
  return ppFetch<PpSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`)
}

export async function cancelSubscription(id: string, reason: string) {
  await ppFetch<void>(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason.slice(0, 128) }),
  })
}

// PayPal verifies its own signature: we send the headers and the event back to its API.
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const { webhookId } = paypalConfig()
  const h = (name: string) => headers.get(name)
  if (!webhookId || !h("paypal-transmission-id") || !h("paypal-transmission-sig")) return false
  try {
    const res = await ppFetch<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: h("paypal-auth-algo"),
        cert_url: h("paypal-cert-url"),
        transmission_id: h("paypal-transmission-id"),
        transmission_sig: h("paypal-transmission-sig"),
        transmission_time: h("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: event,
      }),
    })
    return res.verification_status === "SUCCESS"
  } catch (e) {
    console.error("verifyWebhook:", e)
    return false
  }
}
