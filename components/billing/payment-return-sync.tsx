"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { confirmPayPalReturn } from "@/lib/data/billing"

// PayPal sends the customer back with ?paypal=ok&subscription_id=I-... (or ?paypal=cancelado).
// The subscription can take a few seconds to go from APPROVED to ACTIVE, so we retry briefly.
export function PaymentReturnSync() {
  const params = useSearchParams()
  const router = useRouter()
  const outcome = params.get("paypal")
  const subscriptionId = params.get("subscription_id")
  const [state, setState] = useState<"idle" | "checking" | "slow" | "cancelled">(
    outcome === "cancelado" ? "cancelled" : outcome === "ok" && subscriptionId ? "checking" : "idle",
  )

  useEffect(() => {
    if (outcome !== "ok" || !subscriptionId) return
    let cancelled = false
    ;(async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        const { synced } = await confirmPayPalReturn(subscriptionId)
        if (synced) {
          router.replace(window.location.pathname)
          router.refresh()
          return
        }
        await new Promise((r) => setTimeout(r, 3000))
      }
      if (!cancelled) setState("slow")
    })()
    return () => {
      cancelled = true
    }
  }, [outcome, subscriptionId, router])

  if (state === "idle") return null
  return (
    <div role="status" className="rounded-2xl border bg-muted/50 p-4 text-sm">
      {state === "checking" && (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Confirmando tu suscripción con PayPal...
        </span>
      )}
      {state === "slow" && (
        <span>PayPal está procesando la autorización. Si en un par de minutos no se activa, recarga la página o escríbenos por WhatsApp.</span>
      )}
      {state === "cancelled" && <span>Saliste de PayPal sin autorizar el pago. No se hizo ningún cargo; puedes intentarlo de nuevo cuando quieras.</span>}
    </div>
  )
}
