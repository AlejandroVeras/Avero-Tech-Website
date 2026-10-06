import type React from "react"
import { getUser } from "@/lib/auth"
import { getAccess } from "@/lib/data/access"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const access = await getAccess()

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 w-full lg:w-[calc(100%-16rem)] border-l">
        <DashboardHeader user={user} />
        <SubscriptionBanner access={access} businessName={user.businessName} />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
