// Renders a long-form content page (services, about, pricing…) from data, so every page shares one design.
import type { Metadata } from "next"
import Link from "next/link"
import { Faq } from "@/components/site/faq"
import { JsonLd } from "@/components/site/blocks/structure"
import { ArrowLink, CheckList, H2, Prose, Section, type Action } from "@/components/site/blocks/primitives"
import { AnswerBlock, CardGrid, CaseBlock, CompareTable, CtaBand, PricingTiers, ProcessSteps, RelatedServices, ServiceHero, type Metric, type RelatedItem, type Step, type Tier } from "@/components/site/blocks/sections"
import { Reveal } from "@/components/site/blocks/reveal"
import { pageGraph, type Crumb, type Faq as FaqItem } from "@/lib/schema"

/* ───────────── Rich text: [label](url) links and **bold** inside plain strings ───────────── */

export function rich(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const [, label, href] = link
      return href.startsWith("http") || href.startsWith("mailto:") ? (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
      ) : (
        <Link key={i} href={href}>{label}</Link>
      )
    }
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>
    return p
  })
}
const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "")

/* ───────────── Spec types ───────────── */

export type Inner =
  | { k: "prose"; text: string[] }
  | { k: "table"; headers: string[]; rows: string[][]; highlight?: number; caption: string }
  | { k: "cards"; items: { title: string; text: string; icon?: React.ReactNode }[]; columns?: 2 | 3 }
  | { k: "steps"; steps: Step[] }
  | { k: "check"; items: string[] }
  | { k: "pricing"; tiers: Tier[]; cta: Action; note?: string }
  | { k: "node"; node: React.ReactNode }
  | { k: "link"; href: string; label: string }

export type Block =
  | { k: "section"; tone?: "default" | "fog" | "ice" | "dark"; id?: string; q?: string; a?: string; title?: string; items?: Inner[]; narrow?: boolean }
  | { k: "case"; id?: string; eyebrow?: string; title: string; text: string[]; check?: string[]; metrics?: Metric[]; visual?: React.ReactNode }
  | { k: "faq"; title: string; after?: { href: string; label: string } }
  | { k: "cta"; title: string; text: string; primary: Action; secondary?: Action; micro?: string }
  | { k: "related"; items: RelatedItem[]; title?: string }
  | { k: "node"; node: React.ReactNode }

export type PageSpec = {
  path: string
  /** Title without the " | Avero Technology" suffix, unless absolute. */
  title: string
  titleAbsolute?: boolean
  description: string
  pageType?: string
  crumbs: Crumb[]
  hero: {
    eyebrow?: string
    h1: string
    intro: string
    primary: Action
    secondary?: Action
    micro?: string
    visual?: React.ReactNode
    dark?: boolean
  }
  blocks: Block[]
  faq?: FaqItem[]
  schemaNodes?: Record<string, unknown>[]
}

export function contentMetadata(spec: Pick<PageSpec, "path" | "title" | "titleAbsolute" | "description">): Metadata {
  const full = spec.titleAbsolute ? spec.title : `${spec.title} | Avero Technology`
  return {
    title: spec.titleAbsolute ? { absolute: spec.title } : spec.title,
    description: spec.description,
    alternates: { canonical: spec.path },
    openGraph: { title: full, description: spec.description, url: spec.path },
  }
}

/* ───────────── Renderers ───────────── */

function renderInner(it: Inner, i: number, inverted: boolean) {
  switch (it.k) {
    case "prose":
      return (
        <Prose key={i} inverted={inverted} className="max-w-3xl">
          {it.text.map((t, j) => <p key={j}>{rich(t)}</p>)}
        </Prose>
      )
    case "table":
      return <CompareTable key={i} caption={it.caption} headers={it.headers} rows={it.rows.map((r) => r.map(rich))} highlight={it.highlight} />
    case "cards":
      return <CardGrid key={i} columns={it.columns} items={it.items.map((c) => ({ ...c, text: rich(c.text) }))} />
    case "steps":
      return <ProcessSteps key={i} className="max-w-4xl" steps={it.steps} />
    case "check":
      return <CheckList key={i} inverted={inverted} className="max-w-3xl" items={it.items.map(rich)} />
    case "pricing":
      return <PricingTiers key={i} tiers={it.tiers} cta={it.cta} note={it.note} />
    case "node":
      return <div key={i}>{it.node}</div>
    case "link":
      return <ArrowLink key={i} href={it.href}>{it.label}</ArrowLink>
  }
}

function SectionBlock({ b }: { b: Extract<Block, { k: "section" }> }) {
  const inverted = b.tone === "dark"
  const inner = <div className="space-y-8">{(b.items ?? []).map((it, i) => renderInner(it, i, inverted))}</div>
  return (
    <Section tone={b.tone} id={b.id} narrow={b.narrow}>
      {b.q ? (
        <AnswerBlock question={b.q} answer={b.a ? rich(b.a) : undefined} inverted={inverted}>
          {b.items?.length ? inner : null}
        </AnswerBlock>
      ) : (
        <Reveal>
          {b.title && <H2 inverted={inverted}>{b.title}</H2>}
          <div className={b.title ? "mt-10" : ""}>{inner}</div>
        </Reveal>
      )}
    </Section>
  )
}

export function ContentPage({ spec }: { spec: PageSpec }) {
  const fullTitle = spec.titleAbsolute ? spec.title : `${spec.title} | Avero Technology`
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: spec.path,
          title: fullTitle,
          description: spec.description,
          type: spec.pageType,
          crumbs: spec.crumbs,
          faq: spec.faq?.map((f) => ({ question: f.question, answer: plain(f.answer) })),
          nodes: spec.schemaNodes,
        })}
      />
      <ServiceHero crumbs={spec.crumbs} path={spec.path} {...spec.hero} title={spec.hero.h1} />
      {spec.blocks.map((b, i) => {
        switch (b.k) {
          case "section":
            return <SectionBlock key={i} b={b} />
          case "case":
            return (
              <CaseBlock key={i} id={b.id} eyebrow={b.eyebrow} title={b.title} metrics={b.metrics} visual={b.visual}>
                {b.text.map((t, j) => <p key={j}>{rich(t)}</p>)}
                {b.check && <CheckList items={b.check.map(rich)} />}
              </CaseBlock>
            )
          case "faq":
            return (
              <Section key={i} narrow id="preguntas">
                <Reveal>
                  <H2 className="text-center">{b.title}</H2>
                  <div className="mt-10">
                    <Faq entries={(spec.faq ?? []).map((f) => ({ question: f.question, answer: plain(f.answer) }))} />
                  </div>
                  {b.after && (
                    <p className="mt-8 text-center">
                      <ArrowLink href={b.after.href}>{b.after.label}</ArrowLink>
                    </p>
                  )}
                </Reveal>
              </Section>
            )
          case "cta":
            return <CtaBand key={i} {...b} />
          case "related":
            return <RelatedServices key={i} items={b.items} title={b.title} />
          case "node":
            return <div key={i}>{b.node}</div>
        }
      })}
    </>
  )
}
