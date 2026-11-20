"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { CheckCircle2, Loader2, Minus, Plus, Printer, Receipt, ScanBarcode, Search, Trash2, UserRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQuickSale } from "@/lib/data/invoices"
import type { ItbisMode } from "@/lib/business-setup"
import { PAYMENT_METHODS, changeDue, computeSaleTotals, matchProduct, type PaymentMethod } from "@/lib/pos"
import { cn } from "@/lib/utils"
import { InvoiceShareButtons } from "@/components/invoice-share-buttons"

export interface SaleProduct {
  id: string
  name: string
  sku?: string
  category?: string
  price: number
  stockQuantity: number
  trackInventory: boolean
}

type CartLine = { productId: string; quantity: number }
type Done = { id: string; invoiceNumber: string; total: number; change: number | null }

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" })
const fmt = (n: number) => money.format(n)

function parseAmount(value: string) {
  const n = Number.parseFloat(value.replace(/,/g, ""))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Bills people usually hand over for this total: exact, and the next 100 / 500 / 1,000 / 2,000. */
function cashSuggestions(total: number) {
  if (total <= 0) return []
  const up = (step: number) => Math.ceil(total / step) * step
  return [...new Set([total, up(100), up(500), up(1000), up(2000)])].slice(0, 4)
}

export function QuickSale({ products, itbisMode }: { products: SaleProduct[]; itbisMode: ItbisMode }) {
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [cart, setCart] = useState<CartLine[]>([])
  const [discount, setDiscount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [received, setReceived] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [showCustomer, setShowCustomer] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<Done | null>(null)

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? products.filter(
          (p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q),
        )
      : products
    return list.slice(0, 60)
  }, [products, query])

  const lines = cart
    .map((l) => ({ ...l, product: byId.get(l.productId) }))
    .filter((l): l is CartLine & { product: SaleProduct } => Boolean(l.product))

  const totals = computeSaleTotals({
    lines: lines.map((l) => ({ unitPrice: l.product.price, quantity: l.quantity })),
    discount: parseAmount(discount),
    itbisMode,
  })
  const receivedAmount = received.trim() === "" ? null : parseAmount(received)
  const change = method === "cash" ? changeDue(totals.total, receivedAmount) : null
  const shortCash = method === "cash" && receivedAmount !== null && receivedAmount < totals.total
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  function focusSearch() {
    requestAnimationFrame(() => searchRef.current?.focus())
  }

  function add(product: SaleProduct, fromKeyboard = false) {
    setCart((current) => {
      const found = current.find((l) => l.productId === product.id)
      return found
        ? current.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...current, { productId: product.id, quantity: 1 }]
    })
    setQuery("")
    // On phones and tablets, focusing the search after a tap would pop the keyboard up every time.
    if (fromKeyboard || window.matchMedia("(pointer: fine)").matches) focusSearch()
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((current) =>
      quantity <= 0 ? current.filter((l) => l.productId !== productId) : current.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    )
  }

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    e.preventDefault()
    // Barcode scanners type the code and press Enter.
    const match = matchProduct(products, query) ?? (results.length === 1 ? results[0] : null)
    if (match) add(match, true)
    else if (query.trim() && results.length === 0) toast.error(`No encontramos "${query.trim()}" en tus productos.`)
  }

  function reset() {
    setCart([])
    setDiscount("")
    setReceived("")
    setCustomerName("")
    setShowCustomer(false)
    setMethod("cash")
    setDone(null)
    focusSearch()
  }

  async function charge() {
    if (lines.length === 0 || shortCash) return
    setSaving(true)
    try {
      const result = await createQuickSale({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod: method,
        discount: totals.discount,
        amountReceived: method === "cash" ? receivedAmount : null,
        customerName: customerName.trim() || undefined,
      })
      if ("error" in result) {
        toast.error(result.error)
      } else {
        setDone({ id: result.id, invoiceNumber: result.invoiceNumber, total: result.total, change: result.change })
      }
    } catch {
      toast.error("No pudimos registrar la venta. Revisa tu conexión e intenta de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="space-y-6 p-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" aria-hidden />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Venta registrada</h2>
            <p className="text-muted-foreground">Factura {done.invoiceNumber} · {fmt(done.total)}</p>
          </div>
          {done.change !== null && done.change > 0 && (
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Devuelta</p>
              <p className="text-3xl font-bold">{fmt(done.change)}</p>
            </div>
          )}
          <InvoiceShareButtons invoiceId={done.id} stacked />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" size="lg">
              <Link href={`/dashboard/vender/recibo/${done.id}?imprimir=1`}>
                <Printer className="h-4 w-4" aria-hidden /> Imprimir ticket
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/dashboard/vender/recibo/${done.id}`}>
                <Receipt className="h-4 w-4" aria-hidden /> Ver ticket
              </Link>
            </Button>
          </div>
          <Button size="lg" className="h-12 w-full text-base" onClick={reset} autoFocus>
            Nueva venta
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
      {/* Products */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Busca por nombre o escanea el código"
            aria-label="Buscar producto o escanear código"
            className="h-14 rounded-2xl pl-12 pr-12 text-base"
            autoComplete="off"
          />
          <ScanBarcode className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="space-y-3 p-8 text-center">
              <p className="font-medium">Todavía no tienes productos.</p>
              <p className="text-sm text-muted-foreground">Agrega lo que vendes y aparecerá aquí para venderlo con un toque.</p>
              <Button asChild>
                <Link href="/dashboard/products/new">Agregar producto</Link>
              </Button>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Ningún producto coincide con “{query}”.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {results.map((p) => {
              const out = p.trackInventory && p.stockQuantity <= 0
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    className="flex h-full w-full flex-col justify-between gap-2 rounded-2xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="line-clamp-2 text-sm font-medium">{p.name}</span>
                    <span className="flex items-end justify-between gap-2">
                      <span className="font-semibold">{fmt(p.price)}</span>
                      {p.trackInventory && (
                        <span className={cn("text-xs", out ? "font-medium text-destructive" : "text-muted-foreground")}>
                          {out ? "Agotado" : `${p.stockQuantity} disp.`}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Cart */}
      <Card id="carrito" className="h-fit lg:sticky lg:top-20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Venta</span>
            {lines.length > 0 && (
              <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                Vaciar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {lines.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Toca un producto o escanea su código para agregarlo.
            </p>
          ) : (
            <ul className="divide-y">
              {lines.map((l) => {
                const low = l.product.trackInventory && l.quantity > l.product.stockQuantity
                return (
                  <li key={l.productId} className="space-y-1 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{l.product.name}</span>
                      <span className="text-sm font-semibold">{fmt(l.product.price * l.quantity)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label={`Quitar uno de ${l.product.name}`} onClick={() => setQuantity(l.productId, l.quantity - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">{l.quantity}</span>
                        <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label={`Agregar uno de ${l.product.name}`} onClick={() => setQuantity(l.productId, l.quantity + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="ml-2 text-xs text-muted-foreground">× {fmt(l.product.price)}</span>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Eliminar ${l.product.name}`} onClick={() => setQuantity(l.productId, 0)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {low && (
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        En inventario quedan {Math.max(l.product.stockQuantity, 0)}. Puedes vender igual.
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {lines.length > 0 && (
            <>
              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmt(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-muted-foreground">
                  <Label htmlFor="discount">Descuento (RD$)</Label>
                  <Input id="discount" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className="h-8 w-28 text-right" />
                </div>
                {itbisMode !== "none" && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{totals.itbisIncluded ? "ITBIS incluido (18%)" : "ITBIS (18%)"}</span>
                    <span>{fmt(totals.itbis)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-xl font-bold">
                  <span>Total</span>
                  <span>{fmt(totals.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Forma de pago</p>
                <div role="radiogroup" aria-label="Forma de pago" className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={method === m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        method === m.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {method === "cash" && (
                <div className="space-y-2">
                  <Label htmlFor="received">Recibido (opcional)</Label>
                  <Input id="received" inputMode="decimal" value={received} onChange={(e) => setReceived(e.target.value)} placeholder={fmt(totals.total)} className="h-11 text-base" />
                  <div className="flex flex-wrap gap-2">
                    {cashSuggestions(totals.total).map((amount) => (
                      <Button key={amount} type="button" variant="outline" size="sm" onClick={() => setReceived(String(amount))}>
                        {fmt(amount)}
                      </Button>
                    ))}
                  </div>
                  {change !== null && change > 0 && <p className="text-sm font-semibold">Devuelta: {fmt(change)}</p>}
                  {shortCash && <p className="text-sm text-destructive">Lo recibido no cubre el total.</p>}
                </div>
              )}

              {showCustomer ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="customerName">Nombre del cliente</Label>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Quitar cliente" onClick={() => { setShowCustomer(false); setCustomerName("") }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Consumidor final" maxLength={120} />
                </div>
              ) : (
                <button type="button" onClick={() => setShowCustomer(true)} className="flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:underline">
                  <UserRound className="h-4 w-4" aria-hidden /> Agregar nombre del cliente (opcional)
                </button>
              )}

              <Button size="lg" className="hidden h-14 w-full text-lg lg:flex" onClick={charge} disabled={saving || shortCash}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                Cobrar {fmt(totals.total)}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile: the charge button stays at the bottom of the screen. */}
      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <a href="#carrito" className="min-w-0 flex-1 text-sm">
              <span className="block text-muted-foreground">{itemCount} {itemCount === 1 ? "artículo" : "artículos"}</span>
              <span className="block text-lg font-bold">{fmt(totals.total)}</span>
            </a>
            <Button size="lg" className="h-12 px-8 text-base" onClick={charge} disabled={saving || shortCash}>
              {saving && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
              Cobrar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
