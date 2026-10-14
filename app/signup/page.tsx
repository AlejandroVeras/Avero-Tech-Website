import { redirect } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/site/logo"
import { getUser } from "@/lib/auth"
import { SignupForm } from "@/components/signup-form"
import { getTrialDays } from "@/lib/data/systems"

export const metadata = { title: "Crear cuenta", description: "Registra tu negocio y prueba gratis Avero Inventario: inventario, facturas con ITBIS y ventas a crédito." }

export default async function SignupPage() {
  const user = await getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background p-4">
      <Link href="/" aria-label="Avero Tech, inicio">
        <Logo className="h-10" />
      </Link>
      <SignupForm trialDays={await getTrialDays()} />
    </main>
  )
}
