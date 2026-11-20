"use server"

import { friendlyError } from "@/lib/data/errors"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isItbisMode } from "@/lib/business-setup"
import { WALK_IN_CUSTOMER, changeDue, computeSaleTotals } from "@/lib/pos"

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"

export interface InvoiceItem {
  id: string
  invoiceId: string
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  /** Product cost when it was sold (DATABASE_PROFIT.sql); older lines don't have it. */
  unitCost?: number
}

export interface Invoice {
  id: string
  userId: string
  customerId?: string
  customerName: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  status: InvoiceStatus
  subtotal: number
  discount: number
  itbis: number
  total: number
  applyFinancing: boolean
  notes?: string
  /** cash | card | transfer — only sales made from Vender have it. */
  paymentMethod?: string
  amountReceived?: number
  /** The ITBIS is part of the tag price: total = subtotal − discount. */
  itbisIncluded: boolean
  /** "pos" for sales made from Vender. */
  source?: string
  items: InvoiceItem[]
  createdAt: Date
  updatedAt: Date
}

// Función auxiliar para actualizar inventario de forma segura
async function updateProductStock(supabase: Awaited<ReturnType<typeof createClient>>, productId: string, quantityChange: number) {
  // quantityChange negativo para restar (venta), positivo para devolver (anulación/borrado)

  // Una sola operación en la base de datos (DATABASE_BUSINESS_SETUP.sql): dos ventas al mismo
  // tiempo no se pisan. Solo toca productos con track_inventory.
  const { error: rpcError } = await supabase.rpc("adjust_product_stock", {
    p_product_id: productId,
    p_delta: quantityChange,
  })
  if (!rpcError) return

  // Antes de correr el SQL la función no existe: leer y escribir como antes.
  const { data: product, error } = await supabase
    .from("products")
    .select("track_inventory, stock_quantity")
    .eq("id", productId)
    .single()

  if (error || !product) return // Si no existe, ignorar

  if (product.track_inventory) {
    // Selling more than what is on hand leaves 0, never a negative count.
    const newStock = Math.max(0, (product.stock_quantity || 0) + quantityChange)

    await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", productId)
  }
}

async function nextInvoiceNumber(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const match = lastInvoice?.invoice_number?.match(/INV-(\d+)/)
  const next = match ? parseInt(match[1]) + 1 : 1
  return `INV-${String(next).padStart(4, "0")}`
}

type ItemRow = {
  invoice_id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
  unit_cost?: number | null
}

/** Current cost of each product, to store with the sale so profit stays right if the cost changes later. */
async function productCosts(supabase: Awaited<ReturnType<typeof createClient>>, productIds: string[]) {
  const ids = [...new Set(productIds.filter(Boolean))]
  if (ids.length === 0) return new Map<string, number | null>()
  const { data } = await supabase.from("products").select("id, cost").in("id", ids)
  return new Map((data ?? []).map((p) => [p.id as string, p.cost != null ? Number(p.cost) : null]))
}

/** Inserts invoice lines; before DATABASE_PROFIT.sql runs, retries without unit_cost. */
async function insertItems(supabase: Awaited<ReturnType<typeof createClient>>, rows: ItemRow[]) {
  const first = await supabase.from("invoice_items").insert(rows)
  if (first.error && (first.error.code === "PGRST204" || first.error.code === "42703")) {
    const withoutCost = rows.map((row) => {
      const copy = { ...row }
      delete copy.unit_cost
      return copy
    })
    return supabase.from("invoice_items").insert(withoutCost)
  }
  return first
}

