import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { SYSTEM_FAQ } from "@/components/site/faq-content"
import { getPublishedSystems, getTrialDays } from "@/lib/data/systems"
import { FALLBACK_GESTION, isAnnualOnly, type SaasSystem, type SystemPlan } from "@/lib/systems"
import { appUrl, formatUSD, whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: "/precios" },
  title: "Planes y precios",
  description: "Precios de Avero Inventario, Avero Citas y Avero Condominios: prueba gratis y pago mensual o anual.",
}

// Section anchors, in the order the systems appear on the page.
const ANCHORS: Record<string, string> = { gestion: "inventario", citas: "citas", condominios: "condominios" }

export default async function PreciosPage() {
  const [all, trialDays] = await Promise.all([getPublishedSystems(), getTrialDays()])
  const systems = all.filter((s) => s.status === "disponible" && s.plans.length > 0)
  if (!systems.some((s) => s.slug === "gestion")) systems.unshift(FALLBACK_GESTION)

  return (
    <>
      <section className="pt-20 md:pt-28 pb-8 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            eyebrow="Planes y precios"
            title="Prueba gratis, paga solo si te sirve"
            description="Sin contratos de permanencia. Usa el sistema completo durante la prueba y sigue solo si te sirve."
          />
          <nav aria-label="Sistemas" className="mt-8 flex flex-wrap justify-center gap-2">
            {systems.map((s) => (
              <a
                key={s.slug}
                href={`#${ANCHORS[s.slug] ?? s.slug}`}
                className="rounded-full border border-pale-mist px-4 py-1.5 text-[14px] text-obsidian hover:border-sapphire/40 dark:text-foreground"
              >
                {s.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {systems.map((s, i) => (
        <section
          key={s.slug}
          id={ANCHORS[s.slug] ?? s.slug}
          className={`scroll-mt-20 py-16 md:py-20 ${i % 2 ? "bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]" : "bg-background"}`}
        >
          <div className="container mx-auto px-4">
            <SectionHeading title={s.name} description={s.tagline} className="mb-10" />
            {s.slug === "gestion" ? <GestionPlans system={s} trialDays={trialDays} /> : <ExternalPlans system={s} trialDays={s.trialDays ?? trialDays} />}
          </div>
        </section>
      ))}

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes" className="mb-12" />
          <Faq entries={SYSTEM_FAQ} />
        </div>
      </section>
    </>
  )
}

function GestionPlans({ system, trialDays }: { system: SaasSystem; trialDays: number }) {
  const plans = system.plans
  return (
    <>
      <div className={plans.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" : ""}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            trialDays={trialDays}
            cta={
              <div className="space-y-3 pt-2">
                <Button size="lg" className="w-full rounded-full text-[14px] font-normal" asChild>
                  <Link href={appUrl("/signup")}>Probar gratis {trialDays} días</Link>
                </Button>
                <p className="text-[12px] text-pewter">Al crear tu cuenta autorizas el pago con PayPal. No se cobra nada durante la prueba; después el cobro es automático cada mes o cada año.</p>
              </div>
            }
          />
        ))}
      </div>
      <p className="text-center mt-8">
        <Link href="/sistemas/gestion" className="text-[14px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
          Ver todo lo que incluye Avero Inventario &gt;
        </Link>
      </p>
    </>
  )
}

/** Plans of a system that lives on its own domain: compact cards that send people to its signup. */
function ExternalPlans({ system, trialDays }: { system: SaasSystem; trialDays: number }) {
  const signup = system.externalUrl ? `${system.externalUrl}/registro` : whatsappUrl(`Hola, quiero probar ${system.name}.`)
  const annualOnly = system.plans.every(isAnnualOnly)
  return (
    <>
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {system.plans.map((plan, i) => (
          <li key={plan.id} className="flex">
            <PlanBox plan={plan} featured={system.plans.length === 3 && i === 1} signup={signup} trialDays={trialDays} />
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-xl text-center text-[14px] text-pewter">
        {annualOnly
          ? `${trialDays} días gratis y después un solo pago al año.`
          : `${trialDays} días gratis. Si pagas el año completo, te regalamos 2 meses.`}{" "}
        {system.externalUrl && (
          <a href={system.externalUrl} className="text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
            Conocer {system.name} &gt;
          </a>
        )}
      </p>
    </>
  )
}

function PlanBox({ plan, featured, signup, trialDays }: { plan: SystemPlan; featured: boolean; signup: string; trialDays: number }) {
  const annualOnly = isAnnualOnly(plan)
  return (
    <div
      className={`flex flex-1 flex-col rounded-3xl p-7 ${
        featured ? "bg-obsidian text-white dark:bg-white/[0.06] dark:ring-2 dark:ring-sky-signal" : "bg-card border border-pale-mist/70"
      }`}
    >
      <h3 className={`text-lg font-semibold ${featured ? "" : "text-obsidian dark:text-foreground"}`}>{plan.name}</h3>
      {plan.description && <p className={`text-[14px] ${featured ? "text-white/70" : "text-pewter"}`}>{plan.description}</p>}
      <p className="mt-5">
        <span className={`text-4xl font-semibold tracking-tight ${featured ? "" : "text-obsidian dark:text-foreground"}`}>
          {formatUSD(annualOnly ? plan.annual_usd! : plan.monthly_usd)}
        </span>
        <span className={featured ? "text-white/70" : "text-pewter"}>{annualOnly ? "/año" : "/mes"}</span>
      </p>
      <p className={`text-[13px] ${featured ? "text-white/70" : "text-pewter"}`}>
        {annualOnly ? `Equivale a ${formatUSD(Math.round(plan.annual_usd! / 12))} al mes` : plan.annual_usd ? `o ${formatUSD(plan.annual_usd)} al año` : "Facturado cada mes"}
      </p>
      <ul className="mt-5 space-y-2.5 text-[14px]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-sky-signal" : "text-sapphire dark:text-sky-signal"}`} aria-hidden />
            <span className={featured ? "text-white/85" : "text-obsidian/85 dark:text-foreground/85"}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <Button
          size="lg"
          variant={featured ? "default" : "outline"}
          className={`w-full rounded-full text-[14px] font-normal ${featured ? "bg-white text-obsidian hover:bg-white/90" : ""}`}
          asChild
        >
          <a href={signup}>Probar {trialDays} días gratis</a>
        </Button>
      </div>
    </div>
  )
}
