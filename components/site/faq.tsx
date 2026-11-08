import Link from "next/link"
import { ChevronDown } from "lucide-react"

export interface FaqEntry {
  question: string
  answer: string
  /** Optional link to the page that develops the answer. */
  link?: { href: string; label: string }
}

// Native <details>: the answer is always in the HTML, so Google and AI crawlers can read it even while closed.
function FaqItem({ question, answer, link }: FaqEntry) {
  return (
    <details className="group border-b border-border last:border-0">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between py-5 text-left [&::-webkit-details-marker]:hidden">
        <span className="pr-4 font-medium text-obsidian dark:text-foreground group-hover:text-sapphire dark:group-hover:text-sky-signal transition-colors">
          {question}
        </span>
        <ChevronDown
          aria-hidden
          className="h-5 w-5 shrink-0 text-pewter transition-transform group-open:rotate-180 group-open:text-sapphire dark:group-open:text-sky-signal"
        />
      </summary>
      <p className="pb-5 text-pewter text-[15px] leading-relaxed">
        {answer}
        {link && (
          <>
            {" "}
            <Link href={link.href} className="text-sapphire dark:text-sky-signal hover:underline underline-offset-4">{link.label}</Link>
          </>
        )}
      </p>
    </details>
  )
}

export function Faq({ entries }: { entries: FaqEntry[] }) {
  return (
    <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-pale-mist/70 px-6 py-2">
      {entries.map((e) => (
        <FaqItem key={e.question} {...e} />
      ))}
    </div>
  )
}
