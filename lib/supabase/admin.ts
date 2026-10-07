import "server-only"

import { createClient } from "@supabase/supabase-js"

// Bypasses RLS. Only for server code with no user session (payment webhooks).
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY
  if (!url || !key) throw new Error("Falta SUPABASE_SECRET_KEY en el servidor")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
