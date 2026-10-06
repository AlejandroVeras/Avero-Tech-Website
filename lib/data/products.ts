"use server"

import { friendlyError } from "@/lib/data/errors"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  CONDITIONS,
  MAX_PRODUCT_IMAGES,
  MAX_SPECS,
  PRODUCT_IMAGES_BUCKET,
  slugify,
  type Condition,
  type Spec,
} from "@/lib/catalog"

export interface ProductImage {
  path: string
  url: string
}

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
  slug?: string
  brand?: string
  condition?: Condition
  warrantyMonths?: number
  specs: Spec[]
  featured: boolean
  images: ProductImage[]
  createdAt: Date
  updatedAt: Date
}

type ProductRow = {
  id: string
  user_id: string
  name: string
  description: string | null
  sku: string | null
  price: number | string
  cost: number | string | null
  stock_quantity: number
  track_inventory: boolean
  is_public: boolean | null
  category: string | null
  slug: string | null
  brand: string | null
  condition: string | null
  warranty_months: number | null
  specs: unknown
  featured: boolean | null
  created_at: string
  updated_at: string
}

function toProduct(p: ProductRow, images: ProductImage[] = []): Product {
  return {
    id: p.id,
    userId: p.user_id,
    name: p.name,
    description: p.description ?? undefined,
    sku: p.sku ?? undefined,
    price: Number(p.price),
    cost: p.cost != null ? Number(p.cost) : undefined,
    stockQuantity: p.stock_quantity,
    trackInventory: p.track_inventory,
    isPublic: p.is_public || false,
    category: p.category ?? undefined,
    slug: p.slug ?? undefined,
    brand: p.brand ?? undefined,
    condition: CONDITIONS.includes(p.condition as Condition) ? (p.condition as Condition) : undefined,
    warrantyMonths: p.warranty_months ?? undefined,
    specs: Array.isArray(p.specs) ? (p.specs as Spec[]) : [],
    featured: !!p.featured,
    images,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
  }
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return { supabase, user }
}

export async function getProducts(): Promise<Product[]> {
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as ProductRow[]).map((p) => toProduct(p))
}

export async function getProduct(id: string): Promise<Product | null> {
  const { supabase, user } = await requireUser()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("user_id", user.id).single()
  if (error || !data) return null

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path, url")
    .eq("product_id", id)
    .order("position", { ascending: true })

  return toProduct(
    data as ProductRow,
    (images ?? []).map((i) => ({ path: i.storage_path as string, url: i.url as string })),
  )
}

// ─── Validación del formulario ───────────────────────────────────────

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null)

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? Number(v) : null))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Debe ser un número mayor o igual a 0")

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(200),
  description: optionalText(5000),
  sku: optionalText(80),
  category: optionalText(80),
  price: z
    .string()
    .trim()
    .min(1, "El precio es requerido")
    .transform(Number)
    .refine((v) => Number.isFinite(v) && v >= 0, "El precio debe ser un número mayor o igual a 0"),
  cost: optionalNumber,
  stockQuantity: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : 0))
    .refine((v) => Number.isInteger(v) && v >= 0, "El stock debe ser un número entero mayor o igual a 0"),
  trackInventory: z.string().optional().transform((v) => v !== "false"),
  isPublic: z.string().optional().transform((v) => v === "true" || v === "on"),
  featured: z.string().optional().transform((v) => v === "true" || v === "on"),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? slugify(v) : "")),
  brand: optionalText(80),
  condition: z
    .string()
    .optional()
    .transform((v) => (CONDITIONS.includes(v as Condition) ? (v as Condition) : null)),
  warrantyMonths: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= 120), "La garantía debe estar entre 0 y 120 meses"),
  specs: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return [] as Spec[]
      try {
        return JSON.parse(v) as unknown
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Especificaciones inválidas" })
        return z.NEVER
      }
    })
    .pipe(
      z
        .array(z.object({ label: z.string().trim().max(60), value: z.string().trim().max(200) }))
        .max(MAX_SPECS, `Máximo ${MAX_SPECS} especificaciones`)
        .transform((specs) => specs.filter((s) => s.label && s.value)),
    ),
  images: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return [] as string[]
      try {
        return JSON.parse(v) as unknown
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Imágenes inválidas" })
        return z.NEVER
      }
    })
    .pipe(z.array(z.string().max(300)).max(MAX_PRODUCT_IMAGES, `Máximo ${MAX_PRODUCT_IMAGES} fotos`)),
})

type ParsedProduct = z.infer<typeof productSchema>

