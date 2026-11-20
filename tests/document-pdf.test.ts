import { test } from "node:test"
import assert from "node:assert/strict"
import { jsPDF } from "jspdf"
import { drawDocumentPdf, pdfText } from "../lib/document-pdf.ts"
import type { InvoiceDocument } from "../lib/invoice-document.ts"

const quote: InvoiceDocument = {
  kind: "quote",
  invoiceNumber: "COT-0002",
  status: "sent",
  customerName: "Esther Lluberes",
  issueDate: "2026-11-20",
  dueDate: "2026-12-20",
  items: [{ description: "Dell Latitude 7420 Intel i5-1135G7, 2.40GHz 8GB 256GB SSD Win11 Pro", quantity: 1, unitPrice: 21000, total: 21000 }],
  subtotal: 21000,
  discount: 5500,
  itbis: 0,
  itbisIncluded: false,
  total: 15500,
  notes: "El equipo cuenta con 6 meses de garantía.",
  business: { name: "Avero Technology", phone: "(829) 812-2103", email: "info@averotechnology.com", website: "averotechnology.com" },
  accent: "#0071e3",
}

function render(doc: InvoiceDocument) {
  const pdf = new jsPDF({ unit: "mm", format: "letter" })
  drawDocumentPdf(pdf, doc, null)
  return pdf
}

test("a quote renders as one page", () => {
  assert.equal(render(quote).getNumberOfPages(), 1)
})

test("long quotes continue on more pages and number them", () => {
  const items = Array.from({ length: 45 }, (_, i) => ({ description: `Producto ${i + 1} con una descripción larga`, quantity: 1, unitPrice: 100, total: 100 }))
  const pdf = render({ ...quote, items })
  assert.ok(pdf.getNumberOfPages() >= 2)
  assert.ok(pdf.output().includes("Página 2 de"))
})

test("text outside Latin-1 is mapped or dropped so the PDF fonts can draw it", () => {
  assert.equal(pdfText("“Hola” — niño… ✓"), '"Hola" - niño... ')
})
