import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  FileText,
  Heart,
  Laptop,
  MessageCircle,
  Monitor,
  Package,
  QrCode,
  Search,
  Server,
  Shield,
  Store,
  Truck,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { ProductCard } from "@/components/site/product-card"
import { Hero } from "@/components/site/home/hero"
import { getStoreProducts } from "@/lib/data/public-catalog"
import { getTrialDays } from "@/lib/data/systems"
import { formatDOP, whatsappUrl } from "@/lib/site"

const STEPS = [
  { icon: Search, title: "Elige tu equipo", text: "Mira el catálogo con fotos, especificaciones y precios en pesos." },
  { icon: MessageCircle, title: "Escríbenos por WhatsApp", text: "Te confirmamos disponibilidad y resolvemos tus dudas al momento." },
  { icon: Truck, title: "Recíbelo listo para usar", text: "Entrega en Santo Domingo el mismo día; a otras provincias, lo coordinamos." },
]

const VALUES = [
  { icon: Zap, title: "Rapidez", description: "Respuesta en menos de 2 horas. Equipos listos para entregar el mismo día." },
  { icon: Heart, title: "Honestidad", description: "Precios transparentes, sin letras pequeñas. Tecnología que funciona desde el día 1." },
  { icon: Shield, title: "Garantía", description: "Nuestros equipos y servicios incluyen garantía." },
]

const card = "group relative overflow-hidden rounded-[28px] border border-pale-mist/70 bg-card transition-colors hover:border-sapphire/40"

