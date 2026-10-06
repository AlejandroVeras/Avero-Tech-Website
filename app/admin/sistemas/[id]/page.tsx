import { notFound } from "next/navigation"
import { SystemForm } from "@/components/admin/system-form"
import { getSystemById } from "@/lib/data/admin-queries"

export const metadata = { title: "Editar sistema" }

export default async function EditarSistemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const system = await getSystemById(id)
  if (!system) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{system.name}</h1>
        <p className="text-muted-foreground">Los cambios se ven en la web al guardar.</p>
      </div>
      <SystemForm system={system} />
    </div>
  )
}
