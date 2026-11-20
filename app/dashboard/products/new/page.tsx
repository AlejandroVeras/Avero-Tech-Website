import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"

import { ProductForm } from "@/components/product-form"
import { getProductFormSettings } from "@/lib/data/business-setup"

export const metadata = { title: "Nuevo producto" }

export default async function NewProductPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const formSettings = await getProductFormSettings()

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-muted-foreground mt-1">Agrega un nuevo producto o servicio a tu catálogo</p>
        </div>

        <ProductForm userId={user.id} {...formSettings} />
      </div>
    </div>
  )
}

