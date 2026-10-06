import {
  BarChart3,
  CreditCard,
  FileText,
  Package,
  Receipt,
  Sparkles,
  Store,
  Ticket,
  Users,
  CalendarDays,
  Wrench,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  package: Package,
  "credit-card": CreditCard,
  "file-text": FileText,
  store: Store,
  receipt: Receipt,
  "bar-chart": BarChart3,
  users: Users,
  ticket: Ticket,
  calendar: CalendarDays,
  wrench: Wrench,
  "shopping-bag": ShoppingBag,
}

export const SYSTEM_ICON_NAMES = Object.keys(ICONS)

export function SystemIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles
  return <Icon className={className} aria-hidden />
}
