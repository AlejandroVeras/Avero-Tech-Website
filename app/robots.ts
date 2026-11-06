import type { MetadataRoute } from "next"
import { headers } from "next/headers"
import { APP_URL, SITE_URL } from "@/lib/site"

const PRIVATE = ["/dashboard", "/admin", "/login", "/signup", "/api/"]

// Search and AI crawlers we want, named explicitly so a future change to "*" cannot block them by accident.
// Search: Googlebot, Bingbot (also feeds Copilot), OAI-SearchBot, PerplexityBot.
// User-triggered fetches: ChatGPT-User, Perplexity-User. Model training: GPTBot, Google-Extended (no effect on Search).
const SEARCH_AND_AI = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "Perplexity-User", "Google-Extended"]

export default async function robots(): Promise<MetadataRoute.Robots> {
  // The app domain only exposes the customers' public stores to search engines.
  const onApp = (await headers()).get("host") === new URL(APP_URL).host
  const base = onApp ? APP_URL : SITE_URL
  return {
    rules: [
      { userAgent: SEARCH_AND_AI, allow: "/", disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
