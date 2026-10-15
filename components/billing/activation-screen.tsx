import { Suspense } from "react"
import { Logo } from "@/components/site/logo"
import { PlanCheckout } from "@/components/billing/plan-checkout"
import { PaymentReturnSync } from "@/components/billing/payment-return-sync"
import { SignOutButton } from "@/components/billing/sign-out-button"
import { getPublishedSystem, getTrialDays } from "@/lib/data/systems"
import { getCheckoutMode } from "@/lib/data/billing"
import { FALLBACK_GESTION } from "@/lib/systems"
import { whatsappUrl } from "@/lib/site"
import { emailConfigured } from "@/lib/email"

export async function ActivationScreen({ businessName, email }: { businessName: string; email: string }) {
  const [system, trialDays, mode] = await Promise.all([getPublishedSystem("gestion"), getTrialDays(), getCheckoutMode()])
  const plan = (system ?? FALLBACK_GESTION).plans[0]

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <SignOutButton />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Activa tu prueba gratis, {businessName}</h1>
          <p className="text-muted-foreground">
            Para empezar a usar el sistema, elige tu plan y autoriza el pago automático con PayPal. No se te cobra nada durante los{" "}
            {trialDays} días de prueba.
          </p>
        </div>

        <Suspense fallback={null}>
          <PaymentReturnSync />
        </Suspense>

        <div className="rounded-3xl border bg-background p-6 md:p-8">
          {mode.ready && plan ? (
            <PlanCheckout
              plan={plan}
              trialDays={trialDays}
              withTrial={mode.withTrial}
              remindsByEmail={emailConfigured()}
            />
          ) : (
            <div className="space-y-4 text-sm">
              <p>
                Los pagos automáticos se están configurando. Mientras tanto, escríbenos y activamos tu cuenta en el momento.
              </p>
              <a
                href={whatsappUrl(`Hola, acabo de crear mi cuenta (${email}) para "${businessName}" y quiero activarla.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-primary-foreground"
              >
                Activar por WhatsApp
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">Sesión iniciada como {email}</p>
      </div>
    </main>
  )
}
