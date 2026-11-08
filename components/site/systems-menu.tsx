"use client"

import { ArrowUpRight, Building2, CalendarCheck, ChevronDown, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CITAS_URL, CONDOMINIOS_URL, SITE_URL, appUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

/** The three systems customers sign in to. Inventario shares the site's session; Citas and Condominios have their own. */
export function systemLogins(isLoggedIn: boolean) {
  return [
    { name: "Avero Inventario", line: isLoggedIn ? "Ir a tu panel" : "Inventario, ventas y facturas", href: appUrl(isLoggedIn ? "/dashboard" : "/login"), icon: Package },
    { name: "Avero Citas", line: "Agenda, reservas y comisiones", href: `${CITAS_URL}/entrar`, icon: CalendarCheck },
    { name: "Avero Condominios", line: "Cuotas, pagos y estados de cuenta", href: `${CONDOMINIOS_URL}/entrar`, icon: Building2 },
  ]
}

/** "Entrar" dropdown in the header with a link to each system's login. */
export function SystemsMenu({ isLoggedIn, className }: { isLoggedIn: boolean; className?: string }) {
  const systems = systemLogins(isLoggedIn)
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex h-8 items-center gap-1 rounded-full px-3 text-caption text-obsidian/70 outline-none transition-colors hover:text-obsidian focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-obsidian dark:text-foreground/70 dark:hover:text-foreground dark:data-[state=open]:text-foreground",
          className,
        )}
      >
        Entrar
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-[19rem] rounded-2xl border-pale-mist/70 p-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)]">
        <DropdownMenuLabel className="px-2 pb-1.5 pt-1 text-caption font-normal uppercase tracking-[0.14em] text-pewter">Entrar a tu sistema</DropdownMenuLabel>
        {systems.map((s) => (
          <DropdownMenuItem key={s.name} asChild className="cursor-pointer rounded-xl p-2 focus:bg-fog-white dark:focus:bg-white/5">
            <a href={s.href} className="group/item flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sapphire dark:bg-sky-signal/15 dark:text-sky-signal">
                <s.icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-obsidian dark:text-foreground">{s.name}</span>
                <span className="block text-[12px] text-pewter">{s.line}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-pewter opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100" aria-hidden />
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1.5" />
        <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-2 py-1.5 text-[13px] text-sapphire focus:bg-fog-white dark:text-sky-signal dark:focus:bg-white/5">
          <a href={`${SITE_URL}/sistemas`}>¿Aún no tienes cuenta? Prueba gratis</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
