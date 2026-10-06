import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type AccessState =
  | { kind: "active"; endsAt: Date | null }
  | { kind: "trialing"; endsAt: Date; daysLeft: number }
  | { kind: "expired"; endsAt: Date | null; wasTrial: boolean }
  | { kind: "unknown" }

// Mirrors public.account_has_access() in DATABASE_SYSTEMS_UPDATE.sql, which is what actually
// enforces read-only mode. Fails open: an unreadable or missing subscription never blocks the UI.
export const getAccess = cache(async (): Promise<AccessState> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: "unknown" }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan_id, current_period_end, systems!inner(slug)")
    .eq("user_id", user.id)
    .eq("systems.slug", "gestion")
    .maybeSingle()

  if (error || !data) return { kind: "unknown" }

  const endsAt = data.current_period_end ? new Date(data.current_period_end) : null
  const notExpired = !endsAt || endsAt.getTime() > Date.now()

  if (data.status === "trialing" && endsAt && notExpired) {
    const daysLeft = Math.max(1, Math.ceil((endsAt.getTime() - Date.now()) / 86_400_000))
    return { kind: "trialing", endsAt, daysLeft }
  }
  if ((data.status === "active" || data.status === "trialing") && notExpired) {
    return { kind: "active", endsAt }
  }
  return { kind: "expired", endsAt, wasTrial: data.plan_id === "trial" }
})

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle()
  return !!data
}
