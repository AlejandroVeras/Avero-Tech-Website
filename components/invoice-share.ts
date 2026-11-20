"use client"

import { escapeHtml, invoiceDocumentHtml, invoiceFileName, type InvoiceDocument } from "@/lib/invoice-document"
import { drawDocumentPdf, type PdfLogo } from "@/lib/document-pdf"

/** The logo as a PNG data: URL with its size, so jsPDF can embed it (it can't read WebP or cross-origin URLs). */
async function loadLogo(url?: string): Promise<PdfLogo | null> {
  if (!url) return null
  try {
    const blob = url.startsWith("data:") ? await (await fetch(url)).blob() : await (await fetch(url, { mode: "cors" })).blob()
    const bitmap = await createImageBitmap(blob)
    // Keep it sharp in print but light: at most 1200 px wide.
    const scale = Math.min(1, 1200 / bitmap.width)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext("2d")!
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return { data: canvas.toDataURL("image/png"), width: canvas.width, height: canvas.height }
  } catch {
    return null // no logo is better than no document
  }
}

/** Builds the invoice or quote as a vector PDF (sharp, selectable text) and returns it as a file. */
export async function renderInvoicePdf(doc: InvoiceDocument): Promise<File> {
  const [logo, { jsPDF }] = await Promise.all([loadLogo(doc.business.logoUrl), import("jspdf")])
  const pdf = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait", compress: true })
  const kind = doc.kind === "quote" ? "Cotización" : "Factura"
  pdf.setProperties({ title: `${kind} ${doc.invoiceNumber}`, subject: `${kind} para ${doc.customerName}`, author: doc.business.name, creator: doc.business.name })
  drawDocumentPdf(pdf, doc, logo)
  const blob = pdf.output("blob")
  return new File([blob], invoiceFileName(doc), { type: "application/pdf" })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** True where the browser can hand a PDF to WhatsApp directly (phones, tablets, some desktops). */
export function canShareFiles(file: File) {
  return typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })
}

/**
 * Sends the PDF: on phones the share sheet opens and the person picks WhatsApp and the chat.
 * Where files can't be shared (most computers) the PDF downloads and WhatsApp opens with the
 * message, so it only needs to be attached.
 */
export async function sharePdfToWhatsApp(file: File, text: string): Promise<"shared" | "cancelled" | "downloaded"> {
  if (canShareFiles(file)) {
    try {
      await navigator.share({ files: [file], text })
      return "shared"
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled"
      // Any other failure (e.g. the gesture expired): fall back to download + WhatsApp.
    }
  }
  downloadFile(file)
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  return "downloaded"
}

/** Opens the same document in a new window and prints it (or "Guardar como PDF" from the dialog). */
export function printDocument(doc: InvoiceDocument) {
  const w = window.open("", "_blank")
  if (!w) return false
  const title = `${doc.kind === "quote" ? "Cotización" : "Factura"} ${doc.invoiceNumber}`
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>` +
      `<style>@page{size:letter;margin:10mm}body{margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.av-inv{margin:0 auto}</style>` +
      `</head><body>${invoiceDocumentHtml(doc)}</body></html>`,
  )
  w.document.close()
  const imgs = Array.from(w.document.images)
  Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => ((i.onload = r), (i.onerror = r)))))).then(() => {
    w.focus()
    w.print()
  })
  return true
}
