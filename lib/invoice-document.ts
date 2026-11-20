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
  const ink = "#0f172a"
  const e = escapeHtml
  const b = doc.business
  const logoOk = b.logoUrl && /^(data:image\/|https:\/\/)/.test(b.logoUrl)
  const pay = doc.paymentMethod ? PAYMENT[doc.paymentMethod] : undefined
  const quote = doc.kind === "quote"
  const statusLabel = (quote ? QUOTE_STATUS : STATUS)[doc.status] ?? e(doc.status.toUpperCase())
  const good = doc.status === (quote ? "approved" : "paid")
  const bad = ["rejected", "cancelled", "overdue"].includes(doc.status)

  const facts = [
    ["Fecha de emisión", longDate(doc.issueDate)],
    doc.dueDate ? [quote ? "Válida hasta" : "Vence", longDate(doc.dueDate)] : null,
    pay ? ["Forma de pago", pay] : null,
  ]
    .filter((f): f is string[] => !!f)
    .map(([k, v]) => `<div class="fact"><span>${k}</span><strong>${e(v)}</strong></div>`)
    .join("")

  return `<div class="av-inv">
<style>
.av-inv { width: 760px; background: #fff; color: #334155; font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 12.5px; line-height: 1.5; box-sizing: border-box; }
.av-inv * { box-sizing: border-box; margin: 0; padding: 0; }
.av-inv .bar { height: 5px; background: ${accent}; }
.av-inv .in { padding: 36px 48px 28px; }
.av-inv .hd { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; padding-bottom: 22px; border-bottom: 1px solid #cbd5e1; }
.av-inv .logo { max-height: 62px; max-width: 210px; object-fit: contain; display: block; margin-bottom: 10px; }
.av-inv .co h1 { font-size: ${logoOk ? "14px" : "22px"}; font-weight: 700; color: ${ink}; margin-bottom: 3px; }
.av-inv .co p { color: #64748b; font-size: 11.5px; margin: 1px 0; }
.av-inv .meta { text-align: right; min-width: 220px; }
.av-inv .kind { color: ${ink}; font-size: 22px; font-weight: 300; letter-spacing: 5px; }
.av-inv .num { font-size: 14px; font-weight: 700; color: ${accent}; letter-spacing: .5px; margin-top: 4px; }
.av-inv .badge { display: inline-block; margin-top: 10px; padding: 2px 10px 5px; line-height: 14px; border: 1px solid #cbd5e1; border-radius: 3px; font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px; color: #475569; }
.av-inv .badge.paid { border-color: #86efac; color: #166534; }
.av-inv .badge.bad { border-color: #fca5a5; color: #991b1b; }
.av-inv .info { display: flex; justify-content: space-between; gap: 32px; padding: 20px 0 22px; }
.av-inv .label { font-size: 9.5px; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.av-inv .client { font-size: 15px; font-weight: 700; color: ${ink}; }
.av-inv .facts { min-width: 260px; }
.av-inv .fact { display: flex; justify-content: space-between; gap: 18px; padding: 3px 0; }
.av-inv .fact span { color: #64748b; }
.av-inv .fact strong { color: ${ink}; font-weight: 600; }
.av-inv table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 20px; }
.av-inv thead tr { background: ${ink}; }
.av-inv th { border: 0; color: #fff; text-align: left; padding: 9px 12px; line-height: 16px; font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; vertical-align: middle; }
.av-inv td { padding: 11px 12px; line-height: 18px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
.av-inv tbody tr.alt td { background: #f8fafc; }
.av-inv td.n { color: #94a3b8; width: 36px; }
.av-inv td.d { color: ${ink}; }
.av-inv .r { text-align: right; }
.av-inv .bottom { display: flex; gap: 32px; align-items: flex-start; }
.av-inv .side { flex: 1; }
.av-inv .tot { width: 270px; }
.av-inv .row { display: flex; justify-content: space-between; padding: 5px 0; line-height: 18px; color: #475569; border-bottom: 1px solid #f1f5f9; }
.av-inv .row.disc { color: #b91c1c; }
.av-inv .row.big { margin-top: 6px; padding: 10px 0 4px; border-top: 2px solid ${ink}; border-bottom: 0; color: ${ink}; line-height: 24px; }
.av-inv .row.big span { white-space: nowrap; }
.av-inv .row.big span:first-child { font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
.av-inv .row.big span:last-child { font-size: 19px; font-weight: 800; color: ${accent}; }
.av-inv .block { padding: 10px 0 10px 14px; border-left: 2px solid ${accent}; margin-bottom: 14px; }
.av-inv .block p { color: #334155; }
.av-inv .block strong { color: ${ink}; }
.av-inv .sign { display: flex; gap: 64px; margin-top: 60px; }
.av-inv .sign div { flex: 1; border-top: 1px solid #64748b; padding-top: 7px; text-align: center; color: #64748b; font-size: 10.5px; }
.av-inv .ft { margin: 30px 48px 0; padding: 12px 0 20px; border-top: 1px solid #cbd5e1; text-align: center; color: #94a3b8; font-size: 10.5px; }
.av-inv .ft strong { color: #475569; font-weight: 600; }
</style>
<div class="bar"></div>
<div class="in">
<div class="hd">
  <div class="co">
    ${logoOk ? `<img class="logo" src="${e(b.logoUrl)}" alt="" />` : ""}
    <h1>${e(b.name)}</h1>
    ${b.taxId ? `<p>RNC: ${e(b.taxId)}</p>` : ""}
    ${b.address ? `<p>${e(b.address)}</p>` : ""}
    ${b.phone ? `<p>Tel. ${e(b.phone)}</p>` : ""}
    ${b.email ? `<p>${e(b.email)}</p>` : ""}
    ${b.website ? `<p>${e(b.website)}</p>` : ""}
  </div>
  <div class="meta">
    <p class="kind">${quote ? "COTIZACIÓN" : "FACTURA"}</p>
    <p class="num">No. ${e(doc.invoiceNumber)}</p>
    <span class="badge ${good ? "paid" : bad ? "bad" : ""}">${statusLabel}</span>
  </div>
</div>
<div class="info">
  <div><p class="label">${quote ? "Preparada para" : "Cliente"}</p><p class="client">${e(doc.customerName)}</p></div>
  <div class="facts">${facts}</div>
</div>
<table>
  <thead><tr><th>#</th><th>Descripción</th><th class="r">Cant.</th><th class="r">Precio unit.</th><th class="r">Importe</th></tr></thead>
  <tbody>
    ${doc.items
      .map(
        (i, n) =>
          `<tr class="${n % 2 ? "alt" : ""}"><td class="n">${n + 1}</td><td class="d">${e(i.description)}</td><td class="r">${e(i.quantity)}</td><td class="r">${money.format(i.unitPrice)}</td><td class="r"><strong>${money.format(i.total)}</strong></td></tr>`,
      )
      .join("")}
  </tbody>
</table>
<div class="bottom">
  <div class="side">
    ${
      quote && doc.dueDate
        ? `<div class="block"><p class="label">Vigencia</p><p>Esta cotización es válida hasta el <strong>${e(longDate(doc.dueDate))}</strong>. Precios en pesos dominicanos (RD$).</p></div>`
        : ""
    }
    ${doc.notes ? `<div class="block"><p class="label">${quote ? "Condiciones y notas" : "Notas"}</p><p>${e(doc.notes).replace(/\n/g, "<br/>")}</p></div>` : ""}
  </div>
  <div class="tot">
    <div class="row"><span>Subtotal</span><span>${money.format(doc.subtotal)}</span></div>
    ${doc.discount > 0 ? `<div class="row disc"><span>Descuento</span><span>-${money.format(doc.discount)}</span></div>` : ""}
    ${doc.itbis > 0 ? `<div class="row"><span>${doc.itbisIncluded ? "ITBIS incluido (18%)" : "ITBIS (18%)"}</span><span>${money.format(doc.itbis)}</span></div>` : ""}
    <div class="row big"><span>${quote ? "Total cotizado" : "Total"}</span><span>${money.format(doc.total)}</span></div>
  </div>
</div>
${quote ? `<div class="sign"><div>Preparada por<br/><strong>${e(b.name)}</strong></div><div>Aceptada por el cliente<br/>Firma y fecha</div></div>` : ""}
</div>
<div class="ft">${quote ? "Gracias por considerarnos." : "Gracias por su compra."} <strong>${e(b.name)}</strong>${b.phone ? ` · ${e(b.phone)}` : ""}${b.email ? ` · ${e(b.email)}` : ""}</div>
</div>`
}
