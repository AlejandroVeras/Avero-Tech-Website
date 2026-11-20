"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Plus, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoiceShareButtons } from "@/components/invoice-share-buttons"
import type { InvoiceDocument } from "@/lib/invoice-document"

export function ReceiptActions({ document, autoPrint }: { document: InvoiceDocument; autoPrint: boolean }) {
  useEffect(() => {
    if (!autoPrint) return
    // Let the ticket render before the print dialog opens.
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [autoPrint])

  return (
    <div className="space-y-3 print:hidden">
      <InvoiceShareButtons document={document} stacked />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden /> Imprimir ticket
        </Button>
        <Button asChild>
          <Link href="/dashboard/vender">
            <Plus className="h-4 w-4" aria-hidden /> Nueva venta
          </Link>
        </Button>
      </div>
    </div>
  )
}
