import {
  BarChart3,
  CreditCard,
  FileText,
  Globe,
  Home,
  LifeBuoy,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"
import type { Features } from "@/lib/business-setup"
import { SITE_URL } from "@/lib/site"

export const ALL_FEATURES: Features = { quickSale: false, quotes: true, customers: true, serviceOrders: false }

export interface NavItem {
  name: string
  href: string
  icon: typeof Home
}
export interface NavGroup {
  /** Empty for the first group, which needs no heading. */
  label: string
  items: NavItem[]
}

export interface NavContext {
  isAdmin?: boolean
  /** The Avero Technology account, which runs the website catalog and the IT support desk. */
  isStoreOwner?: boolean
}

/**
 * The dashboard menu, grouped by what the business is trying to do, not by database table, and
 * trimmed to what this business uses. Hidden screens keep working by URL.
 */
export function dashboardNavigation(features: Features, ctx: NavContext = {}): NavGroup[] {
  const avero = !!(ctx.isStoreOwner || ctx.isAdmin)
  const groups: NavGroup[] = [
    {
      label: "",
      items: [
        { name: "Inicio", href: "/dashboard", icon: Home },
        ...(features.quickSale ? [{ name: "Vender", href: "/dashboard/vender", icon: ShoppingCart }] : []),
        { name: features.quickSale ? "Ventas y facturas" : "Facturas", href: "/dashboard/invoices", icon: Receipt },
      ],
    },
    {
      label: "Mi mercancía",
      items: [
        { name: "Productos", href: "/dashboard/products", icon: Package },
        { name: avero ? "Mi tienda y la web" : "Mi tienda en línea", href: "/dashboard/tienda", icon: Store },
      ],
    },
    {
      label: "Clientes",
      items: [
        ...(features.customers ? [{ name: "Clientes", href: "/dashboard/customers", icon: Users }] : []),
        ...(features.quotes ? [{ name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText }] : []),
        ...(features.serviceOrders && !avero ? [{ name: "Órdenes de servicio", href: "/dashboard/tickets", icon: Wrench }] : []),
      ],
    },
    {
      label: "Dinero",
      items: [
        { name: "Gastos", href: "/dashboard/expenses", icon: CreditCard },
        { name: "¿Cuánto gané?", href: "/dashboard/reports", icon: BarChart3 },
      ],
    },
    ...(avero
      ? [
          {
            label: "Avero",
            items: [
              { name: "Soporte técnico", href: "/dashboard/tickets", icon: LifeBuoy },
              { name: "Catálogo de la web", href: `${SITE_URL}/catalogo`, icon: Globe },
              ...(ctx.isAdmin ? [{ name: "Administración", href: "/admin", icon: ShieldCheck }] : []),
            ],
          },
        ]
      : []),
    {
      label: "Cuenta",
      items: [
        { name: "Configuración", href: "/dashboard/settings", icon: Settings },
        { name: "Mi suscripción", href: "/dashboard/suscripcion", icon: Wallet },
      ],
    },
  ]
  return groups.filter((g) => g.items.length > 0)
}

/** True when the link is the current page or a page inside it ("Inicio" only matches itself). */
export function isActiveLink(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
}

