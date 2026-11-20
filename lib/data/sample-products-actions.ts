"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { sampleProductsFor } from "@/lib/sample-products"

async function me() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

/** "Probar con productos de ejemplo": loads a few products of this kind of business, marked as samples. */
export async function addSampleProducts() {
  const { supabase, user } = await me()
  if (!user) return { error: "No autorizado" }
  const setup = await getBusinessSetup()
  const stamp = Date.now().toString(36)
  const rows = sampleProductsFor(setup.businessType).map((p, i) => ({
    user_id: user.id,
    slug: `ejemplo-${stamp}-${i + 1}`,
    name: p.name,
    category: p.category,
    price: p.price,
    cost: p.cost,
    stock_quantity: p.stock,
    track_inventory: p.stock > 0,
    is_public: false,
    is_sample: true,
  }))
  const { error } = await supabase.from("products").insert(rows)
  if (error) {
    console.error("addSampleProducts:", error)
    return { error: "No pudimos cargar los ejemplos. Intenta de nuevo." }
  }
  revalidatePath("/dashboard", "layout")
  return { success: true, count: rows.length }
}

/** Deletes every sample product of this business; ones already used in a sale stay, unmarked. */
export async function removeSampleProducts() {
  const { supabase, user } = await me()
  if (!user) return { error: "No autorizado" }
  const { data } = await supabase.from("products").select("id").eq("user_id", user.id).eq("is_sample", true)
  let kept = 0
  for (const { id } of data ?? []) {
    const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id)
    if (error) {
      kept++
      await supabase.from("products").update({ is_sample: false }).eq("id", id).eq("user_id", user.id)
    }
  }
  revalidatePath("/dashboard", "layout")
  return { success: true, kept }
}
