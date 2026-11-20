"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import type { Quote } from "@/lib/data/quotes"

import type { Profile } from "@/lib/data/profile"

interface QuotePDFProps {
  quote: Quote
  profile: Profile
}

export function QuotePDF({ quote, profile }: QuotePDFProps) {
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
    <div className="flex">
      <Button onClick={sendEmail} variant="outline" className="border-primary/20 hover:bg-primary/5">
        <Mail className="h-4 w-4 mr-2 text-primary" />
        Enviar por Email
      </Button>
    </div>
  )
}
