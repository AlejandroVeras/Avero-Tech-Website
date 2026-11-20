// What kind of business an account is and how it sells. The answers decide which parts of
// Avero Inventario show up. No imports: the tests run this file directly with node --test.
// The allowed values mirror the CHECK constraints in DATABASE_BUSINESS_SETUP.sql.

export const BUSINESS_TYPES = [
  { id: "ropa", label: "Tienda de ropa, calzado o accesorios" },
  { id: "colmado", label: "Colmado, minimarket o tienda de productos" },
  { id: "ferreteria", label: "Ferretería o repuestos" },
  { id: "distribuidora", label: "Distribuidora o venta al por mayor" },
  { id: "servicios", label: "Servicios (taller, salón, técnico)" },
  { id: "otro", label: "Otro tipo de negocio" },
] as const
export type BusinessType = (typeof BUSINESS_TYPES)[number]["id"]

export const SALES_MODES = [
  { id: "counter", label: "En mostrador, al cliente que llega", hint: "Vendes rápido, sin registrar al cliente." },
  { id: "invoice", label: "Con cotización y factura a clientes fijos", hint: "Cada venta lleva el nombre o RNC del cliente." },
  { id: "both", label: "Las dos", hint: "Mostrador y clientes fijos." },
] as const
export type SalesMode = (typeof SALES_MODES)[number]["id"]

export const ITBIS_MODES = [
  { id: "included", label: "Mis precios ya incluyen el ITBIS", hint: "Si la etiqueta dice RD$1,000, el cliente paga RD$1,000." },
  { id: "added", label: "Sumar el 18% al precio", hint: "Si el precio es RD$1,000, el cliente paga RD$1,180." },
  { id: "none", label: "No cobro ITBIS", hint: "El cliente paga el precio tal cual, sin ITBIS." },
] as const
export type ItbisMode = (typeof ITBIS_MODES)[number]["id"]

export interface BusinessSetup {
  businessType: BusinessType | null
  salesMode: SalesMode | null
  sellsOnCredit: boolean | null
  /** How quick sales (Vender) charge ITBIS. Invoices made by hand keep their own checkbox. */
  itbisMode: ItbisMode
  /** False only for new accounts that have not answered or skipped the welcome questions. */
  completed: boolean
}

/** Accounts from before DATABASE_BUSINESS_SETUP.sql, or when the columns can't be read: nothing changes. */
export const LEGACY_SETUP: BusinessSetup = {
  businessType: null,
  salesMode: null,
  sellsOnCredit: null,
  itbisMode: "added",
  completed: true,
}

/** The answers the welcome screen pre-selects after the business type is chosen. */
export function presetFor(type: BusinessType): { salesMode: SalesMode; sellsOnCredit: boolean; itbisMode: ItbisMode } {
  switch (type) {
    case "ropa":
      return { salesMode: "counter", sellsOnCredit: false, itbisMode: "included" }
    case "colmado":
      return { salesMode: "counter", sellsOnCredit: true, itbisMode: "included" }
    case "ferreteria":
      return { salesMode: "both", sellsOnCredit: true, itbisMode: "included" }
    case "distribuidora":
      return { salesMode: "invoice", sellsOnCredit: true, itbisMode: "added" }
    case "servicios":
      return { salesMode: "invoice", sellsOnCredit: false, itbisMode: "added" }
    case "otro":
      return { salesMode: "both", sellsOnCredit: false, itbisMode: "added" }
  }
}

function oneOf<T extends string>(list: readonly { id: T }[], value: unknown): T | null {
  return list.some((o) => o.id === value) ? (value as T) : null
}

export function isBusinessType(value: unknown): value is BusinessType {
  return oneOf(BUSINESS_TYPES, value) !== null
}
export function isSalesMode(value: unknown): value is SalesMode {
  return oneOf(SALES_MODES, value) !== null
}
export function isItbisMode(value: unknown): value is ItbisMode {
  return oneOf(ITBIS_MODES, value) !== null
}

/** Reads the profiles row; unknown values fall back to the legacy behavior. */
export function parseSetupRow(row: {
  business_type?: unknown
  sales_mode?: unknown
  sells_on_credit?: unknown
  itbis_mode?: unknown
  setup_completed_at?: unknown
}): BusinessSetup {
  return {
    businessType: oneOf(BUSINESS_TYPES, row.business_type),
    salesMode: oneOf(SALES_MODES, row.sales_mode),
    sellsOnCredit: typeof row.sells_on_credit === "boolean" ? row.sells_on_credit : null,
    itbisMode: oneOf(ITBIS_MODES, row.itbis_mode) ?? "added",
    completed: row.setup_completed_at != null,
  }
}

