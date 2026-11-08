import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { getUser } from "@/lib/auth"
import { SignupForm } from "@/components/signup-form"
import { getTrialDays } from "@/lib/data/systems"

export const metadata = { title: "Crear cuenta", description: "Registra tu negocio y prueba gratis Avero Inventario: inventario, facturas con ITBIS y ventas a crédito." }

export default async function SignupPage() {
  const user = await getUser()

  if (user) {
    redirect("/dashboard")
  }

  const trialDays = await getTrialDays()
  return (
    <AuthShell
      title="Crea tu cuenta"
      description={
        trialDays
          ? `Prueba Avero Inventario gratis ${trialDays} días. Después autorizas el pago con PayPal; no se cobra nada hasta que termine la prueba.`
          : "Registra tu negocio en Avero Inventario."
      }
    >
      <SignupForm />
    </AuthShell>
  )
}
