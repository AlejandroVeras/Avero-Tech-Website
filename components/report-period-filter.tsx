"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PERIOD_PRESETS, type ReportPeriod } from "@/lib/report-period"
import { cn } from "@/lib/utils"

/** Este mes · Mes pasado · Últimos 3 meses · Este año · Todo · De una fecha a otra. */
export function ReportPeriodFilter({ period, today }: { period: ReportPeriod; today: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [custom, setCustom] = useState(period.preset === "rango")
  const [from, setFrom] = useState(period.start ?? today.slice(0, 8) + "01")
  const [to, setTo] = useState(period.end && period.end <= today ? period.end : today)

  const go = (qs: string) => router.push(`${pathname}?${qs}`, { scroll: false })

  return (
    <div className="space-y-3 rounded-xl border bg-card p-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Período">
        {PERIOD_PRESETS.map((p) => {
          const active = !custom && period.preset === p.id
          return (
            <Button
              key={p.id}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              className="rounded-full"
              onClick={() => {
                setCustom(false)
                go(`periodo=${p.id}`)
              }}
            >
              {p.label}
            </Button>
          )
        })}
        <Button
          type="button"
          size="sm"
          variant={custom ? "default" : "outline"}
          aria-pressed={custom}
          aria-expanded={custom}
          className="rounded-full"
          onClick={() => setCustom((v) => !v)}
        >
          <CalendarRange className="h-3.5 w-3.5" aria-hidden /> Escoger fechas
        </Button>
      </div>

      {custom && (
        <form
          className="flex flex-wrap items-end gap-3 border-t pt-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (from && to) go(`periodo=rango&desde=${from}&hasta=${to}`)
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="desde">Desde</Label>
            <Input id="desde" type="date" value={from} max={today} onChange={(e) => setFrom(e.target.value)} className="w-40" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="hasta">Hasta</Label>
            <Input id="hasta" type="date" value={to} max={today} onChange={(e) => setTo(e.target.value)} className="w-40" required />
          </div>
          <Button type="submit" size="sm" className={cn("h-9")}>
            Ver estas fechas
          </Button>
        </form>
      )}
    </div>
  )
}
