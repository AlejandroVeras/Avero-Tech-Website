import Link from "next/link"
import { ArrowUpRight, FileText, Package, Receipt, Users } from "lucide-react"

const actions = [
  { icon: FileText, label: "Nueva factura", hint: "Cobra una venta", href: "/dashboard/invoices/new" },
  { icon: Users, label: "Agregar cliente", hint: "Guarda sus datos", href: "/dashboard/customers/new" },
  { icon: Package, label: "Nuevo producto", hint: "Precio y existencias", href: "/dashboard/products/new" },
  { icon: Receipt, label: "Registrar gasto", hint: "Luz, compras, nómina", href: "/dashboard/expenses/new" },
]

/** One color for every shortcut (the business's brand color via --primary), as real links. */
export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group relative flex items-center gap-3 rounded-xl border bg-card p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <action.icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground">{action.label}</span>
            <span className="block truncate text-xs text-muted-foreground">{action.hint}</span>
          </span>
          <ArrowUpRight
            className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </Link>
      ))}
    </div>
  )
}
