"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isPlatformAdmin } from "@/lib/data/access"
import { slugify } from "@/lib/catalog"

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
  features: jsonField(z.array(featureSchema).max(24, "Máximo 24 funciones"), "Funciones"),
  plans: jsonField(z.array(planSchema).max(4, "Máximo 4 planes"), "Planes"),
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
    features: d.features,
    plans: d.plans.map((p, i) => ({ ...p, id: p.id || slugify(p.name) || `plan-${i + 1}` })),
    updated_at: new Date().toISOString(),
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
