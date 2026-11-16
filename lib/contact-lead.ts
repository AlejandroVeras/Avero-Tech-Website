import { z } from "zod"

// What the visitor can pick in "Servicio de interés". Keys are stored in Supabase; labels go to HubSpot.
export const LEAD_SERVICES = {
  web: "Página web",
  portal: "Portal o plataforma",
  seo: "Posicionamiento SEO",
  bot: "Chatbot para WhatsApp o web",
  ia: "IA para mi negocio",
  soporte: "Soporte técnico",
  sistemas: "Sistemas Avero (Inventario, Citas, Condominios)",
  equipos: "Equipos (compra de computadoras y accesorios)",
  otro: "Otro",
} as const

export type LeadService = keyof typeof LEAD_SERVICES

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export const contactLeadSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  email: z.string().trim().toLowerCase().email("Escribe un correo válido").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Escribe un teléfono o WhatsApp válido"),
  company: z.string().trim().max(120).optional().default(""),
  service: z.enum(Object.keys(LEAD_SERVICES) as [LeadService, ...LeadService[]], {
    errorMap: () => ({ message: "Elige el servicio que te interesa" }),
  }),
  message: z.string().trim().min(10, "Cuéntanos un poco más (al menos 10 caracteres)").max(4000),
  consent: z.literal(true, { errorMap: () => ({ message: "Acepta la política de privacidad para enviar el formulario" }) }),
  language: z.enum(["es", "en"]).default("es"),
  pageUri: z.string().trim().max(500).optional().default(""),
  pageName: z.string().trim().max(200).optional().default(""),
  utm: z
    .record(z.string().max(200))
    .optional()
    .default({})
    .transform((u) => Object.fromEntries(UTM_KEYS.filter((k) => u[k]).map((k) => [k, u[k]!]))),
  // Honeypot: hidden from people, bots tend to fill every field.
  website: z.string().max(0).optional(),
})

export type ContactLeadInput = z.input<typeof contactLeadSchema>
export type ContactLead = z.output<typeof contactLeadSchema>

// Flat shape (the project doesn't use strictNullChecks, so discriminated unions don't narrow).
export type ParseResult = { ok: boolean; lead?: ContactLead; spam?: boolean; error?: string }

export function parseContactLead(input: unknown): ParseResult {
  const parsed = contactLeadSchema.safeParse(input)
  if (parsed.success) return { ok: true, lead: parsed.data as ContactLead }
  if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: false, spam: true }
  return { ok: false, spam: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario" }
}

// Rate limits, checked against contact_leads of the last hour.
export const RATE_LIMITS = { perIp: 5, perEmail: 3, global: 60 } as const
