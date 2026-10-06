import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/site/product-detail"
import { getStoreProduct, getStoreProducts, relatedProducts } from "@/lib/data/public-catalog"
import { WHATSAPP_NUMBER, formatDOP } from "@/lib/site"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = await getStoreProduct(slug)
  if (!product) return { title: "Equipo no encontrado" }

  const description =
    product.description?.slice(0, 160) ||
    `${product.name} disponible en Avero Technology por ${formatDOP(product.price)}.`
  return {
    title: product.name,
    description,
    alternates: { canonical: `/catalogo/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/catalogo/${product.slug}`,
      images: product.images.length > 0 ? [{ url: product.images[0], alt: product.name }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = await getStoreProduct(slug)
  if (!product) notFound()

  const related = relatedProducts(await getStoreProducts(), product)

  return (
    <ProductDetail
      product={product}
      related={related}
      basePath="/catalogo"
      storeName="Avero Technology"
      whatsapp={WHATSAPP_NUMBER}
      showCart
      deliveryNote="Entrega en Santo Domingo; otras provincias, coordinamos el envío"
    />
  )
}
