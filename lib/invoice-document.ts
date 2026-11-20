// The invoice as HTML, turned into a PDF in the browser (components/invoice-share.ts) so it can
// be downloaded or sent by WhatsApp as a file. Styles are scoped to .av-inv so the markup can be
// placed inside the app without touching its styles. No imports: tests run this file directly.

export interface InvoiceDocument {
  /** "quote" turns the same layout into a cotización (title, labels, validity, acceptance). */
  kind?: "invoice" | "quote"
  invoiceNumber: string
  status: string
  customerName: string
  issueDate: string
  /** Invoice: due date. Quote: valid until. */
  dueDate?: string
  items: { description: string; quantity: number; unitPrice: number; total: number }[]
  subtotal: number
  discount: number
  itbis: number
  itbisIncluded: boolean
  total: number
  notes?: string
  paymentMethod?: string | null
  business: {
    name: string
    taxId?: string
    phone?: string
    address?: string
    website?: string
    email?: string
    /** Prefer a data: URL so the PDF renderer never hits a cross-origin image. */
    logoUrl?: string
  }
  /** Brand color (#rrggbb); the Avero green when the business has none. */
  accent?: string | null
}

const STATUS: Record<string, string> = {
  paid: "PAGADA",
  sent: "ENVIADA",
  draft: "BORRADOR",
  overdue: "VENCIDA",
  cancelled: "CANCELADA",
}

const QUOTE_STATUS: Record<string, string> = {
  draft: "BORRADOR",
  sent: "ENVIADA",
  approved: "APROBADA",
  rejected: "RECHAZADA",
}

const PAYMENT: Record<string, string> = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia" }

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" })

