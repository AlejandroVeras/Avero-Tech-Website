import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrialDaysForm } from "@/components/admin/trial-days-form"
import { getTrialDays } from "@/lib/data/systems"

export const metadata = { title: "Ajustes" }

export default async function AjustesPage() {
  const trialDays = await getTrialDays()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Prueba gratis</CardTitle>
          <CardDescription>
            Cada negocio nuevo empieza con esta cantidad de días con todas las funciones. Al terminar queda en solo lectura
            hasta que registres un pago. Las cuentas que ya están en prueba no cambian.
            <strong className="block mt-2 text-foreground">
              Con cobro automático, la prueba real la define el plan de PayPal (scripts/paypal-setup.mjs): pon aquí el mismo
              número de días para que la web muestre lo correcto.
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrialDaysForm value={trialDays} />
        </CardContent>
      </Card>
    </div>
  )
}
