import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Mail } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordPaymentForm, StatusButtons } from "@/components/admin/subscription-actions"
import { listAccounts, listPayments } from "@/lib/data/admin-queries"
import { getPublishedSystem } from "@/lib/data/systems"
import { accountState, daysUntil, PLAN_LABELS, STATE_LABELS } from "@/lib/admin"
import { formatDOP, formatUSD } from "@/lib/site"

export const metadata = { title: "Negocio" }

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric" })

export default async function NegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ accounts }, payments, system] = await Promise.all([
    listAccounts(),
    listPayments({ userId: id }),
    getPublishedSystem("gestion"),
  ])
  const account = accounts.find((a) => a.userId === id)
  if (!account) notFound()

  const state = accountState(account)
  const days = daysUntil(account.periodEnd)

  const rows: [string, React.ReactNode][] = [
    ["Correo", account.email],
    ["Registrado", dateFormat.format(new Date(account.signedUpAt))],
    ["Último acceso", account.lastSignInAt ? dateFormat.format(new Date(account.lastSignInAt)) : "Nunca"],
    ["Plan", account.planId ? PLAN_LABELS[account.planId] ?? account.planId : "Sin suscripción"],
    [
      "Cobro",
      account.provider === "lemonsqueezy"
        ? `Automático con tarjeta${account.cardBrand ? ` ${account.cardBrand}` : ""}${account.cardLastFour ? ` •${account.cardLastFour}` : ""}`
        : account.status === "incomplete"
          ? "No ha registrado tarjeta"
          : "Manual",
    ],
    [
      "Vence",
      account.periodEnd
        ? `${dateFormat.format(new Date(account.periodEnd))}${days !== null ? (days < 0 ? ` (hace ${-days} días)` : ` (en ${days} días)`) : ""}`
        : "Sin vencimiento",
    ],
    ["Productos", `${account.products} (${account.publicProducts} visibles en su tienda)`],
  ]

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/negocios">
          <ArrowLeft className="h-4 w-4" /> Negocios
        </Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{account.businessName}</h1>
          <Badge variant={account.hasAccess ? "secondary" : "destructive"} className="mt-1 rounded-full">
            {STATE_LABELS[state]}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${account.email}`}>
              <Mail className="h-4 w-4" /> Escribir
            </a>
          </Button>
          {account.storeEnabled && account.slug && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/t/${account.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Ver tienda
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y text-sm">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
              <CardDescription>Suspender no borra datos: el negocio queda en solo lectura.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusButtons account={account.userId} hasAccess={account.hasAccess} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar pago</CardTitle>
              <CardDescription>Activa o extiende la suscripción y deja constancia del cobro.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecordPaymentForm account={account.userId} plan={system?.plans[0]} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de pagos</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {payments.map((p) => (
                    <li key={p.id} className="flex justify-between gap-4 py-2.5">
                      <span>
                        <span className="font-medium">{dateFormat.format(new Date(p.createdAt))}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.method}
                          {p.reference ? ` · ${p.reference}` : ""} · {p.months} {p.months === 1 ? "mes" : "meses"} hasta el{" "}
                          {dateFormat.format(new Date(p.periodEnd))}
                        </span>
                        {p.notes && <span className="block text-xs text-muted-foreground">{p.notes}</span>}
                      </span>
                      <span className="font-semibold tabular-nums shrink-0">
                        {p.currency === "USD" ? formatUSD(p.amount) : formatDOP(p.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
