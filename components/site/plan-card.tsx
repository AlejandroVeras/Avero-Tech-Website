"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SAAS_ANNUAL_PRICE_USD, SAAS_MONTHLY_PRICE_USD, formatUSD } from "@/lib/site"

export const PLAN_FEATURES = [
  "Inventario de productos con control de stock",
  "Ventas a crédito y registro de cobros",
  "Facturas y cotizaciones en PDF con ITBIS",
  "Base de clientes",
  "Registro de gastos",
  "Reportes de ingresos, gastos y ganancia",
  "Tickets de soporte para tus clientes",
  "Acceso desde el navegador del celular o la computadora",
]

export function PlanCard({
  inverted = false,
  cta,
}: {
  inverted?: boolean
  cta?: React.ReactNode
}) {
  const [annual, setAnnual] = useState(true)
  const perMonth = annual ? SAAS_ANNUAL_PRICE_USD / 12 : SAAS_MONTHLY_PRICE_USD

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={cn("text-[13px]", inverted ? (annual ? "text-white/50" : "text-white") : annual ? "text-pewter" : "text-obsidian dark:text-foreground")}>
          Mensual
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          aria-label="Facturación anual"
          onClick={() => setAnnual((a) => !a)}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors",
            annual ? (inverted ? "bg-sky-signal" : "bg-primary") : inverted ? "bg-white/20" : "bg-pale-mist",
          )}
        >
          <span className={cn("absolute top-0.5 left-0 w-6 h-6 rounded-full bg-white transition-transform", annual ? "translate-x-5" : "translate-x-0.5")} />
        </button>
        <span className={cn("text-[13px]", inverted ? (annual ? "text-white" : "text-white/50") : annual ? "text-obsidian dark:text-foreground" : "text-pewter")}>
          Anual <span className={cn("ml-1 text-[11px]", inverted ? "text-sky-signal" : "text-sapphire dark:text-sky-signal")}>2 meses gratis</span>
        </span>
      </div>

      <div
        className={cn(
          "rounded-3xl border p-8 text-center space-y-6",
          inverted ? "border-white/10 bg-white/[0.04] text-white" : "border-pale-mist/70 bg-card",
        )}
      >
        <div>
          <h3 className={cn("text-2xl font-semibold", !inverted && "text-obsidian dark:text-foreground")}>Plan Profesional</h3>
          <p className={cn("text-[13px] mt-1", inverted ? "text-white/60" : "text-pewter")}>
            Todo lo que necesitas para administrar tu negocio
          </p>
        </div>

        <div>
          {annual && (
            <p className={cn("line-through text-lg", inverted ? "text-white/40" : "text-pewter")}>
              {formatUSD(SAAS_MONTHLY_PRICE_USD)}/mes
            </p>
          )}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-semibold">{formatUSD(perMonth)}</span>
            <span className={inverted ? "text-white/50" : "text-pewter"}>/mes</span>
          </div>
          <p className={cn("text-[13px] mt-1", inverted ? "text-sky-signal" : "text-sapphire dark:text-sky-signal")}>
            {annual ? `${formatUSD(SAAS_ANNUAL_PRICE_USD)} al año` : "Facturado cada mes"}
          </p>
        </div>

        <ul className="text-left space-y-3">
          {PLAN_FEATURES.map((f) => (
            <li key={f} className={cn("flex items-start gap-2 text-[14px]", inverted ? "text-white/85" : "text-obsidian/85 dark:text-foreground/85")}>
              <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", inverted ? "text-sky-signal" : "text-sapphire dark:text-sky-signal")} aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {cta ?? (
          <Button
            size="lg"
            className={cn("w-full rounded-full text-[14px] font-normal", inverted && "bg-white text-obsidian hover:bg-white/90")}
            asChild
          >
            <Link href="/precios">Comenzar ahora</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
