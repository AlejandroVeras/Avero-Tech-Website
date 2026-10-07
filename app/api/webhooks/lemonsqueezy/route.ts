import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifySignature } from "@/lib/billing/lemonsqueezy"
import { applySubscription, logBillingEvent, recordInvoice } from "@/lib/billing/sync"
import type { LsInvoiceAttributes, LsSubscriptionAttributes } from "@/lib/billing/lemonsqueezy-mapping"

export const runtime = "nodejs"

type Payload = {
  meta?: { event_name?: string; custom_data?: Record<string, unknown>; test_mode?: boolean }
  data?: { id?: string; type?: string; attributes?: Record<string, unknown> }
}

const SUBSCRIPTION_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
])
const PAYMENT_EVENTS = new Set(["subscription_payment_success", "subscription_payment_recovered"])

export async function POST(request: Request) {
  const raw = await request.text()
  if (!verifySignature(raw, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }

  let payload: Payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const eventName = payload.meta?.event_name ?? "desconocido"
  const externalId = payload.data?.id
  const attributes = payload.data?.attributes
  const customUserId = payload.meta?.custom_data?.user_id
  const testMode = !!payload.meta?.test_mode

  try {
    let userId: string | null = null
    if (externalId && attributes && SUBSCRIPTION_EVENTS.has(eventName)) {
      userId = await applySubscription(externalId, attributes as unknown as LsSubscriptionAttributes, customUserId)
    } else if (externalId && attributes && PAYMENT_EVENTS.has(eventName)) {
      userId = await recordInvoice(externalId, attributes as unknown as LsInvoiceAttributes, customUserId)
    }
    await logBillingEvent({
      eventName,
      externalId,
      userId,
      testMode,
      payload,
      error: userId === null && (SUBSCRIPTION_EVENTS.has(eventName) || PAYMENT_EVENTS.has(eventName)) ? "Cuenta no encontrada" : undefined,
    })
    if (userId) revalidatePath("/admin", "layout")
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await logBillingEvent({ eventName, externalId, testMode, payload, error: message })
    // 500 makes Lemon Squeezy retry the delivery later.
    return NextResponse.json({ error: "No se pudo procesar" }, { status: 500 })
  }
}
