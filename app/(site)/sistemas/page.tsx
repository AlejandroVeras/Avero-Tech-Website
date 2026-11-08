import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionHeading } from "@/components/site/section-heading"
import { SystemIcon } from "@/components/site/system-icon"
import { getPublishedSystems, getTrialDays } from "@/lib/data/systems"
import { isAnnualOnly, systemHref } from "@/lib/systems"
import { SITE_URL, formatUSD, whatsappUrl } from "@/lib/site"
import { Faq } from "@/components/site/faq"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { Byline, CheckList, H2, Section } from "@/components/site/blocks/primitives"
import { AnswerBlock, CompareTable, CtaBand } from "@/components/site/blocks/sections"
import { Reveal } from "@/components/site/blocks/reveal"
import { contentMetadata } from "@/components/site/blocks/content-page"
import { pageGraph } from "@/lib/schema"

const PATH = "/sistemas"
const TITLE = "Sistemas para negocios hechos en RD"
const DESCRIPTION = "Avero Inventario, Avero Citas y Avero Condominios: software web en español para administrar tu negocio desde el celular. Prueba gratis antes de pagar."
const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Sistemas", href: PATH },
]

export const metadata: Metadata = contentMetadata({ path: PATH, title: TITLE, description: DESCRIPTION })

const FAQ = [
  { question: "¿Los sistemas de Avero funcionan en el celular?", answer: "Sí. Los tres funcionan en el navegador del celular, la tablet o la computadora, sin instalar nada." },
  { question: "¿Puedo probarlos gratis?", answer: "Sí. Avero Inventario y Avero Citas tienen 30 días de prueba y Avero Condominios, 60." },
  { question: "¿Cómo se pagan?", answer: "Con PayPal, de forma automática según el plan. Si no tienes cuenta de PayPal, se crea en el mismo paso con tu tarjeta." },
  { question: "¿Mis datos están seguros?", answer: "Cada negocio ve solo su información gracias a reglas de acceso dentro de la base de datos, y las conexiones van cifradas con HTTPS." },
  { question: "¿Pueden adaptar un sistema a mi negocio?", answer: "Los sistemas son iguales para todos los clientes. Si necesitas algo distinto, lo desarrollamos a medida." },
]

export default async function SistemasPage() {
  const [systems, trialDays] = await Promise.all([getPublishedSystems(), getTrialDays()])

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          title: `${TITLE} | Avero Technology`,
          description: DESCRIPTION,
          type: "CollectionPage",
          crumbs: CRUMBS,
          faq: FAQ,
          nodes: [{ "@type": "ItemList", "@id": `${SITE_URL}${PATH}#sistemas`, itemListElement: systems.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: `${SITE_URL}${systemHref(s)}` })) }],
        })}
      />
      <section className="pt-10 md:pt-14 pb-24 md:pb-32 bg-obsidian text-white">
        <div className="container mx-auto px-4">
          <Breadcrumbs crumbs={CRUMBS} inverted className="max-w-6xl mx-auto mb-10" />
          <SectionHeading
            as="h1"
            inverted
            eyebrow="Software para tu negocio"
            title="Sistemas para administrar tu negocio, hechos en República Dominicana"
            description="Tres sistemas web, en español, que funcionan desde el celular o la computadora sin instalar nada. Los diseñó y los opera Avero Technology en Santo Domingo, y los pruebas gratis antes de pagar."
            className="mb-6"
          />
          <Byline path={PATH} inverted className="mb-14 text-center" />

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

      <Section>
        <AnswerBlock
          question="¿Qué sistema necesito?"
          answer="Si vendes productos, Avero Inventario. Si trabajas con citas, Avero Citas. Si administras un edificio, Avero Condominios. Los tres comparten el mismo principio: cada negocio ve solo su información, el pago es automático y puedes cancelar cuando quieras."
        >
          <CompareTable
            caption="Qué sistema elegir"
            headers={["", "Para quién", "Qué resuelve", "Desde", "Prueba"]}
            rows={[
              [<Link key="i" href="/sistemas/inventario">Avero Inventario</Link>, "Colmados, tiendas, ferreterías, talleres", "Inventario, ventas a crédito, facturas con ITBIS, gastos y catálogo en línea", "US$12/mes", "30 días"],
              [<Link key="c" href="/sistemas/citas">Avero Citas</Link>, "Barberías, salones, spas y consultorios", "Reservas en línea, recordatorios, agenda del equipo y comisiones", "US$9/mes", "30 días"],
              [<Link key="d" href="/sistemas/condominios">Avero Condominios</Link>, "Administradores de condominios", "Cuotas, gas, comprobantes, recibos y estado de cuenta por apartamento", "US$320/año", "60 días"],
            ]}
          />
        </AnswerBlock>
      </Section>

      <Section tone="fog">
        <Reveal>
          <H2>¿Qué tienen en común los sistemas de Avero?</H2>
          <CheckList
            className="mt-8 max-w-3xl"
            items={[
              "Funcionan en el navegador: no hay que descargar nada ni actualizar.",
              "Cada negocio ve solo su información, con reglas de acceso dentro de la base de datos.",
              "Si dejas de pagar, no se borra nada: la cuenta queda en modo solo lectura hasta que renuevas.",
              "Soporte por WhatsApp de la misma empresa que los programa.",
            ]}
          />
        </Reveal>
      </Section>

      <Section narrow>
        <Reveal>
          <H2 className="text-center">Preguntas frecuentes</H2>
          <div className="mt-10">
            <Faq entries={FAQ} />
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Necesitas algo a la medida?"
        text="Si tu negocio necesita un sistema que todavía no está aquí, lo construimos con el mismo método. Mira el servicio de portales y plataformas a medida o cuéntanos qué quieres resolver."
        primary={{ label: "Hablar de un sistema a la medida", href: whatsappUrl("Hola, me interesa un sistema a la medida") }}
        secondary={{ label: "Ver portales a medida", href: "/servicios/desarrollo-portales-web" }}
      />
    </>
  )
}
