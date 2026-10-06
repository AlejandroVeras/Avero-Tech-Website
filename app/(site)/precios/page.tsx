import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { SYSTEM_FAQ } from "@/components/site/faq-content"
import { whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Plan Profesional del sistema de gestión de Avero Technology: inventario, ventas a crédito, facturación con ITBIS y reportes.",
}

export default function PreciosPage() {
  return (
    <>
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Sistema de gestión"
            title="Elige tu plan"
            description="Un solo plan con todo incluido. Sin contratos de permanencia."
            className="mb-12"
          />
          <PlanCard
            cta={
              <div className="space-y-3 pt-2">
                <p className="text-[13px] text-pewter">
                  Por ahora la suscripción se coordina por WhatsApp: te ayudamos a crear la cuenta y te indicamos cómo
                  pagar.
                </p>
                <Button size="lg" className="w-full rounded-full text-[14px] font-normal" asChild>
                  <a
                    href={whatsappUrl("Hola, quiero contratar el sistema de gestión de Avero Technology")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contratar por WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full text-[14px] font-normal border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
                  asChild
                >
                  <Link href="/signup">Crear cuenta de prueba</Link>
                </Button>
              </div>
            }
          />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes" className="mb-12" />
          <Faq entries={SYSTEM_FAQ} />
        </div>
      </section>
    </>
  )
}