// Función auxiliar para actualizar financiamiento del cliente
async function updateCustomerFinancing(supabase: Awaited<ReturnType<typeof createClient>>, customerId: string, amountChange: number) {
  // amountChange positivo para aumentar deuda, negativo para disminuir
  
  // 1. Obtener cliente actual
  const { data: customer, error } = await supabase
    .from("customers")
    .select("financing_available, financing_limit, financing_used")
    .eq("id", customerId)
    .single()

  if (error || !customer) return false // Si no existe, ignorar
  
  // 2. Si tiene financiamiento disponible, actualizar
  if (customer.financing_available) {
    const newFinancingUsed = (customer.financing_used || 0) + amountChange
    const totalAvailable = customer.financing_limit || 0
    
    // Validar que no exceda el límite
    if (newFinancingUsed <= totalAvailable && newFinancingUsed >= 0) {
      const { error: updateError } = await supabase
        .from("customers")
        .update({ financing_used: newFinancingUsed })
        .eq("id", customerId)
      
      return !updateError
    }
  }
  
  return true // Devolver true si el cliente no tiene financiamiento o la operación fue exitosa
}

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: invoicesData, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (invoicesError) throw invoicesError
  if (!invoicesData || invoicesData.length === 0) return []

  const invoiceIds = invoicesData.map((inv) => inv.id)
  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .in("invoice_id", invoiceIds)

  if (itemsError) throw itemsError

  return invoicesData.map((inv) => ({
    id: inv.id,
    userId: inv.user_id,
    customerId: inv.customer_id,
    customerName: inv.customer_name || "",
    invoiceNumber: inv.invoice_number,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    status: inv.status as InvoiceStatus,
    subtotal: Number(inv.subtotal),
    discount: Number(inv.discount || 0),
    itbis: Number(inv.itbis),
    total: Number(inv.total),
    applyFinancing: Boolean(inv.apply_financing),
    notes: inv.notes,
    paymentMethod: inv.payment_method ?? undefined,
    amountReceived: inv.amount_received != null ? Number(inv.amount_received) : undefined,
    itbisIncluded: Boolean(inv.itbis_included),
    source: inv.source ?? undefined,
    items: (itemsData || [])
      .filter((item) => item.invoice_id === inv.id)
      .map((item) => ({
        id: item.id,
        invoiceId: item.invoice_id,
        productId: item.product_id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        total: Number(item.total),
        unitCost: item.unit_cost != null ? Number(item.unit_cost) : undefined,
      })),
    createdAt: new Date(inv.created_at),
    updatedAt: new Date(inv.updated_at),
  }))
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (invoiceError || !invoiceData) return null

  const { data: itemsData, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", id)

  if (itemsError) throw itemsError

  return {
    id: invoiceData.id,
    userId: invoiceData.user_id,
    customerId: invoiceData.customer_id,
    customerName: invoiceData.customer_name || "",
    invoiceNumber: invoiceData.invoice_number,
    issueDate: invoiceData.issue_date,
    dueDate: invoiceData.due_date,
    status: invoiceData.status as InvoiceStatus,
    subtotal: Number(invoiceData.subtotal),
    discount: Number(invoiceData.discount || 0),
    itbis: Number(invoiceData.itbis),
    total: Number(invoiceData.total),
    applyFinancing: Boolean(invoiceData.apply_financing),
    notes: invoiceData.notes,
    paymentMethod: invoiceData.payment_method ?? undefined,
    amountReceived: invoiceData.amount_received != null ? Number(invoiceData.amount_received) : undefined,
    itbisIncluded: Boolean(invoiceData.itbis_included),
    source: invoiceData.source ?? undefined,
    items: (itemsData || []).map((item) => ({
      id: item.id,
      invoiceId: item.invoice_id,
      productId: item.product_id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
      unitCost: item.unit_cost != null ? Number(item.unit_cost) : undefined,
    })),
    createdAt: new Date(invoiceData.created_at),
    updatedAt: new Date(invoiceData.updated_at),
  }
}

