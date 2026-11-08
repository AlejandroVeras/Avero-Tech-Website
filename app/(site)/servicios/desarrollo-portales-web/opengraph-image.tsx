import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Desarrollo de portales web y plataformas a medida"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Desarrollo de portales web y plataformas a medida", "Portales y plataformas")
}
