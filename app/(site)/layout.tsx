import { getUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

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
      <SiteHeader isLoggedIn={isLoggedIn} />
      <main id="contenido" className="flex-1">{children}</main>
      <SiteFooter isLoggedIn={isLoggedIn} />
    </div>
  )
}
