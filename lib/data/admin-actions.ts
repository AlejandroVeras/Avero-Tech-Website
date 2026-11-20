"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isPlatformAdmin } from "@/lib/data/access"
import { slugify } from "@/lib/catalog"
import { createServiceClient } from "@/lib/supabase/admin"
import { accessToSubscription } from "@/lib/admin"
import { checkPassword, isStrongPassword, weakPasswordMessage } from "@/lib/password-policy"

type Result = { error?: string; success?: boolean; id?: string }

async function adminClient() {
  if (!(await isPlatformAdmin())) throw new Error("Solo administradores de plataforma")
  return createClient()
}

function formEntries(formData: FormData) {
  return Object.fromEntries(Array.from(formData.entries()).map(([k, v]) => [k, typeof v === "string" ? v : ""]))
}

const uuid = z.string().uuid("Cuenta inválida")

const paymentSchema = z.object({
  account: uuid,
  plan: z.enum(["monthly", "annual", "courtesy"], { message: "Elige un plan" }),
  months: z.coerce.number().int().min(1, "Mínimo 1 mes").max(36, "Máximo 36 meses"),
  amount: z.coerce.number().min(0, "El monto no puede ser negativo"),
  currency: z.enum(["USD", "DOP"]),
  method: z.string().trim().min(1, "Indica el método de pago").max(60),
  reference: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
})

