import Link from "next/link"
import { AlertTriangle, ShoppingBag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { paymentMethodLabel } from "@/lib/pos"

const money = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" })

export const LOW_STOCK_LIMIT = 3

function todayInSantoDomingo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(new Date())
}

/** Paid invoices dated today, with a split by payment method once DATABASE_BUSINESS_SETUP.sql has run. */
export async function TodaySales() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const base = () =>
    supabase.from("invoices").select("total, payment_method").eq("user_id", user.id).eq("status", "paid").eq("issue_date", todayInSantoDomingo())
  let { data, error } = await base()
  if (error) {
    const plain = await supabase.from("invoices").select("total").eq("user_id", user.id).eq("status", "paid").eq("issue_date", todayInSantoDomingo())
    data = (plain.data ?? []).map((r) => ({ ...r, payment_method: null as string | null }))
    error = plain.error
  }
  const rows = error ? [] : (data ?? [])

  const total = rows.reduce((s, r) => s + Number(r.total), 0)
  const byMethod = new Map<string, number>()
  for (const r of rows) {
    const label = paymentMethodLabel(r.payment_method as string | null)
    if (label) byMethod.set(label, (byMethod.get(label) ?? 0) + Number(r.total))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Ventas de hoy</CardTitle>
        <ShoppingBag className="h-5 w-5 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          <p className="text-3xl font-bold">{money.format(total)}</p>
          <p className="pb-1 text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "venta" : "ventas"}
          </p>
        </div>
        {byMethod.size > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm">
            {[...byMethod].map(([label, amount]) => (
              <li key={label} className="rounded-full bg-muted px-3 py-1">
                {label}: <span className="font-medium">{money.format(amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/** Tracked products with LOW_STOCK_LIMIT units or fewer. */
export async function LowStock() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("products")
    .select("id, name, stock_quantity")
    .eq("user_id", user.id)
    .eq("track_inventory", true)
    .lte("stock_quantity", LOW_STOCK_LIMIT)
    .order("stock_quantity", { ascending: true })
    .limit(8)
  const items = data ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Productos por agotarse</CardTitle>
        <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ningún producto tiene {LOW_STOCK_LIMIT} unidades o menos.</p>
        ) : (
          <ul className="divide-y text-sm">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/dashboard/products/${p.id}`} className="truncate hover:underline">
                  {p.name}
                </Link>
                <span className={p.stock_quantity <= 0 ? "font-medium text-destructive" : "text-amber-700 dark:text-amber-400"}>
                  {p.stock_quantity <= 0 ? "Agotado" : `Quedan ${p.stock_quantity}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
