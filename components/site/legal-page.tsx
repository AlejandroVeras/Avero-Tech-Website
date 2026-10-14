import Link from "next/link"
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/site"

export type LegalSection = { title: string; body: React.ReactNode }

const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/garantia", label: "Garantía y devoluciones" },
]

/** Shared layout for the legal pages: title, last update, numbered sections and contact. */
export function LegalPage({ title, intro, updated, sections, current }: { title: string; intro: string; updated: string; sections: LegalSection[]; current: string }) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <p className="text-caption uppercase tracking-[0.16em] text-pewter">Avero Technology</p>
        <h1 className="mt-3 text-4xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground text-balance">{title}</h1>
        <p className="mt-4 text-body text-pewter">{intro}</p>
        <p className="mt-2 text-caption text-pewter">Última actualización: {updated}</p>

        <nav aria-label="Documentos legales" className="mt-8 flex flex-wrap gap-2">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.href === current ? "page" : undefined}
              className={
                l.href === current
                  ? "rounded-full bg-obsidian px-4 py-1.5 text-[13px] text-white dark:bg-white dark:text-obsidian"
                  : "rounded-full border border-pale-mist px-4 py-1.5 text-[13px] text-obsidian hover:border-sapphire/40 dark:text-foreground"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <ol className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <li key={s.title}>
              <h2 className="text-lg font-semibold text-obsidian dark:text-foreground">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-obsidian/85 dark:text-foreground/85 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-sapphire [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-sky-signal">
                {s.body}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-3xl border border-pale-mist/70 bg-card p-6 text-[15px] text-obsidian/85 dark:text-foreground/85">
          ¿Preguntas sobre este documento? Escríbenos a{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sapphire underline underline-offset-4 dark:text-sky-signal">{CONTACT_EMAIL}</a> o por WhatsApp al{" "}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="text-sapphire underline underline-offset-4 dark:text-sky-signal">{WHATSAPP_DISPLAY}</a>.
        </div>
      </div>
    </section>
  )
}
