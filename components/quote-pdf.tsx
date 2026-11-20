"use client"

import { Button } from "@/components/ui/button"
import { Mail, Printer } from "lucide-react"
import type { InvoiceDocument } from "@/lib/invoice-document"
import { printDocument } from "@/components/invoice-share"
import type { Quote } from "@/lib/data/quotes"

import type { Profile } from "@/lib/data/profile"

interface QuotePDFProps {
  /** The branded quote document that "Imprimir" prints. */
  document: InvoiceDocument
  quote: Quote
  profile: Profile
}

export function QuotePDF({ document, quote, profile }: QuotePDFProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  function formatDate(dateString: string) {
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function sendEmail() {
    const subject = encodeURIComponent(`Cotización ${quote.quoteNumber} de ${profile.businessName}`)
    const body = encodeURIComponent(
      `Estimado/a ${quote.customerName},\n\n` +
      `Adjunto encontrará la propuesta comercial (Cotización ${quote.quoteNumber}) por un monto total de ${formatCurrency(quote.total)}.\n\n` +
      `Fecha de emisión: ${formatDate(quote.issueDate)}\n` +
      (quote.validUntil ? `Válida hasta: ${formatDate(quote.validUntil)}\n\n` : '\n') +
      `Quedamos a su disposición ante cualquier consulta o requerimiento adicional.\n\n` +
      `Atentamente,\n${profile.businessName}`
    )
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => printDocument(document)} variant="outline">
        <Printer className="h-4 w-4" aria-hidden />
        Imprimir
      </Button>
      <Button onClick={sendEmail} variant="outline">
        <Mail className="h-4 w-4" aria-hidden />
        Enviar por Email
      </Button>
    </div>
  )
}
