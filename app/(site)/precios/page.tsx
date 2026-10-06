import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { SYSTEM_FAQ } from "@/components/site/faq-content"
import { getPublishedSystem, getTrialDays } from "@/lib/data/systems"
import { FALLBACK_GESTION } from "@/lib/systems"
import { whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Planes del sistema de gestión de Avero Technology: inventario, ventas a crédito, facturación con ITBIS y catálogo en línea.",
}

export default async function PreciosPage() {
  const [system, trialDays] = await Promise.all([getPublishedSystem("gestion"), getTrialDays()])
  const plans = (system ?? FALLBACK_GESTION).plans

  return (
    <>
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Sistema de gestión"
            title={plans.length > 1 ? "Elige tu plan" : "Un plan, todo incluido"}
            description="Sin contratos de permanencia. Empieza con la prueba gratis y decide después."
            className="mb-12"
          />
          <div className={plans.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" : ""}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                trialDays={trialDays}
                cta={
                  <div className="space-y-3 pt-2">
                    <Button size="lg" className="w-full rounded-full text-[14px] font-normal" asChild>
                      <Link href="/signup">Probar gratis {trialDays} días</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full text-[14px] font-normal border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
                      asChild
                    >
                      <a href={whatsappUrl(`Hola, quiero contratar el ${plan.name} del sistema de gestión.`)} target="_blank" rel="noopener noreferrer">
                        Contratar por WhatsApp
                      </a>
                    </Button>
                    <p className="text-[12px] text-pewter">
                      Por ahora el pago se coordina por WhatsApp y activamos tu cuenta en el momento.
                    </p>
                  </div>
                }
              />
            ))}
          </div>
          <p className="text-center mt-8">
            <Link href="/sistemas/gestion" className="text-[14px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
              Ver todo lo que incluye el sistema &gt;
            </Link>
          </p>
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
