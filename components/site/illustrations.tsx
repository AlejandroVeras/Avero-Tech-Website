// Illustrations built in code (no stock photos): they scale cleanly, weigh almost nothing and follow dark mode.
// Text inside is generic ("Tu negocio") or taken verbatim from docs/whatsapp-sim/resultados.md.
import { BadgeCheck, Bot, CheckCheck, Database, MapPin, MessageCircle, Search, ShoppingBag, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

function Window({ children, className, url = "tunegocio.com" }: { children: React.ReactNode; className?: string; url?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[22px] border border-pale-mist/80 bg-card shadow-[0_30px_60px_-30px_rgba(0,40,90,0.35)]", className)}>
      <div className="flex items-center gap-2 border-b border-pale-mist/70 bg-fog-white/80 dark:bg-white/[0.04] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto rounded-full bg-card px-3 py-0.5 text-[11px] text-pewter">{url}</span>
      </div>
      {children}
    </div>
  )
}

/** A small business site with a catalog and WhatsApp buttons, plus a phone with the chat it opens. */
export function WebsiteMockup() {
  const items = [
    { name: "Laptop 14 pulgadas", price: "RD$ 32,900" },
    { name: "Audífonos inalámbricos", price: "RD$ 2,450" },
    { name: "Monitor 24 pulgadas", price: "RD$ 9,800" },
  ]
  return (
    <div aria-hidden className="relative mx-auto max-w-[520px] pb-10">
      <Window>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-obsidian dark:text-foreground">Tu negocio</span>
            <span className="flex gap-3 text-[11px] text-pewter"><span>Catálogo</span><span>Nosotros</span><span>Contacto</span></span>
          </div>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-ice-wash/50 to-card dark:from-sky-signal/15 dark:to-card p-5">
            <p className="text-[18px] font-semibold leading-tight text-obsidian dark:text-foreground">Lo que vendes, con precio y entrega</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] text-primary-foreground">
              <MessageCircle className="h-3 w-3" /> Pedir por WhatsApp
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {items.map((it) => (
              <div key={it.name} className="rounded-xl border border-pale-mist/70 p-2.5">
                <div className="flex h-12 items-center justify-center rounded-lg bg-fog-white dark:bg-white/5 text-pewter"><ShoppingBag className="h-4 w-4" /></div>
                <p className="mt-2 truncate text-[10px] text-obsidian dark:text-foreground">{it.name}</p>
                <p className="text-[10px] font-semibold text-sapphire dark:text-sky-signal">{it.price}</p>
              </div>
            ))}
          </div>
        </div>
      </Window>
      <div className="absolute -bottom-2 right-0 w-[46%] sm:-right-6">
        <ChatBubbles compact />
      </div>
    </div>
  )
}

const SIM = [
  { from: "client", text: "Hola, me interesa: MacBook Air M2 13\" 256 GB" },
  { from: "bot", text: "¡Buenas! Sí, la tenemos disponible, nueva y sellada, en RD$69,900. ¿La quiere para trabajo, estudios o algo más pesado como edición?" },
  { from: "client", text: "me la deja en 60 mil?" },
  { from: "bot", text: "Le entiendo, pero el precio autorizado es RD$69,900 y no puedo cambiarlo desde aquí. Si gusta, puedo pasarle con alguien del equipo." },
] as const

