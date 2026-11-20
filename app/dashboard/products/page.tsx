import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getProducts } from "@/lib/data/products"

import { ProductsList } from "@/components/products-list"
import { SampleProductsBanner } from "@/components/onboarding/sample-products"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Productos" }

export default async function ProductsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const products = await getProducts()

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground mt-1">Lo que vendes: precios, existencias y fotos</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo producto
            </Link>
          </Button>
        </div>

        {products.some((p) => p.isSample) && <SampleProductsBanner />}

        <ProductsList products={products} />
      </div>
    </div>
  )
}

