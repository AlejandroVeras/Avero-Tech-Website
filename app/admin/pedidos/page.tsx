import Link from "next/link"
import { redirect } from "next/navigation"
import { Bot, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STYLES, listLeads, usageSummary, type LeadStatus } from "@/lib/data/leads"
import { formatDOP, formatUSD } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata = { title: "Pedidos de WhatsApp" }

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ estado?: string; chat?: string }> }) {
  const { estado, chat } = await searchParams
  const filter = LEAD_STATUSES.includes(estado as LeadStatus) ? (estado as LeadStatus) : undefined
  const [{ leads, error }, usage] = await Promise.all([listLeads(), usageSummary().catch(() => ({ costUsd: 0, messagesOut: 0 }))])

  // Links from the "pasar a humano" notice point to a chat; open its latest order.
  if (chat) {
    const match = leads.find((l) => l.conversationId === chat)
    if (match) redirect(`/admin/pedidos/${match.id}`)
  }

  const shown = filter ? leads.filter((l) => l.status === filter) : leads.filter((l) => l.status !== "nuevo")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos de WhatsApp</h1>
          <p className="text-muted-foreground">Lo que el asistente de ventas registró. Te avisa por WhatsApp y correo de cada pedido confirmado.</p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          Últimos 30 días: {usage.messagesOut} mensajes enviados · IA {formatUSD(Math.round(usage.costUsd * 100) / 100)}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-100">
          No se pudo leer la lista: {error}
        </p>
      )}

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-1">
        {[undefined, ...LEAD_STATUSES].map((s) => {
          const count = s ? leads.filter((l) => l.status === s).length : leads.filter((l) => l.status !== "nuevo").length
          return (
            <Link
              key={s ?? "todos"}
              href={s ? `/admin/pedidos?estado=${s}` : "/admin/pedidos"}
              aria-current={filter === s ? "page" : undefined}
              className={cn("rounded-full border px-3 py-1 text-sm", filter === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}
            >
              {s ? LEAD_STATUS_LABELS[s] : "Activos"} <span className="tabular-nums opacity-70">{count}</span>
            </Link>
          )
        })}
      </nav>

      <Card className="py-0 overflow-hidden">
        {shown.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Todavía no hay pedidos con ese filtro.</p>
        ) : (
          <ul className="divide-y">
            {shown.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/pedidos/${l.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-muted/40">
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {l.code} · {l.customerName ?? `+${l.phone}`}
                      {l.isTest && <Badge variant="outline">Prueba</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.items.length
                        ? l.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")
                        : l.interestedSlugs.length
                          ? `Interesado en ${l.interestedSlugs.join(", ")}`
                          : "Sin productos"}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{dateFormat.format(new Date(l.confirmedAt ?? l.createdAt))}</span>
                  {l.botStatus && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      {l.botStatus === "bot" ? <Bot className="h-4 w-4" aria-hidden /> : <UserRound className="h-4 w-4" aria-hidden />}
                      {l.botStatus === "bot" ? "Asistente" : l.botStatus === "humano" ? "Tú atiendes" : "Cerrada"}
                    </span>
                  )}
                  <Badge className={cn("rounded-full border-0", LEAD_STYLES[l.status])}>{LEAD_STATUS_LABELS[l.status]}</Badge>
                  <span className="ml-auto font-semibold tabular-nums">{l.total ? formatDOP(l.total) : "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
