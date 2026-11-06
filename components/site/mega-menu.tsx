"use client"

import Link from "next/link"
import { ArrowRight, Laptop, MessageCircle } from "lucide-react"
import { SERVICES, SERVICE_GROUPS } from "@/lib/site"
import { ServiceIcon } from "@/components/site/blocks/service-icon"
import { cn } from "@/lib/utils"

// Catalog sits with support in the third column: it is not a service page but buyers look for it there.
const EXTRA = { soporte: [{ name: "Catálogo de equipos", href: "/catalogo", menu: "Laptops y equipos con garantía" }] } as const

type Item = { name: string; href: string; menu: string; icon?: string }

function groupItems(group: string): Item[] {
  const services: Item[] = SERVICES.filter((s) => s.group === group).map((s) => ({ name: s.name, href: s.href, menu: s.menu, icon: s.icon }))
  return [...services, ...((EXTRA as Record<string, readonly Item[]>)[group] ?? [])]
}

function ItemLink({ item, onNavigate }: { item: Item; onNavigate?: () => void }) {
  return (
    <Link href={item.href} onClick={onNavigate} className="group flex gap-3 rounded-2xl p-3 -mx-3 transition-colors hover:bg-fog-white dark:hover:bg-white/5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal group-hover:bg-card">
        {item.icon ? <ServiceIcon name={item.icon} className="h-4 w-4" /> : <Laptop className="h-4 w-4" aria-hidden />}
      </span>
      <span>
        <span className="block text-[15px] font-medium text-obsidian dark:text-foreground">{item.name}</span>
        <span className="block text-[13px] text-pewter">{item.menu}</span>
      </span>
    </Link>
  )
}

/** Desktop panel under the header. */
export function MegaMenuPanel({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  return (
    <div id={id} className="absolute inset-x-0 top-full border-y border-pale-mist/60 bg-card dark:bg-[oklch(0.15_0.03_261)] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]">
      <div className="container mx-auto max-w-6xl px-4 py-8 grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-8">
        {SERVICE_GROUPS.map((g) => (
          <div key={g.key}>
            <p className="mb-3 text-caption uppercase tracking-[0.16em] text-pewter">{g.label}</p>
            <div className="space-y-1">
              {groupItems(g.key).map((it) => (
                <ItemLink key={it.href} item={it} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
        <Link
          href="/servicios/chatbots-ia-whatsapp#caso"
          onClick={onNavigate}
          className="group relative flex flex-col overflow-hidden rounded-[28px] bg-obsidian p-6 text-white"
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.35),transparent)]" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sky-signal">
            <MessageCircle className="h-4 w-4" aria-hidden />
          </span>
          <span className="relative mt-4 text-[17px] font-semibold leading-snug">Así funciona nuestro asistente de ventas con IA</span>
          <span className="relative mt-2 text-[13px] text-white/65">Responde con el catálogo real y solo registra pedidos confirmados.</span>
          <span className="relative mt-auto pt-5 inline-flex items-center gap-1 text-[13px] text-sky-signal">
            Ver el caso <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>
      </div>
      <div className="border-t border-pale-mist/60">
        <div className="container mx-auto max-w-6xl px-4 py-3 flex gap-6 text-[13px]">
          <Link href="/servicios" onClick={onNavigate} className="text-sapphire dark:text-sky-signal hover:underline underline-offset-4">Ver todos los servicios</Link>
          <Link href="/nosotros" onClick={onNavigate} className="text-pewter hover:text-obsidian dark:hover:text-foreground">Quiénes somos</Link>
          <Link href="/precios" onClick={onNavigate} className="text-pewter hover:text-obsidian dark:hover:text-foreground">Precios</Link>
        </div>
      </div>
    </div>
  )
}

/** Mobile accordion content inside the existing mobile menu. */
export function MegaMenuMobile({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-5 px-3 pb-3 pt-1">
      {SERVICE_GROUPS.map((g) => (
        <div key={g.key}>
          <p className="mb-1 text-caption uppercase tracking-[0.16em] text-pewter">{g.label}</p>
          {groupItems(g.key).map((it) => (
            <ItemLink key={it.href} item={it} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
      <Link href="/servicios" onClick={onNavigate} className={cn("inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal")}>
        Ver todos los servicios <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  )
}
