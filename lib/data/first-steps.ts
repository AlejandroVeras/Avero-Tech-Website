import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Features } from "@/lib/business-setup"

export interface FirstStep {
  id: string
  title: string
  hint: string
  href: string
  cta: string
  done: boolean
}

async function hasRows(table: string, userId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId)
  return (count ?? 0) > 0
}

/** The getting-started checklist on Inicio; each step ticks itself once the data exists. */
export async function getFirstSteps(features: Features): Promise<FirstStep[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const [{ data: profile }, products, sales, customers] = await Promise.all([
    supabase.from("profiles").select("logo_url, phone, store_enabled").eq("id", user.id).maybeSingle(),
    hasRows("products", user.id),
    hasRows("invoices", user.id),
    features.customers && !features.quickSale ? hasRows("customers", user.id) : Promise.resolve(true),
  ])
  const p = (profile ?? {}) as { logo_url?: string | null; phone?: string | null; store_enabled?: boolean | null }

  const steps: FirstStep[] = [
    {
      id: "business",
      title: "Pon el logo y los datos de tu negocio",
      hint: "Salen en tus facturas, cotizaciones y en tu tienda en línea.",
      href: "/dashboard/settings",
      cta: "Completar datos",
      done: !!(p.logo_url || p.phone),
    },
    {
      id: "product",
      title: "Agrega tu primer producto",
      hint: "Nombre, precio y cuántos tienes. Lo demás es opcional.",
      href: "/dashboard/products/new",
      cta: "Agregar producto",
      done: products,
    },
  ]
  if (features.customers && !features.quickSale) {
    steps.push({
      id: "customer",
      title: "Registra un cliente",
      hint: "Para facturarle con su nombre o RNC y llevar lo que te debe.",
      href: "/dashboard/customers/new",
      cta: "Agregar cliente",
      done: customers,
    })
  }
  steps.push(
    {
      id: "sale",
      title: features.quickSale ? "Haz tu primera venta" : "Haz tu primera factura",
      hint: features.quickSale ? "Busca el producto, pon la cantidad y cobra. El recibo sale solo." : "Elige el cliente y los productos; el PDF sale con tu logo.",
      href: features.quickSale ? "/dashboard/vender" : "/dashboard/invoices/new",
      cta: features.quickSale ? "Ir a Vender" : "Crear factura",
      done: sales,
    },
    {
      id: "store",
      title: "Activa tu tienda en línea",
      hint: "Un enlace con tus productos para compartir por WhatsApp e Instagram.",
      href: "/dashboard/tienda",
      cta: "Ver mi tienda",
      done: !!p.store_enabled,
    },
  )
  return steps
}
