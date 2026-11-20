// Real profit for a period: sales without ITBIS, minus what the sold merchandise cost, minus
// operating expenses. No imports: tests run this file directly.

/** Expense category for buying stock. It is NOT subtracted again: the cost of what was sold already is. */
export const MERCHANDISE_CATEGORY = "Compra de mercancía"

export interface ProfitInvoice {
  status: string
  issueDate: string
  total: number
  itbis: number
  /** True when the ITBIS is inside the total (sales from Vender with "precios con ITBIS"). */
  itbisIncluded?: boolean
  items: { productId?: string; quantity: number; unitCost?: number | null }[]
}

export interface ProfitExpense {
  date: string
  amount: number
  category: string
}

export interface ProfitSummary {
  /** What customers paid, ITBIS included. */
  grossSales: number
  /** ITBIS collected, which belongs to the DGII. */
  itbis: number
  /** Sales without ITBIS. */
  netSales: number
  /** Cost of the merchandise sold. */
  cogs: number
  /** Sold items whose product has no cost on file (their cost counts as 0). */
  itemsWithoutCost: number
  /** Operating expenses (merchandise purchases excluded). */
  expenses: number
  merchandisePurchases: number
  netProfit: number
  paidCount: number
}

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * @param currentCosts cost on file per product, used for sales saved before unit_cost existed.
 * Only paid invoices count. Both lists must already be filtered to the period.
 */
export function computeProfit(
  invoices: ProfitInvoice[],
  expenses: ProfitExpense[],
  currentCosts: Map<string, number | null | undefined>,
): ProfitSummary {
  let grossSales = 0
  let itbis = 0
  let cogs = 0
  let itemsWithoutCost = 0
  let paidCount = 0

  for (const inv of invoices) {
    if (inv.status !== "paid") continue
    paidCount++
    grossSales += inv.total
    itbis += inv.itbis
    for (const item of inv.items) {
      if (!item.productId) continue // free-text lines (services) have no merchandise cost
      const cost = item.unitCost ?? currentCosts.get(item.productId)
      if (cost == null) itemsWithoutCost++
      else cogs += cost * item.quantity
    }
  }

  let operating = 0
  let merchandisePurchases = 0
  for (const e of expenses) {
    if (e.category === MERCHANDISE_CATEGORY) merchandisePurchases += e.amount
    else operating += e.amount
  }

  const netSales = grossSales - itbis
  return {
    grossSales: round(grossSales),
    itbis: round(itbis),
    netSales: round(netSales),
    cogs: round(cogs),
    itemsWithoutCost,
    expenses: round(operating),
    merchandisePurchases: round(merchandisePurchases),
    netProfit: round(netSales - cogs - operating),
    paidCount,
  }
}
