"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { friendlyError } from "@/lib/data/errors"
import { PRODUCT_IMAGES_BUCKET, normalizeWhatsapp, slugify } from "@/lib/catalog"

export interface MyStore {
  slug: string
  enabled: boolean
  whatsapp?: string
  description?: string
  logoUrl?: string
  businessName: string
  publicProducts: number
  ready: boolean
}

// Words that could be mistaken for official Avero pages.
const RESERVED_SLUGS = new Set(["admin", "avero", "averotech", "averotechnology", "soporte", "ayuda", "api", "dashboard", "login", "signup", "inventario", "citas", "condominios"])

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return { supabase, user }
}

export async function getMyStore(): Promise<MyStore | null> {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from("profiles")
    .select("business_name, slug, store_enabled, whatsapp_phone, store_description, logo_url")
    .eq("id", user.id)
    .maybeSingle()

  // Columns missing until DATABASE_TENANT_STORES.sql runs.
  if (error || !data) return null

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_public", true)

  return {
    slug: data.slug ?? slugify(data.business_name ?? ""),
    enabled: !!data.store_enabled,
    whatsapp: data.whatsapp_phone ?? undefined,
    description: data.store_description ?? undefined,
    logoUrl: data.logo_url ?? undefined,
    businessName: data.business_name ?? "Mi negocio",
    publicProducts: count ?? 0,
    ready: true,
  }
}

const storeSchema = z.object({
  enabled: z.string().optional().transform((v) => v === "true"),
  slug: z
    .string()
    .trim()
    .transform((v) => slugify(v))
    .refine((v) => v.length >= 3, "La dirección debe tener al menos 3 letras o números")
    .refine((v) => v.length <= 60, "La dirección es demasiado larga")
    .refine((v) => !RESERVED_SLUGS.has(v), "Esa dirección está reservada, elige otra"),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null
      const normalized = normalizeWhatsapp(v)
      if (!normalized) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Escribe un número de WhatsApp válido, por ejemplo 829-555-1234" })
        return z.NEVER
      }
      return normalized
    }),
  description: z
    .string()
    .trim()
    .max(300, "La descripción puede tener hasta 300 caracteres")
    .optional()
    .transform((v) => v || null),
  logoPath: z.string().max(300).optional(),
  removeLogo: z.string().optional().transform((v) => v === "true"),
})

export async function updateMyStore(formData: FormData) {
  const { supabase, user } = await requireUser()

  const raw = Object.fromEntries(Array.from(formData.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""]))
  const parsed = storeSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const d = parsed.data

  if (d.enabled && !d.whatsapp) {
    return { error: "Agrega un número de WhatsApp para que tus clientes puedan escribirte antes de activar la tienda" }
  }

  const { data: taken } = await supabase.from("public_stores").select("id").eq("slug", d.slug).neq("id", user.id).maybeSingle()
  if (taken) return { error: "Esa dirección ya la usa otro negocio, prueba con otra" }

  const { data: current } = await supabase.from("profiles").select("slug, logo_url").eq("id", user.id).single()

  const update: Record<string, unknown> = {
    slug: d.slug,
    store_enabled: d.enabled,
    whatsapp_phone: d.whatsapp,
    store_description: d.description,
    updated_at: new Date().toISOString(),
  }

  let oldLogoPath: string | null = null
  const ownPrefix = `${user.id}/`
  const bucketMarker = `/${PRODUCT_IMAGES_BUCKET}/`
  if (current?.logo_url?.includes(bucketMarker)) {
    oldLogoPath = current.logo_url.split(bucketMarker)[1] ?? null
  }

  if (d.logoPath && d.logoPath.startsWith(ownPrefix) && !d.logoPath.includes("..")) {
    update.logo_url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(d.logoPath).data.publicUrl
  } else if (d.removeLogo) {
    update.logo_url = null
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id)
  if (error) {
    if (error.code === "23505") return { error: "Esa dirección ya la usa otro negocio, prueba con otra" }
    return { error: friendlyError(error) }
  }

  if (oldLogoPath && oldLogoPath.startsWith(ownPrefix) && "logo_url" in update) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([oldLogoPath])
  }

  revalidatePath("/dashboard/tienda")
  revalidatePath(`/t/${d.slug}`, "layout")
  if (current?.slug && current.slug !== d.slug) revalidatePath(`/t/${current.slug}`, "layout")
  return { success: true, slug: d.slug }
}
