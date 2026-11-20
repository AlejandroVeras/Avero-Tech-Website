"use client"

import { useEffect, useState } from "react"
import { Download, Loader2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getInvoiceDocument } from "@/lib/data/invoice-document-actions"
import type { InvoiceDocument } from "@/lib/invoice-document"
import { downloadFile, renderInvoicePdf, sharePdfToWhatsApp } from "@/components/invoice-share"
import { cn } from "@/lib/utils"

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" })

/**
 * "Enviar por WhatsApp" sends the invoice as a PDF with the store's logo, not as text.
 * The PDF is built as soon as the buttons appear: phones only open the share sheet if it
 * happens right on the tap, with nothing slow in between.
 */
export function InvoiceShareButtons({
  invoiceId,
  document: initial,
  className,
  stacked = false,
}: {
  invoiceId?: string
  document?: InvoiceDocument
  className?: string
  /** Full-width buttons, one per row (sale confirmation screen). */
  stacked?: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [doc, setDoc] = useState<InvoiceDocument | null>(initial ?? null)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [hint, setHint] = useState("")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = initial ?? (invoiceId ? await getInvoiceDocument(invoiceId) : null)
        if (!d) throw new Error("not found")
        const pdf = await renderInvoicePdf(d)
        if (!cancelled) {
          setDoc(d)
          setFile(pdf)
        }
      } catch (err) {
        console.error("invoice pdf:", err)
        if (!cancelled) setFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initial, invoiceId])

  async function sendWhatsApp() {
    if (!file || !doc) return
    setBusy(true)
    const text =
      doc.kind === "quote"
        ? `Cotización ${doc.invoiceNumber} de ${doc.business.name} por ${money.format(doc.total)}.`
        : `Factura ${doc.invoiceNumber} de ${doc.business.name} por ${money.format(doc.total)}.`
    const result = await sharePdfToWhatsApp(file, text)
    setBusy(false)
    if (result === "downloaded") {
      setHint("Se descargó el PDF y se abrió WhatsApp: elige el chat y adjunta el archivo con el clip.")
    }
  }

  if (failed) {
    return <p className="text-sm text-destructive">No se pudo preparar el PDF. Recarga la página e intenta de nuevo.</p>
  }

  const ready = !!file && !busy
  const noun = (doc ?? initial)?.kind === "quote" ? "cotización" : "factura"
  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("gap-2", stacked ? "grid" : "flex flex-wrap")}>
        <Button type="button" onClick={sendWhatsApp} disabled={!ready} size={stacked ? "lg" : "default"}>
          {file ? <MessageCircle className="h-4 w-4" aria-hidden /> : <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {file ? (stacked ? `Enviar ${noun} por WhatsApp` : "Enviar por WhatsApp") : "Preparando PDF…"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => file && (downloadFile(file), toast.success("PDF descargado"))}
          disabled={!ready}
          size={stacked ? "lg" : "default"}
        >
          <Download className="h-4 w-4" aria-hidden /> Descargar PDF
        </Button>
      </div>
      {hint && (
        <p role="status" className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