export interface Features {
  /** The Vender screen (point of sale). */
  quickSale: boolean
  quotes: boolean
  customers: boolean
}

export function featuresFor(setup: BusinessSetup): Features {
  const mode = setup.salesMode
  // No answer (old accounts, skipped questions): keep everything exactly as before.
  if (!mode) return { quickSale: false, quotes: true, customers: true }
  return {
    quickSale: mode === "counter" || mode === "both",
    quotes: mode !== "counter",
    // A counter-only shop still needs customers if it sells on credit.
    customers: mode !== "counter" || setup.sellsOnCredit !== false,
  }
}

// ─── Formulario de producto según el negocio ─────────────────────────

export interface ProductFormConfig {
  /** Nuevo / usado / reacondicionado. */
  showCondition: boolean
  showWarranty: boolean
  namePlaceholder: string
  brandPlaceholder: string
  categoryPlaceholder: string
  /** Ready-made rows for the specifications list, or null for no shortcut. */
  specsTemplate: { label: string; fields: string[] } | null
  /** Greyed-out example shown in empty specification rows. */
  specsExample: { label: string; value: string }
}

/** Old accounts and "otro" keep the original form, which was built for electronics. */
const ELECTRONICS_FORM: ProductFormConfig = {
  showCondition: true,
  showWarranty: true,
  namePlaceholder: "Nombre del producto o servicio",
  brandPlaceholder: "Ej: Dell",
  categoryPlaceholder: "Ej: Laptops, Monitores, Servicios",
  specsTemplate: {
    label: "Campos de laptop",
    fields: ["Procesador", "Memoria RAM", "Almacenamiento", "Pantalla", "Gráficos", "Sistema operativo", "Batería"],
  },
  specsExample: { label: "Ej: Procesador", value: "Ej: Intel Core i5" },
}

export function productFormFor(type: BusinessType | null): ProductFormConfig {
  switch (type) {
    case "ropa":
      return {
        showCondition: false,
        showWarranty: false,
        namePlaceholder: "Ej: Blusa de lino blanca M",
        brandPlaceholder: "Ej: Zara",
        categoryPlaceholder: "Ej: Blusas, Jeans, Vestidos",
        specsTemplate: { label: "Campos de ropa", fields: ["Talla", "Color", "Material"] },
        specsExample: { label: "Ej: Talla", value: "Ej: M" },
      }
    case "colmado":
      return {
        showCondition: false,
        showWarranty: false,
        namePlaceholder: "Ej: Arroz Campos 5 lb",
        brandPlaceholder: "Ej: Induveca",
        categoryPlaceholder: "Ej: Víveres, Bebidas, Limpieza",
        specsTemplate: { label: "Campos de producto", fields: ["Presentación", "Contenido"] },
        specsExample: { label: "Ej: Contenido", value: "Ej: 5 lb" },
      }
    case "ferreteria":
      return {
        showCondition: true,
        showWarranty: true,
        namePlaceholder: "Ej: Taladro inalámbrico 20V",
        brandPlaceholder: "Ej: Truper",
        categoryPlaceholder: "Ej: Herramientas, Plomería, Electricidad",
        specsTemplate: { label: "Campos de ferretería", fields: ["Medida", "Material", "Potencia"] },
        specsExample: { label: "Ej: Medida", value: "Ej: 1/2 pulgada" },
      }
    case "distribuidora":
      return {
        showCondition: false,
        showWarranty: false,
        namePlaceholder: "Ej: Agua 16 oz (caja de 24)",
        brandPlaceholder: "Ej: Nestlé",
        categoryPlaceholder: "Ej: Bebidas, Granos, Limpieza",
        specsTemplate: { label: "Campos de mayoreo", fields: ["Presentación", "Unidades por caja"] },
        specsExample: { label: "Ej: Unidades por caja", value: "Ej: 24" },
      }
    case "servicios":
      return {
        showCondition: false,
        showWarranty: true,
        namePlaceholder: "Ej: Cambio de aceite",
        brandPlaceholder: "Ej: Mobil",
        categoryPlaceholder: "Ej: Mantenimiento, Reparación",
        specsTemplate: null,
        specsExample: { label: "Ej: Duración", value: "Ej: 1 hora" },
      }
    default:
      return ELECTRONICS_FORM
  }
}
