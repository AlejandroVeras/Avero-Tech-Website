import { SystemForm } from "@/components/admin/system-form"

export const metadata = { title: "Nuevo sistema" }

export default function NuevoSistemaPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Nuevo sistema</h1>
        <p className="text-muted-foreground">
          Créalo como &quot;Próximamente&quot; para anunciarlo antes de que esté listo; no se muestra en la web hasta que lo publiques.
        </p>
      </div>
      <SystemForm />
    </div>
  )
}
