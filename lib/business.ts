// Business facts that are still pending confirmation from Alejandro Veras.
// Every value stays null until confirmed; components hide or soften whatever depends on a null value,
// so no placeholder ever reaches the live site. Changing one line here publishes the fact everywhere.

export type Price = { from: number } | null // RD$, "desde"

export const SERVICE_PRICES = {
  webPresentacion: null as Price,
  webCatalogo: null as Price,
  webMedida: null as Price,
  webDominioAnual: null as Price,
  webMantenimiento: null as Price,
  portalDescubrimiento: null as Price,
  portalEsencial: null as Price,
  portalPlataforma: null as Price,
  portalMantenimiento: null as Price,
  seoAuditoria: null as Price,
  seoLocal: null as Price,
  seoCrecimiento: null as Price,
  iaDiagnostico: null as Price,
  iaPiloto: null as Price,
  iaOperacion: null as Price,
  botCreacion: null as Price,
  botOperacion: null as Price,
  soporteVisita: null as Price,
  soporteIguala: null as Price,
  soporteIgualaEmpresa: null as Price,
}
export type PriceKey = keyof typeof SERVICE_PRICES

export const PENDING = {
  /** e.g. "50 % al aprobar la propuesta y 50 % al entregar" */
  paymentTerms: null as string | null,
  /** Whether quoted service prices include ITBIS. */
  servicePricesIncludeItbis: null as boolean | null,
  catalogPricesIncludeItbis: null as boolean | null,
  founderPhotoUrl: null as string | null,
  founderLinkedIn: null as string | null,
  founderBio: null as string | null,
  socialProfiles: [] as string[],
  legalNameAndRnc: null as string | null,
  projectsDelivered: null as number | null,
  /** Date the WhatsApp assistant went live, e.g. "2026-12-01". Until then pages say "en pruebas". */
  assistantLiveSince: null as string | null,
  devWarrantyDays: null as number | null,
  basicRetainerDevices: null as number | null,
  emailResponseTime: null as string | null,
  supportVisitTime: null as string | null,
}

const dop = new Intl.NumberFormat("es-DO", { maximumFractionDigits: 0 })

/** "Desde RD$ 25,000" or "Cotiza sin costo" while the price is not confirmed. */
export function priceLabel(key: PriceKey, suffix = "") {
  const p = SERVICE_PRICES[key]
  return p ? `Desde RD$ ${dop.format(p.from)}${suffix}` : "Cotiza sin costo"
}
export function hasPrice(key: PriceKey) {
  return SERVICE_PRICES[key] !== null
}
