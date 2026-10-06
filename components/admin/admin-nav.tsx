"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/negocios", label: "Negocios" },
  { href: "/admin/sistemas", label: "Sistemas" },
  { href: "/admin/ajustes", label: "Ajustes" },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Administración" className="flex gap-1 overflow-x-auto">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
