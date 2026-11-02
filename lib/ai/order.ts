// Prices and stock for an order always come from the catalog, never from the model.

export type CatalogItem = {
  slug: string
  name: string
  price: number
  inStock: boolean
  stockQuantity: number | null
  trackInventory: boolean
}

export type RequestedItem = { slug: string; cantidad: number }

export type PricedItem = { slug: string; name: string; quantity: number; unitPrice: number; subtotal: number }

export type PricedOrder = { items: PricedItem[]; total: number; problems: string[] }

export function priceOrder(requested: RequestedItem[], catalog: Map<string, CatalogItem>): PricedOrder {
  const problems: string[] = []
  const merged = new Map<string, number>()
  for (const r of requested) {
    const qty = Math.floor(Number(r.cantidad))
    if (!Number.isFinite(qty) || qty < 1 || qty > 20) {
      problems.push(`Cantidad inválida para ${r.slug}`)
      continue
    }
    merged.set(r.slug, (merged.get(r.slug) ?? 0) + qty)
  }

  const items: PricedItem[] = []
  for (const [slug, quantity] of merged) {
    const p = catalog.get(slug)
    if (!p) {
      problems.push(`El producto ${slug} no existe en el catálogo`)
      continue
    }
    if (!p.inStock) {
      problems.push(`${p.name} está agotado`)
      continue
    }
    if (p.trackInventory && p.stockQuantity != null && quantity > p.stockQuantity) {
      problems.push(`Solo quedan ${p.stockQuantity} de ${p.name}`)
      continue
    }
    items.push({ slug, name: p.name, quantity, unitPrice: p.price, subtotal: p.price * quantity })
  }
  if (items.length === 0 && problems.length === 0) problems.push("El pedido no tiene productos")

  return { items, total: items.reduce((s, i) => s + i.subtotal, 0), problems }
}

// The customer must have confirmed in their own words; the model's flag alone is not enough.
export function customerConfirmed(lastCustomerText: string) {
  const t = lastCustomerText
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
  if (/\b(no|todavia|aun no|espera|cambia)\b/.test(t)) return false
  return /\b(si|confirmo|confirmado|correcto|dale|de acuerdo|ok|okay|esta bien|perfecto|yes)\b/.test(t)
}
