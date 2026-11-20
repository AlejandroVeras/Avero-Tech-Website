import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { LEGACY_SETUP, parseSetupRow, productFormFor, type BusinessSetup } from "@/lib/business-setup"

// Fails open like getAccess(): before DATABASE_BUSINESS_SETUP.sql runs, or if the row can't be
// read, every account behaves exactly as it did before (LEGACY_SETUP).
export const getBusinessSetup = cache(async (): Promise<BusinessSetup> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return LEGACY_SETUP

  const { data, error } = await supabase
    .from("profiles")
    .select("business_type, sales_mode, sells_on_credit, itbis_mode, setup_completed_at, is_store_owner, enabled_tools")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) return LEGACY_SETUP
  return parseSetupRow(data)
})

/** What the product form needs: fields for this kind of business and the public catalog address. */
export async function getProductFormSettings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const [setup, { data }] = await Promise.all([
    getBusinessSetup(),
    user ? supabase.from("profiles").select("slug").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ])
  const slug = (data as { slug?: string | null } | null)?.slug
  return {
    config: productFormFor(setup.businessType),
    catalogPrefix: slug ? `/t/${slug}/` : "/t/tu-tienda/",
  }
}
