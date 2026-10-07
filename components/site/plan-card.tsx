"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatUSD } from "@/lib/site"
import type { SystemPlan } from "@/lib/systems"

export function PlanCard({
  plan,
  inverted = false,
  trialDays,
  cta,
  titleAs: Title = "h3",
}: {
  plan: SystemPlan
  inverted?: boolean
  trialDays?: number
  cta?: React.ReactNode
  titleAs?: "h2" | "h3"
}) {
  const hasAnnual = plan.annual_usd != null && plan.annual_usd > 0
  const [annual, setAnnual] = useState(hasAnnual)
  const perMonth = annual && hasAnnual ? plan.annual_usd! / 12 : plan.monthly_usd
  const monthsFree = hasAnnual ? Math.round(12 - plan.annual_usd! / plan.monthly_usd) : 0

  const muted = inverted ? "text-white/50" : "text-pewter"
  const strong = inverted ? "text-white" : "text-obsidian dark:text-foreground"
  const accent = inverted ? "text-sky-signal" : "text-sapphire dark:text-sky-signal"

  return (
    <div className="max-w-md mx-auto">
      {hasAnnual && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={cn("text-[13px]", annual ? muted : strong)}>Mensual</span>
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
          <span className={cn("text-[13px]", annual ? strong : muted)}>
            Anual
            {monthsFree > 0 && (
              <span className={cn("ml-1 text-[11px]", accent)}>
                {monthsFree === 1 ? "1 mes gratis" : `${monthsFree} meses gratis`}
              </span>
            )}
          </span>
        </div>
      )}

      <div
        className={cn(
          "rounded-3xl border p-8 text-center space-y-6",
          inverted ? "border-white/10 bg-white/[0.04] text-white" : "border-pale-mist/70 bg-card",
        )}
      >
        <div>
          <Title className={cn("text-2xl font-semibold", strong)}>{plan.name}</Title>
          {plan.description && <p className={cn("text-[13px] mt-1", inverted ? "text-white/60" : "text-pewter")}>{plan.description}</p>}
        </div>

        <div>
          {annual && hasAnnual && <p className={cn("line-through text-lg", muted)}>{formatUSD(plan.monthly_usd)}/mes</p>}
          <div className="flex items-baseline justify-center gap-1">
            <span className={cn("text-5xl font-semibold", strong)}>{formatUSD(perMonth)}</span>
            <span className={muted}>/mes</span>
          </div>
          <p className={cn("text-[13px] mt-1", accent)}>
            {annual && hasAnnual ? `${formatUSD(plan.annual_usd!)} al año` : "Facturado cada mes"}
          </p>
          {trialDays ? (
            <p className={cn("text-[13px] mt-2", inverted ? "text-white/70" : "text-obsidian/80 dark:text-foreground/80")}>
              Prueba gratis {trialDays} días: hoy no se cobra nada.
            </p>
          ) : null}
        </div>

        <ul className="text-left space-y-3">
          {plan.features.map((f) => (
            <li key={f} className={cn("flex items-start gap-2 text-[14px]", inverted ? "text-white/85" : "text-obsidian/85 dark:text-foreground/85")}>
              <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", accent)} aria-hidden />
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
