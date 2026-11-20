"use client"

import { escapeHtml, invoiceDocumentHtml, invoiceFileName, type InvoiceDocument } from "@/lib/invoice-document"

/** The logo as a data: URL, so the PDF renderer never reads a cross-origin image. */
async function inlineImage(url?: string) {
  if (!url || url.startsWith("data:")) return url
  try {
    const res = await fetch(url, { mode: "cors" })
    if (!res.ok) return undefined
    const blob = await res.blob()
    // jsPDF can't embed WebP: redraw it as PNG.
    const bitmap = await createImageBitmap(blob)
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0)
    return canvas.toDataURL("image/png")
  } catch {
    return undefined // no logo is better than no invoice
  }
}

/** Renders the invoice off-screen and returns it as a PDF file. */
export async function renderInvoicePdf(doc: InvoiceDocument): Promise<File> {
  const logoUrl = await inlineImage(doc.business.logoUrl)
  const html = invoiceDocumentHtml({ ...doc, business: { ...doc.business, logoUrl } })

  // An empty iframe: html2canvas can't parse the app's modern CSS colors (oklch/lab), so the
  // invoice is laid out where none of the app's stylesheets exist.
  const frame = document.createElement("iframe")
  frame.setAttribute("aria-hidden", "true")
  frame.tabIndex = -1
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:1200px;border:0;visibility:hidden"
  document.body.appendChild(frame)
  try {
    const fdoc = frame.contentDocument!
    fdoc.open()
    fdoc.write(`<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#fff">${html}</body></html>`)
    fdoc.close()
    await Promise.all(
      Array.from(fdoc.querySelectorAll("img")).map((img): Promise<unknown> | null =>
        img.complete ? null : img.decode().catch((): null => null),
      ),
    )
    // html2canvas reads only the iframe's document, so no app CSS reaches it.
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")])
    const canvas = await html2canvas(fdoc.body.firstElementChild as HTMLElement, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: 800,
    })

    // Letter page with an 8 mm margin; long invoices continue on the next pages.
    const pdf = new jsPDF({ unit: "mm", format: "letter", orientation: "portrait" })
    const margin = 8
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW - margin * 2
    const imgH = (canvas.height * imgW) / canvas.width
    const usable = pageH - margin * 2
    const img = canvas.toDataURL("image/jpeg", 0.95)
    let offset = 0
    pdf.addImage(img, "JPEG", margin, margin, imgW, imgH)
    while (imgH - offset > usable + 0.5) {
      offset += usable
      pdf.addPage()
      pdf.addImage(img, "JPEG", margin, margin - offset, imgW, imgH)
    }
    const blob = pdf.output("blob")
    return new File([blob], invoiceFileName(doc), { type: "application/pdf" })
  } finally {
    frame.remove()
  }
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
