// Product page for one of Avero's systems. Features and plans come from the `systems` table;
// the approved copy (H1, definition, FAQ…) comes from each page.
import Link from "next/link"
import { notFound } from "next/navigation"
import { Link2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { SystemIcon } from "@/components/site/system-icon"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { Byline, CheckList, H2, Lead, Section } from "@/components/site/blocks/primitives"
import { CtaBand } from "@/components/site/blocks/sections"
import { Reveal } from "@/components/site/blocks/reveal"
import { getPublishedSystem, getTrialDays } from "@/lib/data/systems"
import { isAnnualOnly } from "@/lib/systems"
import { ORG_ID, pageGraph, type Faq as FaqItem } from "@/lib/schema"
import { APP_URL, SITE_URL, whatsappUrl } from "@/lib/site"

export type SystemCopy = {
  slug: string
  path: string
  title: string
  description: string
  h1: string
  intro: string
  definitionQuestion: string
  definition: string
  audience: string
  pains?: string[]
  steps: { title: string; text: string }[]
  priceQuestion: string
  priceAnswer: (trialDays: number) => string
  note?: string
  faq: FaqItem[]
  signupUrl: (externalUrl: string | null) => string
  ctaTitle: string
  ctaText: string
}

export async function SystemDetail({ copy }: { copy: SystemCopy }) {
  const [system, defaultTrialDays] = await Promise.all([getPublishedSystem(copy.slug), getTrialDays()])
  if (!system) notFound()
  const trialDays = system.trialDays ?? defaultTrialDays
  const signup = copy.signupUrl(system.externalUrl)
  const signupLabel = trialDays ? `Probar gratis ${trialDays} días` : "Crear cuenta"
  const hasStore = system.features.some((f) => f.icon === "store")
  const crumbs = [
    { name: "Inicio", href: "/" },
    { name: "Sistemas", href: "/sistemas" },
    { name: system.name, href: copy.path },
  ]
  const offers = system.plans.map((p) => {
    const annualOnly = isAnnualOnly(p)
    const price = annualOnly ? p.annual_usd : p.monthly_usd
    return { "@type": "Offer", name: p.name, price: String(price), priceCurrency: "USD", description: annualOnly ? `US$${p.annual_usd} al año` : `US$${p.monthly_usd} al mes${p.annual_usd ? ` o US$${p.annual_usd} al año` : ""}` }
  })

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: copy.path,
          title: copy.title,
          description: copy.description,
          crumbs,
          faq: copy.faq,
          nodes: [
            {
              "@type": "SoftwareApplication",
              "@id": `${SITE_URL}${copy.path}#software`,
              name: system.name,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web (navegador en celular, tablet o computadora)",
              inLanguage: "es",
              url: `${SITE_URL}${copy.path}`,
              publisher: { "@id": ORG_ID },
              description: copy.definition,
              ...(offers.length ? { offers } : {}),
            },
          ],
        })}
      />

      <section className="relative overflow-hidden pt-10 md:pt-14 pb-24 md:pb-32 bg-obsidian text-white">
        <div aria-hidden className="pointer-events-none absolute right-[-10%] top-[-20%] h-[560px] w-[760px] max-w-[140vw] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]" />
        <div className="relative container mx-auto max-w-6xl px-4">
          <Breadcrumbs crumbs={crumbs} inverted className="mb-10" />
          <div className="mx-auto max-w-[980px] text-center">
            <p className="mb-4 text-caption uppercase tracking-[0.16em] text-white/50">{system.name}</p>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] md:leading-[1.07] font-semibold tracking-[-0.03em] text-balance">{copy.h1}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-subheading text-white/80 text-balance">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-12 rounded-full px-7 text-[15px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                <a href={signup}>{signupLabel}</a>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-[15px] font-normal border-sky-signal text-sky-signal bg-transparent hover:bg-sky-signal/10 hover:text-sky-signal" asChild>
                <a href={whatsappUrl(`Hola, quiero saber más de ${system.name}.`)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden /> Preguntar por WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-4 text-[13px] text-white/60">No se cobra nada durante la prueba. Cancelas cuando quieras.</p>
            <Byline path={copy.path} inverted className="mt-8" />
          </div>
        </div>
      </section>

      <Section>
        <Reveal>
          <div className="max-w-3xl">
            <H2>{copy.definitionQuestion}</H2>
            <Lead className="mt-5">{copy.definition}</Lead>
            <p className="mt-6 text-body text-pewter">
              <span className="font-semibold text-obsidian dark:text-foreground">Para quién es: </span>
              {copy.audience}
            </p>
          </div>
        </Reveal>
      </Section>

      {copy.pains && (
        <Section tone="fog">
          <Reveal>
            <SectionHeading title="¿Te suena familiar?" className="mb-12" />
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {copy.pains.map((p) => (
                <li key={p} className="rounded-[28px] border border-pale-mist/70 bg-card p-6 text-center text-[15px] text-obsidian dark:text-foreground">{p}</li>
              ))}
            </ul>
          </Reveal>
        </Section>
      )}

      {system.features.length > 0 && (
        <Section tone="ice">
          <Reveal>
            <H2>¿Qué incluye?</H2>
            <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {system.features.map((f) => (
                <li key={f.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-6">
                  <div className="w-10 h-10 rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                    <SystemIcon name={f.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-obsidian dark:text-foreground">{f.title}</h3>
                  <p className="mt-1 text-[14px] text-pewter">{f.description}</p>
                </li>
              ))}
            </ul>
            {copy.note && <p className="mt-6 text-[15px] text-pewter">{copy.note}</p>}
          </Reveal>
        </Section>
      )}

      {hasStore && (
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-caption uppercase tracking-[0.16em] text-pewter">Incluido en el plan</p>
              <h2 className="mt-3 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Tu catálogo en línea, listo para compartir</h2>
              <p className="mt-4 text-body text-pewter">
                Los productos que marques como visibles aparecen en tu propia página, con fotos, precios y un botón para que tus clientes te escriban por WhatsApp. Mandas el link y listo: sin pagar una página web aparte.
              </p>
            </div>
            <div className="rounded-[28px] border border-pale-mist/70 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 rounded-full bg-fog-white dark:bg-white/5 px-4 py-2.5 text-[13px] text-obsidian dark:text-foreground">
                <Link2 className="h-4 w-4 text-pewter shrink-0" aria-hidden />
                <span className="truncate">{APP_URL.replace(/^https?:\/\//, "")}/t/tu-negocio</span>
              </div>
              <CheckList items={["Tu logo, nombre y descripción", "Productos con fotos, precio y disponibilidad al día", "Botón de WhatsApp directo a tu número"]} />
            </div>
          </div>
        </Section>
      )}

      <Section tone="fog">
        <Reveal>
          <H2>¿Cómo empiezo?</H2>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {copy.steps.map((s, i) => (
              <li key={s.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{i + 1}</span>
                <h3 className="mt-4 font-semibold text-obsidian dark:text-foreground">{s.title}</h3>
                <p className="mt-1 text-[14px] text-pewter">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>

      {system.plans.length > 0 && (
        <section id="planes" className="scroll-mt-20 py-20 md:py-28 bg-obsidian text-white">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-balance">{copy.priceQuestion}</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-white/75">{copy.priceAnswer(trialDays)}</p>
            </div>
            <div className={system.plans.length > 2 ? "mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6" : system.plans.length > 1 ? "mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" : "mt-12"}>
              {system.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  inverted
                  trialDays={trialDays}
                  cta={
                    <Button size="lg" className="w-full rounded-full text-[14px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                      <a href={signup}>{signupLabel}</a>
                    </Button>
                  }
                />
              ))}
            </div>
            <p className="mt-8 text-center text-[13px] text-white/60">
              Precios en dólares, cobrados con PayPal. <Link href="/precios" className="text-sky-signal hover:underline underline-offset-4">Ver todos los precios</Link>
            </p>
          </div>
        </section>
      )}

      <Section narrow>
        <Reveal>
          <H2 className="text-center">Preguntas frecuentes</H2>
          <div className="mt-10">
            <Faq entries={copy.faq} />
          </div>
        </Reveal>
      </Section>

      <CtaBand title={copy.ctaTitle} text={copy.ctaText} primary={{ label: signupLabel, href: signup }} secondary={{ label: "Ver todos los sistemas", href: "/sistemas" }} />
    </>
  )
}
