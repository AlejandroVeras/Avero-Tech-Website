import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getFinancialSummary, getMonthlyData, getExpensesByCategory } from "@/lib/data/reports"

import { FinancialSummaryCards } from "@/components/financial-summary-cards"
import { MonthlyChart } from "@/components/monthly-chart"
import { ExpensesCategoryChart } from "@/components/expenses-category-chart"
import { ExportReportsButton } from "@/components/export-reports-button"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { featuresFor } from "@/lib/business-setup"
import { resolvePeriod, todayInDR } from "@/lib/report-period"
import { ReportPeriodFilter } from "@/components/report-period-filter"

export const metadata = { title: "¿Cuánto gané?" }

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; desde?: string; hasta?: string }>
}) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const today = todayInDR()
  const period = resolvePeriod(await searchParams, today)
  // Long periods show one bar per month (up to 12); short ones, the 6 months up to the period's end.
  const span = period.start ? monthsBetween(period.start, period.end ?? today) : 12
  const [summary, monthlyData, categoryExpenses, setup] = await Promise.all([
    getFinancialSummary(period.start, period.end),
    getMonthlyData(Math.min(12, Math.max(6, span)), period.end && period.end < today ? period.end : today),
    getExpensesByCategory(period.start, period.end),
    getBusinessSetup(),
  ])
  const { quotes } = featuresFor(setup)

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">¿Cuánto gané?</h1>
            <p className="text-muted-foreground mt-1">
              Lo que vendiste, lo que gastaste y lo que te quedó. <span className="font-medium text-foreground">{period.label}</span>
            </p>
          </div>
          <ExportReportsButton 
            summary={summary} 
            monthlyData={monthlyData} 
            categoryExpenses={categoryExpenses} 
          />
        </div>

        <ReportPeriodFilter period={period} today={today} />

        <FinancialSummaryCards summary={summary} showPending={quotes} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart data={monthlyData} />
          <ExpensesCategoryChart data={categoryExpenses} />
        </div>
      </div>
    </div>
  )
}


function monthsBetween(start: string, end: string) {
  const [sy, sm] = start.split("-").map(Number)
  const [ey, em] = end.split("-").map(Number)
  return (ey - sy) * 12 + (em - sm) + 1
}
