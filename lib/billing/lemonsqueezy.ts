import "server-only"

import crypto from "node:crypto"
import type { LsSubscriptionAttributes } from "@/lib/billing/lemonsqueezy-mapping"

const API_BASE = (process.env.LEMONSQUEEZY_API_BASE ?? "https://api.lemonsqueezy.com/v1").replace(/\/$/, "")

export function lemonConfig() {
  const config = {
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
    storeId: process.env.LEMONSQUEEZY_STORE_ID,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    variants: {
      monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
      annual: process.env.LEMONSQUEEZY_VARIANT_ANNUAL,
    },
    // Same prices without a free trial, for accounts that already used theirs.
    variantsNoTrial: {
      monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY_NO_TRIAL,
      annual: process.env.LEMONSQUEEZY_VARIANT_ANNUAL_NO_TRIAL,
    },
  }
  return { ...config, ready: !!(config.apiKey && config.storeId && (config.variants.monthly || config.variants.annual)) }
}

async function lsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { apiKey } = lemonConfig()
  if (!apiKey) throw new Error("Lemon Squeezy no está configurado")
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
      ...init.headers,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Lemon Squeezy respondió ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

export async function createCheckout(input: {
  variantId: string
  email: string
  name: string
  userId: string
  redirectUrl: string
}): Promise<string> {
  const { storeId } = lemonConfig()
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: { email: input.email, name: input.name, custom: { user_id: input.userId } },
        product_options: {
          redirect_url: input.redirectUrl,
          receipt_link_url: input.redirectUrl,
          receipt_button_text: "Ir a mi sistema",
        },
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(input.variantId) } },
      },
    },
  }
  const res = await lsFetch<{ data: { attributes: { url: string } } }>("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return res.data.attributes.url
}

type LsSubscriptionResource = {
  id: string
  attributes: LsSubscriptionAttributes & { user_email: string; urls?: { customer_portal?: string; update_payment_method?: string } }
}

export async function getSubscription(id: string) {
  const res = await lsFetch<{ data: LsSubscriptionResource }>(`/subscriptions/${encodeURIComponent(id)}`)
  return res.data
}

export async function listSubscriptionsByEmail(email: string) {
  const { storeId } = lemonConfig()
  const params = new URLSearchParams({ "filter[store_id]": String(storeId), "filter[user_email]": email })
  const res = await lsFetch<{ data: LsSubscriptionResource[] }>(`/subscriptions?${params}`)
  return res.data
}

export function verifySignature(rawBody: string, signature: string | null): boolean {
  const { webhookSecret } = lemonConfig()
  if (!webhookSecret || !signature) return false
  const digest = Buffer.from(crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex"), "utf8")
  const received = Buffer.from(signature, "utf8")
  return digest.length === received.length && crypto.timingSafeEqual(new Uint8Array(digest), new Uint8Array(received))
}
