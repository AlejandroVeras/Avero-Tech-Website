import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function PricingPage() {
  const user = await getUser()

  // If already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple navbar */}
      <header className="bg-background/80 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-obsidian dark:bg-white rounded-full flex items-center justify-center text-background dark:text-obsidian font-semibold text-sm">A</div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-[13px] tracking-tight text-obsidian dark:text-foreground">AVERO</span>
              <span className="text-[9px] text-pewter uppercase tracking-[0.2em] leading-none">Technology</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="rounded-full" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-lg">
        <div className="text-center mb-10">
          <p className="text-caption uppercase tracking-[0.16em] text-pewter mb-3">Empieza hoy</p>
          <h1 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Elige tu plan</h1>
          <p className="text-body text-pewter mt-2">
            Accede a todo el sistema de gestión de Avero Technology
          </p>
        </div>

        <Card className="shadow-none border-pale-mist/70 bg-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-semibold text-obsidian dark:text-foreground">Plan Profesional</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-semibold text-obsidian dark:text-foreground">$15</span>
                <span className="text-pewter">/mes</span>
              </div>
              <p className="text-[13px] text-pewter mt-1">
                o $150/año (ahorra 2 meses)
              </p>
            </div>

            <ul className="text-left space-y-3">
              {[
                "Inventario ilimitado",
                "Tickets de soporte",
                "Base de clientes",
                "Facturación y cotizaciones PDF",
                "Reportes financieros",
                "Soporte técnico prioritario",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-obsidian/85 dark:text-foreground/85">
                  <CheckCircle2 className="h-4 w-4 text-sapphire dark:text-sky-signal shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-2">
              <p className="text-[13px] text-pewter">
                La integración de pago con Stripe se activará próximamente.
                Por ahora, contacta con nosotros para crear tu cuenta.
              </p>
              <Button size="lg" className="w-full rounded-full text-[14px] font-normal" asChild>
                <a href="https://wa.me/18298122103?text=Hola%2C%20quiero%20contratar%20el%20sistema%20de%20gesti%C3%B3n%20de%20Avero%20Technology" target="_blank" rel="noopener">
                  Contactar para suscribirse
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full text-[14px] font-normal border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
                asChild
              >
                <Link href="/signup">Crear cuenta gratuita (demo)</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-caption text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
            &lt; Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
