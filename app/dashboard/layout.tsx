import type React from "react"
import { getUser } from "@/lib/auth"
import { getAccess, isPlatformAdmin } from "@/lib/data/access"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { ActivationScreen } from "@/components/billing/activation-screen"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [access, isAdmin] = await Promise.all([getAccess(), isPlatformAdmin()])

  // Only accounts left waiting for a card under the old signup flow land here (DATABASE_TRIAL_NO_CARD.sql).
  if (access.kind === "incomplete" && !isAdmin) {
    return <ActivationScreen businessName={user.businessName} email={user.email} />
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar isAdmin={isAdmin} />
      <div className="flex flex-col flex-1 w-full lg:w-[calc(100%-16rem)] border-l">
        <DashboardHeader user={user} isAdmin={isAdmin} />
        <SubscriptionBanner access={access} businessName={user.businessName} />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
