import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { APP_URL, SITE_URL } from "@/lib/site"

export default async function robots(): Promise<MetadataRoute.Robots> {
  // The app domain only exposes the customers' public stores to search engines.
  const onApp = (await headers()).get("host") === new URL(APP_URL).host
  const base = onApp ? APP_URL : SITE_URL
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/login", "/signup"] },
    sitemap: `${base}/sitemap.xml`,
  }
}
