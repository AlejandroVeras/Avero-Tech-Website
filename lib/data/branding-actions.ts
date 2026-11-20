"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { friendlyError } from "@/lib/data/errors"
import { PRODUCT_IMAGES_BUCKET } from "@/lib/catalog"
import { DASHBOARD_WIDGETS, facebookPage, normalizeHex, socialHandle } from "@/lib/brand"

const MISSING_COLUMNS = "Esta opción todavía no está activa en el sistema. Escríbenos y la activamos."

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return { supabase, user }
}

function saveError(error: { code?: string; message?: string }) {
  if (error.code === "PGRST204" || error.code === "42703") return MISSING_COLUMNS
  return friendlyError(error)
}

async function revalidateStore(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("profiles").select("slug").eq("id", userId).maybeSingle()
  if (data?.slug) revalidatePath(`/t/${data.slug}`, "layout")
}

/** null goes back to the Avero blue. */
export async function saveBrandColor(color: string | null) {
  const { supabase, user } = await requireUser()
  const hex = color === null ? null : normalizeHex(color)
  if (color !== null && !hex) return { error: "Color inválido" }

  const { error } = await supabase.from("profiles").update({ brand_color: hex, updated_at: new Date().toISOString() }).eq("id", user.id)
  if (error) return { error: saveError(error) }

  revalidatePath("/dashboard", "layout")
  await revalidateStore(supabase, user.id)
  return { success: true }
}

const widgetIds = DASHBOARD_WIDGETS.map((w) => w.id) as [string, ...string[]]
const widgetsSchema = z.array(z.object({ id: z.enum(widgetIds), visible: z.boolean() })).max(DASHBOARD_WIDGETS.length)

export async function saveDashboardWidgets(widgets: { id: string; visible: boolean }[]) {
  const parsed = widgetsSchema.safeParse(widgets)
  if (!parsed.success) return { error: "Lista inválida" }
  const { supabase, user } = await requireUser()

  const { error } = await supabase
    .from("profiles")
    .update({ dashboard_widgets: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) return { error: saveError(error) }

  revalidatePath("/dashboard")
  return { success: true }
}

const optional = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((v) => v || null)

const appearanceSchema = z.object({
  hours: optional(200, "El horario puede tener hasta 200 caracteres"),
  address: optional(200, "La dirección puede tener hasta 200 caracteres"),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  featuredCategories: z.string().optional(),
  coverPath: z.string().max(300).optional(),
  removeCover: z.string().optional().transform((v) => v === "true"),
})

export async function saveStoreAppearance(formData: FormData) {
  const raw = Object.fromEntries(Array.from(formData.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""]))
  const parsed = appearanceSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const d = parsed.data

  const instagram = d.instagram?.trim() ? socialHandle(d.instagram, "instagram") : null
  if (d.instagram?.trim() && !instagram) return { error: "Revisa el usuario de Instagram (ej: @boutique.ana)" }
  const tiktok = d.tiktok?.trim() ? socialHandle(d.tiktok, "tiktok") : null
  if (d.tiktok?.trim() && !tiktok) return { error: "Revisa el usuario de TikTok (ej: @boutique.ana)" }
  const facebook = d.facebook?.trim() ? facebookPage(d.facebook) : null
  if (d.facebook?.trim() && !facebook) return { error: "Revisa la página de Facebook" }

  let featured: string[] = []
  try {
    const list = d.featuredCategories ? (JSON.parse(d.featuredCategories) as unknown) : []
    if (Array.isArray(list)) featured = [...new Set(list.filter((c): c is string => typeof c === "string").map((c) => c.trim().slice(0, 60)).filter(Boolean))]
  } catch {
    return { error: "Categorías inválidas" }
  }
  if (featured.length > 8) return { error: "Puedes destacar hasta 8 categorías" }

  const { supabase, user } = await requireUser()
  const update: Record<string, unknown> = {
    store_hours: d.hours,
    store_address: d.address,
    store_instagram: instagram,
    store_facebook: facebook,
    store_tiktok: tiktok,
    store_featured_categories: featured,
    updated_at: new Date().toISOString(),
  }

  // The cover lives next to the logo in the product images bucket, under the user's own folder.
  const ownPrefix = `${user.id}/`
  const bucketMarker = `/${PRODUCT_IMAGES_BUCKET}/`
  const { data: current } = await supabase.from("profiles").select("store_cover_url").eq("id", user.id).maybeSingle()
  const oldCoverPath = current?.store_cover_url?.includes(bucketMarker) ? (current.store_cover_url.split(bucketMarker)[1] ?? null) : null

  if (d.coverPath && d.coverPath.startsWith(ownPrefix) && !d.coverPath.includes("..")) {
    update.store_cover_url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(d.coverPath).data.publicUrl
  } else if (d.removeCover) {
    update.store_cover_url = null
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id)
  if (error) return { error: saveError(error) }

  if (oldCoverPath && oldCoverPath.startsWith(ownPrefix) && "store_cover_url" in update) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([oldCoverPath])
  }

  revalidatePath("/dashboard/tienda")
  await revalidateStore(supabase, user.id)
  return { success: true }
}
