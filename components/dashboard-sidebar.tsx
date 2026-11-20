"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/site/logo"
import { dashboardNavigation, ALL_FEATURES } from "@/components/dashboard-nav"
import type { Features } from "@/lib/business-setup"

import { cn } from "@/lib/utils"

export function DashboardSidebar({ isAdmin = false, features = ALL_FEATURES }: { isAdmin?: boolean; features?: Features }) {
  const pathname = usePathname()

  const navigation = dashboardNavigation(features, isAdmin)

  return (
    <aside className="hidden print:hidden border-r bg-card md:block w-64 shrink-0 h-[calc(100vh-4rem)] lg:h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-16 items-center gap-2 border-b px-6 lg:flex">
        <Link href="/dashboard" aria-label="Avero Tech, dashboard" className="flex items-center">
          <Logo className="h-8" />
        </Link>
      </div>

      <div className="px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard"
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors relative group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
