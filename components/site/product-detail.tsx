import Link from "next/link"
import { ChevronRight, MessageCircle, ShieldCheck, Truck, CheckCircle2, XCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductGallery } from "@/components/site/product-gallery"
import { AddToCartButton } from "@/components/site/add-to-cart-button"
import { ProductCard } from "@/components/site/product-card"
import { CONDITION_LABELS, warrantyLabel, type PublicProduct, type PublicProductDetail } from "@/lib/catalog"
import { APP_URL, SITE_URL, formatDOP, whatsappUrl } from "@/lib/site"

const CONDITION_SCHEMA = {
  nuevo: "https://schema.org/NewCondition",
  reacondicionado: "https://schema.org/RefurbishedCondition",
  usado: "https://schema.org/UsedCondition",
} as const

export function ProductDetail({
  product,
  related,
  basePath,
  storeName,
  whatsapp,
  showCart,
  deliveryNote,
}: {
  product: PublicProductDetail
  related: PublicProduct[]
  basePath: string
  storeName: string
  whatsapp?: string
  showCart: boolean
  deliveryNote?: string
}) {
  // Store pages live on the app domain; the Avero catalog lives on the main one.
  const url = `${basePath.startsWith("/t/") ? APP_URL : SITE_URL}${basePath}/${product.slug}`
  const message = `Hola ${storeName}, me interesa el ${product.name} (${formatDOP(product.price)}).\n${url}`
  const warranty = warrantyLabel(product.warrantyMonths)
  const eyebrow = [product.brand, product.condition && CONDITION_LABELS[product.condition], product.category]
    .filter(Boolean)
    .join(" · ")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    itemCondition: product.condition ? CONDITION_SCHEMA[product.condition] : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "DOP",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: storeName },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="py-10 md:py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav aria-label="Ruta de navegación" className="mb-8">
            <ol className="flex items-center gap-1 text-caption text-pewter min-w-0">
              <li className="shrink-0">
                <Link href={basePath} className="hover:text-obsidian dark:hover:text-foreground">
                  Catálogo
                </Link>
              </li>
              <li aria-hidden className="shrink-0">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li className="truncate text-obsidian dark:text-foreground" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <ProductGallery images={product.images} name={product.name} tech={basePath === "/catalogo"} />

            <div className="flex flex-col">
              {eyebrow && <p className="text-caption uppercase tracking-[0.16em] text-pewter">{eyebrow}</p>}
              <h1 className="mt-2 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">
                {product.name}
              </h1>
              <p className="mt-4 text-heading font-semibold text-obsidian dark:text-foreground">{formatDOP(product.price)}</p>

              <ul className="mt-4 space-y-2 text-[15px]">
                <li className="flex items-center gap-2">
                  {product.inStock ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" aria-hidden />
                  )}
                  <span className="text-obsidian dark:text-foreground">
                    {product.inStock ? "Disponible" : "Agotado por ahora — pregunta por disponibilidad"}
                  </span>
                </li>
                {warranty && (
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-sapphire dark:text-sky-signal" aria-hidden />
                    <span className="text-obsidian dark:text-foreground">Garantía: {warranty}</span>
                  </li>
                )}
                {deliveryNote && (
                  <li className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-sapphire dark:text-sky-signal" aria-hidden />
                    <span className="text-pewter">{deliveryNote}</span>
                  </li>
                )}
              </ul>

              <div className="mt-8 flex flex-wrap gap-2">
                {whatsapp && (
                  <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
                    <a href={whatsappUrl(message, whatsapp)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Consultar por WhatsApp
                    </a>
                  </Button>
                )}
                {showCart && <AddToCartButton product={product} />}
              </div>

              {/* Avero's own catalog: how buying works, so nobody has to ask before writing. */}
              {basePath === "/catalogo" && (
                <ul className="mt-6 space-y-2 rounded-2xl border border-pale-mist/70 p-4 text-[14px] text-pewter">
                  <li className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-sapphire dark:text-sky-signal" aria-hidden />
                    Pago por transferencia o en efectivo.
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-sapphire dark:text-sky-signal" aria-hidden />
                    <span>
                      Revisado antes de entregar.{" "}
                      <Link href="/garantia" className="text-sapphire underline underline-offset-4 dark:text-sky-signal">
                        Garantía y devoluciones
                      </Link>
                    </span>
                  </li>
                </ul>
              )}

              {product.description && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-obsidian dark:text-foreground">Descripción</h2>
                  <p className="mt-2 text-body text-pewter whitespace-pre-line">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {product.specs.length > 0 && (
            <div className="mt-16 max-w-3xl">
              <h2 className="text-heading-sm font-semibold text-obsidian dark:text-foreground">Especificaciones</h2>
              <dl className="mt-4 divide-y divide-pale-mist/70 border-y border-pale-mist/70">
                {product.specs.map((s, i) => (
                  <div key={`${s.label}-${i}`} className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-1 sm:gap-6 py-3.5">
                    <dt className="text-[14px] text-pewter">{s.label}</dt>
                    <dd className="text-[15px] text-obsidian dark:text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* On phones the main action stays in reach while scrolling the specs. */}
      {whatsapp && (
        <>
          <div aria-hidden className="h-20 md:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-pale-mist/70 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] text-pewter">{product.name}</p>
                <p className="text-[17px] font-semibold text-obsidian dark:text-foreground">{formatDOP(product.price)}</p>
              </div>
              <Button className="shrink-0 rounded-full px-5 text-[14px] font-normal" asChild>
                <a href={whatsappUrl(message, whatsapp)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Consultar
                </a>
              </Button>
            </div>
          </div>
        </>
      )}

      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-heading-sm md:text-heading font-semibold text-obsidian dark:text-foreground mb-8">
              También te puede interesar
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} basePath={basePath} showCart={showCart} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
