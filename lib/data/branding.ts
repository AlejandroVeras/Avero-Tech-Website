import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_WIDGETS, normalizeHex, parseWidgets, type WidgetSetting } from "@/lib/brand"

export interface Branding {
  brandColor: string | null
  /** Color chosen for invoices, receipts and quotes; null = use the brand color. */
  documentColor: string | null
  widgets: WidgetSetting[]
}

export interface StoreAppearance {
  coverUrl?: string
  hours?: string
  address?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  featuredCategories: string[]
  /** Categories of the business's visible products, to pick the featured ones from. */
  categories: string[]
}

// Fails open: before DATABASE_BRANDING.sql runs every account keeps the Avero blue and the default home.
export const getBranding = cache(async (): Promise<Branding> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { brandColor: null, documentColor: null, widgets: DEFAULT_WIDGETS }

  const { data, error } = await supabase
    .from("profiles")
    .select("brand_color, document_color, dashboard_widgets")
    .eq("id", user.id)
    .maybeSingle()
  if (error || !data) return { brandColor: null, documentColor: null, widgets: DEFAULT_WIDGETS }
  return {
    brandColor: normalizeHex(data.brand_color),
    documentColor: normalizeHex(data.document_color),
    widgets: parseWidgets(data.dashboard_widgets),
  }
})

/** null until DATABASE_BRANDING.sql runs (the form explains it instead of failing on save). */
export async function getStoreAppearance(): Promise<StoreAppearance | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data, error }, { data: products }] = await Promise.all([
    supabase
      .from("profiles")
      .select("store_cover_url, store_hours, store_address, store_instagram, store_facebook, store_tiktok, store_featured_categories")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("products").select("category").eq("user_id", user.id).eq("is_public", true).not("category", "is", null),
  ])
  if (error || !data) return null

  const categories = [...new Set((products ?? []).map((p) => (p.category as string).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  )
  return {
    coverUrl: data.store_cover_url ?? undefined,
    hours: data.store_hours ?? undefined,
    address: data.store_address ?? undefined,
    instagram: data.store_instagram ?? undefined,
    facebook: data.store_facebook ?? undefined,
    tiktok: data.store_tiktok ?? undefined,
    featuredCategories: Array.isArray(data.store_featured_categories) ? data.store_featured_categories : [],
    categories,
  }
}

/** The color invoices, receipts and quotes are drawn with. */
export function documentAccent(b: Branding) {
  return b.documentColor ?? b.brandColor
}
