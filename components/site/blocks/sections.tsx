import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SERVICES, type ServiceKey } from "@/lib/site"
import type { Crumb } from "@/lib/schema"
import { Breadcrumbs } from "@/components/site/blocks/structure"
import { ActionButton, Byline, H2, Lead, type Action } from "@/components/site/blocks/primitives"
import { Reveal } from "@/components/site/blocks/reveal"
import { ServiceIcon } from "@/components/site/blocks/service-icon"

/* ───────────────────────── Hero ───────────────────────── */

export function ServiceHero({
  crumbs,
  path,
  eyebrow,
  title,
  intro,
  primary,
  secondary,
  micro,
  visual,
  dark = false,
}: {
  crumbs: Crumb[]
  path: string
  eyebrow?: string
  title: string
  intro: string
  primary: Action
  secondary?: Action
  micro?: string
  visual?: React.ReactNode
  dark?: boolean
}) {
  const tone = dark ? "dark" : "light"
  return (
    <section className={cn("relative overflow-hidden pt-10 md:pt-14 pb-16 md:pb-24", dark ? "bg-obsidian text-white" : "bg-background")}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {dark ? (
          <div className="absolute right-[-10%] top-[-20%] h-[560px] w-[760px] max-w-[140vw] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.22),transparent)]" />
        ) : (
          <>
            <div className="absolute left-1/2 top-[-18%] h-[560px] w-[1000px] max-w-[160vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.16),transparent)] dark:bg-[radial-gradient(closest-side,rgba(41,151,255,0.2),transparent)]" />
            <div className="absolute right-[-12%] top-[40%] h-[460px] w-[560px] max-w-[110vw] rounded-full bg-[radial-gradient(closest-side,rgba(170,208,246,0.4),transparent)] dark:bg-[radial-gradient(closest-side,rgba(80,155,231,0.12),transparent)]" />
          </>
        )}
      </div>
      <div className="relative container mx-auto max-w-6xl px-4">
        <Breadcrumbs crumbs={crumbs} inverted={dark} className="mb-8 md:mb-12" />
        <div className={cn("grid items-center gap-12", visual ? "lg:grid-cols-[1.05fr_1fr]" : "max-w-3xl")}>
          <div>
            {eyebrow && <p className={cn("mb-4 text-caption uppercase tracking-[0.16em]", dark ? "text-white/50" : "text-pewter")}>{eyebrow}</p>}
            <h1 className={cn("text-[2.35rem] leading-[1.06] sm:text-5xl md:text-[3.5rem] font-semibold tracking-[-0.03em] text-balance", dark ? "text-white" : "text-obsidian dark:text-foreground")}>
              {title}
            </h1>
            <Lead inverted={dark} className="mt-5 max-w-xl">{intro}</Lead>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ActionButton action={primary} tone={tone} />
              {secondary && <ActionButton action={secondary} variant="secondary" tone={tone} />}
            </div>
            {micro && <p className={cn("mt-4 text-[13px]", dark ? "text-white/60" : "text-pewter")}>{micro}</p>}
            <Byline path={path} inverted={dark} className="mt-8" />
          </div>
          {visual && <div className="relative">{visual}</div>}
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Answer-first block ───────────────────────── */

/** H2 phrased as a question, a 40–60 word answer that stands alone, then optional detail. */
export function AnswerBlock({ id, question, answer, children, inverted = false, className }: { id?: string; question: string; answer: React.ReactNode; children?: React.ReactNode; inverted?: boolean; className?: string }) {
  return (
    <Reveal className={className}>
      <div className="max-w-3xl">
        <H2 id={id} inverted={inverted}>{question}</H2>
        <Lead inverted={inverted} className="mt-5">{answer}</Lead>
      </div>
      {children && <div className="mt-10">{children}</div>}
    </Reveal>
  )
}

/* ───────────────────────── Comparison / data table ───────────────────────── */

/**
 * Table that stays a real <table> (easy for Google and AI to read) and turns each row into a card on phones
 * via data-label, so there is no horizontal scroll.
 */
export function CompareTable({ headers, rows, highlight, caption, className }: { headers: string[]; rows: React.ReactNode[][]; highlight?: number; caption?: string; className?: string }) {
  const hasRowLabel = headers[0] === ""
  return (
    <div className={cn("md:overflow-hidden md:rounded-[28px] md:border md:border-pale-mist/70 md:bg-card", className)}>
      <table className="w-full text-left border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="max-md:hidden">
          <tr className="border-b border-pale-mist/70">
            {headers.map((h, i) => (
              <th key={i} scope="col" className={cn("px-5 py-4 align-bottom text-caption uppercase tracking-[0.12em] font-medium text-pewter", i === highlight && "bg-ice-wash/25 text-sapphire dark:bg-sky-signal/10 dark:text-sky-signal")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-md:space-y-3 max-md:block">
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-pale-mist/60 last:border-0 max-md:block max-md:rounded-[22px] max-md:border max-md:border-pale-mist/70 max-md:bg-card max-md:p-4">
              {row.map((cell, i) => {
                const isLabel = hasRowLabel && i === 0
                const Cell = isLabel ? "th" : "td"
                return (
                  <Cell
                    key={i}
                    scope={isLabel ? "row" : undefined}
                    data-label={headers[i] || undefined}
                    className={cn(
                      "px-5 py-4 align-top text-[15px] leading-relaxed max-md:block max-md:px-0 max-md:py-1.5",
                      isLabel || (!hasRowLabel && i === 0) ? "font-semibold text-obsidian dark:text-foreground max-md:text-[16px]" : "text-obsidian/80 dark:text-foreground/80",
                      headers[i] && !(isLabel || (!hasRowLabel && i === 0)) && "max-md:before:content-[attr(data-label)] max-md:before:block max-md:before:text-caption max-md:before:uppercase max-md:before:tracking-[0.12em] max-md:before:text-pewter max-md:before:mb-0.5",
                      i === highlight && "md:bg-ice-wash/20 dark:md:bg-sky-signal/[0.07] max-md:-mx-2 max-md:mt-1 max-md:rounded-2xl max-md:bg-ice-wash/20 max-md:px-2 dark:max-md:bg-sky-signal/10",
                      "[&_a]:text-sapphire dark:[&_a]:text-sky-signal hover:[&_a]:underline [&_a]:underline-offset-4",
                    )}
                  >
                    {cell}
                  </Cell>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ───────────────────────── Process steps ───────────────────────── */

export type Step = { title: string; text: string; time?: string }

export function ProcessSteps({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-4", className)}>
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 rounded-[28px] border border-pale-mist/70 bg-card p-6 md:p-7">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold text-obsidian dark:text-foreground">{s.title}</h3>
              {s.time && <span className="rounded-full bg-fog-white dark:bg-white/5 px-3 py-1 text-[12px] text-pewter">{s.time}</span>}
            </div>
            <p className="mt-1.5 text-[15px] text-pewter">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ───────────────────────── Pricing tiers ───────────────────────── */

export type Tier = { name: string; audience: string; includes: string[]; price: string; featured?: boolean }

export function PricingTiers({ tiers, cta, note }: { tiers: Tier[]; cta: Action; note?: React.ReactNode }) {
  return (
    <div>
      <div className={cn("grid gap-5", tiers.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
        {tiers.map((t) => (
          <div
            key={t.name}
            className={cn(
              "flex flex-col rounded-[28px] p-7 md:p-8",
              t.featured ? "bg-obsidian text-white dark:bg-white/[0.06] dark:ring-2 dark:ring-sky-signal" : "border border-pale-mist/70 bg-card",
            )}
          >
            <h3 className={cn("text-xl font-semibold", !t.featured && "text-obsidian dark:text-foreground")}>{t.name}</h3>
            <p className={cn("mt-1 text-[14px]", t.featured ? "text-white/70" : "text-pewter")}>{t.audience}</p>
            <p className={cn("mt-6 text-2xl font-semibold tracking-tight", !t.featured && "text-obsidian dark:text-foreground")}>{t.price}</p>
            <ul className="mt-6 space-y-2.5 text-[14px]">
              {t.includes.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className={cn("mt-0.5 h-4 w-4 shrink-0", t.featured ? "text-sky-signal" : "text-sapphire dark:text-sky-signal")} aria-hidden />
                  <span className={t.featured ? "text-white/85" : "text-obsidian/85 dark:text-foreground/85"}>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <ActionButton action={cta} tone={t.featured ? "dark" : "light"} variant={t.featured ? "primary" : "secondary"} className="w-full" />
            </div>
          </div>
        ))}
      </div>
      {note && <p className="mt-6 text-center text-[14px] text-pewter">{note}</p>}
    </div>
  )
}

/* ───────────────────────── Real case ───────────────────────── */

export type Metric = { value: string; label: string }

export function CaseBlock({ id = "caso", eyebrow = "Caso real", title, children, metrics, visual }: { id?: string; eyebrow?: string; title: string; children: React.ReactNode; metrics?: Metric[]; visual?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
      <div className="container mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="overflow-hidden rounded-[36px] border border-pale-mist/70 bg-card">
            <div className={cn("grid gap-10 p-7 md:p-12", visual && "lg:grid-cols-2 lg:items-center")}>
              <div>
                <p className="text-caption uppercase tracking-[0.16em] text-sapphire dark:text-sky-signal">{eyebrow}</p>
                <h2 className="mt-3 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">{title}</h2>
                <div className="mt-5 space-y-4 text-body text-pewter [&_strong]:text-obsidian dark:[&_strong]:text-foreground [&_a]:text-sapphire dark:[&_a]:text-sky-signal hover:[&_a]:underline">{children}</div>
                {metrics && (
                  <dl className="mt-8 grid grid-cols-2 gap-4">
                    {metrics.map((m) => (
                      <div key={m.label} className="flex flex-col-reverse rounded-3xl bg-fog-white dark:bg-white/5 p-5">
                        <dt className="mt-1 text-[13px] text-pewter">{m.label}</dt>
                        <dd className="text-2xl md:text-3xl font-semibold tracking-tight text-obsidian dark:text-foreground">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              {visual && <div>{visual}</div>}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────────────── CTA band ───────────────────────── */

export function CtaBand({ title, text, primary, secondary, micro }: { title: string; text: string; primary: Action; secondary?: Action; micro?: string }) {
  return (
    <section className="pb-24 md:pb-32 pt-4 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0058b3] via-[#0071e3] to-[#2997ff] px-6 py-16 text-center text-white md:px-16 md:py-24">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#aad0f6]/20 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl md:text-[3.25rem] md:leading-[1.08] font-semibold tracking-[-0.03em] text-balance">{title}</h2>
            <p className="mx-auto mt-5 max-w-xl text-subheading text-white/85 text-balance">{text}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ActionButton action={primary} tone="blue" />
              {secondary && <ActionButton action={secondary} tone="blue" variant="secondary" />}
            </div>
            <p className="mt-6 text-[13px] text-white/75">{micro ?? "Respondemos al momento, 24/7."}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────────────────── Related services ───────────────────────── */

export function RelatedServices({ items, title = "Servicios relacionados" }: { items: { key: ServiceKey; why: string }[]; title?: string }) {
  return (
    <section className="pt-4 pb-20 md:pb-24 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="text-heading-sm font-semibold text-obsidian dark:text-foreground">{title}</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          {items.map(({ key, why }) => {
            const s = SERVICES.find((x) => x.key === key)!
            return (
              <li key={key}>
                <Link href={s.href} className="group flex h-full flex-col rounded-[28px] border border-pale-mist/70 bg-card p-7 transition-colors hover:border-sapphire/40">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-obsidian dark:text-foreground">{s.name}</h3>
                  <p className="mt-1.5 text-[15px] text-pewter">{why}</p>
                  <span className="mt-auto pt-6 inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                    Ver servicio <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ───────────────────────── Card grid ───────────────────────── */

export function CardGrid({ items, columns = 3 }: { items: { title: string; text: React.ReactNode; icon?: React.ReactNode }[]; columns?: 2 | 3 }) {
  return (
    <ul className={cn("grid gap-5", columns === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")}>
      {items.map((it) => (
        <li key={it.title} className="rounded-[28px] border border-pale-mist/70 bg-card p-7">
          {it.icon && <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">{it.icon}</span>}
          <h3 className="text-lg font-semibold text-obsidian dark:text-foreground">{it.title}</h3>
          <p className="mt-1.5 text-[15px] text-pewter">{it.text}</p>
        </li>
      ))}
    </ul>
  )
}