export async function createInvoice(data: {
  customerId?: string
  customerName: string
  issueDate: string
  dueDate?: string
  status: InvoiceStatus
  notes?: string
  applyItbis: boolean
  applyFinancing: boolean
  discount: number
  items: Array<{
    productId?: string
    description: string
    quantity: number
    unitPrice: number
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  
  const discount = data.discount || 0
  const taxableAmount = Math.max(0, subtotal - discount)
  const itbis = data.applyItbis ? taxableAmount * 0.18 : 0
  const total = taxableAmount + itbis

  const invoiceNumber = await nextInvoiceNumber(supabase, user.id)

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      invoice_number: invoiceNumber,
      issue_date: data.issueDate,
      due_date: data.dueDate || null,
      status: data.status,
      subtotal,
      discount,
      itbis,
      total,
      apply_financing: data.applyFinancing,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (invoiceError) return { error: friendlyError(invoiceError) }

  const costs = await productCosts(supabase, data.items.map((i) => i.productId ?? ""))
  const itemsToInsert = data.items.map((item) => ({
    invoice_id: invoiceData.id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
    unit_cost: item.productId ? (costs.get(item.productId) ?? null) : null,
  }))

  const { error: itemsError } = await insertItems(supabase, itemsToInsert)

  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoiceData.id)
    return { error: friendlyError(itemsError) }
  }

  // --- LÓGICA DE INVENTARIO: RESTAR STOCK ---
  for (const item of data.items) {
    if (item.productId) {
      // Restamos la cantidad (usamos negativo)
      await updateProductStock(supabase, item.productId, -item.quantity)
    }
  }

  // --- LÓGICA DE FINANCIAMIENTO: ACTUALIZAR DEUDA DEL CLIENTE ---
  if (data.customerId && data.status !== "draft" && data.applyFinancing) {
    // Solo actualizar financiamiento si está habilitado y no es un borrador
    await updateCustomerFinancing(supabase, data.customerId, total)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/reports")
  revalidatePath("/dashboard/products") // Actualizar vista de productos
  revalidatePath("/dashboard/customers") // Actualizar vista de clientes

  return { success: true, id: invoiceData.id }
}

export async function updateInvoice(
  id: string,
  data: {
    customerId?: string
    customerName: string
    issueDate: string
    dueDate?: string
    status: InvoiceStatus
    notes?: string
    applyItbis: boolean
    applyFinancing: boolean
    discount: number
    items: Array<{
      productId?: string
      description: string
      quantity: number
      unitPrice: number
    }>
  },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!data.customerName || data.items.length === 0) {
    return { error: "Cliente y al menos un item son requeridos" }
  }

  // Obtener factura anterior para comparar cambios de financiamiento
  const { data: oldInvoiceData } = await supabase
    .from("invoices")
    .select("customer_id, total, status, apply_financing")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  
  const discount = data.discount || 0
  const taxableAmount = Math.max(0, subtotal - discount)
  const itbis = data.applyItbis ? taxableAmount * 0.18 : 0
  const total = taxableAmount + itbis

  // --- LÓGICA DE INVENTARIO: REVERTIR STOCK ANTERIOR ---
  // Primero obtenemos los items que ya existían para devolver ese stock
  const { data: oldItems } = await supabase
    .from("invoice_items")
    .select("product_id, quantity")
    .eq("invoice_id", id)
  
  if (oldItems) {
    for (const item of oldItems) {
      if (item.product_id) {
        // Devolvemos el stock (sumamos positivo)
        await updateProductStock(supabase, item.product_id, Number(item.quantity))
      }
    }
  }

  // --- LÓGICA DE FINANCIAMIENTO: MATEMÁTICA DIFERENCIAL ---
  // Calculamos la deuda anterior real aportada
  const oldFinancingAmt = (oldInvoiceData?.customer_id === data.customerId && oldInvoiceData?.status !== "draft" && oldInvoiceData?.apply_financing)
    ? oldInvoiceData.total
    : 0;
  
  // Calculamos la deuda nueva que aportará
  const newFinancingAmt = (data.customerId && data.status !== "draft" && data.applyFinancing)
    ? total
    : 0;

  const financingDelta = newFinancingAmt - oldFinancingAmt;

  if (data.customerId && financingDelta !== 0) {
    await updateCustomerFinancing(supabase, data.customerId, financingDelta)
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      customer_id: data.customerId || null,
      customer_name: data.customerName,
      issue_date: data.issueDate,
      due_date: data.dueDate || null,
      status: data.status,
      subtotal,
      discount,
      itbis,
      total,
      apply_financing: data.applyFinancing,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (updateError) return { error: friendlyError(updateError) }

  await supabase.from("invoice_items").delete().eq("invoice_id", id)

  const costs = await productCosts(supabase, data.items.map((i) => i.productId ?? ""))
  const itemsToInsert = data.items.map((item) => ({
    invoice_id: id,
    product_id: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.quantity * item.unitPrice,
    unit_cost: item.productId ? (costs.get(item.productId) ?? null) : null,
  }))

  const { error: itemsError } = await insertItems(supabase, itemsToInsert)

  if (itemsError) return { error: friendlyError(itemsError) }

  // --- LÓGICA DE INVENTARIO: RESTAR NUEVO STOCK ---
  for (const item of data.items) {
    if (item.productId) {
      // Restamos la nueva cantidad
      await updateProductStock(supabase, item.productId, -item.quantity)
    }
  }

  // La matemática diferencial ya se encargó de actualizar el financiamiento, 
  // no necesitamos actualizar toda la deuda de nuevo.

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/invoices")
  revalidatePath(`/dashboard/invoices/${id}`)
  revalidatePath("/dashboard/reports")
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/customers")

  return { success: true }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Obtener datos de la factura antes de borrarla
  const { data: invoiceData } = await supabase
    .from("invoices")
    .select("customer_id, total, status, apply_financing")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  // --- LÓGICA DE INVENTARIO: DEVOLVER STOCK ANTES DE BORRAR ---
  const { data: oldItems } = await supabase
    .from("invoice_items")
    .select("product_id, quantity")
    .eq("invoice_id", id)
  
  if (oldItems) {
    for (const item of oldItems) {
      if (item.product_id) {
        await updateProductStock(supabase, item.product_id, Number(item.quantity))
      }
    }
  }

  // --- LÓGICA DE FINANCIAMIENTO: REVERTIR DEUDA ANTES DE BORRAR ---
  if (invoiceData?.customer_id && invoiceData.status !== "draft" && invoiceData.apply_financing) {
    await updateCustomerFinancing(supabase, invoiceData.customer_id, -invoiceData.total)
  }

  const { error } = await supabase.from("invoices").delete().eq("id", id).eq("user_id", user.id)

  if (error) return { error: friendlyError(error) }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/reports")
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/customers")

  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Obtener datos de la factura para verificar financiamiento
  const { data: invoice } = await supabase
    .from("invoices")
    .select("customer_id, total, status, apply_financing")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!invoice) return { error: "Invoice not found" }

  const oldStatus = invoice.status;
  const newStatus = status;

  const { error } = await supabase
    .from("invoices")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: friendlyError(error) }

  // Ajustar financiamiento si cambia desde/hacia draft
  if (invoice.customer_id && invoice.apply_financing) {
    if (oldStatus === "draft" && newStatus !== "draft") {
      // Salió del borrador, afecta el límite
      await updateCustomerFinancing(supabase, invoice.customer_id, invoice.total)
    } else if (oldStatus !== "draft" && newStatus === "draft") {
      // Regresó a borrador, devuelve el límite
      await updateCustomerFinancing(supabase, invoice.customer_id, -invoice.total)
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/invoices")
  revalidatePath(`/dashboard/invoices/${id}`)
  revalidatePath("/dashboard/reports")

  return { success: true }
}

// ─── Venta rápida (pantalla Vender) ──────────────────────────────────

const quickSaleSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().uuid(), quantity: z.number().positive().max(100000) }))
    .min(1, "Agrega al menos un producto")
    .max(200),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  discount: z.number().min(0).max(100000000).default(0),
  amountReceived: z.number().min(0).max(100000000).nullable().default(null),
  customerName: z.string().trim().max(120).optional(),
})

