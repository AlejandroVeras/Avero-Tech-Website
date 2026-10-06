export const PRODUCT_IMAGES_BUCKET = "product-images"
export const MAX_PRODUCT_IMAGES = 8
export const MAX_SPECS = 40

export const CONDITIONS = ["nuevo", "reacondicionado", "usado"] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABELS: Record<Condition, string> = {
  nuevo: "Nuevo",
  reacondicionado: "Reacondicionado",
  usado: "Usado",
}

export interface Spec {
  label: string
  value: string
}

// Shapes below are serialized to the browser: never add cost, sku or exact stock.
export interface PublicProduct {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  category?: string
  brand?: string
  condition?: Condition
  featured: boolean
  inStock: boolean
  coverUrl?: string
  createdAt: string
}

export interface PublicProductDetail extends PublicProduct {
  warrantyMonths?: number
  specs: Spec[]
  images: string[]
}

export interface PublicStore {
  id: string
  slug: string
  name: string
  logoUrl?: string
  description?: string
  whatsapp?: string
  isStoreOwner: boolean
}

// "829-812-2103" -> "18298122103" (wa.me needs the country code, DR is +1).
export function normalizeWhatsapp(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  if (/^(809|829|849)\d{7}$/.test(digits)) return `1${digits}`
  if (/^1(809|829|849)\d{7}$/.test(digits)) return digits
  if (digits.length >= 11 && digits.length <= 15) return digits
  return null
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export function warrantyLabel(months?: number) {
  if (months == null) return undefined
  if (months === 0) return "Sin garantía"
  if (months % 12 === 0) return months === 12 ? "1 año" : `${months / 12} años`
  return months === 1 ? "1 mes" : `${months} meses`
}
