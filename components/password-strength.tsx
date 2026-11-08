"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PasswordCheck } from "@/lib/password-policy"

const LEVELS = [
  { label: "Muy débil", bar: "bg-destructive" },
  { label: "Muy débil", bar: "bg-destructive" },
  { label: "Débil", bar: "bg-destructive" },
  { label: "Regular", bar: "bg-amber-500" },
  { label: "Casi lista", bar: "bg-amber-500" },
  { label: "Casi lista", bar: "bg-amber-500" },
  { label: "Segura", bar: "bg-emerald-500" },
]

/** Live strength bar plus the checklist of rules, so people see what is missing while they type. */
export function PasswordStrength({ checks, id, show }: { checks: PasswordCheck[]; id: string; show: boolean }) {
  const passed = checks.filter((c) => c.ok).length
  const level = LEVELS[passed]
  return (
    <div id={id} className="space-y-3">
      <div className="flex items-center gap-3" aria-hidden={!show}>
        <div className="flex flex-1 gap-1">
          {checks.map((c, i) => (
            <span key={c.id} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-300", show && i < passed ? level.bar : "bg-muted")} />
          ))}
        </div>
        <span className={cn("w-20 text-right text-[12px] font-medium", !show && "invisible", passed === checks.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
          {level.label}
        </span>
      </div>
      <ul className="grid gap-1.5 text-[13px]" aria-live="polite">
        {checks.map((c) => (
          <li key={c.id} className={cn("flex items-start gap-2 transition-colors", c.ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>
            <span
              className={cn(
                "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                c.ok ? "bg-emerald-500/15" : "bg-muted",
              )}
            >
              {c.ok ? <Check className="h-3 w-3" aria-hidden /> : <X className="h-3 w-3 opacity-60" aria-hidden />}
            </span>
            <span>
              <span className="sr-only">{c.ok ? "Cumple: " : "Falta: "}</span>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
