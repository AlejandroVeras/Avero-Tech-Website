"use client"

import Link from "next/link"
import { Logo } from "@/components/site/logo"
import { dashboardNavigation, ALL_FEATURES } from "@/components/dashboard-nav"
import { DashboardNavList } from "@/components/dashboard-nav-list"
import type { Features } from "@/lib/business-setup"

export function DashboardSidebar({
  isAdmin = false,
  isStoreOwner = false,
  features = ALL_FEATURES,
}: {
  isAdmin?: boolean
  isStoreOwner?: boolean
  features?: Features
}) {
  const groups = dashboardNavigation(features, { isAdmin, isStoreOwner })

  return (
    <aside className="hidden print:hidden border-r bg-card md:block w-64 shrink-0 h-[calc(100vh-4rem)] lg:h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-16 items-center gap-2 border-b px-6 lg:flex">
        <Link href="/dashboard" aria-label="Avero Inventario, inicio" className="flex items-center">
          <Logo className="h-8" />
        </Link>
      </div>
      <div className="px-3 py-5">
        <DashboardNavList groups={groups} />
      </div>
    </aside>
  )
}
