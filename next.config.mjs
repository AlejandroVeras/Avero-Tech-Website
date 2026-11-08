const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Render <title>, description, canonical and Open Graph inside <head> for every visitor, not streamed at the
  // end of <body>: crawlers and AI fetchers that are not on Next's bot list would otherwise miss them.
  htmlLimitedBots: /.*/,
  images: {
    // Product photos are resized to WebP in the browser before upload, so Next's optimizer isn't needed.
    unoptimized: true,
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async redirects() {
    return [
      { source: "/pricing", destination: "/precios", permanent: true },
      // Support became a service; the management system is now called Avero Inventario.
      { source: "/soporte", destination: "/servicios/soporte-tecnico", statusCode: 301 },
      { source: "/sistemas/gestion", destination: "/sistemas/inventario", statusCode: 301 },
    ]
  },
  // Clickjacking, MIME sniffing and downgrade protection for every page (sitio, inventario y tiendas).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
