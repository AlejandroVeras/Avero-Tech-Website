import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Ticket,
  Users,
  Wallet,
} from "lucide-react"
import type { Features } from "@/lib/business-setup"

export const ALL_FEATURES: Features = { quickSale: false, quotes: true, customers: true }

/** The dashboard menu, shared by the desktop sidebar and the mobile sheet. */
export function dashboardNavigation(features: Features, isAdmin: boolean) {
  return [
    ...(features.quickSale ? [{ name: "Vender", href: "/dashboard/vender", icon: ShoppingCart }] : []),
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(features.customers ? [{ name: "Clientes", href: "/dashboard/customers", icon: Users }] : []),
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Mi tienda", href: "/dashboard/tienda", icon: Store },
    ...(features.quotes ? [{ name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText }] : []),
    { name: features.quickSale ? "Ventas y facturas" : "Facturas", href: "/dashboard/invoices", icon: Receipt },
    { name: "Gastos", href: "/dashboard/expenses", icon: CreditCard },
    { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { name: "Reportes", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
    { name: "Mi suscripción", href: "/dashboard/suscripcion", icon: Wallet },
    ...(isAdmin ? [{ name: "Administración", href: "/admin", icon: ShieldCheck }] : []),
  ]
}
