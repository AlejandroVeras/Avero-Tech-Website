import type { MetadataRoute } from "next"
import { getProductsForStore, getStoreProducts, listPublicStores } from "@/lib/data/public-catalog"
import { getPublishedSystems } from "@/lib/data/systems"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, systems, stores] = await Promise.all([getStoreProducts(), getPublishedSystems(), listPublicStores()])
  const storeEntries = await Promise.all(
    stores.map(async (store) => {
      const items = await getProductsForStore(store.id)
      return [
        { url: `${SITE_URL}/t/${store.slug}`, changeFrequency: "weekly" as const, priority: 0.5 },
        ...items.map((p) => ({ url: `${SITE_URL}/t/${store.slug}/${p.slug}`, lastModified: p.createdAt, priority: 0.3 })),
      ]
    }),
  )

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    ...products.map((p) => ({ url: `${SITE_URL}/catalogo/${p.slug}`, lastModified: p.createdAt, priority: 0.8 })),
    { url: `${SITE_URL}/sistemas`, changeFrequency: "monthly", priority: 0.8 },
    ...systems.filter((s) => !s.externalUrl).map((s) => ({ url: `${SITE_URL}/sistemas/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/precios`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/soporte`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.5 },
    ...storeEntries.flat(),
  ]
}
