import Link from "next/link"
import { ExternalLink, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listAllSystems } from "@/lib/data/admin-queries"
import { formatUSD } from "@/lib/site"

export const metadata = { title: "Sistemas" }

export default async function AdminSistemasPage() {
  const systems = await listAllSystems()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sistemas</h1>
          <p className="text-muted-foreground">El software que vendes. Lo publicado aparece en /sistemas.</p>
        </div>
        <Button asChild>
          <Link href="/admin/sistemas/nuevo">
            <Plus className="h-4 w-4" /> Nuevo sistema
          </Link>
        </Button>
      </div>

      {systems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay sistemas o no se pudo leer la tabla. ¿Ya corriste <code>DATABASE_SYSTEMS_UPDATE.sql</code>?
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systems.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{s.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{s.tagline}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={s.status === "disponible" ? "default" : "secondary"} className="rounded-full">
                    {s.status === "disponible" ? "Disponible" : "Próximamente"}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">{s.published ? "Publicado" : "Borrador"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {s.features.length} funciones · {s.plans.length} {s.plans.length === 1 ? "plan" : "planes"}
                  {s.plans[0] ? ` · desde ${formatUSD(s.plans[0].monthly_usd)}/mes` : ""}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/sistemas/${s.id}`}>Editar</Link>
                  </Button>
                  {s.published && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/sistemas/${s.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" /> Ver
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
