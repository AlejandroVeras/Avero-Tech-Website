"use client"

import { useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowRight, BadgeCheck, Bot, CheckCheck, Laptop, LayoutDashboard, MessageCircle, Monitor, Search, Sparkles, Wrench } from "lucide-react"

// The globe is client-only WebGL: load it after the text so it never delays the first paint.
const Globe = dynamic(() => import("@/components/site/home/globe").then((m) => m.Globe), { ssr: false })

export type Spotlight = { name: string; price: string; href: string; image?: string }

const CHIPS = [
  { label: "Páginas web", href: "/servicios/diseno-paginas-web", icon: Monitor },
  { label: "SEO", href: "/servicios/posicionamiento-seo", icon: Search },
  { label: "IA y chatbots", href: "/servicios/chatbots-ia-whatsapp", icon: Sparkles },
  { label: "Sistemas", href: "/sistemas", icon: LayoutDashboard },
  { label: "Equipos", href: "/catalogo", icon: Laptop },
  { label: "Soporte", href: "/servicios/soporte-tecnico", icon: Wrench },
]

const glass = "rounded-2xl border border-white/12 bg-white/[0.07] backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"

export function HomeHero({ quoteUrl, spotlight }: { quoteUrl: string; spotlight?: Spotlight }) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  // Tilt the floating cards toward the pointer (desktop only; CSS keeps them still for reduced motion).
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !sceneRef.current) return
    const r = sceneRef.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      sceneRef.current?.style.setProperty("--ry", `${x * 14}deg`)
      sceneRef.current?.style.setProperty("--rx", `${-y * 10}deg`)
    })
  }
  const onLeave = () => {
    sceneRef.current?.style.setProperty("--ry", "0deg")
    sceneRef.current?.style.setProperty("--rx", "0deg")
  }

  return (
    <section onPointerMove={onMove} onPointerLeave={onLeave} className="relative isolate overflow-hidden bg-[#05070d] text-white">
      {/* Background: glows, perspective grid floor and a soft vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-30%] h-[700px] w-[900px] max-w-[160vw] rounded-full bg-[radial-gradient(closest-side,rgba(0,113,227,0.35),transparent)]" />
        <div className="absolute right-[-15%] top-[10%] h-[640px] w-[640px] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]" />
        <div className="hero-grid absolute inset-x-[-25%] bottom-[-10%] h-[62%]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#05070d_95%)]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 pt-14 pb-12 md:pt-20 lg:min-h-[calc(100svh-3.5rem)] lg:flex lg:flex-col lg:justify-center">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/80 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-signal opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-signal" />
              </span>
              Santo Domingo · Para todo el mundo · WhatsApp 24/7
            </p>

            <h1 className="mt-6 text-[2.5rem] leading-[1.04] sm:text-[3.4rem] lg:text-[3.6rem] font-semibold tracking-[-0.04em] text-balance">
              Páginas web, SEO e{" "}
              <span className="bg-gradient-to-r from-[#2997ff] via-[#7cc0ff] to-[#aad0f6] bg-clip-text text-transparent">inteligencia artificial</span>{" "}
              para negocios en República Dominicana
            </h1>

            <p className="mt-6 max-w-xl text-[17px] md:text-[18px] leading-relaxed text-white/75">
              Hacemos que tu negocio aparezca en Google, atienda por WhatsApp a cualquier hora y deje de perder tiempo en tareas repetitivas. Y te vendemos los equipos para trabajar, con garantía y entrega en todo Santo Domingo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[15px] text-primary-foreground shadow-[0_10px_30px_-8px_rgba(0,113,227,0.8)] transition-transform hover:-translate-y-0.5 hover:bg-primary/90">
                <MessageCircle className="h-4 w-4" aria-hidden /> Cotizar por WhatsApp
              </a>
              <Link href="/servicios" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-7 text-[15px] text-white backdrop-blur transition-colors hover:bg-white/[0.12]">
                Ver servicios
              </Link>
              <Link href="/catalogo" className="group inline-flex h-12 items-center gap-1 px-2 text-[15px] text-sky-signal">
                Ver equipos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <p className="mt-4 text-[13px] text-white/55">Respondemos al momento, 24/7. Cotización sin costo.</p>

            <ul aria-label="Lo que hacemos" className="mt-7 flex flex-wrap gap-1.5">
              {CHIPS.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[12.5px] text-white/75 transition-colors hover:border-sky-signal/60 hover:text-white">
                    <c.icon className="h-3.5 w-3.5 text-sky-signal" aria-hidden /> {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3D scene: globe with floating glass cards */}
          <div ref={sceneRef} className="hero-scene relative mx-auto aspect-square w-full max-w-[600px]">
            <div className="hero-tilt absolute inset-0">
              <Globe className="absolute inset-[1%]" />

              <div className={`${glass} hero-float absolute left-[-2%] top-[10%] hidden w-[52%] max-w-[250px] p-3 sm:block [--z:60px]`}>
                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#25d366]/20 text-[#25d366]"><Bot className="h-3.5 w-3.5" aria-hidden /></span>
                  Asistente de ventas · en línea
                </div>
                <p className="mt-2 rounded-xl rounded-tl-sm bg-white/10 px-3 py-2 text-[12px] leading-snug text-white/90">
                  ¡Buenas! Sí, la tenemos disponible, nueva y sellada. ¿La quiere para trabajo o estudios?
                </p>
                <p className="mt-1.5 ml-auto w-fit rounded-xl rounded-tr-sm bg-[#005c4b] px-3 py-1.5 text-[12px] text-white/95">
                  Sí, confirmo <CheckCheck className="ml-0.5 inline h-3 w-3 text-[#53bdeb]" aria-hidden />
                </p>
              </div>

              {spotlight && (
                <Link href={spotlight.href} className={`${glass} hero-float hero-float-delay absolute bottom-[3%] right-[6%] flex w-[88%] max-w-[300px] items-center gap-3 p-3 sm:bottom-[12%] sm:right-[-2%] sm:w-[56%] sm:max-w-[270px] transition-colors hover:border-sky-signal/50 [--z:90px]`}>
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    {spotlight.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spotlight.image} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                    ) : (
                      <Laptop className="m-4 h-6 w-6 text-obsidian/40" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-sky-signal">Disponible hoy</span>
                    <span className="block truncate text-[13px] font-medium text-white">{spotlight.name}</span>
                    <span className="block text-[13px] text-white/70">{spotlight.price}</span>
                  </span>
                </Link>
              )}

              <div className={`${glass} hero-float hero-float-delay-2 absolute right-[4%] top-[4%] hidden px-4 py-3 sm:block [--z:40px]`}>
                <p className="flex items-center gap-1.5 text-[11px] text-white/60"><BadgeCheck className="h-3.5 w-3.5 text-[#6fd39b]" aria-hidden /> Lighthouse móvil</p>
                <p className="mt-0.5 text-2xl font-semibold tracking-tight">100 <span className="text-[13px] font-normal text-white/60">SEO</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Proof strip */}
        <dl className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["3", "sistemas propios en producción"],
            ["24/7", "respuesta por WhatsApp"],
            ["100", "en SEO y accesibilidad (Lighthouse móvil)"],
            ["2024", "año en que empezamos, en Santo Domingo"],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <dt className="mt-1 text-[13px] text-white/60">{label}</dt>
              <dd className="text-3xl md:text-4xl font-semibold tracking-tight">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
