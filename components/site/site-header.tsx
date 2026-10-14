"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/site/logo"
import { CartSheet } from "@/components/site/cart-sheet"
import { NAV_LINKS, appUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" aria-label="Avero Tech, inicio" className="shrink-0">
          <Logo className="h-8" />
        </Link>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "px-3 py-2 text-caption transition-colors",
                  active
                    ? "text-obsidian dark:text-foreground font-semibold"
                    : "text-obsidian/70 dark:text-foreground/70 hover:text-obsidian dark:hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <CartSheet />
          <Button asChild size="sm" className="hidden sm:flex rounded-full">
            <Link href={appUrl(isLoggedIn ? "/dashboard" : "/login")}>{isLoggedIn ? "Ir al sistema" : "Entrar al sistema"}</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Principal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block w-full px-3 py-2.5 text-body rounded-full hover:bg-muted",
                      active && "font-semibold bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href={appUrl(isLoggedIn ? "/dashboard" : "/login")}
                className="block w-full px-3 py-2.5 text-body text-sapphire dark:text-sky-signal rounded-full hover:bg-muted"
              >
                {isLoggedIn ? "Ir al sistema" : "Entrar al sistema"}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
