"use client"

import Link from "next/link"
import { useState, useSyncExternalStore } from "react"
import { ArrowRight, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FirstStep } from "@/lib/data/first-steps"
import { cn } from "@/lib/utils"

const KEY = "avero:first-steps-hidden"

/** "Primeros pasos": what to do first, ticked automatically, and hideable. */
export function FirstSteps({ steps }: { steps: FirstStep[] }) {
  // Hidden on the server and until localStorage is read, so it never flashes for people who closed it.
  const stored = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem(KEY) === "1",
    () => true,
  )
  const [closed, setClosed] = useState(false)
  const hidden = stored || closed

  const done = steps.filter((s) => s.done).length
  if (hidden || steps.length === 0 || done === steps.length) return null
  const next = steps.find((s) => !s.done)

  return (
    <section aria-labelledby="first-steps-title" className="rounded-2xl border bg-card p-5 shadow-xs md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="first-steps-title" className="text-lg font-semibold">Primeros pasos</h2>
          <p className="text-sm text-muted-foreground">
            {done} de {steps.length} listos. Sigue este orden y en unos minutos tienes tu negocio funcionando.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Ocultar primeros pasos"
          onClick={() => {
            localStorage.setItem(KEY, "1")
            setClosed(true)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="mt-4 divide-y">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 py-3">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                s.done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
              aria-hidden
            >
              {s.done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", s.done && "text-muted-foreground line-through")}>
                {s.title}
                <span className="sr-only">{s.done ? " (listo)" : " (pendiente)"}</span>
              </p>
              {!s.done && <p className="text-xs text-muted-foreground">{s.hint}</p>}
            </div>
            {!s.done && (
              <Button asChild size="sm" variant={s.id === next?.id ? "default" : "outline"} className="shrink-0">
                <Link href={s.href}>
                  {s.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
