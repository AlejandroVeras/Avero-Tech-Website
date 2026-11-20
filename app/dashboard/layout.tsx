import type React from "react"
import { getUser } from "@/lib/auth"
import { getAccess, isPlatformAdmin } from "@/lib/data/access"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { ActivationScreen } from "@/components/billing/activation-screen"
import { redirect } from "next/navigation"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { featuresFor } from "@/lib/business-setup"
import { getBranding } from "@/lib/data/branding"
import { brandProps } from "@/lib/brand"
import type { Metadata } from "next"

// Tabs read "Vender | Avero Inventario", not the marketing site's title.
export const metadata: Metadata = {
  title: { default: "Avero Inventario", template: "%s | Avero Inventario" },
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [access, isAdmin, setup, branding] = await Promise.all([getAccess(), isPlatformAdmin(), getBusinessSetup(), getBranding()])
  const features = featuresFor(setup)

  // New accounts authorize PayPal before using the system (DATABASE_TRIAL_WITH_PAYPAL.sql).
  if (access.kind === "incomplete" && !isAdmin) {
    return <ActivationScreen businessName={user.businessName} email={user.email} />
  }

  return (
    <div className="flex min-h-screen bg-muted/40 print:bg-white" {...(brandProps(branding.brandColor) as React.HTMLAttributes<HTMLDivElement>)}>
      <DashboardSidebar isAdmin={isAdmin} features={features} />
      <div className="flex flex-col flex-1 min-w-0 w-full lg:w-[calc(100%-16rem)] border-l print:border-0">
        <DashboardHeader user={user} isAdmin={isAdmin} features={features} />
        <SubscriptionBanner access={access} businessName={user.businessName} />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
