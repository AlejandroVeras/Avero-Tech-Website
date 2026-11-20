"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isBusinessType, isItbisMode, isSalesMode, parseTools, suggestedFeatures, TOOL_KEYS, type Features } from "@/lib/business-setup"
import { getBusinessSetup } from "@/lib/data/business-setup"

export async function saveBusinessSetup(input: {
  businessType: string | null
  salesMode: string | null
  sellsOnCredit: boolean | null
  itbisMode: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  if (input.businessType !== null && !isBusinessType(input.businessType)) return { error: "Tipo de negocio no válido" }
  if (input.salesMode !== null && !isSalesMode(input.salesMode)) return { error: "Forma de venta no válida" }
  if (!isItbisMode(input.itbisMode)) return { error: "Opción de ITBIS no válida" }

  const { error } = await supabase
    .from("profiles")
    .update({
      business_type: input.businessType,
      sales_mode: input.salesMode,
      sells_on_credit: typeof input.sellsOnCredit === "boolean" ? input.sellsOnCredit : null,
      itbis_mode: input.itbisMode,
      setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error saving business setup:", error)
    return { error: "No pudimos guardar las opciones. Intenta de nuevo." }
  }

  revalidatePath("/dashboard", "layout")
  return { success: true }
}

/** "Responder después": the welcome screen stops showing and nothing else changes. */
export async function skipBusinessSetup() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const { error } = await supabase
    .from("profiles")
    .update({ setup_completed_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) return { error: "No pudimos guardar. Intenta de nuevo." }
  revalidatePath("/dashboard", "layout")
  return { success: true }
}

/** Configuración → Herramientas: keeps only the switches that differ from what the answers suggest. */
export async function saveTools(input: Partial<Features>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const wanted = parseTools(input)
  const suggested = suggestedFeatures(await getBusinessSetup())
  const diff: Partial<Features> = {}
  for (const k of TOOL_KEYS) {
    if (typeof wanted[k] === "boolean" && wanted[k] !== suggested[k]) diff[k] = wanted[k]
  }

  const { error } = await supabase
    .from("profiles")
    .update({ enabled_tools: Object.keys(diff).length ? diff : null, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (error) {
    console.error("Error saving tools:", error)
    return { error: "No pudimos guardar las herramientas. Intenta de nuevo." }
  }
  revalidatePath("/dashboard", "layout")
  return { success: true }
}
