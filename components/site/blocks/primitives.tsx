// Shared building blocks for the content pages (services, systems, about, pricing).
// They reuse the site's tokens: fog-white canvas, white cards, obsidian text, one blue action color.
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FOUNDER } from "@/lib/site"
import { contentDate, contentDateLabel } from "@/lib/content-dates"

export type Action = { label: string; href: string }

const isExternal = (href: string) => href.startsWith("http")
const isWhatsApp = (href: string) => href.includes("wa.me/")

/** Primary or secondary pill button; WhatsApp links open in a new tab with the chat icon. */
export function ActionButton({ action, variant = "primary", tone = "light", className }: { action: Action; variant?: "primary" | "secondary"; tone?: "light" | "dark" | "blue"; className?: string }) {
  const styles = {
    primary: {
      light: "bg-primary text-primary-foreground hover:bg-primary/90",
      dark: "bg-white text-obsidian hover:bg-white/90",
      blue: "bg-white text-[#0058b3] hover:bg-white/90",
    },
    secondary: {
      light: "border border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal",
      dark: "border border-sky-signal text-sky-signal bg-transparent hover:bg-sky-signal/10 hover:text-sky-signal",
      blue: "border border-white/70 bg-transparent text-white hover:bg-white/10 hover:text-white",
    },
  }[variant][tone]
  const content = (
    <>
      {isWhatsApp(action.href) && <MessageCircle className="h-4 w-4" aria-hidden />}
      {action.label}
    </>
  )
  return (
    <Button size="lg" className={cn("h-12 rounded-full px-7 text-[15px] font-normal", styles, className)} asChild>
      {isExternal(action.href) ? (
        <a href={action.href} target="_blank" rel="noopener noreferrer">{content}</a>
      ) : (
        <Link href={action.href}>{content}</Link>
      )}
    </Button>
  )
}

/** Inline text link with arrow, used under blocks ("Ver precios →"). */
export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const cls = cn("group inline-flex items-center gap-1 text-[15px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4", className)
  const inner = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </>
  )
  return isExternal(href) ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a> : <Link href={href} className={cls}>{inner}</Link>
}

const TONES = {
  default: "bg-background",
  fog: "bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]",
  ice: "bg-gradient-to-b from-ice-wash/25 via-ice-wash/10 to-background dark:from-sky-signal/[0.07] dark:via-transparent",
  dark: "bg-obsidian text-white",
} as const

export function Section({ tone = "default", id, className, children, narrow = false }: { tone?: keyof typeof TONES; id?: string; className?: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <section id={id} className={cn("py-16 md:py-24 scroll-mt-20", TONES[tone], className)}>
      <div className={cn("container mx-auto px-4", narrow ? "max-w-3xl" : "max-w-6xl")}>{children}</div>
    </section>
  )
}

/** "Por Alejandro Veras, fundador de Avero Technology · Actualizado el 5 de noviembre de 2026" */
export function Byline({ path, inverted = false, className }: { path: string; inverted?: boolean; className?: string }) {
  return (
    <p className={cn("text-[13px]", inverted ? "text-white/60" : "text-pewter", className)}>
      Por{" "}
      <Link href="/nosotros" className={cn("underline underline-offset-4", inverted ? "text-white/85 decoration-white/30" : "text-obsidian/85 dark:text-foreground/85 decoration-pewter/40")}>
        {FOUNDER}
      </Link>
      , fundador de Avero Technology · Actualizado el <time dateTime={contentDate(path)}>{contentDateLabel(path)}</time>
    </p>
  )
}

/** Small uppercase label above titles, like SectionHeading's eyebrow. */
export function Eyebrow({ children, inverted = false, className }: { children: React.ReactNode; inverted?: boolean; className?: string }) {
  return <p className={cn("text-caption uppercase tracking-[0.16em]", inverted ? "text-white/50" : "text-pewter", className)}>{children}</p>
}

/** Left-aligned section title for long-form pages. */
export function H2({ children, id, inverted = false, className }: { children: React.ReactNode; id?: string; inverted?: boolean; className?: string }) {
  return (
    <h2 id={id} className={cn("scroll-mt-24 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-balance", inverted ? "text-white" : "text-obsidian dark:text-foreground", className)}>
      {children}
    </h2>
  )
}

export function Lead({ children, inverted = false, className }: { children: React.ReactNode; inverted?: boolean; className?: string }) {
  return <p className={cn("text-[19px] leading-[1.5] tracking-[-0.2px]", inverted ? "text-white/80" : "text-obsidian/80 dark:text-foreground/80", className)}>{children}</p>
}

export function Prose({ children, inverted = false, className }: { children: React.ReactNode; inverted?: boolean; className?: string }) {
  return (
    <div className={cn("space-y-4 text-body", inverted ? "text-white/75" : "text-pewter", "[&_a]:text-sapphire dark:[&_a]:text-sky-signal [&_a]:underline [&_a]:decoration-sapphire/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-current [&_strong]:font-semibold [&_strong]:text-obsidian dark:[&_strong]:text-foreground", className)}>
      {children}
    </div>
  )
}

/** Bullet list with blue check dots. */
export function CheckList({ items, inverted = false, className }: { items: React.ReactNode[]; inverted?: boolean; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((it, i) => (
        <li key={i} className={cn("flex gap-3 text-body", inverted ? "text-white/80" : "text-obsidian/85 dark:text-foreground/85")}>
          <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary dark:bg-sky-signal" />
          <span className="[&_strong]:font-semibold">{it}</span>
        </li>
      ))}
    </ul>
  )
}
