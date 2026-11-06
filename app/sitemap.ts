import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { getProductsForStore, getStoreProducts, listPublicStores } from "@/lib/data/public-catalog"
import { CONTENT_DATES } from "@/lib/content-dates"
import { APP_URL, SITE_URL } from "@/lib/site"

// Each domain lists only its own pages: the customers' stores on the app domain, the rest on the main one.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host")
  const appHost = new URL(APP_URL).host
  const sameDomain = appHost === new URL(SITE_URL).host
  if (host === appHost && !sameDomain) return storeEntries(APP_URL)

  const products = await getStoreProducts()
  // Static pages carry their real last edit (lib/content-dates.ts); products use their own date.
  return [
    ...Object.entries(CONTENT_DATES).map(([path, date]) => ({ url: path === "/" ? SITE_URL : `${SITE_URL}${path}`, lastModified: new Date(`${date}T00:00:00Z`) })),
    ...products.map((p) => ({ url: `${SITE_URL}/catalogo/${p.slug}`, lastModified: p.createdAt })),
    ...(sameDomain ? await storeEntries(SITE_URL) : []),
  ]
}

async function storeEntries(base: string): Promise<MetadataRoute.Sitemap> {
  const stores = await listPublicStores()
  const entries = await Promise.all(
    stores.map(async (store) => {
      const items = await getProductsForStore(store.id)
      return [
        { url: `${base}/t/${store.slug}`, changeFrequency: "weekly" as const, priority: 0.5 },
        ...items.map((p) => ({ url: `${base}/t/${store.slug}/${p.slug}`, lastModified: p.createdAt, priority: 0.3 })),
      ]
    }),
  )
  return entries.flat()
}
