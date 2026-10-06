import type { Metadata } from "next"
import { SectionHeading } from "@/components/site/section-heading"
import { Catalog } from "@/components/site/catalog"
import { Faq } from "@/components/site/faq"
import { STORE_FAQ } from "@/components/site/faq-content"
import { getPublicProducts } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "Catálogo de equipos",
  description: "Laptops, PCs y periféricos disponibles para entrega inmediata en Santo Domingo.",
}

export default async function CatalogoPage() {
  const products = await getPublicProducts()

  return (
    <>
      <section className="py-20 md:py-28 bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background dark:from-sky-signal/[0.07] dark:via-transparent">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            title="Catálogo de equipos"
            description="Laptops, PCs y periféricos disponibles para entrega inmediata"
            className="mb-10"
          />
          <Catalog products={products} />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes" className="mb-12" />
          <Faq entries={STORE_FAQ} />
        </div>
      </section>
    </>
  )
}
