// Invoices and quotes drawn as a real (vector) PDF with jsPDF: sharp text at any zoom, selectable
// and searchable, the logo at full resolution and proper page breaks. Same look as the printed
// HTML (lib/invoice-document.ts). Only type imports, so tests can run this file with node.

import type { jsPDF } from "jspdf"
import { longDate, money, PAYMENT, QUOTE_STATUS, STATUS, type InvoiceDocument } from "./invoice-document.ts"

export interface PdfLogo {
  /** data:image/png;base64,... */
  data: string
  width: number
  height: number
}

type RGB = [number, number, number]

const INK: RGB = [15, 23, 42]
const BODY: RGB = [51, 65, 85]
const MUTED: RGB = [100, 116, 139]
const FAINT: RGB = [148, 163, 184]
const RULE: RGB = [203, 213, 225]
const LIGHT_RULE: RGB = [226, 232, 240]
const ZEBRA: RGB = [248, 250, 252]
const RED: RGB = [185, 28, 28]

function rgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** The standard PDF fonts only cover Latin-1: map common typographic characters and drop the rest. */
export function pdfText(value: unknown) {
  return String(value ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[  ]/g, " ")
    .replace(/[^\n -~ -ÿ]/g, "")
}

export function drawDocumentPdf(pdf: jsPDF, doc: InvoiceDocument, logo?: PdfLogo | null) {
  const quote = doc.kind === "quote"
  const accent = rgb(/^#[0-9a-f]{6}$/i.test(doc.accent ?? "") ? doc.accent! : "#10b981")
  const b = doc.business
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const M = 16 // side margin, mm
  const R = W - M
  const FOOTER = 20 // reserved at the bottom of every page
  const t = pdfText

  const color = (c: RGB) => pdf.setTextColor(c[0], c[1], c[2])
  const font = (style: "normal" | "bold", size: number, c: RGB = BODY) => {
    pdf.setFont("helvetica", style)
    pdf.setFontSize(size)
    color(c)
  }
  const hline = (x1: number, x2: number, y: number, c: RGB, w = 0.2) => {
    pdf.setDrawColor(c[0], c[1], c[2])
    pdf.setLineWidth(w)
    pdf.line(x1, y, x2, y)
  }
  /** Spaced uppercase label; returns nothing, drawn left-aligned or ending at x when right. */
  const label = (text: string, x: number, y: number, right = false, c: RGB = FAINT, size = 6.8) => {
    font("bold", size, c)
    const cs = 0.35
    const s = t(text.toUpperCase())
    const w = pdf.getTextWidth(s) + cs * Math.max(0, s.length - 1)
    pdf.text(s, right ? x - w : x, y, { charSpace: cs })
  }

  // ─── Header ────────────────────────────────────────────────────────────
  pdf.setFillColor(accent[0], accent[1], accent[2])
  pdf.rect(0, 0, W, 2.2, "F")

  let y = 14
  let leftY = y
  if (logo) {
    const maxH = 17
    const maxW = 62
    const ratio = logo.width / logo.height
    let h = maxH
    let w = h * ratio
    if (w > maxW) {
      w = maxW
      h = w / ratio
    }
    pdf.addImage(logo.data, "PNG", M, y, w, h, undefined, "SLOW")
    leftY = y + h + 6
  } else {
    leftY = y + 4
  }
  font("bold", logo ? 10.5 : 16, INK)
  pdf.text(t(b.name), M, leftY)
  leftY += logo ? 4.6 : 6
  font("normal", 8.4, MUTED)
  for (const line of [b.taxId ? `RNC: ${b.taxId}` : "", b.address ?? "", b.phone ? `Tel. ${b.phone}` : "", b.email ?? "", b.website ?? ""]) {
    if (!line) continue
    for (const part of pdf.splitTextToSize(t(line), 95) as string[]) {
      pdf.text(part, M, leftY)
      leftY += 3.9
    }
  }

  // Title block, right
  const title = quote ? "COTIZACIÓN" : "FACTURA"
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(21)
  color(INK)
  const tcs = 1.6
  const tw = pdf.getTextWidth(t(title)) + tcs * (title.length - 1)
  pdf.text(t(title), R - tw, y + 7, { charSpace: tcs })
  font("bold", 11, accent)
  pdf.text(t(`No. ${doc.invoiceNumber}`), R, y + 14, { align: "right" })

  const status = (quote ? QUOTE_STATUS : STATUS)[doc.status] ?? doc.status.toUpperCase()
  const good = doc.status === (quote ? "approved" : "paid")
  const bad = ["rejected", "cancelled", "overdue"].includes(doc.status)
  const badgeC: RGB = good ? [22, 101, 52] : bad ? [153, 27, 27] : [71, 85, 105]
  const badgeB: RGB = good ? [134, 239, 172] : bad ? [252, 165, 165] : RULE
  font("bold", 6.8, badgeC)
  const bcs = 0.4
  const bw = pdf.getTextWidth(t(status)) + bcs * (status.length - 1) + 6
  pdf.setDrawColor(badgeB[0], badgeB[1], badgeB[2])
  pdf.setLineWidth(0.3)
  pdf.roundedRect(R - bw, y + 17.5, bw, 5.6, 0.8, 0.8, "S")
  pdf.text(t(status), R - bw + 3, y + 21.3, { charSpace: bcs })

  y = Math.max(leftY + 2, y + 28)
  hline(M, R, y, RULE, 0.25)

  // ─── Client and dates ──────────────────────────────────────────────────
  y += 8
  label(quote ? "Preparada para" : "Cliente", M, y)
  font("bold", 13, INK)
  const clientLines = pdf.splitTextToSize(t(doc.customerName), 95) as string[]
  pdf.text(clientLines, M, y + 6.5)

  const facts: [string, string][] = [["Fecha de emisión", longDate(doc.issueDate)]]
  if (doc.dueDate) facts.push([quote ? "Válida hasta" : "Vence", longDate(doc.dueDate)])
  const pay = doc.paymentMethod ? PAYMENT[doc.paymentMethod] : undefined
  if (pay) facts.push(["Forma de pago", pay])
  let fy = y + 0.5
  for (const [k, v] of facts) {
    font("normal", 8.8, MUTED)
    pdf.text(t(k), R - 74, fy)
    font("bold", 8.8, INK)
    pdf.text(t(v), R, fy, { align: "right" })
    fy += 5.6
  }
  y = Math.max(y + 6.5 + clientLines.length * 5.2, fy) + 6

  // ─── Items table ───────────────────────────────────────────────────────
  const col = { n: M + 3, desc: M + 11, qty: R - 62, price: R - 30, total: R - 3 }
  const descW = col.qty - 14 - col.desc
  const tableHeader = () => {
    pdf.setFillColor(INK[0], INK[1], INK[2])
    pdf.rect(M, y, R - M, 8.5, "F")
    const hy = y + 5.5
    label("#", col.n, hy, false, [255, 255, 255], 6.6)
    label("Descripción", col.desc, hy, false, [255, 255, 255], 6.6)
    label("Cant.", col.qty, hy, true, [255, 255, 255], 6.6)
    label("Precio unit.", col.price, hy, true, [255, 255, 255], 6.6)
    label("Importe", col.total, hy, true, [255, 255, 255], 6.6)
    y += 8.5
  }
  const newPage = () => {
    pdf.addPage()
    pdf.setFillColor(accent[0], accent[1], accent[2])
    pdf.rect(0, 0, W, 2.2, "F")
    y = 14
  }

  tableHeader()
  doc.items.forEach((item, i) => {
    font("normal", 9, INK)
    const lines = pdf.splitTextToSize(t(item.description), descW) as string[]
    const rowH = Math.max(9, lines.length * 4.1 + 5)
    if (y + rowH > H - FOOTER) {
      newPage()
      tableHeader()
    }
    if (i % 2 === 1) {
      pdf.setFillColor(ZEBRA[0], ZEBRA[1], ZEBRA[2])
      pdf.rect(M, y, R - M, rowH, "F")
    }
    const base = y + 5.6
    font("normal", 8.6, FAINT)
    pdf.text(String(i + 1), col.n, base)
    font("normal", 9, INK)
    pdf.text(lines, col.desc, base, { lineHeightFactor: 1.3 })
    font("normal", 9, BODY)
    pdf.text(t(String(item.quantity)), col.qty, base, { align: "right" })
    pdf.text(t(money.format(item.unitPrice)), col.price, base, { align: "right" })
    font("bold", 9, INK)
    pdf.text(t(money.format(item.total)), col.total, base, { align: "right" })
    y += rowH
    hline(M, R, y, LIGHT_RULE)
  })

  // ─── Notes (left) and totals (right) ───────────────────────────────────
  const totW = 72
  const totX = R - totW
  const sideW = totX - 10 - M
  const blocks: { title: string; text: string }[] = []
  if (quote && doc.dueDate) {
    blocks.push({ title: "Vigencia", text: `Esta cotización es válida hasta el ${longDate(doc.dueDate)}. Precios en pesos dominicanos (RD$).` })
  }
  if (doc.notes) blocks.push({ title: quote ? "Condiciones y notas" : "Notas", text: doc.notes })

  font("normal", 9, BODY)
  const blockLines = blocks.map((bl) => pdf.splitTextToSize(t(bl.text), sideW - 5) as string[])
  const blocksH = blockLines.reduce((h, l) => h + 8 + l.length * 4.2 + 5, 0)
  const totRows = 1 + (doc.discount > 0 ? 1 : 0) + (doc.itbis > 0 ? 1 : 0)
  const totalsH = totRows * 7 + 16
  if (y + 8 + Math.max(blocksH, totalsH) > H - FOOTER) newPage()
  y += 8
  const top = y

  // Totals
  let ty = top + 4
  const totRow = (k: string, v: string, c: RGB = BODY) => {
    font("normal", 9, c)
    pdf.text(t(k), totX, ty)
    pdf.text(t(v), R, ty, { align: "right" })
    ty += 2.6
    hline(totX, R, ty, [241, 245, 249])
    ty += 4.4
  }
  totRow("Subtotal", money.format(doc.subtotal))
  if (doc.discount > 0) totRow("Descuento", `-${money.format(doc.discount)}`, RED)
  if (doc.itbis > 0) totRow(doc.itbisIncluded ? "ITBIS incluido (18%)" : "ITBIS (18%)", money.format(doc.itbis))
  ty -= 2
  hline(totX, R, ty, INK, 0.6)
  ty += 8
  label(quote ? "Total cotizado" : "Total", totX, ty - 0.6, false, INK, 7.4)
  font("bold", 15, accent)
  pdf.text(t(money.format(doc.total)), R, ty, { align: "right" })
  ty += 4

  // Blocks
  let by = top
  blocks.forEach((bl, i) => {
    const lines = blockLines[i]
    const h = 8 + lines.length * 4.2 + 2
    pdf.setDrawColor(accent[0], accent[1], accent[2])
    pdf.setLineWidth(0.6)
    pdf.line(M + 0.3, by, M + 0.3, by + h)
    label(bl.title, M + 5, by + 4.4, false, INK, 6.8)
    font("normal", 9, BODY)
    pdf.text(lines, M + 5, by + 9.6, { lineHeightFactor: 1.35 })
    by += h + 5
  })
  y = Math.max(ty, by)

  // ─── Signatures (quotes) ───────────────────────────────────────────────
  if (quote) {
    if (y + 30 > H - FOOTER) newPage()
    y = Math.max(y + 22, y + 22)
    const sw = (R - M - 20) / 2
    hline(M, M + sw, y, MUTED, 0.3)
    hline(R - sw, R, y, MUTED, 0.3)
    font("normal", 7.8, MUTED)
    pdf.text("Preparada por", M + sw / 2, y + 4.5, { align: "center" })
    pdf.text("Aceptada por el cliente", R - sw / 2, y + 4.5, { align: "center" })
    font("bold", 7.8, BODY)
    pdf.text(t(b.name), M + sw / 2, y + 8.3, { align: "center" })
    font("normal", 7.8, MUTED)
    pdf.text("Firma y fecha", R - sw / 2, y + 8.3, { align: "center" })
  }

  // ─── Footer on every page ──────────────────────────────────────────────
  const pages = pdf.getNumberOfPages()
  const contact = [b.phone, b.email, b.website].filter(Boolean).join("  ·  ")
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p)
    hline(M, R, H - 13, RULE, 0.25)
    font("normal", 7.4, FAINT)
    pdf.text(t(`${quote ? "Gracias por considerarnos." : "Gracias por su compra."}  ${b.name}${contact ? `  ·  ${contact}` : ""}`), M, H - 8.5)
    pdf.text(`Página ${p} de ${pages}`, R, H - 8.5, { align: "right" })
  }
}
