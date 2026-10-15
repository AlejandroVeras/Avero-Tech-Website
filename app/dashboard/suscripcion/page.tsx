import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlanCheckout } from "@/components/billing/plan-checkout"
import { ManagePayPalSubscription } from "@/components/billing/manage-billing-button"
import { PaymentReturnSync } from "@/components/billing/payment-return-sync"
import { getUser } from "@/lib/auth"
import { getAccess, type AccessState } from "@/lib/data/access"
import { getCheckoutMode } from "@/lib/data/billing"
import { getPublishedSystem, getTrialDays } from "@/lib/data/systems"
import { createClient } from "@/lib/supabase/server"
import { emailConfigured } from "@/lib/email"
import { FALLBACK_GESTION } from "@/lib/systems"
import { formatDOP, formatUSD } from "@/lib/site"

export const metadata = { title: "Mi suscripción" }

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric" })

function describe(access: AccessState): { label: string; tone: "default" | "secondary" | "destructive"; detail: string } {
  switch (access.kind) {
    case "trialing":
      return {
        label: "Prueba gratis",
        tone: "secondary",
        detail:
          access.billing.provider === "paypal"
            ? `Termina el ${dateFormat.format(access.endsAt)}; ese día se hace el primer cobro.`
            : `Termina el ${dateFormat.format(access.endsAt)}.`,
      }
    case "active":
      if (access.pastDue)
        return { label: "Pago pendiente", tone: "destructive", detail: "El último cobro falló. Revisa tu forma de pago en PayPal; seguiremos intentando unos días." }
      if (access.canceled)
        return { label: "Cancelada", tone: "secondary", detail: access.endsAt ? `Tienes acceso hasta el ${dateFormat.format(access.endsAt)}.` : "" }
      if (access.billing.planId === "courtesy") return { label: "Cortesía", tone: "default", detail: "Tu cuenta tiene acceso sin costo." }
      return {
        label: "Activa",
        tone: "default",
        detail:
          access.billing.provider === "paypal" && access.billing.nextChargeAt
            ? `Próximo cobro: ${dateFormat.format(access.billing.nextChargeAt)}.`
            : access.endsAt
              ? `Pagada hasta el ${dateFormat.format(access.endsAt)}.`
              : "Sin vencimiento.",
      }
    case "expired":
      return { label: "Vencida", tone: "destructive", detail: "Tu cuenta está en solo lectura hasta que reactives." }
    default:
      return { label: "Sin suscripción", tone: "secondary", detail: "" }
  }
}

export default async function SuscripcionPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const supabase = await createClient()
  const [access, system, trialDays, mode, paymentsRes] = await Promise.all([
    getAccess(),
    getPublishedSystem("gestion"),
    getTrialDays(),
    getCheckoutMode(),
    supabase.from("subscription_payments").select("id, amount, currency, method, months, created_at, period_end").order("created_at", { ascending: false }).limit(24),
  ])
  const payments = paymentsRes.data ?? []
  const plan = (system ?? FALLBACK_GESTION).plans[0]
  const status = describe(access)
  const billing = "billing" in access ? access.billing : undefined
  const hasPayPal = billing?.provider === "paypal"
  // A cancelled or expired PayPal subscription can't be resumed, so reactivating needs a new one.
  const canSubscribe =
    billing?.planId !== "courtesy" &&
    (access.kind === "expired" || (!hasPayPal && (access.kind === "trialing" || access.kind === "active")))
  const canCancel = hasPayPal && (access.kind === "trialing" || (access.kind === "active" && !access.canceled))
  const accessUntil = access.kind === "trialing" || access.kind === "active" ? access.endsAt : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi suscripción</h1>
          <p className="text-muted-foreground mt-1">Tu plan del sistema de gestión, la forma de pago y los pagos.</p>
        </div>

        <Suspense fallback={null}>
          <PaymentReturnSync />
        </Suspense>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{plan?.name ?? "Sistema de gestión"}</CardTitle>
              <Badge variant={status.tone} className="rounded-full">{status.label}</Badge>
            </div>
            {status.detail && <CardDescription>{status.detail}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {billing && (
              <dl className="divide-y">
                {billing.planId && billing.planId !== "trial" && billing.planId !== "courtesy" && (
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">Plan</dt>
                    <dd>
                      {billing.planId === "annual" ? "Anual" : "Mensual"}
                      {plan ? ` · ${formatUSD(billing.planId === "annual" && plan.annual_usd ? plan.annual_usd : plan.monthly_usd)}` : ""}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <dt className="text-muted-foreground">Forma de pago</dt>
                  <dd>{hasPayPal ? "Cobro automático con PayPal" : billing.planId === "courtesy" ? "Cortesía" : "Manual (transferencia)"}</dd>
                </div>
              </dl>
            )}
            {hasPayPal && (
              <div className="space-y-2 pt-2">
                <ManagePayPalSubscription canCancel={canCancel} accessUntil={accessUntil ? dateFormat.format(accessUntil) : undefined} />
                <p className="text-xs text-muted-foreground">
                  Para cambiar la tarjeta o la cuenta con la que pagas, hazlo desde tus pagos automáticos en PayPal.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {canSubscribe && plan && mode.ready && (
          <Card>
            <CardHeader>
              <CardTitle>{access.kind === "expired" ? "Reactiva tu cuenta" : "Pasa al cobro automático"}</CardTitle>
              <CardDescription>Autoriza el pago automático con PayPal y olvídate de renovar a mano.</CardDescription>
            </CardHeader>
            <CardContent>
              <PlanCheckout
                plan={plan}
                trialDays={trialDays}
                withTrial={mode.withTrial}
                firstChargeAt={mode.firstChargeAt}
                remindsByEmail={emailConfigured()}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>
            ) : (
              <ul className="divide-y text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between gap-4 py-2.5">
                    <span>
                      <span className="font-medium">{dateFormat.format(new Date(p.created_at))}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.method} · {p.months} {p.months === 1 ? "mes" : "meses"}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {p.currency === "DOP" ? formatDOP(Number(p.amount)) : formatUSD(Number(p.amount))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