export async function recordPayment(formData: FormData): Promise<Result> {
  const parsed = paymentSchema.safeParse(formEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const d = parsed.data
  const supabase = await adminClient()
  const { error } = await supabase.rpc("admin_record_payment", {
    account: d.account,
    months: d.months,
    plan: d.plan,
    amount: d.amount,
    currency: d.currency,
    method: d.method,
    reference: d.reference ?? null,
    notes: d.notes ?? null,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

const statusSchema = z.object({
  account: uuid,
  action: z.enum(["suspend", "reactivate", "courtesy"]),
})

export async function changeSubscription(formData: FormData): Promise<Result> {
  const parsed = statusSchema.safeParse(formEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const { account, action } = parsed.data
  const supabase = await adminClient()

  const args: Record<string, string | boolean | null> =
    action === "suspend"
      ? { account, new_status: "inactive" }
      : action === "reactivate"
        ? { account, new_status: "active" }
        : { account, new_status: "active", new_plan: "courtesy", new_end: null, keep_end: false }

  const { error } = await supabase.rpc("admin_set_subscription", args)
  if (error) return { error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

const featureSchema = z.object({
  icon: z.string().trim().max(40).optional(),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240),
})

const planSchema = z.object({
  id: z.string().trim().max(40).optional(),
  name: z.string().trim().min(1, "Cada plan necesita nombre").max(80),
  description: z.string().trim().max(200).optional(),
  monthly_usd: z.coerce.number().min(0, "Precio mensual inválido"),
  annual_usd: z.coerce.number().min(0).optional(),
  features: z.array(z.string().trim().min(1).max(120)).max(20),
})

const jsonField = <T extends z.ZodTypeAny>(schema: T, label: string) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      try {
        return v ? (JSON.parse(v) as unknown) : []
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} inválidos` })
        return z.NEVER
      }
    })
    .pipe(schema)

const systemSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "El nombre es requerido").max(80),
  slug: z
    .string()
    .trim()
    .transform((v) => slugify(v))
    .refine((v) => v.length >= 2, "La dirección es requerida"),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().max(1200).optional(),
  audience: z.string().trim().max(400).optional(),
  status: z.enum(["disponible", "proximamente"]),
  published: z.string().optional().transform((v) => v === "true"),
  sortOrder: z.coerce.number().int().min(0).max(999),
  trialDays: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 120), "Los días gratis van de 1 a 120"),
  features: jsonField(z.array(featureSchema).max(24, "Máximo 24 funciones"), "Funciones"),
  plans: jsonField(z.array(planSchema).max(4, "Máximo 4 planes"), "Planes"),
  externalUrl: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v), "El enlace externo debe empezar con https://")
    .optional(),
  hadExternalUrl: z.string().optional(),
})

export async function saveSystem(formData: FormData): Promise<Result> {
  const parsed = systemSchema.safeParse(formEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const d = parsed.data
  if (d.status === "disponible" && d.published && d.plans.length === 0) {
    return { error: "Un sistema disponible y publicado necesita al menos un plan" }
  }
  const supabase = await adminClient()

  const row = {
    name: d.name,
    slug: d.slug,
    tagline: d.tagline || null,
    description: d.description || null,
    audience: d.audience || null,
    status: d.status,
    published: d.published,
    sort_order: d.sortOrder,
    trial_days: d.trialDays,
    features: d.features,
    plans: d.plans.map((p, i) => ({ ...p, id: p.id || slugify(p.name) || `plan-${i + 1}` })),
    updated_at: new Date().toISOString(),
    // Only sent when used, so editing systems keeps working before DATABASE_EXTERNAL_SYSTEMS.sql runs.
    ...(d.externalUrl || d.hadExternalUrl === "true" ? { external_url: d.externalUrl || null } : {}),
  }

  const { data, error } = d.id
    ? await supabase.from("systems").update(row).eq("id", d.id).select("id").single()
    : await supabase.from("systems").insert(row).select("id").single()

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un sistema con esa dirección" }
    return { error: error.message }
  }
  revalidatePath("/admin/sistemas")
  revalidatePath("/sistemas", "layout")
  revalidatePath("/precios")
  return { success: true, id: data.id }
}

export async function updateTrialDays(formData: FormData): Promise<Result> {
  const parsed = z.coerce.number().int().min(1, "Mínimo 1 día").max(90, "Máximo 90 días").safeParse(formData.get("trialDays"))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Valor inválido" }
  const supabase = await adminClient()
  const { error } = await supabase
    .from("platform_settings")
    .update({ value: parsed.data, updated_at: new Date().toISOString() })
    .eq("key", "trial_days")
  if (error) return { error: error.message }
  revalidatePath("/admin/ajustes")
  revalidatePath("/sistemas", "layout")
  revalidatePath("/precios")
  revalidatePath("/signup")
  return { success: true }
}

// ─── Acceso con fecha, y cuentas creadas por el administrador ─────────

const accessSchema = z.object({
  kind: z.enum(["paid", "courtesy", "trial"], { message: "Elige el tipo de acceso" }),
  plan: z.enum(["monthly", "annual"]).optional(),
  until: z.string().trim().optional(),
})

export async function setAccess(formData: FormData): Promise<Result> {
  const parsed = accessSchema.extend({ account: uuid }).safeParse(formEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const mapped = accessToSubscription(parsed.data.account, parsed.data)
  if ("error" in mapped) return { error: mapped.error }

  const supabase = await adminClient()
  const { error } = await supabase.rpc("admin_set_subscription", mapped.args)
  if (error) return { error: error.message }
  revalidatePath("/admin", "layout")
  return { success: true }
}

const newAccountSchema = accessSchema.extend({
  businessName: z.string().trim().min(2, "Escribe el nombre del negocio").max(120),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(200),
  password: z.string().min(1, "Escribe una contraseña").max(200),
})

/**
 * Creates the login for a business (already confirmed, it can enter right away) and gives it
 * the access chosen here, so it skips the PayPal activation screen. The trigger that runs on
 * every new user creates its profile; the first time it enters it sees the welcome questions.
 */
export async function createAccount(formData: FormData): Promise<Result & { warning?: string }> {
  const parsed = newAccountSchema.safeParse(formEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" }
  const d = parsed.data

  const checks = checkPassword(d.password, { email: d.email, name: d.businessName })
  if (!isStrongPassword(checks)) return { error: weakPasswordMessage(checks) }

  // Validate the access before creating anything.
  const preview = accessToSubscription("00000000-0000-0000-0000-000000000000", d)
  if ("error" in preview) return { error: preview.error }

  const supabase = await adminClient() // throws unless the current user is a platform admin

  let service
  try {
    service = createServiceClient()
  } catch {
    return { error: "Falta SUPABASE_SECRET_KEY en el servidor; sin ella no se pueden crear usuarios." }
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { business_name: d.businessName },
  })
  if (createError || !created.user) {
    const msg = createError?.message ?? ""
    if (/already|registered|exists/i.test(msg)) return { error: "Ya existe una cuenta con ese correo." }
    return { error: msg || "No se pudo crear el usuario." }
  }

  const mapped = accessToSubscription(created.user.id, d)
  if ("error" in mapped) return { error: mapped.error }
  const { error } = await supabase.rpc("admin_set_subscription", mapped.args)

  revalidatePath("/admin", "layout")
  if (error) {
    return {
      success: true,
      id: created.user.id,
      warning: `El usuario se creó, pero no se pudo guardar el acceso (${error.message}). Ponlo desde su ficha.`,
    }
  }
  return { success: true, id: created.user.id }
}
