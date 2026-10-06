import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { CONDITIONS, type Condition, type PublicProduct, type PublicProductDetail, type Spec } from "@/lib/catalog"

// Views from DATABASE_CATALOG_UPDATE.sql; anon has no direct access to products/profiles.
const LIST_COLUMNS =
  "id, slug, name, description, price, category, brand, condition, featured, in_stock, cover_url, created_at"

type Row = {
  id: string
  slug: string | null
  name: string
  description: string | null
  price: number | string
  category: string | null
  brand: string | null
  condition: string | null
  featured: boolean | null
  in_stock: boolean
  cover_url: string | null
  created_at: string
}

function toCondition(value: string | null): Condition | undefined {
  return CONDITIONS.includes(value as Condition) ? (value as Condition) : undefined
}

function toPublicProduct(r: Row): PublicProduct {
  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.name,
    description: r.description ?? undefined,
    price: Number(r.price),
    category: r.category ?? undefined,
    brand: r.brand ?? undefined,
    condition: toCondition(r.condition),
    featured: !!r.featured,
    inStock: r.in_stock,
    coverUrl: r.cover_url ?? undefined,
    createdAt: r.created_at,
  }
}

function toSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((s): s is Spec => !!s && typeof s.label === "string" && typeof s.value === "string")
    .map((s) => ({ label: s.label, value: s.value }))
}

const getStoreOwnerId = cache(async (): Promise<string | null> => {
  const supabase = await createClient()
  const { data } = await supabase.from("public_stores").select("id").eq("is_store_owner", true).limit(1).maybeSingle()
  return data?.id ?? null
})

export const getStoreProducts = cache(async (): Promise<PublicProduct[]> => {
  const storeId = await getStoreOwnerId()
  if (!storeId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("public_products")
    .select(LIST_COLUMNS)
    .eq("store_id", storeId)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getStoreProducts:", error.message)
    return []
  }
  return (data as Row[]).map(toPublicProduct)
})

export const getStoreProduct = cache(async (slug: string): Promise<PublicProductDetail | null> => {
  const storeId = await getStoreOwnerId()
  if (!storeId) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("public_products")
    .select(`${LIST_COLUMNS}, warranty_months, specs`)
    .eq("store_id", storeId)
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("getStoreProduct:", error.message)
    return null
  }
  if (!data) return null

  const row = data as Row & { warranty_months: number | null; specs: unknown }
  const { data: images } = await supabase
    .from("public_product_images")
    .select("url, position")
    .eq("product_id", row.id)
    .order("position", { ascending: true })

  return {
    ...toPublicProduct(row),
    warrantyMonths: row.warranty_months ?? undefined,
    specs: toSpecs(row.specs),
    images: (images ?? []).map((i) => i.url as string),
  }
})
