import { redirect } from "next/navigation"
import { getProfile } from "@/lib/data/profile"
import { SettingsForm } from "@/components/settings-form"
import { BusinessSetupForm } from "@/components/business-setup-form"
import { ToolsForm } from "@/components/tools-form"
import { DocumentColorForm } from "@/components/document-color-form"
import { featuresFor } from "@/lib/business-setup"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { getBranding } from "@/lib/data/branding"
import { BrandColorForm, DashboardWidgetsForm } from "@/components/branding-settings"

export const metadata = { title: "Configuración" }

export default async function SettingsPage() {
  const [profile, setup, branding] = await Promise.all([getProfile(), getBusinessSetup(), getBranding()])

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Tus datos, tu marca y cómo funciona el sistema para tu negocio</p>
      </div>

      <SettingsForm profile={profile} />

      <BrandColorForm current={branding.brandColor} />

      <DocumentColorForm current={branding.documentColor} brandColor={branding.brandColor} businessName={profile.businessName} />

      <DashboardWidgetsForm current={branding.widgets} />

      <BusinessSetupForm setup={setup} mode="settings" />

      <ToolsForm current={featuresFor(setup)} />
    </div>
  )
}


