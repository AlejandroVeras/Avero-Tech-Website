"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  email: z.string().trim().email("Escribe un correo válido").max(200),
  phone: z.string().trim().max(40).optional(),
  problemType: z.enum(["hardware", "software", "network", "server", "security", "other"]),
  description: z.string().trim().min(10, "Describe el problema con un poco más de detalle").max(4000),
  // Honeypot: hidden from people, bots tend to fill every field.
  website: z.string().max(0).optional(),
})

export type SupportResult = { ticketRef?: string; error?: string; saved: boolean }

export async function submitSupportRequest(input: z.input<typeof schema>): Promise<SupportResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { saved: false }
    return { saved: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario" }
  }
  const d = parsed.data
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("submit_support_request", {
    p_name: d.name,
    p_email: d.email,
    p_phone: d.phone ?? null,
    p_problem_type: d.problemType,
    p_description: d.description,
  })

  if (error) {
    // 22023 = invalid data, 54000 = rate limit; both carry a message meant for the visitor.
    if (error.code === "22023" || error.code === "54000") return { saved: false, error: error.message }
    console.error("submit_support_request:", error.message)
    return { saved: false }
  }
  return { saved: true, ticketRef: String(data).slice(0, 8).toUpperCase() }
}
