import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Sistemas para administrar tu negocio, hechos en República Dominicana"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Sistemas para administrar tu negocio, hechos en República Dominicana", "Sistemas")
}
