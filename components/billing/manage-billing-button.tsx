"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelMySubscription } from "@/lib/data/billing"

// PayPal has no hosted customer portal: cancelling happens here, and payment details are
// managed from the customer's own PayPal account.
export function ManagePayPalSubscription({ canCancel, accessUntil }: { canCancel: boolean; accessUntil?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Cancelar suscripción
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar el pago automático?</AlertDialogTitle>
                <AlertDialogDescription>
                  PayPal no te volverá a cobrar.
                  {accessUntil ? ` Mantienes el acceso completo hasta el ${accessUntil}; después tu cuenta queda en solo lectura.` : ""} No se
                  borra ningún dato.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setLoading(true)
                    setError("")
                    const result = await cancelMySubscription()
                    setLoading(false)
                    if (result.error) setError(result.error)
                    else router.refresh()
                  }}
                >
                  Sí, cancelar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button variant="ghost" asChild>
          <a href="https://www.paypal.com/myaccount/autopay/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden /> Ver en mi cuenta de PayPal
          </a>
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
