import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { BusinessSetupForm } from "@/components/business-setup-form"

export const metadata = { title: "Bienvenida" }

export default async function WelcomePage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const setup = await getBusinessSetup()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido a Avero Inventario</h1>
        <p className="mt-1 text-muted-foreground">
          {user.businessName}, responde tres preguntas y el sistema se adapta a tu forma de trabajar.
        </p>
      </div>
      <BusinessSetupForm setup={setup} mode="welcome" />
    </div>
  )
}
