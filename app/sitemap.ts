import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { getProductsForStore, getStoreProducts, listPublicStores } from "@/lib/data/public-catalog"
import { getPublishedSystems } from "@/lib/data/systems"
import { APP_URL, SITE_URL } from "@/lib/site"

// Each domain lists only its own pages: the customers' stores on the app domain, the rest on the main one.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host")
  const appHost = new URL(APP_URL).host
  const sameDomain = appHost === new URL(SITE_URL).host
  if (host === appHost && !sameDomain) return storeEntries(APP_URL)

  const [products, systems] = await Promise.all([getStoreProducts(), getPublishedSystems()])
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${SITE_URL}/catalogo/${p.slug}`, lastModified: p.createdAt, priority: 0.8 })),
    { url: `${SITE_URL}/sistemas`, changeFrequency: "monthly", priority: 0.8 },
    ...systems.filter((s) => !s.externalUrl).map((s) => ({ url: `${SITE_URL}/sistemas/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/precios`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/soporte`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.5 },
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
