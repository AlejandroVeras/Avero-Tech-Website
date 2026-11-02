import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { LEAD_STATUSES, LEAD_STATUS_LABELS, LEAD_STYLES, getLead } from "@/lib/data/leads"
import { sendHumanReply, setBotStatus, setLeadStatus } from "@/lib/data/lead-actions"
import { formatDOP, whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata = { title: "Pedido" }

const timeFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

export default async function PedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getLead(id)
  if (!data) notFound()
  const { lead, messages, windowOpen } = data

  const rows: [string, string | null][] = [
    ["Cliente", lead.customerName],
    ["Teléfono", `+${lead.phone}`],
    ["Dirección", [lead.address, lead.sector, lead.city].filter(Boolean).join(", ") || null],
    ["Referencia", lead.landmark],
    ["Horario", lead.deliveryWindow],
    ["Pago", lead.paymentMethod],
    ["Notas", lead.notes],
  ]

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/pedidos">
          <ArrowLeft className="h-4 w-4" /> Pedidos
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Pedido {lead.code}</h1>
        <Badge className={cn("rounded-full border-0", LEAD_STYLES[lead.status])}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
        {lead.isTest && <Badge variant="outline">Prueba</Badge>}
        <span className="ml-auto text-2xl font-bold tabular-nums">{lead.total ? formatDOP(lead.total) : "—"}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Productos</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {lead.interestedSlugs.length ? `Mostró interés en: ${lead.interestedSlugs.join(", ")}` : "Todavía no eligió productos."}
                </p>
              ) : (
                <ul className="divide-y text-sm">
                  {lead.items.map((i) => (
                    <li key={i.slug} className="flex justify-between gap-3 py-2">
                      <span>
                        {i.quantity}x {i.name}
                        <span className="block text-xs text-muted-foreground">{formatDOP(i.unitPrice)} c/u</span>
                      </span>
                      <span className="tabular-nums">{formatDOP(i.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {rows.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd>{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estado del pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {LEAD_STATUSES.filter((s) => s !== lead.status && s !== "nuevo").map((s) => (
                <form key={s} action={setLeadStatus}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="status" value={s} />
                  <Button type="submit" variant={s === "cancelado" ? "outline" : "secondary"} size="sm">
                    Marcar {LEAD_STATUS_LABELS[s].toLowerCase()}
                  </Button>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Conversación</CardTitle>
            <div className="flex flex-wrap gap-2">
              {lead.conversationId && (
                <form action={setBotStatus}>
                  <input type="hidden" name="conversationId" value={lead.conversationId} />
                  <input type="hidden" name="status" value={lead.botStatus === "bot" ? "humano" : "bot"} />
                  <Button type="submit" variant="outline" size="sm">
                    {lead.botStatus === "bot" ? "Pausar el asistente y atender yo" : "Devolver al asistente"}
                  </Button>
                </form>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={whatsappUrl(undefined, lead.phone)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Abrir en WhatsApp
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <ol className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg bg-muted/50 p-3" aria-label="Mensajes">
              {messages.map((m) =>
                m.author === "sistema" ? (
                  <li key={m.id} className="self-center text-xs text-muted-foreground">
                    {m.content}
                  </li>
                ) : (
                  <li
                    key={m.id}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                      m.direction === "in" ? "self-start bg-background" : "self-end bg-green-100 text-green-950 dark:bg-green-900/50 dark:text-green-50",
                    )}
                  >
                    {m.content}
                    <span className="mt-1 block text-[11px] opacity-60">
                      {m.author === "humano" ? "Tú · " : m.author === "bot" ? "Asistente · " : ""}
                      {timeFormat.format(new Date(m.createdAt))}
                    </span>
                  </li>
                ),
              )}
            </ol>
            {lead.conversationId &&
              (windowOpen ? (
                <form action={sendHumanReply} className="flex flex-col gap-2">
                  <input type="hidden" name="conversationId" value={lead.conversationId} />
                  <Textarea name="text" required maxLength={1000} rows={2} placeholder="Escribe al cliente (pausa el asistente)" aria-label="Mensaje al cliente" />
                  <Button type="submit" className="self-end">Enviar</Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pasaron más de 24 horas desde el último mensaje del cliente. WhatsApp solo permite escribirle con una plantilla aprobada, o desde tu teléfono.
                </p>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
