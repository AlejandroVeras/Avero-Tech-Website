import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifyWebhook } from "@/lib/billing/paypal"
import { logBillingEvent, recordSale, refreshSubscription } from "@/lib/billing/sync"
import type { PpSale } from "@/lib/billing/paypal-mapping"

export const runtime = "nodejs"

type PpEvent = {
  id?: string
  event_type?: string
  resource_type?: string
  resource?: Record<string, unknown> & { id?: string; billing_agreement_id?: string }
}

export async function POST(request: Request) {
  const raw = await request.text()
  let event: PpEvent
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (!(await verifyWebhook(request.headers, event))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }

  const type = event.event_type ?? "desconocido"
  const resource = event.resource ?? {}
  const testMode = process.env.PAYPAL_ENV !== "live"

  try {
    let userId: string | null = null
    let externalId: string | undefined

    if (type.startsWith("BILLING.SUBSCRIPTION.") && resource.id) {
      // Always re-read the subscription from PayPal: event payloads can be partial or arrive out of order.
      externalId = resource.id
      userId = await refreshSubscription(resource.id)
    } else if (type === "PAYMENT.SALE.COMPLETED" && resource.billing_agreement_id) {
      externalId = resource.billing_agreement_id
      userId = await recordSale(resource as unknown as PpSale)
      await refreshSubscription(resource.billing_agreement_id)
    }

    await logBillingEvent({
      eventName: type,
      externalId,
      userId,
      testMode,
      payload: event,
      error: externalId && !userId ? "Cuenta no encontrada" : undefined,
    })
    if (userId) revalidatePath("/admin", "layout")
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await logBillingEvent({ eventName: type, externalId: resource.id, testMode, payload: event, error: message })
    // A non-2xx response makes PayPal retry the delivery later.
    return NextResponse.json({ error: "No se pudo procesar" }, { status: 500 })
  }
}
