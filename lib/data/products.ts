"use server"

import { createClient } from "@/lib/supabase/server"

export interface Product {
  id: string
  userId: string
  name: string
  description?: string
  sku?: string
  price: number
  cost?: number
  stockQuantity: number
  trackInventory: boolean
  isPublic?: boolean
  category?: string
  createdAt: Date
  updatedAt: Date
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    name: p.name,
    description: p.description,
    sku: p.sku,
    price: Number(p.price),
    cost: p.cost ? Number(p.cost) : undefined,
    stockQuantity: p.stock_quantity,
    trackInventory: p.track_inventory,
    isPublic: p.is_public || false,
    category: p.category,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }))
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error || !data) return null

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    sku: data.sku,
    price: Number(data.price),
    cost: data.cost ? Number(data.cost) : undefined,
    stockQuantity: data.stock_quantity,
    trackInventory: data.track_inventory,
    isPublic: data.is_public || false,
    category: data.category,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const sku = formData.get("sku") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0
  const trackInventory = formData.get("trackInventory") !== "false"
  const isPublic = formData.get("isPublic") === "true" || formData.get("isPublic") === "on"
  const category = formData.get("category") as string

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name,
      description: description || null,
      sku: sku || null,
      price,
      cost: cost ? Number.parseFloat(cost) : null,
      stock_quantity: stockQuantity,
      track_inventory: trackInventory,
      is_public: isPublic,
      category: category || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, id: data.id }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const price = Number.parseFloat(formData.get("price") as string)

  if (!name || isNaN(price)) {
    return { error: "Nombre y precio son requeridos" }
  }

  const cost = formData.get("cost") as string
  const stockQuantity = Number.parseInt(formData.get("stockQuantity") as string) || 0
  const trackInventory = formData.get("trackInventory") !== "false"
  const isPublic = formData.get("isPublic") === "true" || formData.get("isPublic") === "on"

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: (formData.get("description") as string) || null,
      sku: (formData.get("sku") as string) || null,
      price,
      cost: cost ? Number.parseFloat(cost) : null,
      stock_quantity: stockQuantity,
      track_inventory: trackInventory,
      is_public: isPublic,
      category: (formData.get("category") as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

// Never add cost, sku or exact stock here: this shape is serialized to the browser.
export interface PublicProduct {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  inStock: boolean
}

export async function getPublicProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient()

  // Vistas definidas en DATABASE_SECURITY_FIX.sql; el público no tiene acceso
  // directo a las tablas products ni profiles.
  const { data: store } = await supabase
    .from("public_stores")
    .select("id")
    .eq("is_store_owner", true)
    .limit(1)
    .maybeSingle()

  if (!store) return []

  const { data, error } = await supabase
    .from("public_products")
    .select("id, name, description, price, category, in_stock")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("fetch public products err:", error)
    return []
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    price: Number(p.price),
    category: p.category ?? undefined,
    inStock: p.in_stock,
  }))
}
