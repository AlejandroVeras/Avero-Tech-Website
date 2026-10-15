import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { BookOpen, FileSpreadsheet, HelpCircle, Link2, MessageCircle, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { SystemIcon } from "@/components/site/system-icon"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { SYSTEM_FAQ } from "@/components/site/faq-content"
import { getPublishedSystem, getTrialDays } from "@/lib/data/systems"
import { APP_URL, appUrl, whatsappUrl } from "@/lib/site"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const system = await getPublishedSystem(slug)
  if (!system) return { title: "Sistema no encontrado" }
  return {
    title: system.name,
    description: system.tagline ?? system.description,
    alternates: { canonical: `/sistemas/${system.slug}` },
  }
}

const PAINS = [
  { icon: BookOpen, text: "Anotas las ventas y lo que te deben en una libreta que se pierde o se moja." },
  { icon: FileSpreadsheet, text: "Tienes el inventario en un Excel que nadie actualiza." },
  { icon: HelpCircle, text: "A fin de mes no sabes cuánto ganaste de verdad." },
]

const outlineOnDark =
  "rounded-full px-6 text-[14px] font-normal border-sky-signal text-sky-signal bg-transparent hover:bg-sky-signal/10 hover:text-sky-signal"

export default async function SystemPage({ params }: Params) {
  const { slug } = await params
  const [system, defaultTrialDays] = await Promise.all([getPublishedSystem(slug), getTrialDays()])
  if (!system) notFound()
  if (system.externalUrl) redirect(system.externalUrl)
  const trialDays = system.trialDays ?? defaultTrialDays

  const available = system.status === "disponible"
  // Pains, onboarding steps and FAQ are written for the management system only.
  const isGestion = available && system.slug === "gestion"
  const hasStore = system.features.some((f) => f.icon === "store")
  const waMessage = available
    ? `Hola, quiero contratar el ${system.name} de Avero Technology.`
    : `Hola, quiero que me avisen cuando el ${system.name} esté disponible.`

  return (
    <>
      <section className="py-24 md:py-32 bg-obsidian text-white">
        <div className="container mx-auto px-4 text-center max-w-[980px]">
          <nav aria-label="Ruta de navegación" className="mb-6">
            <Link href="/sistemas" className="text-caption text-white/50 hover:text-white">
              Sistemas
            </Link>
          </nav>
          {!available && (
            <p className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/80">Próximamente</p>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-display font-semibold tracking-[-0.02em] text-balance">{system.name}</h1>
          {system.tagline && <p className="mt-4 text-subheading text-white/80 text-balance">{system.tagline}</p>}
          {system.description && <p className="mt-4 text-body text-white/60 max-w-2xl mx-auto text-balance">{system.description}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {available ? (
              <>
                <Button size="lg" className="rounded-full px-6 text-[14px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                  <Link href={appUrl("/signup")}>{trialDays ? `Probar gratis ${trialDays} días` : "Crear cuenta"}</Link>
                </Button>
                <Button size="lg" variant="outline" className={outlineOnDark} asChild>
                  <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer">
                    Hablar por WhatsApp
                  </a>
                </Button>
              </>
            ) : (
              <Button size="lg" className="rounded-full px-6 text-[14px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer">
                  Avísame cuando esté listo
                </a>
              </Button>
            )}
          </div>
          {system.audience && (
            <p className="mt-10 text-[14px] text-white/60 max-w-xl mx-auto">
              <span className="text-white/90">Para quién es:</span> {system.audience}
            </p>
          )}
        </div>
      </section>

      {isGestion && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeading title="¿Te suena familiar?" className="mb-12" />
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {PAINS.map((p) => (
                <li key={p.text} className="rounded-3xl border border-pale-mist/70 bg-card p-6 text-center">
                  <p.icon className="w-6 h-6 mx-auto text-pewter" aria-hidden />
                  <p className="mt-4 text-[15px] text-obsidian dark:text-foreground">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {system.features.length > 0 && (
        <section className="py-20 md:py-28 bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background dark:from-sky-signal/[0.07] dark:via-transparent">
          <div className="container mx-auto px-4">
            <SectionHeading title={available ? "Todo lo que incluye" : "Lo que va a incluir"} className="mb-12" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {system.features.map((f) => (
                <li key={f.title} className="rounded-3xl border border-pale-mist/70 bg-card p-6">
                  <div className="w-10 h-10 rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                    <SystemIcon name={f.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-obsidian dark:text-foreground">{f.title}</h3>
                  <p className="mt-1 text-[14px] text-pewter">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {available && hasStore && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-caption uppercase tracking-[0.16em] text-pewter">Incluido en el plan</p>
              <h2 className="mt-3 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">
                Tu catálogo en línea, listo para compartir
              </h2>
              <p className="mt-4 text-body text-pewter">
                Los productos que marques como visibles aparecen en tu propia página, con fotos, precios y un botón para
                que tus clientes te escriban por WhatsApp. Mandas el link y listo: sin pagar una página web aparte.
              </p>
            </div>
            <div className="rounded-3xl border border-pale-mist/70 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3 rounded-full bg-fog-white dark:bg-white/5 px-4 py-2.5 text-[13px] text-obsidian dark:text-foreground">
                <Link2 className="h-4 w-4 text-pewter shrink-0" aria-hidden />
                <span className="truncate">{APP_URL.replace(/^https?:\/\//, "")}/t/tu-negocio</span>
              </div>
              <ul className="space-y-3 text-[14px] text-obsidian dark:text-foreground">
                <li className="flex items-start gap-3">
                  <Store className="h-4 w-4 mt-0.5 text-sapphire dark:text-sky-signal shrink-0" aria-hidden />
                  Tu logo, nombre y descripción
                </li>
                <li className="flex items-start gap-3">
                  <SystemIcon name="package" className="h-4 w-4 mt-0.5 text-sapphire dark:text-sky-signal shrink-0" />
                  Productos con fotos, precio y disponibilidad al día
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="h-4 w-4 mt-0.5 text-sapphire dark:text-sky-signal shrink-0" aria-hidden />
                  Botón de WhatsApp directo a tu número
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {isGestion && (
        <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
          <div className="container mx-auto px-4">
            <SectionHeading title="Empieza en tres pasos" className="mb-12" />
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {[
                { title: "Crea tu cuenta", text: trialDays ? ` días gratis; no se cobra nada hasta que termina la prueba.` : "En menos de un minuto." },
                { title: "Sube tus productos", text: "Con sus precios, existencias y fotos." },
                { title: "Vende y comparte", text: "Factura, lleva tus cuentas y manda el link de tu catálogo." },
              ].map((s, i) => (
                <li key={s.title} className="rounded-3xl border border-pale-mist/70 bg-card p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold text-obsidian dark:text-foreground">{s.title}</h3>
                  <p className="mt-1 text-[14px] text-pewter">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {available && system.plans.length > 0 && (
        <section id="planes" className="py-20 md:py-28 bg-obsidian text-white">
          <div className="container mx-auto px-4">
            <SectionHeading inverted title={system.plans.length > 1 ? "Elige tu plan" : "Un plan, todo incluido"} className="mb-10" />
            <div className={system.plans.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" : ""}>
              {system.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  inverted
                  trialDays={trialDays}
                  cta={
                    <div className="space-y-3">
                      <Button size="lg" className="w-full rounded-full text-[14px] font-normal bg-white text-obsidian hover:bg-white/90" asChild>
                        <Link href={appUrl("/signup")}>{trialDays ? `Probar gratis ${trialDays} días` : "Crear cuenta"}</Link>
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {isGestion && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeading title="Preguntas frecuentes" className="mb-12" />
            <Faq entries={SYSTEM_FAQ} />
          </div>
        </section>
      )}
    </>
  )
}
