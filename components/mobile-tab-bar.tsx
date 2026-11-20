"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Menu, Package, Receipt, ShoppingCart } from "lucide-react"
import { isActiveLink } from "@/components/dashboard-nav"
import type { Features } from "@/lib/business-setup"
import { cn } from "@/lib/utils"

export const OPEN_MENU_EVENT = "avero:open-menu"

/** Thumb-reach navigation on phones: the four daily screens plus the full menu. */
export function MobileTabBar({ features }: { features: Features }) {
  const pathname = usePathname()
  // Vender has its own fixed cart bar at the bottom.
  if (pathname.startsWith("/dashboard/vender")) return null

  const tabs = [
    { name: "Inicio", href: "/dashboard", icon: Home },
    features.quickSale
      ? { name: "Vender", href: "/dashboard/vender", icon: ShoppingCart }
      : { name: "Facturas", href: "/dashboard/invoices", icon: Receipt },
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Ganancias", href: "/dashboard/reports", icon: BarChart3 },
  ]

  return (
    <nav
      aria-label="Accesos principales"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden md:hidden"
    >
      {tabs.map((t) => {
        const active = isActiveLink(pathname, t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}
          >
            <t.icon className="h-5 w-5" aria-hidden />
            {t.name}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_MENU_EVENT))}
        className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground"
      >
        <Menu className="h-5 w-5" aria-hidden />
        Más
      </button>
    </nav>
  )
}
