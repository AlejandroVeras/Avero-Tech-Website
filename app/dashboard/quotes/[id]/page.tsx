import { redirect, notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getQuote } from "@/lib/data/quotes"
import { getCustomers } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"
import { getProfile } from "@/lib/data/profile"
import { QuoteForm } from "@/components/quote-form"
import { QuotePDF } from "@/components/quote-pdf"
import { InvoiceShareButtons } from "@/components/invoice-share-buttons"
import { getBranding } from "@/lib/data/branding"
import type { InvoiceDocument } from "@/lib/invoice-document"

export const metadata = { title: "Cotización" }

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const { id } = await params
  const [quote, customers, products, profile, branding] = await Promise.all([
    getQuote(id),
    getCustomers(),
    getProducts(),
    getProfile(),
    getBranding(),
  ])

  if (!quote || !profile) {
    notFound()
  }

  const document: InvoiceDocument = {
    kind: "quote",
    invoiceNumber: quote.quoteNumber,
    status: quote.status,
    customerName: quote.customerName,
    issueDate: quote.issueDate,
    dueDate: quote.validUntil,
    items: quote.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
    subtotal: quote.subtotal,
    discount: quote.discount,
    itbis: quote.itbis,
    itbisIncluded: false,
    total: quote.total,
    notes: quote.notes,
    business: {
      name: profile.businessName,
      taxId: profile.taxId,
      phone: profile.phone,
      address: profile.address,
      website: profile.website,
      email: profile.email,
      logoUrl: profile.logoUrl,
    },
    accent: branding.brandColor,
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Cotización {quote.quoteNumber}</p>
        <h1 className="text-3xl font-bold tracking-tight">{quote.customerName}</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <p className="px-1 text-sm text-muted-foreground">Envía o descarga la cotización con tu logo.</p>
        <div className="flex flex-wrap items-center gap-2">
          <InvoiceShareButtons document={document} />
          <QuotePDF document={document} quote={quote} profile={profile} />
        </div>
      </div>

      <QuoteForm quote={quote} customers={customers} products={products} />
    </div>
  )
}

