import { redirect } from "next/navigation"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { getUser } from "@/lib/auth"
import { getBusinessSetup } from "@/lib/data/business-setup"
import { featuresFor, type Features } from "@/lib/business-setup"
import { Button } from "@/components/ui/button"
import { getBranding } from "@/lib/data/branding"
import { LowStock, TodaySales } from "@/components/dashboard-widgets"
import type { WidgetId } from "@/lib/brand"

import { DashboardStats } from "@/components/dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { FirstSteps } from "@/components/onboarding/first-steps"
import { getFirstSteps } from "@/lib/data/first-steps"
import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

// Forzamos a que esta página sea dinámica y no se guarde en caché estático
export const dynamic = "force-dynamic"
// Same folder as the dashboard layout, so its title template does not apply here.
export const metadata = { title: { absolute: "Inicio | Avero Inventario" } }

function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ActivityLoading() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Each business picks which cards it sees and in what order (Configuración → Inicio del dashboard).
function widgetsFor(counter: boolean, features: Features): Record<WidgetId, React.ReactNode> {
  return {
    "quick-actions": <QuickActions features={features} />,
    "today-sales": (
      <Suspense fallback={<ActivityLoading />}>
        <TodaySales />
      </Suspense>
    ),
    stats: (
      <Suspense fallback={<StatsLoading />}>
        <DashboardStats counter={counter} />
      </Suspense>
    ),
    "low-stock": (
      <Suspense fallback={<ActivityLoading />}>
        <LowStock />
      </Suspense>
    ),
    "recent-activity": (
      <Suspense fallback={<ActivityLoading />}>
        <RecentActivity />
      </Suspense>
    ),
  }
}

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const [setup, branding] = await Promise.all([getBusinessSetup(), getBranding()])
  // New accounts answer what kind of business they are before anything else (or skip it).
  if (!setup.completed) redirect("/dashboard/bienvenida")
  const features = featuresFor(setup)
  const { quickSale, quotes } = features
  const WIDGETS = widgetsFor(!quotes, features)
  const steps = await getFirstSteps(features)

  return (
    <div className="min-h-screen bg-background">

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inicio</h1>
          <p className="text-muted-foreground mt-1">Hola, {user.businessName}. Así va tu negocio.</p>
        </div>

        {quickSale && (
          <Button asChild size="lg" className="h-14 w-full rounded-2xl text-base sm:w-auto sm:px-10">
            <Link href="/dashboard/vender">
              <ShoppingCart className="h-5 w-5" aria-hidden /> Vender
            </Link>
          </Button>
        )}

        <FirstSteps steps={steps} />

        {branding.widgets.filter((w) => w.visible).map((w) => (
          <div key={w.id}>{WIDGETS[w.id]}</div>
        ))}
      </div>
    </div>
  )
}

