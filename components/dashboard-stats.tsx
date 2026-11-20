import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Package, Receipt, Users, TrendingUp } from "lucide-react"
import { getInvoices } from "@/lib/data/invoices"
import { getCustomers } from "@/lib/data/customers"
import { getExpenses } from "@/lib/data/expenses"
import { createClient } from "@/lib/supabase/server"
import { computeProfit } from "@/lib/profit"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(amount)
}

/** "2026-11" in Santo Domingo (the server runs in UTC). */
function currentMonthKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date()).slice(0, 7)
}

/**
 * This month's numbers. A counter shop (no quotes, walk-in customers) sees cost of goods and
 * average ticket instead of pending invoices and active customers, which don't apply to it.
 */
export async function DashboardStats({ counter = false }: { counter?: boolean }) {
  const supabase = await createClient()
  const [invoices, customers, expenses, { data: products }] = await Promise.all([
    getInvoices(),
    counter ? Promise.resolve([]) : getCustomers(),
    getExpenses(),
    supabase.from("products").select("id, cost"),
  ])
  const costs = new Map((products ?? []).map((p) => [p.id as string, p.cost != null ? Number(p.cost) : null]))

  const month = currentMonthKey()
  const monthInvoices = invoices.filter((inv) => inv.issueDate.startsWith(month))
  const profit = computeProfit(
    monthInvoices,
    expenses.filter((exp) => exp.date.startsWith(month)),
    costs,
  )

  const salesCard = {
    title: "Ventas del mes",
    value: formatCurrency(profit.netSales),
    change: profit.paidCount > 0 ? `${profit.paidCount} ventas · sin ITBIS` : "Sin ventas todavía",
    icon: DollarSign,
    positive: profit.netSales > 0,
  }
  const profitCard = {
    title: "Ganancia neta",
    value: formatCurrency(profit.netProfit),
    change: profit.netProfit >= 0 ? "Ventas − costo − gastos" : "Pérdida del mes",
    icon: TrendingUp,
    positive: profit.netProfit >= 0,
  }

  const middle = counter
    ? [
        {
          title: "Costo de lo vendido",
          value: formatCurrency(profit.cogs),
          change:
            profit.itemsWithoutCost > 0
              ? `${profit.itemsWithoutCost} sin costo registrado`
              : "Lo que te costó la mercancía",
          icon: Package,
          positive: false,
        },
        {
          title: "Venta promedio",
          value: formatCurrency(profit.paidCount > 0 ? profit.grossSales / profit.paidCount : 0),
          change: "Por cliente, con ITBIS",
          icon: Receipt,
          positive: false,
        },
      ]
    : (() => {
        const pending = invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue")
        const activeCustomers = new Set(invoices.map((inv) => inv.customerId).filter(Boolean)).size
        return [
          {
            title: "Facturas pendientes",
            value: pending.length.toString(),
            change: formatCurrency(pending.reduce((sum, inv) => sum + inv.total, 0)),
            icon: FileText,
            positive: false,
          },
          {
            title: "Clientes activos",
            value: activeCustomers.toString(),
            change: `${customers.length} total`,
            icon: Users,
            positive: true,
          },
        ]
      })()

  const stats = [salesCard, ...middle, profitCard]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-xs mt-1 ${stat.positive ? "text-green-600" : "text-muted-foreground"}`}>{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
