"use server"

import { getUser } from "@/lib/auth"
import { getInvoices } from "@/lib/data/invoices"
import { getExpenses } from "@/lib/data/expenses"
import { createClient } from "@/lib/supabase/server"
import { computeProfit } from "@/lib/profit"
import { inPeriod } from "@/lib/report-period"

export interface FinancialSummary {
  /** Sales without ITBIS (what the business keeps before costs). */
  totalIncome: number
  /** What customers paid, ITBIS included. */
  grossSales: number
  /** ITBIS collected (belongs to the DGII). */
  itbis: number
  /** Cost of the merchandise sold. */
  cogs: number
  /** Sold lines whose product has no cost on file. */
  itemsWithoutCost: number
  /** Operating expenses; merchandise purchases are not included (their cost is in cogs). */
  totalExpenses: number
  merchandisePurchases: number
  /** totalIncome − cogs − totalExpenses */
  netProfit: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  profit: number
}

export interface CategoryExpense {
  category: string
  amount: number
  percentage: number
}

/** Cost on file per product, for sales saved before each line stored its own cost. */
async function currentCosts() {
  const supabase = await createClient()
  const { data } = await supabase.from("products").select("id, cost")
  return new Map((data ?? []).map((p) => [p.id as string, p.cost != null ? Number(p.cost) : null]))
}

export async function getFinancialSummary(startDate?: string | null, endDate?: string | null): Promise<FinancialSummary> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const [invoices, expenses, costs] = await Promise.all([getInvoices(), getExpenses(), currentCosts()])

  const period = { start: startDate ?? null, end: endDate ?? null }
  const filteredInvoices = invoices.filter((inv) => inPeriod(inv.issueDate, period))
  const filteredExpenses = expenses.filter((exp) => inPeriod(exp.date, period))

  const profit = computeProfit(filteredInvoices, filteredExpenses, costs)
  const pendingInvoices = filteredInvoices.filter((inv) => inv.status === "sent" || inv.status === "overdue")

  return {
    totalIncome: profit.netSales,
    grossSales: profit.grossSales,
    itbis: profit.itbis,
    cogs: profit.cogs,
    itemsWithoutCost: profit.itemsWithoutCost,
    totalExpenses: profit.expenses,
    merchandisePurchases: profit.merchandisePurchases,
    netProfit: profit.netProfit,
    pendingInvoices: pendingInvoices.length,
    pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paidInvoices: profit.paidCount,
    paidAmount: profit.grossSales,
  }
}

/** One bar per month, ending in the month of endDay (today when null). */
export async function getMonthlyData(months = 6, endDay?: string | null): Promise<MonthlyData[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const [invoices, expenses, costs] = await Promise.all([getInvoices(), getExpenses(), currentCosts()])

  const now = endDay ? new Date(`${endDay.slice(0, 7)}-15T12:00:00`) : new Date()
  const result: MonthlyData[] = []
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const p = computeProfit(
      invoices.filter((inv) => inv.issueDate.startsWith(key)),
      expenses.filter((exp) => exp.date.startsWith(key)),
      costs,
    )
    result.push({
      month: date.toLocaleDateString("es-DO", { year: "numeric", month: "short" }),
      income: p.netSales,
      // Bars show everything that came out of the sales: merchandise sold plus operating expenses.
      expenses: Math.round((p.cogs + p.expenses) * 100) / 100,
      profit: p.netProfit,
    })
  }
  return result
}

export async function getExpensesByCategory(startDate?: string | null, endDate?: string | null): Promise<CategoryExpense[]> {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const period = { start: startDate ?? null, end: endDate ?? null }
  const expenses = (await getExpenses()).filter((e) => inPeriod(e.date, period))

  const categoryMap = new Map<string, number>()
  let total = 0

  for (const expense of expenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + expense.amount)
    total += expense.amount
  }

  const categoryExpenses: CategoryExpense[] = []
  for (const [category, amount] of categoryMap.entries()) {
    categoryExpenses.push({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    })
  }

  // Sort by amount descending
  categoryExpenses.sort((a, b) => b.amount - a.amount)

  return categoryExpenses
}
