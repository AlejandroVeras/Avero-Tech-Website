import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Catalog } from "@/components/site/catalog"
import { getProductsForStore, getStoreBySlug } from "@/lib/data/public-catalog"

type Params = { params: Promise<{ store: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { store: slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) return { title: "Tienda no encontrada" }
  return {
    title: { absolute: `${store.name} — Catálogo` },
    description: store.description ?? `Catálogo en línea de ${store.name}.`,
    alternates: { canonical: `/t/${store.slug}` },
    openGraph: {
      title: store.name,
      description: store.description ?? `Catálogo en línea de ${store.name}.`,
      siteName: store.name,
      images: store.logoUrl ? [{ url: store.logoUrl }] : undefined,
    },
  }
}

export default async function TenantStorePage({ params }: Params) {
  const { store: slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) notFound()
  const products = await getProductsForStore(store.id)

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">
            {store.name}
          </h1>
          {store.description && <p className="mt-3 text-body text-pewter text-balance">{store.description}</p>}
        </div>
        <Catalog
          products={products}
          basePath={`/t/${store.slug}`}
          showCart={false}
          emptyMessage="Esta tienda todavía no ha publicado productos"
        />
      </div>
    </section>
  )
}
