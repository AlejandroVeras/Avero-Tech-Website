import Link from "next/link"
import { ArrowRight, Laptop, LayoutDashboard, Wrench, Zap, Heart, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { getStoreProducts } from "@/lib/data/public-catalog"
import { ProductCard } from "@/components/site/product-card"

const ENTRY_POINTS = [
  {
    icon: Laptop,
    title: "Equipos",
    description: "Laptops, PCs y periféricos listos para trabajar desde el primer día.",
    href: "/catalogo",
    cta: "Ver catálogo",
  },
  {
    icon: LayoutDashboard,
    title: "Sistemas",
    description: "Software para administrar tu negocio: inventario, ventas a crédito, facturas y reportes.",
    href: "/sistemas",
    cta: "Conocer los sistemas",
  },
  {
    icon: Wrench,
    title: "Soporte IT",
    description: "Reparación, mantenimiento, redes, servidores y consultoría para tu empresa.",
    href: "/soporte",
    cta: "Solicitar soporte",
  },
]

const VALUES = [
  { icon: Zap, title: "Rapidez", description: "Respuesta en menos de 2 horas. Equipos listos para entregar el mismo día." },
  { icon: Heart, title: "Honestidad", description: "Precios transparentes, sin letras pequeñas. Tecnología que funciona desde el día 1." },
  { icon: Shield, title: "Garantía", description: "Nuestros equipos y servicios incluyen garantía." },
]

export default async function HomePage() {
  const products = await getStoreProducts()
  const featured = products.filter((p) => p.inStock).slice(0, 4)

  return (
    <>
      <section className="bg-background py-24 md:py-36">
        <div className="container mx-auto px-4 text-center space-y-5 max-w-[980px]">
          <p className="text-caption uppercase tracking-[0.16em] text-pewter">Santo Domingo, República Dominicana</p>
          <h1 className="text-4xl sm:text-5xl md:text-display font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">
            Tecnología que impulsa tu negocio
          </h1>
          <p className="text-body text-pewter max-w-xl mx-auto text-balance">
            Equipos, software y soporte IT — todo lo que necesitas para digitalizar tu empresa con confianza y garantía.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
              <Link href="/catalogo">Ver catálogo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-6 text-[14px] font-normal border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
              asChild
            >
              <Link href="/sistemas">Ver sistemas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background dark:from-sky-signal/[0.07] dark:via-transparent">
        <div className="container mx-auto px-4">
          <SectionHeading title="¿Qué necesitas hoy?" className="mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {ENTRY_POINTS.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group rounded-3xl border border-pale-mist/70 bg-card p-8 flex flex-col hover:border-sapphire/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal mb-5">
                  <e.icon className="w-6 h-6" aria-hidden />
                </div>
                <h2 className="text-heading-sm font-semibold text-obsidian dark:text-foreground">{e.title}</h2>
                <p className="text-[15px] text-pewter mt-2 flex-1">{e.description}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                  {e.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeading title="Disponibles ahora" description="Algunos de los equipos que tenemos listos para entrega." className="mb-12" />
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {featured.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            <div className="text-center mt-10">
              <Link href="/catalogo" className="text-[14px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
                Ver todo el catálogo &gt;
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="¿Por qué Avero Technology?"
            description="Más que una empresa de tecnología — somos tu aliado digital de confianza en Santo Domingo"
            className="mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-3xl border border-pale-mist/70 bg-card p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                  <v.icon className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-obsidian dark:text-foreground">{v.title}</h3>
                <p className="text-sm text-pewter">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
