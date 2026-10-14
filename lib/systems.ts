export type SystemStatus = "disponible" | "proximamente"

export interface SystemFeature {
  icon?: string
  title: string
  description: string
}

export interface SystemPlan {
  id: string
  name: string
  description?: string
  monthly_usd: number
  annual_usd?: number
  features: string[]
}

export interface SaasSystem {
  id: string
  slug: string
  name: string
  tagline?: string
  description?: string
  audience?: string
  features: SystemFeature[]
  plans: SystemPlan[]
  status: SystemStatus
  published: boolean
  sortOrder: number
  // Free days before the first charge; falls back to the platform-wide setting.
  trialDays?: number
  // Systems that live on their own domain (e.g. condominios.averotechnology.com) link out instead of /sistemas/[slug].
  externalUrl?: string
}

// A plan with no monthly price is sold only by the year.
export function isAnnualOnly(plan: Pick<SystemPlan, "monthly_usd" | "annual_usd">) {
  return !plan.monthly_usd && !!plan.annual_usd
}

export function systemHref(system: Pick<SaasSystem, "slug" | "externalUrl">) {
  return system.externalUrl ?? `/sistemas/${system.slug}`
}

export const DEFAULT_TRIAL_DAYS = 30

// Mirrors the seed row in DATABASE_SYSTEMS_UPDATE.sql; used only if the table can't be read.
export const FALLBACK_GESTION: SaasSystem = {
  id: "gestion",
  slug: "gestion",
  name: "Sistema de gestión",
  tagline: "Inventario, ventas a crédito, facturas y tu catálogo en línea, en un solo lugar.",
  description:
    "Deja la libreta y el Excel. Controla lo que tienes, lo que vendes, lo que te deben y lo que gastas, desde el navegador del celular o la computadora, sin instalar nada.",
  audience:
    "Colmados, tiendas de celulares y accesorios, ferreterías, boutiques y pequeños negocios en República Dominicana.",
  features: [
    { icon: "package", title: "Inventario", description: "Productos, precios y existencias. El stock baja solo cuando facturas." },
    { icon: "credit-card", title: "Ventas a crédito", description: "Sabe cuánto te debe cada cliente y registra cada abono." },
    { icon: "file-text", title: "Facturas y cotizaciones", description: "En PDF, con ITBIS y RNC, listas para enviar por WhatsApp." },
    { icon: "store", title: "Tu catálogo en línea", description: "Un link con tus productos para mandarle a tus clientes." },
    { icon: "receipt", title: "Gastos", description: "Registra en qué se va el dinero del negocio." },
    { icon: "bar-chart", title: "Reportes", description: "Ingresos, gastos y ganancia de cada mes." },
    { icon: "users", title: "Clientes", description: "Contactos e historial de compras de cada cliente." },
    { icon: "ticket", title: "Tickets de soporte", description: "Da seguimiento a reparaciones y solicitudes de tus clientes." },
  ],
  plans: [
    {
      id: "profesional",
      name: "Plan Profesional",
      description: "Todo lo que necesitas para administrar tu negocio",
      monthly_usd: 12,
      annual_usd: 120,
      features: [
        "Inventario con control de stock",
        "Ventas a crédito y cobros",
        "Facturas y cotizaciones con ITBIS",
        "Catálogo en línea para tus clientes",
        "Clientes, gastos y reportes",
        "Tickets de soporte",
        "Acceso desde el celular o la computadora",
      ],
    },
  ],
  status: "disponible",
  published: true,
  sortOrder: 0,
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export function toSystem(row: Record<string, unknown>): SaasSystem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    tagline: (row.tagline as string | null) ?? undefined,
    description: (row.description as string | null) ?? undefined,
    audience: (row.audience as string | null) ?? undefined,
    features: asArray(row.features).filter(
      (f): f is SystemFeature => !!f && typeof (f as SystemFeature).title === "string",
    ),
    plans: asArray(row.plans)
      .filter((p): p is SystemPlan => !!p && typeof (p as SystemPlan).name === "string")
      .map((p) => ({
        ...p,
        monthly_usd: Number(p.monthly_usd),
        annual_usd: p.annual_usd != null ? Number(p.annual_usd) : undefined,
        features: asArray(p.features).filter((f): f is string => typeof f === "string"),
      })),
    status: row.status === "disponible" ? "disponible" : "proximamente",
    published: !!row.published,
    sortOrder: Number(row.sort_order ?? 0),
    trialDays: Number.isInteger(row.trial_days) && Number(row.trial_days) > 0 ? Number(row.trial_days) : undefined,
    externalUrl: typeof row.external_url === "string" && row.external_url.startsWith("https://") ? row.external_url : undefined,
  }
}
