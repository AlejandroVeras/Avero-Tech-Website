import type { Metadata } from "next"
import { ArrowRight, BadgeCheck, Banknote, FileSignature, KeyRound, MessageCircle, ShieldCheck, Truck } from "lucide-react"
import { ProductCard } from "@/components/site/product-card"
import { SystemsShowcase } from "@/components/site/systems-showcase"
import { Faq } from "@/components/site/faq"
import { JsonLd } from "@/components/site/blocks/structure"
import { ActionButton, ArrowLink, H2, Lead, Section } from "@/components/site/blocks/primitives"
import { CtaBand } from "@/components/site/blocks/sections"
import { Reveal } from "@/components/site/blocks/reveal"
import { ServiceIcon } from "@/components/site/blocks/service-icon"
import { ChatBubbles } from "@/components/site/illustrations"
import { HomeHero } from "@/components/site/home/hero"
import { TiltCard } from "@/components/site/home/tilt-card"
import { getStoreProducts } from "@/lib/data/public-catalog"
import { getPublishedSystems, getTrialDays } from "@/lib/data/systems"
import { PENDING, hasPrice, priceInline } from "@/lib/business"
import { CHAT_ENABLED } from "@/lib/features"
import { pageGraph } from "@/lib/schema"
import { ENTITY_DEFINITION, FOUNDER, SERVICES, formatDOP, whatsappUrl } from "@/lib/site"

const TITLE = "Avero Technology: webs, SEO e IA en Santo Domingo"
const DESCRIPTION = "Diseñamos páginas y portales web, hacemos SEO y creamos chatbots con IA para negocios en RD. También vendemos equipos y damos soporte técnico."
const QUOTE = whatsappUrl("Hola Avero Technology, quiero cotizar")

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
}

const TECH = ["Next.js", "Supabase", "PostgreSQL", "OpenAI", "WhatsApp Cloud API", "Vercel", "Google Search Console", "Google Analytics 4", "PayPal", "schema.org"]

const STORE_PERKS = [
  { icon: ShieldCheck, text: "Con garantía" },
  { icon: Truck, text: "Entrega en todo Santo Domingo" },
  { icon: Banknote, text: "Transferencia o efectivo" },
]

const WHY = [
  { icon: BadgeCheck, title: "Lo construimos antes de venderlo", text: "Ofrecemos portales, chatbots y SEO porque ya los hicimos para nosotros: tres sistemas en producción, este sitio y nuestro asistente de ventas." },
  { icon: FileSignature, title: "Precio cerrado y por escrito", text: "Sabes cuánto cuesta y cuánto tarda antes de empezar. Si un sistema existente te sirve más que un desarrollo, te lo decimos." },
  { icon: KeyRound, title: "Todo queda a tu nombre", text: "Dominio, código, datos y accesos son tuyos. Y respondemos por WhatsApp las 24 horas." },
]

const STEPS = [
  { title: "Nos escribes por WhatsApp", text: "Una línea sobre tu negocio y lo que quieres resolver. Respondemos al momento." },
  { title: "Te proponemos una solución con precio cerrado", text: "En 24 a 48 horas tienes por escrito el alcance, el precio y el calendario." },
  { title: "Ves avances y apruebas", text: "Trabajamos por etapas cortas y no publicamos nada sin tu visto bueno." },
]

const webPriced = hasPrice("webPresentacion") && hasPrice("webCatalogo")
const FAQ = [
  { question: "¿Qué hace Avero Technology?", answer: "Diseña páginas y portales web, hace posicionamiento SEO, crea chatbots e integraciones con inteligencia artificial, desarrolla los sistemas Avero Inventario, Avero Citas y Avero Condominios, vende equipos y da soporte técnico." },
  { question: "¿Dónde está Avero Technology?", answer: "En Santo Domingo, República Dominicana. No tenemos local abierto al público: entregamos equipos y damos soporte en persona en todo Santo Domingo, y los servicios digitales los damos a distancia para cualquier país." },
  {
    question: "¿Cuánto cuesta una página web con Avero?",
    answer: webPriced
      ? `Una página de presentación cuesta ${priceInline("webPresentacion")} y una con catálogo, ${priceInline("webCatalogo")}. El precio es cerrado y lo recibes por escrito antes de empezar.`
      : "Depende de las secciones y funciones. El precio es cerrado y lo recibes por escrito en 24 a 48 horas, sin costo, antes de empezar.",
  },
  { question: "¿A qué hora atienden?", answer: "Las 24 horas, todos los días, por WhatsApp al (829) 812-2103. Respondemos al momento." },
  { question: "¿Hacen envíos de equipos?", answer: "Sí, a todo Santo Domingo. Coordinamos la entrega al confirmar el pedido por WhatsApp." },
  { question: "¿Puedo probar los sistemas antes de pagar?", answer: "Sí. Avero Inventario y Avero Citas tienen 30 días de prueba y Avero Condominios, 60." },
]