/** WhatsApp-style conversation. Lines are verbatim from the assistant simulation (2 nov 2026). */
export function ChatBubbles({ compact = false, className }: { compact?: boolean; className?: string }) {
  const lines = compact ? SIM.slice(0, 2) : SIM
  return (
    <div aria-hidden className={cn("overflow-hidden rounded-[26px] border border-pale-mist/80 bg-[#efeae2] dark:bg-[#0b141a] shadow-[0_30px_60px_-30px_rgba(0,40,90,0.4)]", className)}>
      <div className="flex items-center gap-2.5 bg-[#075e54] dark:bg-[#1f2c34] px-4 py-3 text-white">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20"><Bot className="h-3.5 w-3.5" /></span>
        <div className="leading-tight">
          <p className="text-[12px] font-semibold">Avero Technology</p>
          <p className="text-[10px] text-white/70">en línea</p>
        </div>
      </div>
      <div className={cn("space-y-2 p-3", compact ? "text-[10.5px]" : "text-[12.5px]")}>
        {lines.map((l, i) => (
          <div key={i} className={cn("flex", l.from === "client" ? "justify-end" : "justify-start")}>
            <p className={cn("max-w-[85%] rounded-xl px-3 py-2 leading-snug text-[#111b21] dark:text-[#e9edef] shadow-sm", l.from === "client" ? "rounded-tr-sm bg-[#d9fdd3] dark:bg-[#005c4b]" : "rounded-tl-sm bg-white dark:bg-[#1f2c34]")}>
              {l.text}
              {l.from === "client" && <CheckCheck className="ml-1 inline h-3 w-3 text-[#53bdeb]" />}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Google-style result with a local pack and an AI answer that names the business. */
export function SearchMockup() {
  return (
    <div aria-hidden className="mx-auto max-w-[520px]">
      <Window url="google.com">
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-full border border-pale-mist/80 px-4 py-2 text-[12px] text-obsidian dark:text-foreground">
            <Search className="h-3.5 w-3.5 text-pewter" /> diseño de páginas web en Santo Domingo
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-ice-wash/40 to-card dark:from-sky-signal/10 dark:to-card p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sapphire dark:text-sky-signal"><Sparkles className="h-3.5 w-3.5" /> Resumen con IA</p>
            <p className="mt-2 text-[12px] leading-snug text-obsidian/85 dark:text-foreground/85">
              <span className="rounded bg-ice-wash/60 dark:bg-sky-signal/20 px-1 font-medium">Tu negocio</span> diseña páginas web para pymes en Santo Domingo, con precio cerrado y catálogo con WhatsApp…
            </p>
          </div>
          <div className="rounded-2xl border border-pale-mist/70 p-3">
            <div className="flex h-16 items-center justify-center rounded-xl bg-fog-white dark:bg-white/5 text-pewter"><MapPin className="h-5 w-5 text-[#ea4335]" /></div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-obsidian dark:text-foreground">Tu negocio</p>
                <p className="text-[11px] text-pewter">Diseñador de sitios web · Abierto 24 horas</p>
              </div>
              <span className="rounded-full border border-pale-mist/80 px-2.5 py-1 text-[10px] text-sapphire dark:text-sky-signal">Sitio web</span>
            </div>
          </div>
        </div>
      </Window>
    </div>
  )
}

/** How the WhatsApp assistant works: message → server rules → AI → catalog → confirmed order. */
export function AssistantFlow() {
  const steps = [
    { icon: User, title: "El cliente escribe", text: "Texto, nota de voz o foto" },
    { icon: Bot, title: "La IA entiende", text: "Y decide qué consultar" },
    { icon: Database, title: "Lee tu catálogo", text: "Precio y stock reales" },
    { icon: BadgeCheck, title: "Pedido confirmado", text: "Te llega listo para entregar" },
  ]
  return (
    <ol aria-label="Cómo funciona el asistente" className="grid gap-3 sm:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="relative rounded-3xl border border-pale-mist/70 bg-card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal"><s.icon className="h-5 w-5" aria-hidden /></span>
          <p className="mt-4 text-[15px] font-semibold text-obsidian dark:text-foreground">{s.title}</p>
          <p className="mt-1 text-[13px] text-pewter">{s.text}</p>
          <span aria-hidden className="absolute right-4 top-4 text-3xl font-semibold text-obsidian/[0.06] dark:text-white/[0.07]">{i + 1}</span>
        </li>
      ))}
    </ol>
  )
}
