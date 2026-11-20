import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateAccountForm } from "@/components/admin/access-form"

export const metadata = { title: "Crear usuario" }

export default function NewAccountPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/negocios">
          <ArrowLeft className="h-4 w-4" /> Negocios
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Crear usuario de Avero Inventario</CardTitle>
          <CardDescription>
            El cliente entra con este correo y contraseña sin pasar por PayPal. La primera vez le aparecen las preguntas
            sobre su tipo de negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
