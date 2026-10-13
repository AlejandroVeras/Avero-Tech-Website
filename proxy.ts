import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"
import { APP_URL, SITE_URL } from "@/lib/site"

const MAIN_HOST = new URL(SITE_URL).hostname
const APP_HOST = new URL(APP_URL).hostname
// Everything the customers' management system needs; the rest of the site stays on the main domain.
const APP_PATHS = /^\/(login|signup|dashboard|t)(\/|$)/
// API routes, robots.txt and sitemap.xml answer on both domains.
const SHARED_PATHS = /^\/api(\/|$)|\.[a-z0-9]+$/i

function moveTo(base: string, request: NextRequest) {
  const { pathname, search } = request.nextUrl
  return NextResponse.redirect(`${base}${pathname}${search}`, 308)
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0]
  const path = request.nextUrl.pathname

  // Local and preview hosts serve everything; the split only applies on the two real domains.
  if (MAIN_HOST !== APP_HOST && !SHARED_PATHS.test(path)) {
    if (host === MAIN_HOST && APP_PATHS.test(path)) return moveTo(APP_URL, request)
    if (host === APP_HOST && path === "/") return NextResponse.redirect(new URL("/dashboard", request.url))
    if (host === APP_HOST && !APP_PATHS.test(path)) return moveTo(SITE_URL, request)
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
