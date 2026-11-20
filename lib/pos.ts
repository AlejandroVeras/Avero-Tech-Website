// Money math for the Vender screen (quick sale). The server recomputes it with the prices from
// the database, so the client never decides what is charged. No imports: tests run it directly.

import type { ItbisMode } from "./business-setup.ts"

export const ITBIS_RATE = 0.18

export const PAYMENT_METHODS = [
  { id: "cash", label: "Efectivo" },
  { id: "card", label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"]

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((m) => m.id === value)
}

export function paymentMethodLabel(value: string | null | undefined) {
  return PAYMENT_METHODS.find((m) => m.id === value)?.label ?? null
}

export const WALK_IN_CUSTOMER = "Consumidor final"

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export interface SaleTotals {
  /** Sum of the lines at their tag price. */
  subtotal: number
  discount: number
  itbis: number
  total: number
  /** True when the ITBIS is part of the tag price (total = subtotal − discount). */
  itbisIncluded: boolean
}

export function computeSaleTotals(input: {
  lines: { unitPrice: number; quantity: number }[]
  discount?: number
  itbisMode: ItbisMode
}): SaleTotals {
  const subtotal = round(input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0))
  const discount = round(Math.min(Math.max(input.discount || 0, 0), subtotal))
  const net = round(subtotal - discount)

  if (input.itbisMode === "included") {
    return { subtotal, discount, itbis: round(net - net / (1 + ITBIS_RATE)), total: net, itbisIncluded: true }
  }
  if (input.itbisMode === "added") {
    const itbis = round(net * ITBIS_RATE)
    return { subtotal, discount, itbis, total: round(net + itbis), itbisIncluded: false }
  }
  return { subtotal, discount, itbis: 0, total: net, itbisIncluded: false }
}

/** Change to give back, or null when what was received does not cover the total. */
export function changeDue(total: number, received: number | null | undefined): number | null {
  if (received == null || !Number.isFinite(received) || received < total) return null
  return round(received - total)
}

/** Finds the product a barcode scanner or the search box points to: exact SKU first, then a single name match. */
export function matchProduct<T extends { name: string; sku?: string | null }>(products: T[], query: string): T | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const bySku = products.find((p) => p.sku && p.sku.trim().toLowerCase() === q)
  if (bySku) return bySku
  const byName = products.filter((p) => p.name.toLowerCase().includes(q))
  return byName.length === 1 ? byName[0] : null
}
