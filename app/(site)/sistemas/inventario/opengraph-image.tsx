import { OG_SIZE, ogCard } from "@/lib/og"

export const alt = "Avero Inventario: inventario, ventas y facturas para tu negocio"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpengraphImage() {
  return ogCard("Avero Inventario: inventario, ventas y facturas para tu negocio", "Avero Inventario")
}
