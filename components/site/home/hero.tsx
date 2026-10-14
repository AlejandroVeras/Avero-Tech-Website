"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, FileText, MessageCircle, ShieldCheck, Truck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LaptopMock, PhoneMock } from "@/components/site/home/device-mockups"

const TRUST = [
  { icon: ShieldCheck, text: "Equipos con garantía" },
  { icon: Truck, text: "Entrega el mismo día en Santo Domingo" },
  { icon: Zap, text: "Respuesta en menos de 2 horas" },
]

export function Hero({
  productImages,
  spotlight,
}: {
  productImages: string[]
  spotlight?: { name: string; price: string }
}) {
  const reduce = useReducedMotion()
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } }
  const float = (distance: number, duration: number) =>
    reduce ? {} : { animate: { y: [0, -distance, 0] }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } }

  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-10 md:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12%] h-[620px] w-[1100px] max-w-[160vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.18),transparent)] dark:bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]" />
        <div className="absolute right-[-10%] top-[38%] h-[520px] w-[620px] max-w-[110vw] rounded-full bg-[radial-gradient(closest-side,rgba(170,208,246,0.45),transparent)] dark:bg-[radial-gradient(closest-side,rgba(80,155,231,0.14),transparent)]" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-[980px] text-center">
          <motion.div {...rise(0)}>
            <Link
              href="/sistemas"
              className="group inline-flex items-center gap-2 rounded-full border border-pale-mist/80 bg-card/70 px-3 py-1.5 text-[13px] text-obsidian dark:text-foreground backdrop-blur hover:border-sapphire/40"
            >
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">Nuevo</span>
              Avero Citas y Avero Condominios ya disponibles
              <ArrowRight className="h-3.5 w-3.5 text-sapphire dark:text-sky-signal transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </motion.div>

          <motion.h1
            {...rise(0.08)}
            className="mt-6 text-[2.6rem] leading-[1.05] sm:text-6xl md:text-[5rem] font-semibold tracking-[-0.035em] text-obsidian dark:text-foreground text-balance"
          >
            Tecnología que{" "}
            <span className="bg-gradient-to-r from-[#0071e3] via-[#2997ff] to-[#509be7] bg-clip-text text-transparent">
              impulsa tu negocio
            </span>
          </motion.h1>

          <motion.p {...rise(0.16)} className="mx-auto mt-5 max-w-2xl text-subheading text-pewter text-balance">
            Equipos listos para trabajar, sistemas para administrar tu negocio y soporte IT cuando lo necesitas. Todo en un
            solo lugar, en Santo Domingo.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-12 rounded-full px-7 text-[15px] font-normal" asChild>
              <Link href="/catalogo">Ver equipos disponibles</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-[15px] font-normal border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
              asChild
            >
              <Link href="/sistemas">Ver sistemas</Link>
            </Button>
          </motion.div>

          <motion.ul {...rise(0.32)} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-pewter">
            {TRUST.map((t) => (
              <li key={t.text} className="flex items-center gap-1.5">
                <t.icon className="h-4 w-4 text-sapphire dark:text-sky-signal" aria-hidden />
                {t.text}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          {...(reduce
            ? {}
            : { initial: { opacity: 0, y: 48, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] } })}
          className="relative mx-auto mt-14 md:mt-20 w-full max-w-[920px] px-[6%] md:px-[4%]"
        >
          <LaptopMock />

          <div className="absolute right-[1%] md:right-[-1%] bottom-[-4%] w-[27%] min-w-[104px] max-w-[230px]">
            <motion.div {...float(6, 6)}>
              <PhoneMock images={productImages} />
            </motion.div>
          </div>

          <motion.div
            {...float(8, 7)}
            className="absolute left-0 md:left-[-4%] top-[18%] hidden sm:flex items-center gap-3 rounded-2xl border border-pale-mist/70 bg-card/90 px-3.5 py-2.5 backdrop-blur-md"
            aria-hidden
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]">
              <MessageCircle className="h-4.5 w-4.5 text-white" />
            </span>
            <span className="text-left">
              <span className="block text-[12px] font-semibold text-obsidian dark:text-foreground">Pedido por WhatsApp</span>
              <span className="block max-w-[180px] truncate text-[11px] text-pewter">
                {spotlight ? `${spotlight.name} · ${spotlight.price}` : "Consulta con un toque"}
              </span>
            </span>
          </motion.div>

          <motion.div
            {...float(7, 8)}
            className="absolute left-[8%] md:left-[2%] bottom-[2%] hidden md:flex items-center gap-3 rounded-2xl border border-pale-mist/70 bg-card/90 px-3.5 py-2.5 backdrop-blur-md"
            aria-hidden
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <FileText className="h-4.5 w-4.5 text-primary-foreground" />
            </span>
            <span className="text-left">
              <span className="block text-[12px] font-semibold text-obsidian dark:text-foreground">Factura lista</span>
              <span className="block text-[11px] text-pewter">PDF con ITBIS y RNC</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