export default async function HomePage() {
  const [products, trialDays] = await Promise.all([getStoreProducts(), getTrialDays()])
  const available = products.filter((p) => p.inStock)
  const featured = available.slice(0, 4)
  const withPhotos = available.filter((p) => p.coverUrl)
  const spotlight = withPhotos[0] ?? available[0]

  return (
    <>
      <Hero
        productImages={withPhotos.slice(0, 4).map((p) => p.coverUrl!)}
        spotlight={spotlight ? { name: spotlight.name, price: formatDOP(spotlight.price) } : undefined}
      />

      {/* ── Lo que hacemos: mosaico ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background via-ice-wash/15 to-background dark:via-sky-signal/[0.05]">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Todo lo que tu negocio necesita"
            description="Desde el equipo en tu escritorio hasta el sistema con el que llevas tus cuentas."
            className="mb-12"
          />
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-[auto_auto]">
            <Link href="/catalogo" className={`${card} md:col-span-2 flex flex-col sm:flex-row`}>
              <div className="flex flex-1 flex-col p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                  <Laptop className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-heading-sm font-semibold text-obsidian dark:text-foreground">Equipos</h3>
                <p className="mt-2 text-[15px] text-pewter">
                  Laptops, PCs y periféricos revisados, con garantía y listos para trabajar desde el primer día.
                </p>
                <span className="mt-auto pt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                  {available.length > 0 ? `Ver ${available.length === 1 ? "el equipo disponible" : `los ${available.length} equipos disponibles`}` : "Ver catálogo"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
              <div
                className={
                  spotlight?.coverUrl
                    ? "relative min-h-[200px] sm:w-[46%] bg-white"
                    : "relative min-h-[200px] sm:w-[46%] bg-gradient-to-br from-fog-white to-ice-wash/40 dark:from-white/[0.03] dark:to-sky-signal/10"
                }
              >
                {spotlight?.coverUrl ? (
                  <Image
                    src={spotlight.coverUrl}
                    alt={spotlight.name}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Laptop className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 text-obsidian/10 dark:text-white/15" aria-hidden />
                )}
              </div>
            </Link>

            <Link href="/sistemas/gestion" className={`${card} md:row-span-2 flex flex-col bg-obsidian text-white border-white/10 hover:border-sky-signal/50 dark:bg-white/[0.04]`}>
              <div className="flex flex-1 flex-col p-8">
                <span className="text-caption uppercase tracking-[0.16em] text-white/50">Sistema de gestión</span>
                <h3 className="mt-3 text-heading-sm font-semibold leading-tight">Tu negocio, organizado</h3>
                <p className="mt-2 text-[15px] text-white/70">
                  Inventario, ventas a crédito y facturas con ITBIS desde el celular o la computadora.
                </p>
                <ul className="mt-6 space-y-3 text-[14px] text-white/85">
                  {[
                    { icon: Package, text: "Inventario con control de stock" },
                    { icon: CreditCard, text: "Lo que te deben, al día" },
                    { icon: FileText, text: "Facturas y cotizaciones en PDF" },
                    { icon: BarChart3, text: "Ganancia de cada mes" },
                    { icon: Store, text: "Tu catálogo en línea incluido" },
                  ].map((f) => (
                    <li key={f.text} className="flex items-center gap-3">
                      <f.icon className="h-4 w-4 shrink-0 text-sky-signal" aria-hidden />
                      {f.text}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto pt-8 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-[14px] text-obsidian">
                  Probar gratis {trialDays} días
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>

            <Link href="/soporte" className={`${card} p-8 flex flex-col`}>
              <div className="flex gap-2 text-sapphire dark:text-sky-signal">
                {[Monitor, Wifi, Server, Wrench].map((Icon, i) => (
                  <span key={i} className="flex h-10 w-10 items-center justify-center rounded-full bg-fog-white dark:bg-white/5">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </span>
                ))}
              </div>
              <h3 className="mt-5 text-heading-sm font-semibold text-obsidian dark:text-foreground">Soporte IT</h3>
              <p className="mt-2 text-[15px] text-pewter">Reparación, redes, servidores y consultoría. Remoto o en tu negocio.</p>
              <span className="mt-auto pt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                Solicitar soporte
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>

            <Link href="/sistemas/gestion" className={`${card} p-8 flex flex-col bg-gradient-to-br from-ice-wash/50 to-card dark:from-sky-signal/15 dark:to-card`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-sapphire dark:text-sky-signal">
                <QrCode className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-heading-sm font-semibold text-obsidian dark:text-foreground">¿Tienes un negocio?</h3>
              <p className="mt-2 text-[15px] text-pewter">
                Ten tu propio catálogo en línea con un link y un código QR para tus clientes.
              </p>
              <span className="mt-auto pt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                Ver cómo funciona
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Equipos disponibles ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4">
            <SectionHeading title="Disponibles ahora" description="Listos para entrega inmediata." className="mb-10" />
            <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5">
              {featured.map((p) => (
                <li key={p.id} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
            <p className="mt-10 text-center">
              <Link href="/catalogo" className="inline-flex items-center gap-1 text-[15px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
                Ver todo el catálogo <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* ── Cómo comprar ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Comprar es así de fácil" className="mb-12" />
          <ol className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-[28px] border border-pale-mist/70 bg-card p-7">
                <span className="absolute right-6 top-5 text-5xl font-semibold text-obsidian/[0.06] dark:text-white/[0.07]" aria-hidden>
                  {i + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-[15px] text-pewter">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Por qué Avero ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="¿Por qué Avero Technology?"
            description="Más que una empresa de tecnología: somos tu aliado digital de confianza en Santo Domingo."
            className="mb-12"
          />
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-7 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                  <v.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-obsidian dark:text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-sm text-pewter">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="pb-24 md:pb-32 pt-4 bg-background">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0058b3] via-[#0071e3] to-[#2997ff] px-6 py-16 text-center text-white md:px-16 md:py-24">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#aad0f6]/20 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl md:text-[3.25rem] md:leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
                ¿Listo para darle a tu negocio la tecnología que merece?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-subheading text-white/85 text-balance">
                Cuéntanos qué necesitas y te ayudamos a elegir el equipo, el sistema o el servicio correcto.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" className="h-12 rounded-full bg-white px-7 text-[15px] font-normal text-[#0058b3] hover:bg-white/90" asChild>
                  <a
                    href={whatsappUrl("Hola Avero Technology, quisiera información sobre sus equipos y servicios.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden /> Escríbenos por WhatsApp
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/70 bg-transparent px-7 text-[15px] font-normal text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/catalogo">Ver catálogo</Link>
                </Button>
              </div>
              <p className="mt-6 text-[13px] text-white/75">Respondemos en menos de 2 horas.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
