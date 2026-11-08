// Illustrations built in code (no stock photos): they scale cleanly, weigh almost nothing and follow dark mode.
// Text inside is generic ("Tu negocio") or taken verbatim from docs/whatsapp-sim/resultados.md.
import { BadgeCheck, Bot, CheckCheck, Database, FileText, Laptop, MonitorCheck, Wifi, MapPin, MessageCircle, Search, ShoppingBag, Sparkles, User } from "lucide-react"
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

/** A client portal: the signed-in customer sees only their own invoices and balance. */
export function PortalMockup() {
  const rows = [
    { doc: "Factura 0142", date: "3 nov", amount: "RD$ 18,400", state: "Pendiente" },
    { doc: "Factura 0131", date: "21 oct", amount: "RD$ 9,950", state: "Pagada" },
    { doc: "Pedido 0388", date: "18 oct", amount: "RD$ 24,300", state: "Entregado" },
  ]
  return (
    <div aria-hidden className="mx-auto max-w-[520px]">
      <Window url="portal.tuempresa.com" className="border-white/10">
        <div className="grid grid-cols-[112px_1fr]">
          <div className="space-y-2 border-r border-pale-mist/70 bg-fog-white/60 dark:bg-white/[0.03] p-3 text-[10.5px] text-pewter">
            <p className="font-semibold text-obsidian dark:text-foreground">Mi cuenta</p>
            {["Resumen", "Facturas", "Pedidos", "Documentos", "Soporte"].map((x, i) => (
              <p key={x} className={cn("rounded-lg px-2 py-1", i === 1 && "bg-card text-sapphire dark:text-sky-signal")}>{x}</p>
            ))}
          </div>
          <div className="p-4">
            <p className="text-[11px] text-pewter">Hola, Distribuidora del Este</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-fog-white dark:bg-white/5 p-3">
                <p className="text-[10px] text-pewter">Saldo pendiente</p>
                <p className="text-[15px] font-semibold text-obsidian dark:text-foreground">RD$ 18,400</p>
              </div>
              <div className="rounded-xl bg-ice-wash/40 dark:bg-sky-signal/15 p-3">
                <p className="text-[10px] text-pewter">Pedidos este mes</p>
                <p className="text-[15px] font-semibold text-sapphire dark:text-sky-signal">7</p>
              </div>
            </div>
            <div className="mt-3 divide-y divide-pale-mist/70 rounded-xl border border-pale-mist/70">
              {rows.map((r) => (
                <div key={r.doc} className="flex items-center justify-between px-3 py-2 text-[10.5px]">
                  <span className="text-obsidian dark:text-foreground">{r.doc}<span className="ml-2 text-pewter">{r.date}</span></span>
                  <span className="flex items-center gap-2">
                    <span className="text-obsidian dark:text-foreground">{r.amount}</span>
                    <span className={cn("rounded-full px-2 py-0.5", r.state === "Pendiente" ? "bg-[#fff4e5] text-[#8a4600] dark:bg-[#b35c00]/20 dark:text-[#ffb766]" : "bg-[#e8f7ee] text-[#14653a] dark:bg-[#1a7f45]/20 dark:text-[#6fd39b]")}>{r.state}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Window>
    </div>
  )
}

/** Automation: a transfer receipt arrives, the AI extracts the fields and a person approves. Generic sample data. */
export function AutomationMockup() {
  const fields = [
    ["Banco", "Banco Popular"],
    ["Monto", "RD$ 4,500.00"],
    ["Fecha", "4 nov 2026"],
    ["Referencia", "0058-2231"],
    ["Apartamento", "B-302"],
  ]
  return (
    <div aria-hidden className="relative mx-auto max-w-[500px] space-y-3">
      <div className="flex items-center gap-3 rounded-[22px] border border-pale-mist/80 bg-card p-4 shadow-[0_20px_40px_-28px_rgba(0,40,90,0.35)]">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fog-white dark:bg-white/5 text-pewter"><FileText className="h-5 w-5" /></span>
        <div className="text-[12px]">
          <p className="font-semibold text-obsidian dark:text-foreground">comprobante-transferencia.jpg</p>
          <p className="text-pewter">Recibido por WhatsApp · hace 1 min</p>
        </div>
      </div>
      <div className="ml-6 rounded-[22px] border border-pale-mist/80 bg-card p-4 shadow-[0_30px_60px_-30px_rgba(0,40,90,0.35)]">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sapphire dark:text-sky-signal"><Sparkles className="h-3.5 w-3.5" /> Datos leídos por la IA</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
          {fields.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-fog-white dark:bg-white/5 px-3 py-2">
              <dt className="text-pewter">{k}</dt>
              <dd className="font-medium text-obsidian dark:text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[11px] text-pewter">Una persona revisa antes de registrar</span>
          <span className="flex gap-2">
            <span className="rounded-full border border-pale-mist/80 px-3 py-1 text-[11px] text-pewter">Corregir</span>
            <span className="rounded-full bg-primary px-3 py-1 text-[11px] text-primary-foreground">Aprobar</span>
          </span>
        </div>
      </div>
      <div className="ml-12 flex items-center gap-2 rounded-full bg-[#e8f7ee] dark:bg-[#1a7f45]/20 px-4 py-2 text-[12px] text-[#1a7f45] dark:text-[#6fd39b] w-fit">
        <BadgeCheck className="h-4 w-4" /> Pago registrado y recibo enviado por WhatsApp
      </div>
    </div>
  )
}

/** A support request moving from WhatsApp to a remote fix, with the report the client receives. Generic sample. */
export function SupportMockup() {
  const steps = [
    { icon: MessageCircle, title: "Mensaje recibido", text: "«La laptop de recepción no conecta al Wi-Fi»", time: "9:02" },
    { icon: MonitorCheck, title: "Diagnóstico remoto", text: "Conexión autorizada por el cliente", time: "9:06" },
    { icon: Wifi, title: "Resuelto", text: "Controlador de red actualizado y red reconfigurada", time: "9:19" },
  ]
  return (
    <div aria-hidden className="mx-auto max-w-[460px] rounded-[26px] border border-pale-mist/80 bg-card p-5 shadow-[0_30px_60px_-30px_rgba(0,40,90,0.35)]">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-obsidian dark:text-foreground"><Laptop className="h-4 w-4 text-sapphire dark:text-sky-signal" /> Solicitud de soporte</p>
        <span className="rounded-full bg-[#e8f7ee] dark:bg-[#1a7f45]/20 px-2.5 py-1 text-[11px] text-[#1a7f45] dark:text-[#6fd39b]">Resuelto</span>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", i === steps.length - 1 ? "bg-primary text-primary-foreground" : "bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal")}><s.icon className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1 rounded-2xl bg-fog-white dark:bg-white/5 px-3 py-2">
              <p className="flex justify-between text-[12px] font-semibold text-obsidian dark:text-foreground">{s.title}<span className="font-normal text-pewter">{s.time}</span></p>
              <p className="text-[11.5px] text-pewter">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-pewter">Reporte enviado por WhatsApp con lo que se hizo y qué recomendamos.</p>
    </div>
  )
}

/** A real screenshot inside a browser frame (used for Avero's own work). */
export function ScreenshotFrame({ src, alt, url, width, height }: { src: string; alt: string; url: string; width: number; height: number }) {
  return (
    <Window url={url}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="block h-auto w-full" />
    </Window>
  )
}
