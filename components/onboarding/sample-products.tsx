"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addSampleProducts, removeSampleProducts } from "@/lib/data/sample-products-actions"

export function TrySamplesButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const r = await addSampleProducts()
        setBusy(false)
        if (r.error) return toast.error(r.error)
        toast.success(`Cargamos ${r.count} productos de ejemplo. Bórralos cuando quieras desde Productos.`)
        router.refresh()
      }}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
      Probar con ejemplos
    </Button>
  )
}

export function SampleProductsBanner() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  return (
    <div role="status" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
      <p>
        <strong>Estás usando productos de ejemplo.</strong> Practica vendiendo con ellos y bórralos cuando cargues los tuyos.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          const r = await removeSampleProducts()
          setBusy(false)
          if (r.error) return toast.error(r.error)
          toast.success(r.kept ? `Listo. ${r.kept} ejemplos ya tenían ventas y se quedaron como productos normales.` : "Ejemplos borrados.")
          router.refresh()
        }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />} Borrar ejemplos
      </Button>
    </div>
  )
}