function longDate(day: string) {
  // Date-only values parse as UTC midnight; read them at midday so the day never shifts.
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T12:00:00` : day)
  return d.toLocaleDateString("es-DO", { year: "numeric", month: "long", day: "numeric" })
}

/** File name for the PDF: "Factura-INV-0005-Boutique-Marina.pdf". */
export function invoiceFileName(doc: Pick<InvoiceDocument, "invoiceNumber" | "business" | "kind">) {
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  return `${doc.kind === "quote" ? "Cotizacion" : "Factura"}-${clean(doc.invoiceNumber)}-${clean(doc.business.name).slice(0, 40)}.pdf`
}

export function invoiceDocumentHtml(doc: InvoiceDocument) {
  const accent = /^#[0-9a-f]{6}$/i.test(doc.accent ?? "") ? doc.accent! : "#10b981"
  const e = escapeHtml
  const b = doc.business
  const logoOk = b.logoUrl && /^(data:image\/|https:\/\/)/.test(b.logoUrl)
  const pay = doc.paymentMethod ? PAYMENT[doc.paymentMethod] : undefined
  const quote = doc.kind === "quote"
  const statusLabel = (quote ? QUOTE_STATUS : STATUS)[doc.status] ?? e(doc.status.toUpperCase())
  const good = doc.status === (quote ? "approved" : "paid")

  return `<div class="av-inv">
<style>
.av-inv { width: 760px; padding: 36px 40px; background: #fff; color: #1e293b; font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.45; box-sizing: border-box; }
.av-inv * { box-sizing: border-box; margin: 0; padding: 0; }
.av-inv .hd { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 20px; border-bottom: 3px solid ${accent}; margin-bottom: 26px; }
.av-inv .logo { max-height: 72px; max-width: 200px; object-fit: contain; display: block; margin-bottom: 10px; }
.av-inv .co h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
.av-inv .co p { color: #64748b; margin: 2px 0; }
.av-inv .meta { text-align: right; }
.av-inv .meta h2 { color: ${accent}; font-size: 30px; font-weight: 900; letter-spacing: 2px; }
.av-inv .meta .num { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 4px; }
.av-inv .badge { display: inline-block; margin-top: 8px; padding: 2px 12px 7px; line-height: 15px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .5px; background: #f1f5f9; color: #334155; }
.av-inv .badge.paid { background: #dcfce7; color: #166534; }
.av-inv .box { display: flex; justify-content: space-between; gap: 24px; background: #f8fafc; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
.av-inv .box h3 { font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
.av-inv .box p { color: #334155; margin: 2px 0; }
.av-inv table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 24px; }
.av-inv thead tr { background: ${accent}; }
.av-inv th { border: 0; color: #fff; text-align: left; padding: 10px 12px; line-height: 16px; font-size: 11px; letter-spacing: .5px; text-transform: uppercase; vertical-align: middle; }
.av-inv td { padding: 10px 12px; line-height: 18px; border-bottom: 1px solid #eef2f7; color: #334155; vertical-align: middle; }
.av-inv .r { text-align: right; }
.av-inv .tot { margin-left: auto; width: 300px; background: #f8fafc; border-radius: 10px; padding: 14px 18px; }
.av-inv .row { display: flex; justify-content: space-between; padding: 4px 0; line-height: 18px; color: #64748b; }
.av-inv .row.disc { color: #dc2626; }
.av-inv .row.big { border-top: 2px dashed #cbd5e1; margin-top: 8px; padding-top: 10px; line-height: 24px; font-size: 18px; font-weight: 800; color: ${accent}; }
.av-inv .notes { margin-top: 24px; padding: 14px 18px; border-left: 4px solid ${accent}; background: #f8fafc; }
.av-inv .notes h3 { font-size: 11px; color: ${accent}; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.av-inv .valid { margin-top: 18px; padding: 12px 18px; border-radius: 10px; background: ${accent}12; color: #0f172a; display: flex; justify-content: space-between; gap: 16px; }
.av-inv .valid strong { color: ${accent}; }
.av-inv .sign { display: flex; gap: 48px; margin-top: 44px; }
.av-inv .sign div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 6px; text-align: center; color: #64748b; font-size: 12px; }
.av-inv .ft { margin-top: 36px; padding-top: 16px; border-top: 1px solid #eef2f7; text-align: center; color: #94a3b8; font-size: 12px; }
</style>
<div class="hd">
  <div class="co">
    ${logoOk ? `<img class="logo" src="${e(b.logoUrl)}" alt="" />` : ""}
    <h1>${e(b.name)}</h1>
    ${b.taxId ? `<p><strong>RNC:</strong> ${e(b.taxId)}</p>` : ""}
    ${b.phone ? `<p><strong>Teléfono:</strong> ${e(b.phone)}</p>` : ""}
    ${b.address ? `<p>${e(b.address)}</p>` : ""}
    ${b.website ? `<p>${e(b.website)}</p>` : ""}
    ${b.email ? `<p>${e(b.email)}</p>` : ""}
  </div>
  <div class="meta">
    <h2>${quote ? "COTIZACIÓN" : "FACTURA"}</h2>
    <p class="num">${e(doc.invoiceNumber)}</p>
    <span class="badge ${good ? "paid" : ""}">${statusLabel}</span>
  </div>
</div>
<div class="box">
  <div><h3>${quote ? "Preparada para" : "Cliente"}</h3><p><strong>${e(doc.customerName)}</strong></p></div>
  <div class="r">
    <h3>Fecha</h3>
    <p>${e(longDate(doc.issueDate))}</p>
    ${doc.dueDate && !quote ? `<p>Vence: ${e(longDate(doc.dueDate))}</p>` : ""}
    ${pay ? `<p>Pago: ${pay}</p>` : ""}
  </div>
</div>
<table>
  <thead><tr><th>Descripción</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Total</th></tr></thead>
  <tbody>
    ${doc.items
      .map(
        (i) =>
          `<tr><td>${e(i.description)}</td><td class="r">${e(i.quantity)}</td><td class="r">${money.format(i.unitPrice)}</td><td class="r"><strong>${money.format(i.total)}</strong></td></tr>`,
      )
      .join("")}
  </tbody>
</table>
<div class="tot">
  <div class="row"><span>Subtotal</span><span>${money.format(doc.subtotal)}</span></div>
  ${doc.discount > 0 ? `<div class="row disc"><span>Descuento</span><span>-${money.format(doc.discount)}</span></div>` : ""}
  ${doc.itbis > 0 ? `<div class="row"><span>${doc.itbisIncluded ? "ITBIS incluido (18%)" : "ITBIS (18%)"}</span><span>${money.format(doc.itbis)}</span></div>` : ""}
  <div class="row big"><span>${quote ? "Total cotizado" : "Total"}</span><span>${money.format(doc.total)}</span></div>
</div>
${
  quote && doc.dueDate
    ? `<div class="valid"><span>Precios en pesos dominicanos (RD$).</span><span>Válida hasta el <strong>${e(longDate(doc.dueDate))}</strong></span></div>`
    : ""
}
${doc.notes ? `<div class="notes"><h3>${quote ? "Condiciones y notas" : "Notas"}</h3><p>${e(doc.notes).replace(/\n/g, "<br/>")}</p></div>` : ""}
${quote ? `<div class="sign"><div>Preparada por · ${e(b.name)}</div><div>Aceptada por el cliente (firma y fecha)</div></div>` : ""}
<div class="ft">${quote ? `Gracias por considerarnos · ${e(b.name)}${b.phone ? ` · ${e(b.phone)}` : ""}` : `Gracias por su compra · ${e(b.name)}`}</div>
</div>`
}
