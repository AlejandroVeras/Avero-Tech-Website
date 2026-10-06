/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [{ source: "/pricing", destination: "/precios", permanent: true }]
  },
}

export default nextConfig
