import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Precios de servicios y sistemas"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Precios de servicios y sistemas", "Precios")
}
