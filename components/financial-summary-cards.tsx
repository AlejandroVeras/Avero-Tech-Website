"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Clock, Package } from "lucide-react"
import type { FinancialSummary } from "@/lib/data/reports"

interface FinancialSummaryCardsProps {
  summary: FinancialSummary
  /** Counter-only shops don't send invoices to collect later. */
  showPending?: boolean
}

export function FinancialSummaryCards({ summary, showPending = true }: FinancialSummaryCardsProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  const cards = [
    {
      title: "Vendiste (sin ITBIS)",
      value: formatCurrency(summary.totalIncome),
      subtitle: `${summary.paidInvoices} ventas pagadas · ITBIS cobrado ${formatCurrency(summary.itbis)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Costo de lo vendido",
      value: formatCurrency(summary.cogs),
      subtitle:
        summary.itemsWithoutCost > 0
          ? `${summary.itemsWithoutCost} ${summary.itemsWithoutCost === 1 ? "producto vendido no tiene" : "productos vendidos no tienen"} costo registrado`
          : "Lo que te costó la mercancía vendida",
      icon: Package,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Gastos",
      value: formatCurrency(summary.totalExpenses),
      subtitle:
        summary.merchandisePurchases > 0
          ? `Sin contar ${formatCurrency(summary.merchandisePurchases)} de compra de mercancía`
          : "Alquiler, luz, nómina y demás",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Ganancia neta",
      value: formatCurrency(summary.netProfit),
      subtitle: summary.netProfit >= 0 ? "Ventas − costo − gastos" : "Pérdida del período",
      icon: DollarSign,
      color: summary.netProfit >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: summary.netProfit >= 0 ? "bg-blue-100" : "bg-red-100",
    },
    ...(showPending
      ? [
          {
            title: "Facturas pendientes",
            value: `${summary.pendingInvoices}`,
            subtitle: formatCurrency(summary.pendingAmount),
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
          },
        ]
      : []),
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${cards.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