function parseForm(formData: FormData): { data: ParsedProduct } | { error: string } {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""]),
  )
  const result = productSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0]?.message ?? "Datos inválidos" }
  return { data: result.data }
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  base: string,
  excludeId?: string,
) {
  const root = base || "producto"
  let query = supabase.from("products").select("slug").eq("user_id", userId).like("slug", `${root}%`)
  if (excludeId) query = query.neq("id", excludeId)
  const { data } = await query
  const taken = new Set((data ?? []).map((r) => r.slug as string))
  if (!taken.has(root)) return root
  for (let i = 2; ; i++) {
    const candidate = `${root}-${i}`
    if (!taken.has(candidate)) return candidate
  }
}

function toColumns(d: ParsedProduct) {
  return {
    name: d.name,
    description: d.description,
    sku: d.sku,
    price: d.price,
    cost: d.cost,
    stock_quantity: d.stockQuantity,
    track_inventory: d.trackInventory,
    is_public: d.isPublic,
    category: d.category,
    brand: d.brand,
    condition: d.condition,
    warranty_months: d.warrantyMonths,
    specs: d.specs,
    featured: d.featured,
  }
}

// Paths come from the browser, so only accept files inside this user's own folder.
async function syncImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  productId: string,
  paths: string[],
) {
  const prefix = `${userId}/`
  const clean = Array.from(new Set(paths)).filter((p) => p.startsWith(prefix) && !p.includes(".."))

  const { data: existing } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId)
  const removed = (existing ?? []).map((r) => r.storage_path as string).filter((p) => !clean.includes(p))

  const { error: delError } = await supabase.from("product_images").delete().eq("product_id", productId)
  if (delError) return delError.message

  if (clean.length > 0) {
    const rows = clean.map((path, position) => ({
      product_id: productId,
      user_id: userId,
      storage_path: path,
      url: supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl,
      position,
    }))
    const { error } = await supabase.from("product_images").insert(rows)
    if (error) return error.message
  }

  if (removed.length > 0) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(removed)
  }
  return null
}

function revalidateCatalog(slug?: string | null) {
  revalidatePath("/dashboard/products")
  revalidatePath("/catalogo")
  revalidatePath("/")
  if (slug) revalidatePath(`/catalogo/${slug}`)
}

export async function createProduct(formData: FormData) {
  const { supabase, user } = await requireUser()

  const parsed = parseForm(formData)
  if ("error" in parsed) return { error: parsed.error }
  const d = parsed.data

  const slug = await uniqueSlug(supabase, user.id, d.slug || slugify(d.name))

  const { data, error } = await supabase
    .from("products")
    .insert({ user_id: user.id, slug, ...toColumns(d) })
    .select("id")
    .single()

  if (error) return { error: friendlyError(error) }

  const imageError = await syncImages(supabase, user.id, data.id, d.images)
  if (imageError) return { error: `Producto guardado, pero falló al guardar las fotos: ${imageError}` }

  revalidateCatalog(slug)
  return { success: true, id: data.id }
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase, user } = await requireUser()

  const parsed = parseForm(formData)
  if ("error" in parsed) return { error: parsed.error }
  const d = parsed.data

  const { data: current } = await supabase.from("products").select("slug").eq("id", id).eq("user_id", user.id).single()
  if (!current) return { error: "Producto no encontrado" }

  const slug = await uniqueSlug(supabase, user.id, d.slug || slugify(d.name), id)

  const { error } = await supabase
    .from("products")
    .update({ slug, ...toColumns(d), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: friendlyError(error) }

  const imageError = await syncImages(supabase, user.id, id, d.images)
  if (imageError) return { error: `Producto guardado, pero falló al guardar las fotos: ${imageError}` }

  revalidateCatalog(slug)
  if (current.slug && current.slug !== slug) revalidatePath(`/catalogo/${current.slug}`)
  return { success: true }
}

export async function deleteProduct(id: string) {
  const { supabase, user } = await requireUser()

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id)
    .eq("user_id", user.id)

  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("slug")
    .maybeSingle()

  if (error) return { error: friendlyError(error) }

  const paths = (images ?? []).map((i) => i.storage_path as string)
  if (paths.length > 0) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths)

  revalidateCatalog(deleted?.slug)
  return { success: true }
}

// Removes files uploaded from the form that were never saved to a product.
export async function discardUploadedImages(paths: string[]) {
  const { supabase, user } = await requireUser()
  const prefix = `${user.id}/`
  const own = paths.filter((p) => p.startsWith(prefix) && !p.includes("..")).slice(0, MAX_PRODUCT_IMAGES * 2)
  if (own.length === 0) return { success: true }

  const { data: inUse } = await supabase.from("product_images").select("storage_path").in("storage_path", own)
  const used = new Set((inUse ?? []).map((r) => r.storage_path as string))
  const orphans = own.filter((p) => !used.has(p))
  if (orphans.length > 0) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(orphans)
  return { success: true }
}
