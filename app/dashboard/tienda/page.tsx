import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getMyStore } from "@/lib/data/store"
import { StoreSettingsForm } from "@/components/store-settings-form"
import { APP_URL } from "@/lib/site"

export const metadata = { title: "Mi tienda en línea" }

export default async function TiendaPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const store = await getMyStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi tienda en línea</h1>
          <p className="text-muted-foreground mt-1">
            Un catálogo con tus productos visibles para que tus clientes lo vean y te escriban por WhatsApp.
          </p>
        </div>

        {store ? (
          <StoreSettingsForm store={store} userId={user.id} siteUrl={APP_URL} />
        ) : (
          <p className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            La tienda en línea todavía no está habilitada en el sistema. Vuelve a intentarlo más tarde.
          </p>
        )}
      </div>
    </div>
  )
}
