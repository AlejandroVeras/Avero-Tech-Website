import type { Metadata } from "next"
import { SectionHeading } from "@/components/site/section-heading"
import { Catalog } from "@/components/site/catalog"
import { Faq } from "@/components/site/faq"
import { STORE_FAQ } from "@/components/site/faq-content"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { ProcessSteps } from "@/components/site/blocks/sections"
import { ArrowLink, H2, Lead, Section } from "@/components/site/blocks/primitives"
import { contentMetadata } from "@/components/site/blocks/content-page"
import { ShieldCheck, Tag, Truck } from "lucide-react"
import { getStoreProducts } from "@/lib/data/public-catalog"
import { pageGraph } from "@/lib/schema"
import { SITE_URL, whatsappUrl } from "@/lib/site"

const PATH = "/catalogo"
const TITLE = "Laptops y equipos en Santo Domingo"
const DESCRIPTION = "Laptops, celulares y accesorios con precio en pesos, garantía y entrega en todo Santo Domingo. Pregunta disponibilidad por WhatsApp a cualquier hora."
const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Catálogo", href: PATH },
]

export const metadata: Metadata = contentMetadata({ path: PATH, title: TITLE, description: DESCRIPTION })

const TRUST = [
  { icon: Tag, title: "Precio en pesos", text: "El precio que ves es el que pagas. Confirmamos la disponibilidad antes de cerrar la venta." },
  { icon: ShieldCheck, title: "Garantía", text: "Cada ficha indica la garantía del equipo. Detalles en nuestra política de garantía." },
  { icon: Truck, title: "Entrega en Santo Domingo", text: "Coordinamos la entrega en todo Santo Domingo al confirmar el pedido." },
]

export default async function CatalogoPage() {
  const products = await getStoreProducts()

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          title: `${TITLE} | Avero Technology`,
          description: DESCRIPTION,
          type: "CollectionPage",
          crumbs: CRUMBS,
          faq: STORE_FAQ,
          author: false,
          nodes: [{ "@type": "ItemList", "@id": `${SITE_URL}${PATH}#productos`, itemListElement: products.slice(0, 50).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/catalogo/${p.slug}`, name: p.name })) }],
        })}
      />
      <section className="pt-10 md:pt-14 pb-20 md:pb-28 bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background dark:from-sky-signal/[0.07] dark:via-transparent">
        <div className="container mx-auto px-4">
          <Breadcrumbs crumbs={CRUMBS} className="max-w-6xl mx-auto mb-10" />
          <SectionHeading
            as="h1"
            title="Catálogo de laptops y equipos en Santo Domingo"
            description="Laptops, celulares y accesorios con precio en pesos dominicanos, condición y garantía en cada ficha. Entregamos en todo Santo Domingo. Pregunta por disponibilidad o arma tu pedido y envíalo por WhatsApp."
            className="mb-4"
          />
          <p className="mb-10 text-center text-[13px] text-pewter">¿Dudas sobre un equipo? Abre el chat: nuestro asistente responde con el precio y la disponibilidad reales, a cualquier hora.</p>
          <Catalog products={products} />
        </div>
      </section>

      <Section>
        <ul className="grid gap-5 md:grid-cols-3">
          {TRUST.map((t) => (
            <li key={t.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                <t.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{t.title}</h2>
              <p className="mt-1.5 text-[15px] text-pewter">{t.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="fog">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <H2>¿Cómo comprar un equipo en Avero?</H2>
            <Lead className="mt-5">¿No ves el modelo que buscas? Escríbenos y te lo conseguimos.</Lead>
            <p className="mt-6 flex flex-col gap-3">
              <ArrowLink href={whatsappUrl("Hola, busco un equipo que no veo en el catálogo")}>Pedir otro modelo por WhatsApp</ArrowLink>
              <ArrowLink href="/servicios/soporte-tecnico">Soporte técnico en Santo Domingo</ArrowLink>
            </p>
          </div>
          <ProcessSteps
            steps={[
              { title: "Elige el equipo", text: "Revisa sus especificaciones, condición y garantía." },
              { title: "Toca «Consultar»", text: "O agrégalo al carrito y envía el pedido por WhatsApp." },
              { title: "Confirmamos disponibilidad y entrega", text: "En la misma conversación, a cualquier hora." },
              { title: "Recíbelo en tu casa u oficina", text: "En Santo Domingo, y paga por transferencia o en efectivo." },
            ]}
          />
        </div>
      </Section>

      <Section narrow>
        <SectionHeading title="Preguntas frecuentes" className="mb-12" />
        <Faq entries={STORE_FAQ} />
      </Section>
    </>
  )
}
