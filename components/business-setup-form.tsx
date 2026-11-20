"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BUSINESS_TYPES,
  ITBIS_MODES,
  SALES_MODES,
  featuresFor,
  presetFor,
  type BusinessSetup,
  type BusinessType,
  type ItbisMode,
  type SalesMode,
} from "@/lib/business-setup"
import { saveBusinessSetup, skipBusinessSetup } from "@/lib/data/business-setup-actions"
import { cn } from "@/lib/utils"

type Option<T extends string> = { id: T; label: string; hint?: string }

function Choice<T extends string>({
  name,
  options,
  value,
  onChange,
  disabled,
  columns = 1,
}: {
  name: string
  options: readonly Option<T>[]
  value: T | null
  onChange: (value: T) => void
  disabled?: boolean
  columns?: 1 | 2 | 3
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}
    >
      {options.map((o) => {
        const selected = value === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
              selected ? "border-primary bg-primary/10" : "hover:bg-muted",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/60",
                selected && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {selected && <Check className="h-3 w-3" />}
            </span>
            <span>
              <span className="font-medium text-foreground">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-muted-foreground">{o.hint}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const YES_NO = [
  { id: "yes", label: "Sí, vendo fiado o a crédito" },
  { id: "no", label: "No, todo se paga al momento" },
] as const

export function BusinessSetupForm({ setup, mode }: { setup: BusinessSetup; mode: "welcome" | "settings" }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"save" | "skip" | null>(null)
  const [businessType, setBusinessType] = useState<BusinessType | null>(setup.businessType)
  const [salesMode, setSalesMode] = useState<SalesMode | null>(setup.salesMode)
  const [credit, setCredit] = useState<"yes" | "no" | null>(
    setup.sellsOnCredit === null ? null : setup.sellsOnCredit ? "yes" : "no",
  )
  const [itbisMode, setItbisMode] = useState<ItbisMode>(setup.itbisMode)

  function pickType(type: BusinessType) {
    setBusinessType(type)
    // On the welcome screen the type fills in the usual answers; the person can still change them.
    if (mode === "welcome") {
      const preset = presetFor(type)
      setSalesMode(preset.salesMode)
      setCredit(preset.sellsOnCredit ? "yes" : "no")
      setItbisMode(preset.itbisMode)
    }
  }

  const sellsAtCounter = salesMode === "counter" || salesMode === "both"
  const ready = businessType !== null && salesMode !== null && credit !== null

  async function save() {
    setLoading("save")
    const result = await saveBusinessSetup({
      businessType,
      salesMode,
      sellsOnCredit: credit === null ? null : credit === "yes",
      itbisMode,
    })
    if (result.error) {
      toast.error(result.error)
      setLoading(null)
      return
    }
    if (mode === "welcome") {
      const features = featuresFor({ businessType, salesMode, sellsOnCredit: credit === "yes", itbisMode, completed: true })
      router.push(features.quickSale ? "/dashboard/vender" : "/dashboard")
      router.refresh()
    } else {
      toast.success("Listo. El menú ya se ajustó a tu negocio.")
      setLoading(null)
      router.refresh()
    }
  }

  async function skip() {
    setLoading("skip")
    const result = await skipBusinessSetup()
    if (result.error) {
      toast.error(result.error)
      setLoading(null)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  const busy = loading !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "welcome" ? "Cuéntanos de tu negocio" : "Tipo de negocio y funciones"}</CardTitle>
        <CardDescription>
          {mode === "welcome"
            ? "Con tus respuestas ajustamos el menú y las pantallas. Puedes cambiarlas cuando quieras en Configuración."
            : "El menú muestra u oculta opciones según tus respuestas. No se borra nada: si cambias de opinión, todo vuelve a aparecer."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">1. ¿Qué tipo de negocio tienes?</h2>
          <Choice<BusinessType> name="Tipo de negocio" options={BUSINESS_TYPES} value={businessType} onChange={pickType} disabled={busy} columns={2} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">2. ¿Cómo vendes normalmente?</h2>
          <Choice<SalesMode> name="Forma de venta" options={SALES_MODES} value={salesMode} onChange={setSalesMode} disabled={busy} columns={3} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">3. ¿Vendes a crédito?</h2>
          <Choice<"yes" | "no"> name="Venta a crédito" options={YES_NO} value={credit} onChange={setCredit} disabled={busy} columns={2} />
        </section>

        {sellsAtCounter && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">ITBIS en tus ventas rápidas</h2>
            <Choice<ItbisMode> name="ITBIS" options={ITBIS_MODES} value={itbisMode} onChange={setItbisMode} disabled={busy} columns={3} />
            <p className="text-xs text-muted-foreground">
              Aplica a la pantalla Vender. Las facturas que haces a mano mantienen su casilla de ITBIS.
            </p>
          </section>
        )}
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
        {mode === "welcome" ? (
          <Button type="button" variant="ghost" onClick={skip} disabled={busy}>
            {loading === "skip" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Responder después
          </Button>
        ) : (
          <span />
        )}
        <Button type="button" size="lg" onClick={save} disabled={busy || !ready} className="min-w-[160px]">
          {loading === "save" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {mode === "welcome" ? "Empezar" : "Guardar"}
        </Button>
      </CardFooter>
    </Card>
  )
}
