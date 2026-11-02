import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { CONDITION_LABELS, type Condition } from "@/lib/catalog"
import { SITE_URL } from "@/lib/site"
import type { CatalogItem } from "@/lib/ai/order"

// Read-only views of the store owner's public catalog for the sales bot (service key, server only).

type ProductRow = {
  id: string
  slug: string | null
  name: string
  description: string | null
  price: number | string
  category: string | null
  brand: string | null
  condition: string | null
  warranty_months: number | null
  specs: unknown
  stock_quantity: number | null
  track_inventory: boolean | null
}

export type BotProduct = CatalogItem & {
  brand?: string
  category?: string
  condition?: string
  warrantyMonths?: number
  description?: string
  specs: { label: string; value: string }[]
  url: string
}

const COLUMNS = "id, slug, name, description, price, category, brand, condition, warranty_months, specs, stock_quantity, track_inventory"

function toBotProduct(r: ProductRow): BotProduct {
  const tracked = r.track_inventory !== false
  const slug = r.slug || r.id
  return {
    slug,
    name: r.name,
    price: Number(r.price),
    trackInventory: tracked,
    stockQuantity: r.stock_quantity,
    inStock: !tracked || (r.stock_quantity ?? 0) > 0,
    brand: r.brand ?? undefined,
    category: r.category ?? undefined,
    condition: r.condition ? (CONDITION_LABELS[r.condition as Condition] ?? r.condition) : undefined,
    warrantyMonths: r.warranty_months ?? undefined,
    description: r.description ?? undefined,
    specs: Array.isArray(r.specs) ? (r.specs as { label: string; value: string }[]).filter((s) => s?.label && s?.value) : [],
    url: `${SITE_URL}/catalogo/${slug}`,
  }
}

async function ownerId(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("profiles").select("id").eq("is_store_owner", true).limit(1).maybeSingle()
  if (error || !data) throw new Error("No hay una cuenta dueña de la tienda (profiles.is_store_owner)")
  return data.id as string
}

export async function loadCatalog(supabase: SupabaseClient) {
  const owner = await ownerId(supabase)
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("user_id", owner)
    .eq("is_public", true)
    .order("featured", { ascending: false })
    .order("name")
    .limit(300)
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`)
  return (data as ProductRow[]).map(toBotProduct)
}

// One line per product. It goes at the start of the prompt and only changes when the catalog does,
// so OpenAI can serve it from the prompt cache.
export function catalogDigest(products: BotProduct[]) {
  return products
    .map(
      (p) =>
        `${p.slug} | ${p.name} | RD$${p.price.toLocaleString("en-US")} | ${p.condition ?? "—"} | ` +
        `${p.warrantyMonths ? `${p.warrantyMonths} meses de garantía` : "sin garantía indicada"} | ${p.inStock ? "disponible" : "agotado"}`,
    )
    .join("\n")
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

export function searchProducts(products: BotProduct[], query: string, category: string | null, maxBudget: number | null) {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 1)
  const scored = products
    .filter((p) => !category || normalize(p.category ?? "").includes(normalize(category)))
    .filter((p) => maxBudget == null || p.price <= maxBudget)
    .map((p) => {
      const hay = normalize([p.name, p.brand, p.category, p.description, ...p.specs.map((s) => s.value)].join(" "))
      const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)
      return { p, score }
    })
    .filter(({ score }) => words.length === 0 || score > 0)
    .sort((a, b) => b.score - a.score || Number(b.p.inStock) - Number(a.p.inStock))
  return scored.slice(0, 5).map(({ p }) => summary(p))
}

export function summary(p: BotProduct) {
  return {
    slug: p.slug,
    nombre: p.name,
    precio_rd: p.price,
    condicion: p.condition ?? null,
    garantia_meses: p.warrantyMonths ?? null,
    disponible: p.inStock,
    unidades: p.trackInventory ? p.stockQuantity : null,
  }
}

export function detail(p: BotProduct) {
  return { ...summary(p), marca: p.brand ?? null, categoria: p.category ?? null, descripcion: p.description ?? null, especificaciones: p.specs, enlace: p.url }
}