export default async function HomePage() {
  const [products, trialDays, systems] = await Promise.all([getStoreProducts(), getTrialDays(), getPublishedSystems()])
  const available = products.filter((p) => p.inStock)
  const featured = available.slice(0, 4)
  const pick = available.find((p) => p.coverUrl) ?? available[0]
  const spotlight = pick ? { name: pick.name, price: formatDOP(pick.price), href: `/catalogo/${pick.slug}`, image: pick.coverUrl } : undefined

  return (
    <>
      <JsonLd data={pageGraph({ path: "/", title: TITLE, description: DESCRIPTION, faq: FAQ, author: false })} />

      <HomeHero quoteUrl={QUOTE} spotlight={spotlight} />

      {/* ── What we build with: moving strip ── */}
      <section aria-label="Tecnologías que usamos" className="marquee relative overflow-hidden border-y border-pale-mist/60 bg-background py-5">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <ul className="marquee-track flex w-max items-center gap-10 whitespace-nowrap text-[15px] font-medium text-pewter">
          {[...TECH, ...TECH].map((t, i) => (
            <li key={i} aria-hidden={i >= TECH.length} className="flex items-center gap-10">
              {t}
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sky-signal/60" />
            </li>
          ))}
        </ul>
      </section>

      {/* ── Entity definition ── */}
      <Section narrow className="text-center">
        <Reveal>
          <H2>¿Qué es Avero Technology?</H2>
          <Lead className="mt-5">
            {ENTITY_DEFINITION} La fundó {FOUNDER} en 2024 y atiende por WhatsApp las 24 horas.
          </Lead>
        </Reveal>
      </Section>

      {/* ── Services ── */}
      <Section tone="ice">
        <Reveal>
          <div className="max-w-3xl">
            <H2>Servicios</H2>
            <Lead className="mt-4">Seis servicios para dos necesidades: que te encuentren y atender mejor a quien te encuentra.</Lead>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <TiltCard href={s.href} className="flex h-full flex-col rounded-[28px] border border-pale-mist/70 bg-card p-7 hover:border-sapphire/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{s.name}</h3>
                  <p className="mt-1.5 text-[15px] text-pewter">{s.line}</p>
                  <span className="mt-auto pt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                    Ver servicio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </TiltCard>
              </li>
            ))}
          </ul>
          <p className="mt-10">
            <ArrowLink href="/servicios">Ver todos los servicios</ArrowLink>
          </p>
        </Reveal>
      </Section>

      {/* ── Products: we also sell equipment ── */}
      {featured.length > 0 && (
        <Section>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-caption uppercase tracking-[0.16em] text-sapphire dark:text-sky-signal">Tienda de equipos</p>
                <H2 className="mt-3">Equipos disponibles en Santo Domingo</H2>
                <Lead className="mt-4">Laptops, celulares y accesorios con precio en pesos, garantía y entrega en todo Santo Domingo. ¿Buscas otro modelo? Te lo conseguimos.</Lead>
              </div>
              <ul className="flex flex-wrap gap-2">
                {STORE_PERKS.map((p) => (
                  <li key={p.text} className="inline-flex items-center gap-1.5 rounded-full border border-pale-mist/80 bg-card px-3 py-1.5 text-[13px] text-obsidian/80 dark:text-foreground/80">
                    <p.icon className="h-3.5 w-3.5 text-sapphire dark:text-sky-signal" aria-hidden /> {p.text}
                  </li>
                ))}
              </ul>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ActionButton action={{ label: "Ver todo el catálogo", href: "/catalogo" }} />
              <a
                href={whatsappUrl("Hola, busco un equipo que no veo en el catálogo")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[15px] text-sapphire dark:text-sky-signal underline decoration-sapphire/30 underline-offset-4"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> Pedir otro modelo por WhatsApp
              </a>
            </p>
          </Reveal>
        </Section>
      )}

      {/* ── Assistant ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] bg-obsidian text-white">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.35),transparent)]" />
              <div className="relative grid items-center gap-10 p-7 md:p-14 lg:grid-cols-2">
                <ChatBubbles className="mx-auto w-full max-w-[420px]" />
                <div>
                  <p className="text-caption uppercase tracking-[0.16em] text-white/50">Caso real</p>
                  <h2 className="mt-3 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-balance">Un asistente de ventas que no inventa precios</h2>
                  <p className="mt-5 text-[17px] leading-relaxed text-white/75">
                    Construimos nuestro propio asistente con IA para WhatsApp y para la burbuja de este sitio. Responde con el catálogo real, arma el pedido y solo lo registra cuando el cliente confirma. En 10 conversaciones de prueba, la IA costó US$0.0046 en total.{CHAT_ENABLED && " Puedes probarlo ahora en el catálogo."}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ActionButton action={{ label: "Ver cómo funciona", href: "/servicios/chatbots-ia-whatsapp#caso" }} tone="dark" />
                    {CHAT_ENABLED && <ActionButton action={{ label: "Probarlo en el catálogo", href: "/catalogo" }} tone="dark" variant="secondary" />}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Systems ── */}
      <Section tone="fog">
        <Reveal>
          <div className="max-w-3xl">
            <H2>Sistemas para administrar tu negocio</H2>
            <Lead className="mt-4">Si lo que necesitas ya existe, no hace falta un desarrollo. Nuestros sistemas son web, en español, funcionan desde el celular y se prueban gratis antes de pagar.</Lead>
          </div>
          <div className="mt-10">
            <SystemsShowcase systems={systems} defaultTrialDays={trialDays} />
          </div>
          <p className="mt-10">
            <ArrowLink href="/sistemas">Ver sistemas y precios</ArrowLink>
          </p>
        </Reveal>
      </Section>

      {/* ── Why ── */}
      <Section tone="ice">
        <Reveal>
          <H2 className="text-center">¿Por qué trabajar con Avero Technology?</H2>
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {WHY.map((w) => (
              <li key={w.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                  <w.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{w.title}</h3>
                <p className="mt-1.5 text-[15px] text-pewter">{w.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* ── How we start ── */}
      <Section>
        <Reveal>
          <H2 className="text-center">¿Cómo empezamos?</H2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-[28px] border border-pale-mist/70 bg-card p-7">
                <span aria-hidden className="absolute right-6 top-5 text-5xl font-semibold text-obsidian/[0.06] dark:text-white/[0.07]">{i + 1}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground">{i + 1}</span>
                <h3 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-[15px] text-pewter">{s.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Section>

      {/* ── Where + who ── */}
      <Section tone="fog">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="h-full rounded-[28px] border border-pale-mist/70 bg-card p-7 md:p-9">
              <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">¿Dónde atendemos?</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-pewter">
                Estamos en Santo Domingo. Entregamos equipos y damos soporte técnico en persona en todo Santo Domingo. Las páginas web, los portales, el SEO, la IA y los chatbots los hacemos a distancia para negocios de Santiago, del resto del país, de Latinoamérica, de Estados Unidos y de cualquier otro lugar.
              </p>
            </div>
          </Reveal>
          <Reveal className="h-full" delay={0.08}>
            <div className="flex h-full flex-col rounded-[28px] border border-pale-mist/70 bg-card p-7 md:p-9">
              <div className="flex items-center gap-4">
                {PENDING.founderPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={PENDING.founderPhotoUrl} alt={`${FOUNDER}, fundador de Avero Technology`} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">AV</span>
                )}
                <div>
                  <h2 className="text-[26px] font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">Quién está detrás</h2>
                  <p className="text-[13px] text-pewter">{FOUNDER}, fundador</p>
                </div>
              </div>
              <p className="mt-4 text-[16px] leading-relaxed text-pewter">
                Avero Technology la fundó {FOUNDER} en 2024 en Santo Domingo. Alejandro dirige la empresa y responde personalmente por cada proyecto que entregamos.
              </p>
              <p className="mt-auto pt-6">
                <ArrowLink href="/nosotros">Conocer cómo trabajamos</ArrowLink>
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section narrow>
        <Reveal>
          <H2 className="text-center">Preguntas frecuentes</H2>
          <div className="mt-10">
            <Faq entries={FAQ} />
          </div>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Hablamos de tu negocio?"
        text="Escríbenos por WhatsApp y cuéntanos qué quieres lograr. Te respondemos al momento, a cualquier hora."
        primary={{ label: "Escríbenos por WhatsApp", href: QUOTE }}
        secondary={{ label: "Ver precios", href: "/precios" }}
      />
    </>
  )
}
