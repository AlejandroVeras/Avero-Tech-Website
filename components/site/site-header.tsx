"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Menu, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/site/logo"
import { CartSheet } from "@/components/site/cart-sheet"
import { MegaMenuMobile, MegaMenuPanel } from "@/components/site/mega-menu"
import { NAV_LINKS, appUrl, whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

const QUOTE_URL = whatsappUrl("Hola Avero Technology, quiero cotizar.")

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  // Menus belong to the page they were opened on, so navigating closes them without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const [megaOn, setMegaOn] = useState<string | null>(null)
  const [servicesOpenMobile, setServicesOpenMobile] = useState(false)
  const menuOpen = openOn === pathname
  const megaOpen = megaOn === pathname
  const panelId = "mega-menu-servicios"
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const openMega = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setMegaOn(pathname)
  }
  const closeMegaSoon = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setMegaOn(null), 120)
  }
  const closeAll = () => {
    setMegaOn(null)
    setOpenOn(null)
  }

  useEffect(() => {
    if (!megaOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOn(null)
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMegaOn(null)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onClick)
    }
  }, [megaOpen])

  const systemHref = appUrl(isLoggedIn ? "/dashboard" : "/login")
  const systemLabel = isLoggedIn ? "Ir al sistema" : "Entrar al sistema"

  return (
    <header ref={wrapRef} className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Avero Technology, inicio" className="shrink-0" onClick={closeAll}>
          <Logo className="h-8" />
        </Link>

        <nav aria-label="Principal" className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            const cls = cn(
              "px-3 py-2 text-caption transition-colors",
              active || (link.href === "/servicios" && megaOpen)
                ? "text-obsidian dark:text-foreground font-semibold"
                : "text-obsidian/70 dark:text-foreground/70 hover:text-obsidian dark:hover:text-foreground",
            )
            if (link.href === "/servicios") {
              return (
                <div key={link.href} onMouseEnter={openMega} onMouseLeave={closeMegaSoon} className="flex items-center">
                  <Link href={link.href} aria-current={active ? "page" : undefined} className={cn(cls, "pr-1")} onClick={() => setMegaOn(null)}>
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    aria-label="Ver servicios"
                    aria-expanded={megaOpen}
                    aria-controls={panelId}
                    onClick={() => (megaOpen ? setMegaOn(null) : openMega())}
                    className="flex h-8 w-7 items-center justify-center rounded-full text-obsidian/60 dark:text-foreground/60 hover:text-obsidian dark:hover:text-foreground"
                  >
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", megaOpen && "rotate-180")} aria-hidden />
                  </button>
                </div>
              )
            }
            return (
              <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cls}>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <CartSheet />
          <Link href={systemHref} className="hidden lg:block px-3 py-2 text-caption text-obsidian/70 dark:text-foreground/70 hover:text-obsidian dark:hover:text-foreground">
            {systemLabel}
          </Link>
          <Button asChild size="sm" className="hidden sm:flex rounded-full">
            <a href={QUOTE_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Cotizar
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {megaOpen && (
        <div className="hidden lg:block" onMouseEnter={openMega} onMouseLeave={closeMegaSoon}>
          <MegaMenuPanel id={panelId} onNavigate={() => setMegaOn(null)} />
        </div>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Principal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-background/95 backdrop-blur-xl max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
          >
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href)
                if (link.href === "/servicios") {
                  return (
                    <div key={link.href}>
                      <button
                        type="button"
                        aria-expanded={servicesOpenMobile}
                        onClick={() => setServicesOpenMobile((o) => !o)}
                        className={cn("flex w-full items-center justify-between px-3 py-2.5 text-body rounded-full hover:bg-muted", active && "font-semibold bg-muted")}
                      >
                        {link.label}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", servicesOpenMobile && "rotate-180")} aria-hidden />
                      </button>
                      {servicesOpenMobile && <MegaMenuMobile onNavigate={closeAll} />}
                    </div>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("block w-full px-3 py-2.5 text-body rounded-full hover:bg-muted", active && "font-semibold bg-muted")}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <a href={QUOTE_URL} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-3 py-3 text-body text-primary-foreground">
                <MessageCircle className="h-4 w-4" aria-hidden /> Cotizar por WhatsApp
              </a>
              <Link href={systemHref} className="block w-full px-3 py-2.5 text-body text-sapphire dark:text-sky-signal rounded-full hover:bg-muted">
                {systemLabel}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
