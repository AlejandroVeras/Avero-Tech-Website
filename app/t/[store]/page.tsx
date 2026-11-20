import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import { Catalog } from "@/components/site/catalog"
import { getProductsForStore, getStoreBySlug } from "@/lib/data/public-catalog"

type Params = { params: Promise<{ store: string }> }
type PageProps = Params & { searchParams: Promise<{ categoria?: string }> }

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
      images: store.coverUrl ? [{ url: store.coverUrl }] : store.logoUrl ? [{ url: store.logoUrl }] : undefined,
    },
  }
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border px-3 py-1 text-sm text-obsidian hover:bg-muted dark:text-foreground"
    >
      {label}
    </a>
  )
}

export default async function TenantStorePage({ params, searchParams }: PageProps) {
  const [{ store: slug }, { categoria }] = await Promise.all([params, searchParams])
  const store = await getStoreBySlug(slug)
  if (!store) notFound()
  const products = await getProductsForStore(store.id)

  // Only featured categories that still have visible products.
  const available = new Set(products.map((p) => p.category).filter(Boolean))
  const featured = (store.featuredCategories ?? []).filter((c) => available.has(c))
  const active = categoria && available.has(categoria) ? categoria : undefined
  const socials = [
    store.instagram && { href: `https://www.instagram.com/${store.instagram}`, label: "Instagram" },
    store.facebook && { href: `https://www.facebook.com/${store.facebook}`, label: "Facebook" },
    store.tiktok && { href: `https://www.tiktok.com/@${store.tiktok}`, label: "TikTok" },
  ].filter((s): s is { href: string; label: string } => Boolean(s))

  return (
    <>
      {store.coverUrl && (
        <div className="relative w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={store.coverUrl} alt="" className="aspect-[3/1] max-h-[420px] w-full object-cover" />
        </div>
      )}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
            <h1 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">
              {store.name}
            </h1>
            {store.description && <p className="text-body text-pewter text-balance">{store.description}</p>}
            {(store.hours || store.address) && (
              <ul className="flex flex-col items-center gap-1 text-sm text-pewter sm:flex-row sm:justify-center sm:gap-5">
                {store.hours && (
                  <li className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden /> {store.hours}
                  </li>
                )}
                {store.address && (
                  <li className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden /> {store.address}
                  </li>
                )}
              </ul>
            )}
            {socials.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {socials.map((s) => (
                  <SocialLink key={s.label} {...s} />
                ))}
              </div>
            )}
          </div>

          {featured.length > 0 && (
            <nav aria-label="Categorías destacadas" className="mb-8 flex flex-wrap justify-center gap-2">
              <Link
                href={`/t/${store.slug}`}
                scroll={false}
                aria-current={!active ? "page" : undefined}
                className={!active ? "rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground" : "rounded-full border px-4 py-1.5 text-sm hover:bg-muted"}
              >
                Todo
              </Link>
              {featured.map((c) => (
                <Link
                  key={c}
                  href={`/t/${store.slug}?categoria=${encodeURIComponent(c)}`}
                  scroll={false}
                  aria-current={active === c ? "page" : undefined}
                  className={active === c ? "rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground" : "rounded-full border px-4 py-1.5 text-sm hover:bg-muted"}
                >
                  {c}
                </Link>
              ))}
            </nav>
          )}

          <Catalog
            key={active ?? "todo"}
            products={products}
            basePath={`/t/${store.slug}`}
            showCart={false}
            initialCategory={active}
            emptyMessage="Esta tienda todavía no ha publicado productos"
          />
        </div>
      </section>
    </>
  )
}
