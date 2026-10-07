"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Lock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startCheckout } from "@/lib/data/billing"
import { formatUSD, whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"
import type { SystemPlan } from "@/lib/systems"

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long" })

export function PlanCheckout({
  plan,
  trialDays,
  withTrial = true,
  businessName,
  remindsByEmail = false,
}: {
  plan: SystemPlan
  trialDays: number
  withTrial?: boolean
  businessName: string
  remindsByEmail?: boolean
}) {
  const hasAnnual = !!plan.annual_usd
  const [choice, setChoice] = useState<"monthly" | "annual">(hasAnnual ? "annual" : "monthly")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const price = choice === "annual" && plan.annual_usd ? plan.annual_usd : plan.monthly_usd
  const firstCharge = new Date(Date.now() + trialDays * 86_400_000)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const fd = new FormData()
    fd.set("plan", choice)
    const result = await startCheckout(fd)
    // On success the action redirects to the payment page and never returns here.
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const options = [
    { id: "monthly" as const, label: "Mensual", price: `${formatUSD(plan.monthly_usd)}/mes`, note: "Cancela cuando quieras" },
    ...(hasAnnual
      ? [
          {
            id: "annual" as const,
            label: "Anual",
            price: `${formatUSD(plan.annual_usd!)}/año`,
            note: `Equivale a ${formatUSD(plan.annual_usd! / 12)}/mes`,
          },
        ]
      : []),
  ]

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="sr-only">Elige cómo pagar</legend>
        <div className={cn("grid gap-3", options.length > 1 && "sm:grid-cols-2")}>
          {options.map((o) => (
            <label
              key={o.id}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors",
                choice === o.id ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name="plan"
                value={o.id}
                checked={choice === o.id}
                onChange={() => setChoice(o.id)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-muted-foreground">{o.label}</span>
              <span className="mt-1 text-xl font-semibold">{o.price}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{o.note}</span>
              {choice === o.id && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary dark:text-sky-signal" aria-hidden />}
            </label>
          ))}
        </div>
      </fieldset>

      {withTrial ? (
        <div className="rounded-2xl bg-muted/60 p-4 text-sm space-y-1.5">
          <p className="font-medium">Hoy no se te cobra nada.</p>
          <p className="text-muted-foreground">
            Tienes {trialDays} días gratis con todas las funciones. Si no cancelas antes, el{" "}
            <strong className="text-foreground">{dateFormat.format(firstCharge)}</strong> se cobrarán{" "}
            <strong className="text-foreground">{formatUSD(price)}</strong> con PayPal y luego cada{" "}
            {choice === "annual" ? "año" : "mes"}.{remindsByEmail ? " Te avisamos por correo unos días antes del cobro." : ""}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-muted/60 p-4 text-sm">
          Se cobrarán <strong>{formatUSD(price)}</strong> con PayPal hoy y luego cada {choice === "annual" ? "año" : "mes"}. Puedes cancelar
          cuando quieras.
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="h-12 w-full rounded-full text-[15px]" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Abriendo página de pago...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" aria-hidden /> {withTrial ? "Continuar con PayPal y empezar la prueba" : "Continuar con PayPal"}
          </>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden /> Pago seguro con PayPal: con tu cuenta PayPal o, donde PayPal lo permita, con tarjeta. Avero no ve ni guarda tus datos de pago.
      </p>
      <p className="text-center text-xs text-muted-foreground">
        ¿Prefieres pagar por transferencia?{" "}
        <a
          href={whatsappUrl(`Hola, quiero activar el sistema para mi negocio "${businessName}" pagando por transferencia.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 text-sapphire dark:text-sky-signal"
        >
          Escríbenos por WhatsApp
        </a>
      </p>
    </form>
  )
}
