import { Laptop, LayoutDashboard, MessageCircle, Monitor, Search, Sparkles, Wrench, type LucideProps } from "lucide-react"

const ICONS = { monitor: Monitor, layout: LayoutDashboard, search: Search, message: MessageCircle, sparkles: Sparkles, wrench: Wrench, laptop: Laptop }

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Sparkles
  return <Icon aria-hidden {...props} />
}
