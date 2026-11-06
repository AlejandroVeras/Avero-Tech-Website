// Last real edit of each static page. Update the date in the same commit that changes the page:
// it feeds the sitemap, the "Actualizado el…" line and dateModified in the JSON-LD.
export const CONTENT_DATES: Record<string, string> = {
  "/": "2026-11-05",
  "/servicios": "2026-11-05",
  "/servicios/diseno-paginas-web": "2026-11-05",
  "/servicios/desarrollo-portales-web": "2026-11-05",
  "/servicios/posicionamiento-seo": "2026-11-05",
  "/servicios/inteligencia-artificial-para-negocios": "2026-11-05",
  "/servicios/chatbots-ia-whatsapp": "2026-11-05",
  "/servicios/soporte-tecnico": "2026-11-05",
  "/sistemas": "2026-11-05",
  "/sistemas/inventario": "2026-11-05",
  "/sistemas/citas": "2026-11-05",
  "/sistemas/condominios": "2026-11-05",
  "/catalogo": "2026-11-05",
  "/precios": "2026-11-05",
  "/blog": "2026-11-05",
  "/nosotros": "2026-11-05",
  "/preguntas-frecuentes": "2026-11-05",
  "/contacto": "2026-11-05",
  "/garantia": "2026-10-14",
  "/terminos": "2026-10-14",
  "/privacidad": "2026-10-14",
}

export function contentDate(path: string) {
  return CONTENT_DATES[path] ?? "2026-11-05"
}

const long = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
export function contentDateLabel(path: string) {
  return long.format(new Date(`${contentDate(path)}T00:00:00Z`))
}
