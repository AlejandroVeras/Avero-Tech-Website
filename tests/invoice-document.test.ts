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

test("a quote uses its own title, labels, validity and acceptance lines", () => {
  const html = invoiceDocumentHtml({ ...doc, kind: "quote", status: "approved", dueDate: "2026-12-20", paymentMethod: null })
  assert.ok(html.includes("COTIZACIÓN"))
  assert.ok(!html.includes(">FACTURA<"))
  assert.ok(html.includes("APROBADA"))
  assert.ok(html.includes("Preparada para"))
  assert.ok(html.includes("Válida hasta"))
  assert.ok(html.includes("Total cotizado"))
  assert.ok(html.includes("Aceptada por el cliente"))
  assert.equal(invoiceFileName({ ...doc, kind: "quote", invoiceNumber: "COT-0002" }), "Cotizacion-COT-0002-Boutique-Marina-Co.pdf")
})
