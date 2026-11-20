"use server"

import { getInvoice } from "@/lib/data/invoices"
import { getProfile } from "@/lib/data/profile"
import { documentAccent, getBranding } from "@/lib/data/branding"
import type { InvoiceDocument } from "@/lib/invoice-document"

/** Everything the invoice PDF needs, for the signed-in business's own invoice. */
export async function getInvoiceDocument(id: string): Promise<InvoiceDocument | null> {
  const [invoice, profile, branding] = await Promise.all([getInvoice(id), getProfile(), getBranding()])
  if (!invoice || !profile) return null

  return {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    customerName: invoice.customerName,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    items: invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    itbis: invoice.itbis,
    itbisIncluded: invoice.itbisIncluded,
    total: invoice.total,
    notes: invoice.notes,
    paymentMethod: invoice.paymentMethod ?? null,
    business: {
      name: profile.businessName,
      taxId: profile.taxId,
      phone: profile.phone,
      address: profile.address,
      website: profile.website,
      email: profile.email,
      logoUrl: profile.logoUrl,
    },
    accent: documentAccent(branding),
  }
}
