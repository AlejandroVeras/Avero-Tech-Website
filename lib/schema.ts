// JSON-LD builders. The layout prints the organization graph once; pages reference it by @id.
import { CONTACT_EMAIL, ENTITY_DEFINITION, FOUNDED, FOUNDER, SITE_URL, WHATSAPP_E164 } from "@/lib/site"
import { PENDING } from "@/lib/business"
import { contentDate } from "@/lib/content-dates"

export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const PERSON_ID = `${SITE_URL}/nosotros#alejandro-veras`

const ALL_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const ALWAYS_OPEN = { "@type": "OpeningHoursSpecification", dayOfWeek: ALL_WEEK, opens: "00:00", closes: "23:59" }

export function organizationGraph() {
  const sameAs = PENDING.socialProfiles.length ? { sameAs: PENDING.socialProfiles } : {}
  const person: Record<string, unknown> = { "@type": "Person", "@id": PERSON_ID, name: FOUNDER, jobTitle: "Fundador", worksFor: { "@id": ORG_ID }, url: `${SITE_URL}/nosotros` }
  if (PENDING.founderPhotoUrl) person.image = PENDING.founderPhotoUrl
  if (PENDING.founderLinkedIn) person.sameAs = [PENDING.founderLinkedIn]
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": ORG_ID,
        name: "Avero Technology",
        url: SITE_URL,
        logo: `${SITE_URL}/LOGO.png`,
        image: `${SITE_URL}/LOGO.png`,
        description: ENTITY_DEFINITION,
        foundingDate: FOUNDED,
        founder: { "@id": PERSON_ID },
        email: CONTACT_EMAIL,
        telephone: WHATSAPP_E164,
        priceRange: "RD$",
        address: { "@type": "PostalAddress", addressLocality: "Santo Domingo", addressRegion: "Distrito Nacional", addressCountry: "DO" },
        areaServed: [
          { "@type": "City", name: "Santo Domingo" },
          { "@type": "Country", name: "República Dominicana" },
          { "@type": "Place", name: "Todo el mundo (servicios digitales remotos)" },
        ],
        openingHoursSpecification: ALWAYS_OPEN,
        contactPoint: { "@type": "ContactPoint", telephone: WHATSAPP_E164, email: CONTACT_EMAIL, contactType: "sales", availableLanguage: ["Spanish"], hoursAvailable: ALWAYS_OPEN },
        knowsAbout: ["Diseño de páginas web", "Desarrollo de portales web", "Posicionamiento SEO", "SEO local", "Optimización para respuestas de IA (LLMO/GEO)", "Inteligencia artificial para negocios", "Chatbots de WhatsApp", "WhatsApp Cloud API", "Next.js", "Supabase", "Soporte técnico"],
        ...sameAs,
      },
      { "@type": "WebSite", "@id": WEBSITE_ID, url: SITE_URL, name: "Avero Technology", inLanguage: "es-DO", publisher: { "@id": ORG_ID } },
      person,
    ],
  }
}

export type Crumb = { name: string; href: string }
export type Faq = { question: string; answer: string }

const abs = (href: string) => (href.startsWith("http") ? href : `${SITE_URL}${href === "/" ? "/" : href}`)

/** Page-level graph: WebPage + optional breadcrumbs, FAQ and extra nodes. */
export function pageGraph(opts: {
  path: string
  title: string
  description: string
  type?: string
  crumbs?: Crumb[]
  faq?: Faq[]
  nodes?: Record<string, unknown>[]
  author?: boolean
}) {
  const url = abs(opts.path)
  const graph: Record<string, unknown>[] = []
  const page: Record<string, unknown> = {
    "@type": opts.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: "es-DO",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    dateModified: contentDate(opts.path),
  }
  if (opts.author !== false) page.author = { "@id": PERSON_ID }
  if (opts.crumbs) page.breadcrumb = { "@id": `${url}#breadcrumb` }
  graph.push(page)
  if (opts.crumbs) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: opts.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.href) })),
    })
  }
  graph.push(...(opts.nodes ?? []))
  if (opts.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: opts.faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    })
  }
  return { "@context": "https://schema.org", "@graph": graph }
}

export function serviceNode(path: string, name: string, serviceType: string, description: string, opts: { local?: boolean; priceFrom?: number | null } = {}) {
  const url = abs(path)
  const node: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    serviceType,
    description,
    url,
    provider: { "@id": ORG_ID },
    areaServed: opts.local
      ? [{ "@type": "City", name: "Santo Domingo" }]
      : [{ "@type": "Country", name: "República Dominicana" }, { "@type": "Place", name: "Todo el mundo (remoto)" }],
  }
  // Offers only once the price is confirmed (lib/business.ts).
  if (opts.priceFrom) node.offers = { "@type": "Offer", priceCurrency: "DOP", price: String(opts.priceFrom), description: "Precio desde, según alcance." }
  return node
}
