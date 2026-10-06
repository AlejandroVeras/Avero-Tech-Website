import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import {
  CONDITIONS,
  type Condition,
  type PublicProduct,
  type PublicProductDetail,
  type PublicStore,
  type Spec,
} from "@/lib/catalog"

// Views from DATABASE_TENANT_STORES.sql; anon has no direct access to products/profiles.
const LIST_COLUMNS =
  "id, slug, name, description, price, category, brand, condition, featured, in_stock, cover_url, created_at"
const STORE_COLUMNS = "id, slug, business_name, logo_url, store_description, whatsapp_phone, is_store_owner"

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

type StoreRow = {
  id: string
  slug: string | null
  business_name: string
  logo_url: string | null
  store_description?: string | null
  whatsapp_phone?: string | null
  is_store_owner: boolean | null
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

function toStore(r: StoreRow): PublicStore {
  return {
    id: r.id,
    slug: r.slug || r.id,
    name: r.business_name,
    logoUrl: r.logo_url ?? undefined,
    description: r.store_description ?? undefined,
    whatsapp: r.whatsapp_phone ?? undefined,
    isStoreOwner: !!r.is_store_owner,
  }
}

function toSpecs(value: unknown): Spec[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((s): s is Spec => !!s && typeof s.label === "string" && typeof s.value === "string")
    .map((s) => ({ label: s.label, value: s.value }))
}

// Before DATABASE_TENANT_STORES.sql the view lacks the store columns; fall back to id only.
async function selectStore(filter: { column: "is_store_owner" | "slug"; value: string | boolean }) {
  const supabase = await createClient()
  const full = await supabase.from("public_stores").select(STORE_COLUMNS).eq(filter.column, filter.value).limit(1).maybeSingle()
  if (!full.error) return full.data ? toStore(full.data as StoreRow) : null
  if (filter.column !== "is_store_owner") return null
  const basic = await supabase.from("public_stores").select("id, business_name, logo_url, is_store_owner").eq("is_store_owner", true).limit(1).maybeSingle()
  return basic.data ? toStore(basic.data as StoreRow) : null
}

export const getOwnerStore = cache(() => selectStore({ column: "is_store_owner", value: true }))

export const getStoreBySlug = cache((slug: string) => selectStore({ column: "slug", value: slug }))

export const getProductsForStore = cache(async (storeId: string): Promise<PublicProduct[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("public_products")
    .select(LIST_COLUMNS)
    .eq("store_id", storeId)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getProductsForStore:", error.message)
    return []
  }
  return (data as Row[]).map(toPublicProduct)
})

export const getProductForStore = cache(async (storeId: string, slug: string): Promise<PublicProductDetail | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("public_products")
    .select(`${LIST_COLUMNS}, warranty_months, specs`)
    .eq("store_id", storeId)
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("getProductForStore:", error.message)
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

export async function getStoreProducts(): Promise<PublicProduct[]> {
  const store = await getOwnerStore()
  return store ? getProductsForStore(store.id) : []
}

export async function getStoreProduct(slug: string): Promise<PublicProductDetail | null> {
  const store = await getOwnerStore()
  return store ? getProductForStore(store.id, slug) : null
}

export function relatedProducts(all: PublicProduct[], current: PublicProduct, limit = 4) {
  const others = all.filter((p) => p.id !== current.id && p.inStock)
  return [
    ...others.filter((p) => current.category && p.category === current.category),
    ...others.filter((p) => !current.category || p.category !== current.category),
  ].slice(0, limit)
}
