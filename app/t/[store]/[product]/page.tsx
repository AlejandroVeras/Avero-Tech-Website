import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/site/product-detail"
import { getProductForStore, getProductsForStore, getStoreBySlug, relatedProducts } from "@/lib/data/public-catalog"
import { formatDOP } from "@/lib/site"

type Params = { params: Promise<{ store: string; product: string }> }

async function load(params: Params["params"]) {
  const { store: storeSlug, product: productSlug } = await params
  const store = await getStoreBySlug(storeSlug)
  if (!store) return null
  const product = await getProductForStore(store.id, productSlug)
  return product ? { store, product } : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await load(params)
  if (!data) return { title: "Producto no encontrado" }
  const { store, product } = data
  const description =
    product.description?.slice(0, 160) || `${product.name} disponible en ${store.name} por ${formatDOP(product.price)}.`
  return {
    title: { absolute: `${product.name} · ${store.name}` },
    description,
    alternates: { canonical: `/t/${store.slug}/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      siteName: store.name,
      images: product.images.length > 0 ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  }
}

export default async function TenantProductPage({ params }: Params) {
  const data = await load(params)
  if (!data) notFound()
  const { store, product } = data
  const related = relatedProducts(await getProductsForStore(store.id), product)

  return (
    <ProductDetail
      product={product}
      related={related}
      basePath={`/t/${store.slug}`}
      storeName={store.name}
      whatsapp={store.whatsapp}
      showCart={false}
    />
  )
}
