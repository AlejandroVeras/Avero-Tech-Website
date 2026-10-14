import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { SystemIcon } from "@/components/site/system-icon"
import { getPublishedSystems, getTrialDays } from "@/lib/data/systems"
import { isAnnualOnly, systemHref } from "@/lib/systems"
import { formatUSD, whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: "/sistemas" },
  title: "Sistemas",
  description:
    "Software para administrar tu negocio: inventario, ventas a crédito, facturas con ITBIS y catálogo en línea. Hecho en República Dominicana.",
}

export default async function SistemasPage() {
  const [systems, trialDays] = await Promise.all([getPublishedSystems(), getTrialDays()])

  return (
    <>
      <section className="py-24 md:py-32 bg-obsidian text-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            inverted
            eyebrow="Software para tu negocio"
            title="Sistemas que trabajan por ti"
            description="Herramientas web, simples y en español, para que administres tu negocio desde el celular o la computadora. Sin instalar nada."
            className="mb-14"
          />

          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {systems.map((s) => {
              const plan = s.plans[0]
              const freeDays = s.trialDays ?? trialDays
              const available = s.status === "disponible"
              return (
                <li key={s.id}>
                  <Link
                    href={systemHref(s)}
                    className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition-colors hover:border-sky-signal/50 focus-visible:outline-2 focus-visible:outline-sky-signal"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-heading-sm font-semibold">{s.name}</h2>
                      <span
                        className={
                          available
                            ? "rounded-full bg-sky-signal/25 px-2.5 py-1 text-[11px] text-white"
                            : "rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70"
                        }
                      >
                        {available ? "Disponible" : "Próximamente"}
                      </span>
                    </div>
                    {s.tagline && <p className="mt-2 text-[15px] text-white/70">{s.tagline}</p>}
                    {s.features.length > 0 && (
                      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                        {s.features.slice(0, 6).map((f) => (
                          <li key={f.title} className="flex items-center gap-2 text-[13px] text-white/80">
                            <SystemIcon name={f.icon} className="h-4 w-4 shrink-0 text-sky-signal" />
                            {f.title}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-8 flex items-end justify-between gap-4">
                      {available && plan ? (
                        <p className="text-[13px] text-white/60">
                          Desde{" "}
                          {isAnnualOnly(plan) ? (
                            <><span className="text-lg font-semibold text-white">{formatUSD(plan.annual_usd!)}</span>/año</>
                          ) : (
                            <><span className="text-lg font-semibold text-white">{formatUSD(plan.annual_usd ? plan.annual_usd / 12 : plan.monthly_usd)}</span>/mes</>
                          )}
                          {freeDays ? ` · ${freeDays} días gratis` : ""}
                        </p>
                      ) : (
                        <p className="text-[13px] text-white/60">En desarrollo</p>
                      )}
                      <span className="inline-flex items-center gap-1 text-[14px] text-sky-signal">
                        Conocer
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 text-center">
          <SectionHeading
            title="¿Necesitas algo a la medida?"
            description="Si tu negocio necesita un sistema que todavía no está aquí, cuéntanos qué quieres resolver."
            className="mb-8"
          />
          <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
            <a
              href={whatsappUrl("Hola, me interesa un sistema a la medida para mi negocio.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hablar por WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </>
  )
}
