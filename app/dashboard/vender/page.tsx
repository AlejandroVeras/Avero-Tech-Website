import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getProducts } from "@/lib/data/products"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { QuickSale, type SaleProduct } from "@/components/pos/quick-sale"

export const dynamic = "force-dynamic"
export const metadata = { title: "Vender" }

export default async function SellPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const [products, setup] = await Promise.all([getProducts(), getBusinessSetup()])

  // Only what the screen needs; the server re-reads prices when charging.
  const list: SaleProduct[] = products
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      stockQuantity: p.stockQuantity,
      trackInventory: p.trackInventory,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vender</h1>
        <p className="mt-1 text-muted-foreground">Agrega los productos, cobra y la factura se crea sola.</p>
      </div>
      <QuickSale products={list} itbisMode={setup.itbisMode} />
    </div>
  )
}
