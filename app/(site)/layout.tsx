import { getUser } from "@/lib/auth"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader isLoggedIn={isLoggedIn} />
      <main className="flex-1">{children}</main>
      <SiteFooter isLoggedIn={isLoggedIn} />
    </div>
  )
}
