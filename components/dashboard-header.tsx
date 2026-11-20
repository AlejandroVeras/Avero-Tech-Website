"use client"

import { useEffect, useState } from "react"
import { OPEN_MENU_EVENT } from "@/components/mobile-tab-bar"
import { UserIcon, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import Link from "next/link"
import { Logo } from "@/components/site/logo"
import { ThemeToggle } from "./theme-toggle"
import { dashboardNavigation, ALL_FEATURES } from "@/components/dashboard-nav"
import { DashboardNavList } from "@/components/dashboard-nav-list"
import type { Features } from "@/lib/business-setup"

interface DashboardHeaderProps {
  user: User
  isAdmin?: boolean
  isStoreOwner?: boolean
  features?: Features
}

export function DashboardHeader({ user, isAdmin = false, isStoreOwner = false, features = ALL_FEATURES }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const open = () => setMenuOpen(true)
    window.addEventListener(OPEN_MENU_EVENT, open)
    return () => window.removeEventListener(OPEN_MENU_EVENT, open)
  }, [])
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  const navigation = dashboardNavigation(features, { isAdmin, isStoreOwner })

  return (
    <header className="print:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40 w-full">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navegación Móvil</SheetTitle>
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <Link href="/dashboard" aria-label="Avero Tech, dashboard" className="flex items-center">
                  <Logo className="h-8" />
                </Link>
              </div>
              <div className="overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 4rem)" }}>
                <DashboardNavList groups={navigation} onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <span className="font-bold text-lg">AVERO</span>
          </Link>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Global Search / Context could go here in the middle for desktop */}
        <div className="hidden md:flex flex-1" />

        <div className="flex items-center gap-3">
          <ThemeToggle />


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50" aria-label="Menú de la cuenta">
                <UserIcon className="h-5 w-5 text-secondary-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm leading-none">{user.businessName}</p>
                  <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
