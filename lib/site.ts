export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://averotechnology.com").replace(/\/$/, "")
// The customers' management system (login, dashboard, public stores) lives on its own subdomain.
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://inventario.averotechnology.com").replace(/\/$/, "")

// Customer logins of the three systems (each app keeps its own account).
export const CITAS_URL = (process.env.NEXT_PUBLIC_CITAS_URL ?? "https://citas.averotechnology.com").replace(/\/$/, "")
export const CONDOMINIOS_URL = (process.env.NEXT_PUBLIC_CONDOMINIOS_URL ?? "https://condominios.averotechnology.com").replace(/\/$/, "")

export function appUrl(path: string) {
  return `${APP_URL}${path}`
}

export const WHATSAPP_NUMBER = "18298122103"
export const WHATSAPP_DISPLAY = "(829) 812-2103"
export const CONTACT_EMAIL = "info@averotechnology.com"
export const LOCATION = "Santo Domingo, República Dominicana"
export const WHATSAPP_E164 = "+1-829-812-2103"

export const NAV_LINKS = [
  { label: "Servicios", href: "/servicios" },
  { label: "Sistemas", href: "/sistemas" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Precios", href: "/precios" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
] as const

// One definition of the services: the mega menu, the footer, /servicios and the related-services blocks read it.
export const SERVICES = [
  { key: "web", group: "presencia", icon: "monitor", name: "Páginas web", href: "/servicios/diseno-paginas-web", line: "Tu negocio en Google y en WhatsApp, con una página rápida que puedes actualizar." , menu: "Tu negocio en Google y en WhatsApp" },
  { key: "portal", group: "presencia", icon: "layout", name: "Portales y plataformas", href: "/servicios/desarrollo-portales-web", line: "Portales de clientes, intranets, marketplaces y sistemas a la medida.", menu: "Portales de clientes, intranets, marketplaces" },
  { key: "seo", group: "presencia", icon: "search", name: "Posicionamiento SEO", href: "/servicios/posicionamiento-seo", line: "Aparece en Google, en Google Maps y en las respuestas de ChatGPT.", menu: "Google, Maps y respuestas de IA" },
  { key: "bot", group: "ia", icon: "message", name: "Chatbots para WhatsApp y web", href: "/servicios/chatbots-ia-whatsapp", line: "Un asistente que responde con tu catálogo real y te pasa pedidos confirmados.", menu: "Responde y toma pedidos con tu catálogo" },
  { key: "ia", group: "ia", icon: "sparkles", name: "IA para tu negocio", href: "/servicios/inteligencia-artificial-para-negocios", line: "Automatiza tareas repetitivas, analiza tus datos y crea asistentes internos.", menu: "Automatiza tareas y analiza tus datos" },
  { key: "soporte", group: "soporte", icon: "wrench", name: "Soporte técnico", href: "/servicios/soporte-tecnico", line: "Reparación, redes, servidores e igualas mensuales en Santo Domingo.", menu: "Reparación, redes e igualas" },
] as const

export type ServiceKey = (typeof SERVICES)[number]["key"]

export const SERVICE_GROUPS = [
  { key: "presencia", label: "Presencia en internet" },
  { key: "ia", label: "Inteligencia artificial" },
  { key: "soporte", label: "Soporte y equipos" },
] as const

export function service(key: ServiceKey) {
  return SERVICES.find((s) => s.key === key)!
}

export const ENTITY_DEFINITION =
  "Avero Technology es una empresa de tecnología de Santo Domingo, República Dominicana, que diseña páginas y portales web, hace posicionamiento SEO, crea chatbots e integraciones con inteligencia artificial para negocios, desarrolla los sistemas Avero Inventario, Avero Citas y Avero Condominios, vende equipos y da soporte técnico."
export const ENTITY_SHORT = "Páginas web, SEO, chatbots con IA y sistemas para negocios. Santo Domingo, República Dominicana."
export const FOUNDER = "Alejandro Veras"
export const FOUNDED = "2024"
export const HOURS_LABEL = "24/7"

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
