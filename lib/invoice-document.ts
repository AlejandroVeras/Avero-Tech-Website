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

/** "#0071e3" + 0.08 → "rgba(0, 113, 227, 0.08)" (html2canvas does not read 8-digit hex). */
function tint(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
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
  const bad = ["rejected", "cancelled", "overdue"].includes(doc.status)
  const contact = [b.phone, b.email, b.website].filter(Boolean).map((v) => e(v)).join("  ·  ")

  const cards = [
    `<div class="card"><h3>${quote ? "Preparada para" : "Cliente"}</h3><p class="big">${e(doc.customerName)}</p></div>`,
    `<div class="card"><h3>Fecha de emisión</h3><p>${e(longDate(doc.issueDate))}</p></div>`,
    doc.dueDate ? `<div class="card"><h3>${quote ? "Válida hasta" : "Vence"}</h3><p>${e(longDate(doc.dueDate))}</p></div>` : "",
    pay ? `<div class="card"><h3>Forma de pago</h3><p>Pago: ${pay}</p></div>` : "",
  ].join("")

  return `<div class="av-inv">
<style>
.av-inv { width: 760px; background: #fff; color: #1e293b; font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 13px; line-height: 1.45; box-sizing: border-box; }
.av-inv * { box-sizing: border-box; margin: 0; padding: 0; }
.av-inv .bar { height: 10px; background: ${accent}; }
.av-inv .in { padding: 34px 44px 30px; }
.av-inv .hd { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; margin-bottom: 28px; }
.av-inv .logo { max-height: 70px; max-width: 220px; object-fit: contain; display: block; margin-bottom: 12px; }
.av-inv .co h1 { font-size: ${logoOk ? "15px" : "24px"}; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -.2px; }
.av-inv .co p { color: #64748b; font-size: 12px; margin: 1px 0; }
.av-inv .meta { text-align: right; min-width: 210px; }
.av-inv .kind { color: ${accent}; font-size: 12px; font-weight: 800; letter-spacing: 3px; }
.av-inv .num { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -.5px; line-height: 34px; margin-top: 2px; }
.av-inv .badge { display: inline-block; margin-top: 10px; padding: 3px 12px 6px; line-height: 15px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: 1px; background: ${tint(accent, 0.1)}; color: ${accent}; }
.av-inv .badge.paid { background: #dcfce7; color: #166534; }
.av-inv .badge.bad { background: #fee2e2; color: #991b1b; }
.av-inv .cards { display: flex; gap: 12px; margin-bottom: 26px; }
.av-inv .card { flex: 1; border: 1px solid ${tint(accent, 0.18)}; background: ${tint(accent, 0.04)}; border-radius: 12px; padding: 12px 14px; }
.av-inv .card h3 { font-size: 10px; color: #64748b; letter-spacing: 1.2px; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.av-inv .card p { color: #0f172a; font-weight: 600; }
.av-inv .card p.big { font-size: 15px; font-weight: 800; }
.av-inv table { width: 100%; border-collapse: collapse; border-spacing: 0; margin-bottom: 22px; }
.av-inv thead tr { background: ${tint(accent, 0.1)}; }
.av-inv th { border: 0; color: ${accent}; text-align: left; padding: 11px 12px; line-height: 16px; font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; vertical-align: middle; }
.av-inv td { padding: 13px 12px; line-height: 18px; border-bottom: 1px solid #eef2f7; color: #334155; vertical-align: middle; }
.av-inv td.n { color: #94a3b8; width: 34px; font-size: 12px; }
.av-inv td.d { color: #0f172a; font-weight: 600; }
.av-inv .r { text-align: right; }
.av-inv .bottom { display: flex; gap: 24px; align-items: flex-start; }
.av-inv .side { flex: 1; }
.av-inv .tot { width: 290px; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 16px 14px; }
.av-inv .row { display: flex; justify-content: space-between; padding: 5px 0; line-height: 18px; color: #64748b; }
.av-inv .row.disc { color: #dc2626; }
.av-inv .row.big { margin-top: 10px; padding: 11px 14px 13px; border-radius: 10px; background: ${accent}; color: #fff; line-height: 24px; font-size: 18px; font-weight: 800; }
.av-inv .row.big span { white-space: nowrap; }
.av-inv .row.big span:first-child { font-size: 13px; font-weight: 700; letter-spacing: .3px; }
.av-inv .valid { padding: 12px 14px; border-radius: 12px; background: ${tint(accent, 0.07)}; color: #0f172a; margin-bottom: 12px; }
.av-inv .valid strong { color: ${accent}; }
.av-inv .valid span { display: block; color: #64748b; font-size: 12px; margin-top: 2px; }
.av-inv .notes { padding: 12px 14px; border-left: 3px solid ${accent}; background: #f8fafc; border-radius: 0 10px 10px 0; }
.av-inv .notes h3 { font-size: 10px; color: ${accent}; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; margin-bottom: 4px; }
.av-inv .notes p { color: #334155; }
.av-inv .sign { display: flex; gap: 56px; margin-top: 54px; }
.av-inv .sign div { flex: 1; border-top: 1px solid #94a3b8; padding-top: 7px; text-align: center; color: #64748b; font-size: 11px; }
.av-inv .ft { margin-top: 34px; padding: 14px 44px 18px; border-top: 1px solid #eef2f7; display: flex; justify-content: space-between; gap: 16px; color: #94a3b8; font-size: 11px; }
.av-inv .ft strong { color: ${accent}; }
</style>
<div class="bar"></div>
<div class="in">
<div class="hd">
  <div class="co">
    ${logoOk ? `<img class="logo" src="${e(b.logoUrl)}" alt="" />` : ""}
    <h1>${e(b.name)}</h1>
    ${b.taxId ? `<p>RNC: ${e(b.taxId)}</p>` : ""}
    ${b.address ? `<p>${e(b.address)}</p>` : ""}
    ${contact ? `<p>${contact}</p>` : ""}
  </div>
  <div class="meta">
    <p class="kind">${quote ? "COTIZACIÓN" : "FACTURA"}</p>
    <p class="num">${e(doc.invoiceNumber)}</p>
    <span class="badge ${good ? "paid" : bad ? "bad" : ""}">${statusLabel}</span>
  </div>
</div>
<div class="cards">${cards}</div>
<table>
  <thead><tr><th>#</th><th>Descripción</th><th class="r">Cant.</th><th class="r">Precio</th><th class="r">Total</th></tr></thead>
  <tbody>
    ${doc.items
      .map(
        (i, n) =>
          `<tr><td class="n">${n + 1}</td><td class="d">${e(i.description)}</td><td class="r">${e(i.quantity)}</td><td class="r">${money.format(i.unitPrice)}</td><td class="r"><strong>${money.format(i.total)}</strong></td></tr>`,
      )
      .join("")}
  </tbody>
</table>
<div class="bottom">
  <div class="side">
    ${
      quote && doc.dueDate
        ? `<div class="valid">Válida hasta el <strong>${e(longDate(doc.dueDate))}</strong><span>Precios en pesos dominicanos (RD$).</span></div>`
        : ""
    }
    ${doc.notes ? `<div class="notes"><h3>${quote ? "Condiciones y notas" : "Notas"}</h3><p>${e(doc.notes).replace(/\n/g, "<br/>")}</p></div>` : ""}
  </div>
  <div class="tot">
    <div class="row"><span>Subtotal</span><span>${money.format(doc.subtotal)}</span></div>
    ${doc.discount > 0 ? `<div class="row disc"><span>Descuento</span><span>-${money.format(doc.discount)}</span></div>` : ""}
    ${doc.itbis > 0 ? `<div class="row"><span>${doc.itbisIncluded ? "ITBIS incluido (18%)" : "ITBIS (18%)"}</span><span>${money.format(doc.itbis)}</span></div>` : ""}
    <div class="row big"><span>${quote ? "Total cotizado" : "Total"}</span><span>${money.format(doc.total)}</span></div>
  </div>
</div>
${quote ? `<div class="sign"><div>Preparada por · ${e(b.name)}</div><div>Aceptada por el cliente (firma y fecha)</div></div>` : ""}
</div>
<div class="ft"><span>${quote ? "Gracias por considerarnos." : "Gracias por su compra."} <strong>${e(b.name)}</strong></span><span>${b.phone ? e(b.phone) : ""}</span></div>
</div>`
}