export type QuickSaleInput = z.input<typeof quickSaleSchema>

export type QuickSaleResult =
  | { error: string }
  | { success: true; id: string; invoiceNumber: string; total: number; change: number | null }

/** Today in Santo Domingo, as YYYY-MM-DD (the server runs in UTC). */
function todayInSantoDomingo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date())
}

/**
 * One tap sale: no customer needed, the invoice is created already paid, stock goes down and
 * the reports count it. Prices come from the database, never from the browser.
 */
export async function createQuickSale(input: QuickSaleInput): Promise<QuickSaleResult> {
  const parsed = quickSaleSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa la venta" }
  const sale = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Tu sesión terminó. Entra de nuevo." }

  // The same product added twice counts as one line.
  const quantities = new Map<string, number>()
  for (const item of sale.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, cost")
    .eq("user_id", user.id)
    .in("id", [...quantities.keys()])
  if (productsError) return { error: friendlyError(productsError) }
  if (!products || products.length !== quantities.size) {
    return { error: "Uno de los productos ya no existe. Recarga la página e intenta de nuevo." }
  }

  const { data: profile } = await supabase.from("profiles").select("itbis_mode").eq("id", user.id).maybeSingle()
  const itbisMode = isItbisMode(profile?.itbis_mode) ? profile.itbis_mode : "added"

  const lines = products.map((p) => ({
    productId: p.id as string,
    description: p.name as string,
    quantity: quantities.get(p.id as string)!,
    unitPrice: Number(p.price),
    unitCost: p.cost != null ? Number(p.cost) : null,
  }))
  const totals = computeSaleTotals({ lines, discount: sale.discount, itbisMode })

  const received = sale.paymentMethod === "cash" ? sale.amountReceived : null
  if (received != null && received < totals.total) {
    return { error: "Lo recibido no cubre el total de la venta." }
  }

  const invoiceNumber = await nextInvoiceNumber(supabase, user.id)
  const base = {
    user_id: user.id,
    customer_id: null as string | null,
    customer_name: sale.customerName || WALK_IN_CUSTOMER,
    invoice_number: invoiceNumber,
    issue_date: todayInSantoDomingo(),
    due_date: null as string | null,
    status: "paid" as const,
    subtotal: totals.subtotal,
    discount: totals.discount,
    itbis: totals.itbis,
    total: totals.total,
    apply_financing: false,
    notes: null as string | null,
  }
  const extras = {
    payment_method: sale.paymentMethod,
    amount_received: received,
    itbis_included: totals.itbisIncluded,
    source: "pos",
  }

  let inserted = await supabase.from("invoices").insert({ ...base, ...extras }).select("id").single()
  // Before DATABASE_BUSINESS_SETUP.sql the extra columns don't exist: save the sale anyway.
  if (inserted.error && (inserted.error.code === "PGRST204" || inserted.error.code === "42703")) {
    inserted = await supabase.from("invoices").insert(base).select("id").single()
  }
  if (inserted.error || !inserted.data) return { error: friendlyError(inserted.error) }
  const invoiceId = inserted.data.id as string

  const { error: itemsError } = await insertItems(
    supabase,
    lines.map((l) => ({
      invoice_id: invoiceId,
      product_id: l.productId,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      total: Math.round(l.quantity * l.unitPrice * 100) / 100,
      unit_cost: l.unitCost,
    })),
  )
  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoiceId)
    return { error: friendlyError(itemsError) }
  }

  for (const l of lines) await updateProductStock(supabase, l.productId, -l.quantity)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vender")
  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/reports")
  revalidatePath("/dashboard/products")

  return { success: true, id: invoiceId, invoiceNumber, total: totals.total, change: changeDue(totals.total, received) }
}
