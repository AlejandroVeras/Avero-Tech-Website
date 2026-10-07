"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { syncMySubscription } from "@/lib/data/billing"

// After checkout Lemon Squeezy sends the customer back with ?activando=1. The webhook usually
// lands within seconds; meanwhile we ask the API directly a few times.
export function PaymentReturnSync() {
  const params = useSearchParams()
  const router = useRouter()
  const returning = params.get("activando") === "1"
  const [state, setState] = useState<"idle" | "checking" | "slow">(returning ? "checking" : "idle")

  useEffect(() => {
    if (!returning) return
    let cancelled = false
    ;(async () => {
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        const { synced } = await syncMySubscription()
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
  }, [returning, router])

  if (state === "idle") return null
  return (
    <div role="status" className="rounded-2xl border bg-muted/50 p-4 text-sm">
      {state === "checking" ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Confirmando tu suscripción con el procesador de pagos...
        </span>
      ) : (
        <span>
          Tu pago se está procesando. Si en un par de minutos no se activa, recarga la página o escríbenos por WhatsApp.
        </span>
      )}
    </div>
  )
}
