"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { isActiveLink, type NavGroup } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"

/** The grouped menu, shared by the desktop sidebar and the mobile sheet. */
export function DashboardNavList({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Menú del sistema" className="space-y-5">
      {groups.map((group) => (
        <div key={group.label || "main"} className="space-y-0.5">
          {group.label && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
          )}
          {group.items.map((item) => {
            const active = isActiveLink(pathname, item.href)
            const external = item.href.startsWith("http")
            return (
              <Link
                key={item.href + item.name}
                href={item.href}
                onClick={onNavigate}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} aria-hidden />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
