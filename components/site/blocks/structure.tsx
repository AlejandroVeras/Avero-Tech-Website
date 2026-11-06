import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Crumb } from "@/lib/schema"

/** Prints a JSON-LD object. Content comes from our own builders, never from user input. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}

/** Visible breadcrumbs; the matching BreadcrumbList goes in the page graph (lib/schema.ts). */
export function Breadcrumbs({ crumbs, inverted = false, className }: { crumbs: Crumb[]; inverted?: boolean; className?: string }) {
  return (
    <nav aria-label="Ruta de navegación" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-caption">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={inverted ? "text-white/80" : "text-obsidian/80 dark:text-foreground/80"}>
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.href} className={cn("transition-colors", inverted ? "text-white/50 hover:text-white" : "text-pewter hover:text-obsidian dark:hover:text-foreground")}>
                    {c.name}
                  </Link>
                  <ChevronRight aria-hidden className={cn("h-3 w-3", inverted ? "text-white/30" : "text-pewter/60")} />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
