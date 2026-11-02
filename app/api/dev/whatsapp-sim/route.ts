import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/admin"
import { loadCatalog } from "@/lib/ai/catalog-tools"
import { openaiConfigured } from "@/lib/ai/openai"
import { simulate } from "@/lib/ai/simulation"

export const runtime = "nodejs"
export const maxDuration = 300

// Local only: runs the bot against the real catalog without WhatsApp. Used by scripts/whatsapp-sim.mjs.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "No disponible" }, { status: 404 })
  if (!openaiConfigured()) return NextResponse.json({ error: "Falta OPENAI_API_KEY en .env.local" }, { status: 400 })
  const { model, ids } = (await request.json().catch(() => ({}))) as { model?: string; ids?: string[] }
  const products = await loadCatalog(createServiceClient())
  const results = await simulate(products, model ?? process.env.OPENAI_MODEL ?? "gpt-6-luna", ids)
  return NextResponse.json({ model, results })
}
