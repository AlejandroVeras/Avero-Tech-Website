import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { ActionButton, Byline, Lead, Section } from "@/components/site/blocks/primitives"
import { contentMetadata } from "@/components/site/blocks/content-page"
import { ServiceIcon } from "@/components/site/blocks/service-icon"
import { ORG_ID, pageGraph } from "@/lib/schema"
import { SERVICES, SITE_URL, whatsappUrl } from "@/lib/site"

const PATH = "/blog"
const TITLE = "Blog: webs, SEO e IA para negocios en RD"
const DESCRIPTION = "Guías con precios, comparativas y pasos concretos sobre páginas web, SEO, WhatsApp e inteligencia artificial para negocios en República Dominicana."
const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Blog", href: PATH },
]

export const metadata: Metadata = contentMetadata({ path: PATH, title: TITLE, description: DESCRIPTION })

// No articles yet: the first ones are scheduled in docs/contenido/98-calendario-blog.docx.
// Until then the page explains what is coming and sends readers to the services.
export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          title: `${TITLE} | Avero Technology`,
          description: DESCRIPTION,
          type: "CollectionPage",
          crumbs: CRUMBS,
          nodes: [{ "@type": "Blog", "@id": `${SITE_URL}${PATH}#blog`, name: "Blog de Avero Technology", publisher: { "@id": ORG_ID }, inLanguage: "es-DO" }],
        })}
      />
      <section className="pt-10 md:pt-14 pb-12 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <Breadcrumbs crumbs={CRUMBS} className="mb-10" />
          <div className="max-w-3xl">
            <h1 className="text-[2.35rem] leading-[1.06] sm:text-5xl md:text-[3.5rem] font-semibold tracking-[-0.03em] text-obsidian dark:text-foreground text-balance">Guías para vender más con tu web, Google y la IA</h1>
            <Lead className="mt-5">Respuestas concretas a lo que nos preguntan los dueños de negocio: cuánto cuesta, cuánto tarda, qué conviene y cómo hacerlo. Con precios en pesos, ejemplos de República Dominicana y fuentes enlazadas. Las escribe el equipo de Avero Technology.</Lead>
            <Byline path={PATH} className="mt-6" />
          </div>
        </div>
      </section>
      <Section tone="fog">
        <div className="rounded-[28px] border border-pale-mist/70 bg-card p-8 md:p-10">
          <p className="text-caption uppercase tracking-[0.16em] text-sapphire dark:text-sky-signal">Muy pronto</p>
          <h2 className="mt-3 text-heading-sm font-semibold text-obsidian dark:text-foreground">Estamos preparando las primeras guías</h2>
          <p className="mt-2 max-w-2xl text-body text-pewter">Mientras tanto, cada servicio tiene su guía completa con precios, tiempos y comparativas. ¿Tienes una pregunta? Escríbenos por WhatsApp y la respondemos.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.key}>
                <Link href={s.href} className="group flex items-center gap-3 rounded-2xl bg-fog-white dark:bg-white/5 p-4 hover:text-sapphire dark:hover:text-sky-signal">
                  <ServiceIcon name={s.icon} className="h-5 w-5 text-sapphire dark:text-sky-signal" />
                  <span className="flex-1 text-[15px] text-obsidian dark:text-foreground">{s.name}</span>
                  <ArrowRight className="h-4 w-4 text-pewter transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ActionButton action={{ label: "Escribir por WhatsApp", href: whatsappUrl("Hola, tengo una pregunta para el blog") }} />
          </div>
        </div>
      </Section>
    </>
  )
}
