import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Servicios de tecnología para negocios en República Dominicana"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Servicios de tecnología para negocios en República Dominicana", "Servicios")
}
