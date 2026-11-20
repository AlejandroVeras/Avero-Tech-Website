import { test } from "node:test"
import assert from "node:assert/strict"
import { invoiceDocumentHtml, invoiceFileName, type InvoiceDocument } from "../lib/invoice-document.ts"

const doc: InvoiceDocument = {
  invoiceNumber: "INV-0005",
  status: "paid",
  customerName: "Consumidor final",
  issueDate: "2026-11-17",
  items: [{ description: "Blusa <b>lino</b>", quantity: 1, unitPrice: 1450, total: 1450 }],
  subtotal: 1450,
  discount: 0,
  itbis: 221.19,
  itbisIncluded: true,
  total: 1450,
  paymentMethod: "cash",
  business: { name: "Boutique Marina & Co", logoUrl: "data:image/png;base64,AAAA" },
  accent: "#be185d",
}

test("the PDF carries the logo, the brand color and the ITBIS label", () => {
  const html = invoiceDocumentHtml(doc)
  assert.ok(html.includes('<img class="logo" src="data:image/png;base64,AAAA"'))
  assert.ok(html.includes("#be185d"))
  assert.ok(html.includes("ITBIS incluido (18%)"))
  assert.ok(html.includes("Pago: Efectivo"))
  assert.ok(html.includes("PAGADA"))
})

test("text from the business and the products is escaped", () => {
  const html = invoiceDocumentHtml(doc)
  assert.ok(html.includes("Blusa &lt;b&gt;lino&lt;/b&gt;"))
  assert.ok(html.includes("Boutique Marina &amp; Co"))
  assert.ok(!html.includes("<b>lino</b>"))
})

test("a logo that is not https or data: is left out, and a bad color falls back", () => {
  const html = invoiceDocumentHtml({ ...doc, business: { name: "X", logoUrl: "javascript:alert(1)" }, accent: "red;}" })
  assert.ok(!html.includes('class="logo"'))
  assert.ok(html.includes("#10b981"))
})

test("file name is safe for phones and WhatsApp", () => {
  assert.equal(invoiceFileName(doc), "Factura-INV-0005-Boutique-Marina-Co.pdf")
})
