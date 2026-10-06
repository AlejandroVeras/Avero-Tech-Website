import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_TRIAL_DAYS, FALLBACK_GESTION, toSystem, type SaasSystem } from "@/lib/systems"

export const getPublishedSystems = cache(async (): Promise<SaasSystem[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("systems")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("getPublishedSystems:", error.message)
    return [FALLBACK_GESTION]
  }
  return data.length > 0 ? data.map(toSystem) : [FALLBACK_GESTION]
})

export const getPublishedSystem = cache(async (slug: string): Promise<SaasSystem | null> => {
  const systems = await getPublishedSystems()
  return systems.find((s) => s.slug === slug) ?? null
})

export const getTrialDays = cache(async (): Promise<number> => {
  const supabase = await createClient()
  const { data } = await supabase.from("platform_settings").select("value").eq("key", "trial_days").maybeSingle()
  const days = Number(data?.value)
  return Number.isInteger(days) && days > 0 ? days : DEFAULT_TRIAL_DAYS
})
