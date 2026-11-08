import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Avero Citas: tus clientes reservan solos y les llega el recordatorio"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Avero Citas: tus clientes reservan solos y les llega el recordatorio", "Avero Citas")
}
