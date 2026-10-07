"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { openBillingPortal } from "@/lib/data/billing"

export function ManageBillingButton({ label = "Administrar pago y tarjeta" }: { label?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  return (
    <div className="space-y-2">
      <Button
        onClick={async () => {
          setLoading(true)
          setError("")
          const result = await openBillingPortal()
          if (result?.error) {
            setError(result.error)
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ExternalLink className="h-4 w-4" aria-hidden />}
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
