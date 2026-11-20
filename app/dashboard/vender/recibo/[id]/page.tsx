import { notFound, redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { getInvoice } from "@/lib/data/invoices"
import { getProfile } from "@/lib/data/profile"
import { changeDue, paymentMethodLabel } from "@/lib/pos"
import { ReceiptActions } from "@/components/pos/receipt-actions"
import { getInvoiceDocument } from "@/lib/data/invoice-document-actions"

export const metadata = { title: "Ticket de venta" }

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" })
const fmt = (n: number) => money.format(n)

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ imprimir?: string }>
}) {
  const user = await getUser()
  if (!user) redirect("/login")

  const [{ id }, { imprimir }] = await Promise.all([params, searchParams])
  const [invoice, profile, document] = await Promise.all([getInvoice(id), getProfile(), getInvoiceDocument(id)])
  if (!invoice || !profile || !document) notFound()

  // The server runs in UTC; the ticket shows Santo Domingo time.
  const when = invoice.createdAt.toLocaleString("es-DO", {
    timeZone: "America/Santo_Domingo",
    dateStyle: "short",
    timeStyle: "short",
  })
  const method = paymentMethodLabel(invoice.paymentMethod)
  const change = changeDue(invoice.total, invoice.amountReceived)


  return (
    <div className="mx-auto max-w-md space-y-6 p-4 md:p-6 print:m-0 print:max-w-none print:p-0">
      {/* 80 mm thermal paper; the dashboard menu and header are hidden when printing. */}
      <style>{`@media print { @page { size: 80mm auto; margin: 4mm; } body { background: #fff !important; } }`}</style>

      <ReceiptActions document={document} autoPrint={imprimir === "1"} />

      <article
        aria-label={`Ticket ${invoice.invoiceNumber}`}
        className="mx-auto w-full max-w-[80mm] rounded-xl border bg-white p-5 font-mono text-[12px] leading-relaxed text-black shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        <header className="space-y-0.5 text-center">
          {profile.logoUrl && (
            // Grayscale: thermal printers print in black only.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logoUrl} alt="" className="mx-auto mb-2 h-14 w-auto max-w-[60%] object-contain grayscale" />
          )}
          <p className="text-[14px] font-bold">{profile.businessName}</p>
          {profile.taxId && <p>RNC: {profile.taxId}</p>}
          {profile.address && <p>{profile.address}</p>}
          {profile.phone && <p>Tel.: {profile.phone}</p>}
        </header>

        <div className="my-3 border-t border-dashed border-black" />

        <p>Factura: {invoice.invoiceNumber}</p>
        <p>Fecha: {when}</p>
        <p>Cliente: {invoice.customerName}</p>

        <div className="my-3 border-t border-dashed border-black" />

        <ul className="space-y-1.5">
          {invoice.items.map((item) => (
            <li key={item.id}>
              <p>{item.description}</p>
              <p className="flex justify-between">
                <span>
                  {item.quantity} × {fmt(item.unitPrice)}
                </span>
                <span>{fmt(item.total)}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-dashed border-black" />

        <dl className="space-y-0.5">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{fmt(invoice.subtotal)}</dd>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <dt>Descuento</dt>
              <dd>-{fmt(invoice.discount)}</dd>
            </div>
          )}
          {invoice.itbis > 0 && (
            <div className="flex justify-between">
              <dt>{invoice.itbisIncluded ? "ITBIS incluido 18%" : "ITBIS 18%"}</dt>
              <dd>{fmt(invoice.itbis)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-1 text-[14px] font-bold">
            <dt>TOTAL</dt>
            <dd>{fmt(invoice.total)}</dd>
          </div>
          {method && (
            <div className="flex justify-between">
              <dt>Pago</dt>
              <dd>{method}</dd>
            </div>
          )}
          {invoice.amountReceived != null && (
            <div className="flex justify-between">
              <dt>Recibido</dt>
              <dd>{fmt(invoice.amountReceived)}</dd>
            </div>
          )}
          {change !== null && change > 0 && (
            <div className="flex justify-between">
              <dt>Devuelta</dt>
              <dd>{fmt(change)}</dd>
            </div>
          )}
        </dl>

        <div className="my-3 border-t border-dashed border-black" />
        <p className="text-center">¡Gracias por su compra!</p>
      </article>
    </div>
  )
}
