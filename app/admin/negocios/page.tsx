import Link from "next/link"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { listAccounts } from "@/lib/data/admin-queries"
import { accountState, daysUntil, PLAN_LABELS, STATE_LABELS, type AccountState } from "@/lib/admin"
import { cn } from "@/lib/utils"

export const metadata = { title: "Negocios" }

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", year: "numeric" })

const STATE_STYLES: Record<AccountState, string> = {
  pagando: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100",
  cortesia: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  prueba: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  pendiente: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  vencido: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
}

const FILTERS: { value: "todos" | AccountState; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pagando", label: "Pagando" },
  { value: "prueba", label: "En prueba" },
  { value: "pendiente", label: "Sin activar" },
  { value: "cortesia", label: "Cortesía" },
  { value: "vencido", label: "Vencidos" },
]

function periodLabel(end?: string) {
  if (!end) return "Sin vencimiento"
  const d = daysUntil(end) ?? 0
  const date = dateFormat.format(new Date(end))
  return d < 0 ? `Venció el ${date}` : `Hasta el ${date}`
}

export default async function NegociosPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const { estado = "todos", q = "" } = await searchParams
  const { accounts, error } = await listAccounts()
  const query = q.trim().toLowerCase()
  const filtered = accounts.filter((a) => {
    if (estado !== "todos" && accountState(a) !== estado) return false
    if (query && ![a.businessName, a.email, a.slug].some((v) => v?.toLowerCase().includes(query))) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Negocios</h1>
        <p className="text-muted-foreground">Cuentas registradas en el sistema de gestión.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-100">
          No se pudo leer la lista: {error}
        </p>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => {
            const count = f.value === "todos" ? accounts.length : accounts.filter((a) => accountState(a) === f.value).length
            const params = new URLSearchParams({ ...(f.value !== "todos" && { estado: f.value }), ...(q && { q }) })
            return (
              <Link
                key={f.value}
                href={`/admin/negocios${params.size ? `?${params}` : ""}`}
                aria-current={estado === f.value ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  estado === f.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted",
                )}
              >
                {f.label} <span className="tabular-nums opacity-70">{count}</span>
              </Link>
            )
          })}
        </nav>
        <form className="flex gap-2" role="search">
          {estado !== "todos" && <input type="hidden" name="estado" value={estado} />}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input name="q" defaultValue={q} placeholder="Nombre, correo o dirección" aria-label="Buscar negocio" className="pl-8 w-64" />
          </div>
          <Button type="submit" variant="outline">Buscar</Button>
        </form>
      </div>

      <Card className="py-0 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No hay negocios con ese filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Negocio</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium">Plan</th>
                  <th scope="col" className="px-4 py-3 font-medium">Período</th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">Productos</th>
                  <th scope="col" className="px-4 py-3 font-medium">Tienda</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => {
                  const state = accountState(a)
                  return (
                    <tr key={a.userId} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link href={`/admin/negocios/${a.userId}`} className="font-medium hover:underline">
                          {a.businessName}
                        </Link>
                        <div className="text-xs text-muted-foreground">{a.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("rounded-full border-0", STATE_STYLES[state])}>{STATE_LABELS[state]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {a.planId ? PLAN_LABELS[a.planId] ?? a.planId : "—"}
                        {a.provider === "paypal" && (
                          <span className="block text-xs text-muted-foreground">
                            PayPal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{periodLabel(a.periodEnd)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {a.products}
                        {a.publicProducts > 0 && <span className="text-muted-foreground"> ({a.publicProducts} visibles)</span>}
                      </td>
                      <td className="px-4 py-3">
                        {a.storeEnabled && a.slug ? (
                          <a href={`/t/${a.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-sky-signal hover:underline">
                            /t/{a.slug}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Inactiva</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
