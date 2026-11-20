"use client"

import { Button } from "@/components/ui/button"
import { Mail, Printer } from "lucide-react"
import type { Invoice } from "@/lib/data/invoices"
import type { InvoiceDocument } from "@/lib/invoice-document"
import { printDocument } from "@/components/invoice-share"

import type { Profile } from "@/lib/data/profile"
import { parseDay } from "@/lib/dates"

interface InvoicePDFProps {
  /** The branded document (lib/invoice-document.ts) that "Imprimir" prints. */
  document?: InvoiceDocument
  invoice: Invoice
  profile: Profile
  /** The business's brand color (Configuración); the Avero green otherwise. */
  brandColor?: string | null
}


export function InvoicePDF({ document, invoice, profile }: InvoicePDFProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount)
  }

  function formatDate(dateString: string) {
    return parseDay(dateString).toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function generatePDF() {
    if (document) printDocument(document)
  }

  function sendEmail() {
    const subject = encodeURIComponent(`Factura ${invoice.invoiceNumber} de ${profile.businessName}`)
    const body = encodeURIComponent(
      `Estimado/a ${invoice.customerName},\n\n` +
      `Adjunto encontrará la factura ${invoice.invoiceNumber} por un monto de ${formatCurrency(invoice.total)}.\n\n` +
      `Fecha de emisión: ${formatDate(invoice.issueDate)}\n` +
      (invoice.dueDate ? `Fecha de vencimiento: ${formatDate(invoice.dueDate)}\n\n` : '\n') +
      `Gracias por su preferencia.\n\n` +
      `Saludos,\n${profile.businessName}`
    )
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex gap-2">
      <Button onClick={generatePDF} variant="outline" disabled={!document}>
        <Printer className="h-4 w-4 mr-2" />
        Imprimir
      </Button>
      <Button onClick={sendEmail} variant="outline">
        <Mail className="h-4 w-4 mr-2" />
        Enviar por Email
      </Button>
    </div>
  )
}
