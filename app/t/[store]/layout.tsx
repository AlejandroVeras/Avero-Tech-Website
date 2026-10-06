import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { MessageCircle, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { getStoreBySlug } from "@/lib/data/public-catalog"
import { whatsappUrl } from "@/lib/site"

export default async function TenantStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ store: string }>
}) {
  const { store: slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-pale-mist/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href={`/t/${store.slug}`} className="flex items-center gap-3 min-w-0">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover bg-fog-white shrink-0"
              />
            ) : (
              <span className="h-10 w-10 rounded-full bg-fog-white dark:bg-white/10 flex items-center justify-center shrink-0">
                <Store className="h-5 w-5 text-pewter" aria-hidden />
              </span>
            )}
            <span className="font-semibold text-obsidian dark:text-foreground truncate">{store.name}</span>
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            {store.whatsapp && (
              <Button size="sm" className="rounded-full" asChild>
                <a href={whatsappUrl(`Hola ${store.name}, vi su catálogo en línea.`, store.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={`Escribir a ${store.name} por WhatsApp`}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 border-t border-pale-mist/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-pewter">
          <p>
            &copy; {new Date().getFullYear()} {store.name}
          </p>
          <Link href="/sistemas/gestion" className="hover:text-obsidian dark:hover:text-foreground">
            Catálogo hecho con <span className="font-semibold">Avero</span> — crea el tuyo
          </Link>
        </div>
      </footer>
    </div>
  )
}
