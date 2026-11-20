import { test } from "node:test"
import assert from "node:assert/strict"
import { MERCHANDISE_CATEGORY, computeProfit } from "../lib/profit.ts"

const sale = (total: number, itbis: number, items: { productId?: string; quantity: number; unitCost?: number | null }[], status = "paid") => ({
  status,
  issueDate: "2026-11-17",
  total,
  itbis,
  items,
})

test("profit = sales without ITBIS − cost of what was sold − expenses", () => {
  const r = computeProfit(
    [sale(2360, 360, [{ productId: "blusa", quantity: 2, unitCost: 650 }])],
    [{ date: "2026-11-01", amount: 300, category: "Alquiler" }],
    new Map(),
  )
  assert.equal(r.grossSales, 2360)
  assert.equal(r.netSales, 2000)
  assert.equal(r.cogs, 1300)
  assert.equal(r.netProfit, 400) // 2000 − 1300 − 300
})

test("buying merchandise is not subtracted twice", () => {
  const r = computeProfit(
    [sale(1000, 0, [{ productId: "a", quantity: 1, unitCost: 600 }])],
    [{ date: "2026-11-02", amount: 5000, category: MERCHANDISE_CATEGORY }],
    new Map(),
  )
  assert.equal(r.merchandisePurchases, 5000)
  assert.equal(r.expenses, 0)
  assert.equal(r.netProfit, 400)
})

test("older sales use the product's current cost; missing costs are counted", () => {
  const r = computeProfit(
    [sale(3000, 0, [
      { productId: "jean", quantity: 1 },
      { productId: "sin-costo", quantity: 2 },
      { quantity: 1 }, // free-text line
    ])],
    [],
    new Map([["jean", 1100], ["sin-costo", null]]),
  )
  assert.equal(r.cogs, 1100)
  assert.equal(r.itemsWithoutCost, 1)
})

test("only paid invoices count", () => {
  const r = computeProfit([sale(500, 0, [], "draft"), sale(800, 0, [])], [], new Map())
  assert.equal(r.paidCount, 1)
  assert.equal(r.grossSales, 800)
})
