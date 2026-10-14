import { getUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { CONTACT_EMAIL, SITE_URL, WHATSAPP_NUMBER } from "@/lib/site"

// Lets Google show the business (name, phone, area served) in local results and Maps.
const BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ComputerStore",
  name: "Avero Technology",
  url: SITE_URL,
  logo: `${SITE_URL}/LOGO.png`,
  image: `${SITE_URL}/LOGO.png`,
  email: CONTACT_EMAIL,
  telephone: `+${WHATSAPP_NUMBER}`,
  address: { "@type": "PostalAddress", addressLocality: "Santo Domingo", addressCountry: "DO" },
  areaServed: { "@type": "Country", name: "República Dominicana" },
  priceRange: "RD$",
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BUSINESS_JSON_LD) }} />
      <SiteHeader isLoggedIn={isLoggedIn} />
      <main id="contenido" className="flex-1">{children}</main>
      <SiteFooter isLoggedIn={isLoggedIn} />
    </div>
  )
}
