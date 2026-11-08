import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Quiénes somos y cómo trabajamos"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Quiénes somos y cómo trabajamos", "Avero Technology")
}
