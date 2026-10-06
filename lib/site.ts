export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://averotechnology.com").replace(/\/$/, "")

export const WHATSAPP_NUMBER = "18298122103"
export const WHATSAPP_DISPLAY = "(829) 812-2103"
export const CONTACT_EMAIL = "info@averotech.com"
export const LOCATION = "Santo Domingo, República Dominicana"

export const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Sistemas", href: "/sistemas" },
  { label: "Soporte", href: "/soporte" },
  { label: "Contacto", href: "/contacto" },
] as const

export function whatsappUrl(message?: string, phone: string = WHATSAPP_NUMBER) {
  return message
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${phone}`
}

const dop = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 })
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })

export function formatDOP(amount: number) {
  return dop.format(amount)
}

export function formatUSD(amount: number) {
  return `US${usd.format(amount).replace(/\.00$/, "")}`
}
