import { test } from "node:test"
import assert from "node:assert/strict"
import { changeDue, computeSaleTotals, matchProduct } from "../lib/pos.ts"
import { featuresFor, LEGACY_SETUP, parseSetupRow, presetFor, productFormFor } from "../lib/business-setup.ts"

const lines = [
  { unitPrice: 1000, quantity: 2 },
  { unitPrice: 360, quantity: 1 },
]

test("ITBIS included: the customer pays the tag price", () => {
  const t = computeSaleTotals({ lines, itbisMode: "included" })
  assert.equal(t.subtotal, 2360)
  assert.equal(t.total, 2360)
  assert.equal(t.itbis, 360) // 2360 − 2360/1.18
  assert.equal(t.itbisIncluded, true)
})

test("ITBIS added: 18% on top of the price after discount", () => {
  const t = computeSaleTotals({ lines: [{ unitPrice: 1000, quantity: 1 }], discount: 100, itbisMode: "added" })
  assert.deepEqual(t, { subtotal: 1000, discount: 100, itbis: 162, total: 1062, itbisIncluded: false })
})

test("no ITBIS and a discount bigger than the sale", () => {
  const t = computeSaleTotals({ lines: [{ unitPrice: 500, quantity: 1 }], discount: 900, itbisMode: "none" })
  assert.equal(t.discount, 500)
  assert.equal(t.total, 0)
  assert.equal(t.itbis, 0)
})

test("change due only when the cash covers the total", () => {
  assert.equal(changeDue(1062, 1100), 38)
  assert.equal(changeDue(1062, 1062), 0)
  assert.equal(changeDue(1062, 1000), null)
  assert.equal(changeDue(1062, null), null)
})

test("scanner match: exact SKU first, then a single name match", () => {
  const products = [
    { name: "Blusa negra M", sku: "750100" },
    { name: "Blusa blanca M", sku: "750101" },
    { name: "Jeans azul 32", sku: null },
  ]
  assert.equal(matchProduct(products, " 750101 ")?.name, "Blusa blanca M")
  assert.equal(matchProduct(products, "jeans")?.name, "Jeans azul 32")
  assert.equal(matchProduct(products, "blusa"), null) // two matches: let the person pick
  assert.equal(matchProduct(products, ""), null)
})

test("old accounts keep every section and no Vender screen", () => {
  assert.deepEqual(featuresFor(LEGACY_SETUP), { quickSale: false, quotes: true, customers: true, serviceOrders: false })
  assert.deepEqual(featuresFor(parseSetupRow({ setup_completed_at: "2026-11-17" })), { quickSale: false, quotes: true, customers: true, serviceOrders: false })
})

test("a clothing store gets Vender and hides quotes and customers", () => {
  const setup = { ...LEGACY_SETUP, businessType: "ropa" as const, ...presetFor("ropa") }
  assert.deepEqual(featuresFor(setup), { quickSale: true, quotes: false, customers: false, serviceOrders: false })
  assert.equal(featuresFor({ ...setup, sellsOnCredit: true }).customers, true)
})

test("parseSetupRow ignores values outside the allowed lists", () => {
  const s = parseSetupRow({ business_type: "banco", sales_mode: "counter", itbis_mode: "x", sells_on_credit: "si" })
  assert.equal(s.businessType, null)
  assert.equal(s.salesMode, "counter")
  assert.equal(s.itbisMode, "added")
  assert.equal(s.sellsOnCredit, null)
  assert.equal(s.completed, false)
})

test("the product form fits the business", () => {
  const ropa = productFormFor("ropa")
  assert.equal(ropa.showCondition, false)
  assert.equal(ropa.showWarranty, false)
  assert.deepEqual(ropa.specsTemplate?.fields, ["Talla", "Color", "Material"])
  // No laptop words in a clothing store's empty rows.
  assert.equal(ropa.specsExample.label, "Ej: Talla")
  // Old accounts keep the electronics form exactly as it was.
  assert.equal(productFormFor(null).specsTemplate?.label, "Campos de laptop")
  assert.equal(productFormFor(null).showCondition, true)
  assert.equal(productFormFor("ferreteria").showWarranty, true)
})
