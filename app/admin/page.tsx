import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listAccounts, listPayments } from "@/lib/data/admin-queries"
import { getPublishedSystem } from "@/lib/data/systems"
import { getFinancialSummary } from "@/lib/data/reports"
import { saasMetrics, daysUntil } from "@/lib/admin"
import { appUrl, formatDOP, formatUSD } from "@/lib/site"

export const metadata = { title: "Resumen" }

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "short", year: "numeric" })
const monthName = new Intl.DateTimeFormat("es-DO", { month: "long", year: "numeric" })

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="px-5">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="px-5 text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  )
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default async function AdminHome() {
  const now = new Date()
  const start = isoDate(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = isoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  const [{ accounts, error }, payments, system, business] = await Promise.all([
    listAccounts(),
    listPayments(),
    getPublishedSystem("gestion"),
    getFinancialSummary(start, end).catch((): null => null),
  ])
  const m = saasMetrics(accounts, system, payments)
  const recent = payments.slice(0, 6)
  const names = new Map(accounts.map((a) => [a.userId, a.businessName]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Resumen</h1>
        <p className="text-muted-foreground capitalize">{monthName.format(now)}</p>
      </div>

      {error && (
        <div role="alert" className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>
            No se pudo leer la lista de negocios. ¿Ya corriste <code>DATABASE_ADMIN_UPDATE.sql</code>? Detalle: {error}
          </span>
        </div>
      )}

      <section aria-labelledby="saas" className="space-y-3">
        <h2 id="saas" className="text-lg font-semibold">Sistema de gestión (SaaS)</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Ingreso recurrente mensual" value={formatUSD(m.mrrUsd)} hint={`${m.paying} ${m.paying === 1 ? "negocio pagando" : "negocios pagando"}`} />
          <Stat
            label="Cobrado este mes"
            value={formatUSD(m.collectedThisMonth.USD)}
            hint={m.collectedThisMonth.DOP > 0 ? `+ ${formatDOP(m.collectedThisMonth.DOP)} en pesos` : "Pagos registrados en el panel"}
          />
          <Stat label="En prueba" value={m.trialing} hint={`${m.trialsEndingSoon.length} vencen en 7 días o menos`} />
          <Stat label="Negocios registrados" value={m.total} hint={`${m.signupsThisMonth} nuevos este mes · ${m.courtesy} cortesía · ${m.expired} vencidos`} />
        </div>
      </section>

      <section aria-labelledby="negocio" className="space-y-3">
        <h2 id="negocio" className="text-lg font-semibold">Avero Technology (tu negocio)</h2>
        {business ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Ingresos (facturas pagadas)" value={formatDOP(business.totalIncome)} hint={`${business.paidInvoices} facturas este mes`} />
            <Stat label="Gastos" value={formatDOP(business.totalExpenses)} />
            <Stat label="Ganancia" value={formatDOP(business.netProfit)} hint="Ingresos menos gastos del mes" />
            <Stat label="Por cobrar" value={formatDOP(business.pendingAmount)} hint={`${business.pendingInvoices} facturas pendientes`} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No se pudieron cargar las finanzas del negocio.</p>
        )}
        <p className="text-xs text-muted-foreground">
          Las ventas de equipos se llevan en <Link href={appUrl("/dashboard/reports")} className="underline">Reportes</Link>. Los cobros del
          SaaS de arriba son aparte y no se suman a estas cifras.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pruebas por vencer</CardTitle>
            <CardDescription>Buen momento para escribirles.</CardDescription>
          </CardHeader>
          <CardContent>
            {m.trialsEndingSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ninguna en los próximos 7 días.</p>
            ) : (
              <ul className="divide-y">
                {m.trialsEndingSoon.map((a) => (
                  <li key={a.userId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <Link href={`/admin/negocios/${a.userId}`} className="font-medium hover:underline truncate">
                      {a.businessName}
                    </Link>
                    <span className="text-muted-foreground shrink-0">
                      {(() => {
                        const d = daysUntil(a.periodEnd) ?? 0
                        return d <= 0 ? "hoy" : d === 1 ? "en 1 día" : `en ${d} días`
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos pagos</CardTitle>
            <CardDescription>Registrados desde la ficha de cada negocio.</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay pagos registrados.</p>
            ) : (
              <ul className="divide-y">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <Link href={`/admin/negocios/${p.userId}`} className="font-medium hover:underline">
                        {names.get(p.userId) ?? "Negocio"}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {dateFormat.format(new Date(p.createdAt))} · {p.method} · {p.months} {p.months === 1 ? "mes" : "meses"}
                      </span>
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
  )
}
