// Each business's own color and home-screen layout. No imports: tests run this file directly.

// ─── Color de marca ──────────────────────────────────────────────────

export const BRAND_PRESETS = [
  { hex: "#0071e3", label: "Azul" },
  { hex: "#0f766e", label: "Verde azulado" },
  { hex: "#15803d", label: "Verde" },
  { hex: "#b91c1c", label: "Rojo" },
  { hex: "#be185d", label: "Fucsia" },
  { hex: "#7c3aed", label: "Morado" },
  { hex: "#c2410c", label: "Naranja" },
  { hex: "#111827", label: "Negro" },
] as const

/** "#ABC" / "abcdef" / "#AbCdEf" → "#abcdef"; anything else → null. */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== "string") return null
  let v = value.trim().toLowerCase().replace(/^#/, "")
  if (/^[0-9a-f]{3}$/.test(v)) v = v.split("").map((c) => c + c).join("")
  return /^[0-9a-f]{6}$/.test(v) ? `#${v}` : null
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** White or near-black text, whichever reads better on the brand color. */
export function readableOn(hex: string) {
  return contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#111111") ? "#ffffff" : "#111111"
}

function mix(hex: string, target: string, t: number) {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16)
  return (
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(ch(hex, i) + (ch(target, i) - ch(hex, i)) * t))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  )
}

/** Same hue, lightened or darkened until it stands out on `background` (3:1, the WCAG minimum for UI parts). */
export function visibleOn(hex: string, background: string, min = 3) {
  const toward = luminance(background) < 0.5 ? "#ffffff" : "#000000"
  for (let t = 0; t <= 1; t += 0.05) {
    const c = mix(hex, toward, t)
    if (contrastRatio(c, background) >= min) return c
  }
  return toward
}

/** Backgrounds from app/globals.css: white cards in light mode, the dark canvas in dark mode. */
const LIGHT_BG = "#ffffff"
const DARK_BG = "#0b1020"

/**
 * CSS variables for one business's color. Spread the result on the wrapper element; globals.css
 * ([data-brand]) maps them to --primary / --ring in light and dark mode, so a black brand still
 * shows in dark mode and a yellow one in light mode.
 */
export function brandProps(color: string | null | undefined): { style?: Record<string, string>; "data-brand"?: "" } {
  const hex = normalizeHex(color)
  if (!hex) return {}
  const light = visibleOn(hex, LIGHT_BG)
  const dark = visibleOn(hex, DARK_BG)
  return {
    "data-brand": "",
    style: {
      "--brand-light": light,
      "--brand-light-fg": readableOn(light),
      "--brand-dark": dark,
      "--brand-dark-fg": readableOn(dark),
    },
  }
}

// ─── Inicio del dashboard ────────────────────────────────────────────

export const DASHBOARD_WIDGETS = [
  { id: "quick-actions", label: "Accesos rápidos", hint: "Botones para facturar, agregar productos y registrar gastos." },
  { id: "today-sales", label: "Ventas de hoy", hint: "Lo vendido hoy, cuántas ventas y por forma de pago." },
  { id: "stats", label: "Resumen del negocio", hint: "Ingresos, gastos, ganancia y facturas pendientes." },
  { id: "low-stock", label: "Productos por agotarse", hint: "Productos con 3 unidades o menos." },
  { id: "recent-activity", label: "Actividad reciente", hint: "Las últimas facturas y movimientos." },
] as const
export type WidgetId = (typeof DASHBOARD_WIDGETS)[number]["id"]
export type WidgetSetting = { id: WidgetId; visible: boolean }

/** What a business sees until it changes it: the old screen plus the two new cards. */
export const DEFAULT_WIDGETS: WidgetSetting[] = DASHBOARD_WIDGETS.map((w) => ({ id: w.id, visible: true }))

/** Saved list → full ordered list: unknown ids dropped, duplicates ignored, missing widgets appended visible. */
export function parseWidgets(value: unknown): WidgetSetting[] {
  if (!Array.isArray(value)) return DEFAULT_WIDGETS
  const known = new Set<string>(DASHBOARD_WIDGETS.map((w) => w.id))
  const seen = new Set<string>()
  const list: WidgetSetting[] = []
  for (const item of value) {
    const id = item && typeof item === "object" ? (item as { id?: unknown }).id : undefined
    if (typeof id !== "string" || !known.has(id) || seen.has(id)) continue
    seen.add(id)
    list.push({ id: id as WidgetId, visible: (item as { visible?: unknown }).visible !== false })
  }
  for (const w of DASHBOARD_WIDGETS) if (!seen.has(w.id)) list.push({ id: w.id, visible: true })
  return list
}

// ─── Catálogo ────────────────────────────────────────────────────────

/** "@boutique.ana", "instagram.com/boutique.ana/" or "https://www.instagram.com/boutique.ana" → "boutique.ana". */
export function socialHandle(value: unknown, site: "instagram" | "tiktok"): string | null {
  if (typeof value !== "string") return null
  const v = value
    .trim()
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(new RegExp(`^${site}\\.com/`, "i"), "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
  return /^[a-z0-9._]{1,30}$/i.test(v) ? v : null
}

/** Facebook page: accepts the full link or just the page name. */
export function facebookPage(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value
    .trim()
    .replace(/^https?:\/\/(www\.|m\.)?/i, "")
    .replace(/^facebook\.com\//i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
  return /^[a-z0-9.\-/_]{2,100}$/i.test(v) && !v.includes("..") ? v : null
}
