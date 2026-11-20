// Ready-made products so a new business can try selling before loading its own.
// No imports: tests run this file directly.

export interface SampleProduct {
  name: string
  category: string
  price: number
  cost: number
  stock: number
}

const SAMPLES: Record<string, SampleProduct[]> = {
  ropa: [
    { name: "Blusa de lino blanca (M)", category: "Blusas", price: 1450, cost: 700, stock: 8 },
    { name: "Jean azul tiro alto (28)", category: "Jeans", price: 2200, cost: 1100, stock: 6 },
    { name: "Vestido floral midi (S)", category: "Vestidos", price: 2800, cost: 1350, stock: 4 },
    { name: "Camiseta básica negra (L)", category: "Camisetas", price: 650, cost: 300, stock: 15 },
    { name: "Sandalias de cuero (38)", category: "Calzado", price: 1900, cost: 950, stock: 5 },
    { name: "Cartera mediana beige", category: "Accesorios", price: 2500, cost: 1200, stock: 3 },
  ],
  colmado: [
    { name: "Arroz 5 lb", category: "Víveres", price: 225, cost: 180, stock: 30 },
    { name: "Habichuelas rojas 1 lb", category: "Víveres", price: 95, cost: 70, stock: 25 },
    { name: "Aceite 1 litro", category: "Víveres", price: 210, cost: 165, stock: 20 },
    { name: "Refresco 2 litros", category: "Bebidas", price: 130, cost: 95, stock: 24 },
    { name: "Agua 16 oz", category: "Bebidas", price: 25, cost: 12, stock: 48 },
    { name: "Detergente 1 kg", category: "Limpieza", price: 185, cost: 140, stock: 12 },
  ],
  ferreteria: [
    { name: "Martillo de uña 16 oz", category: "Herramientas", price: 650, cost: 380, stock: 10 },
    { name: "Taladro inalámbrico 20V", category: "Herramientas", price: 5900, cost: 4100, stock: 3 },
    { name: "Tubo PVC 1/2 pulgada (6 m)", category: "Plomería", price: 240, cost: 150, stock: 40 },
    { name: "Cinta aislante negra", category: "Electricidad", price: 75, cost: 40, stock: 30 },
    { name: "Galón de pintura blanca", category: "Pintura", price: 1350, cost: 950, stock: 8 },
    { name: "Caja de tornillos 1 pulgada", category: "Tornillería", price: 180, cost: 95, stock: 20 },
  ],
  servicios: [
    { name: "Diagnóstico", category: "Servicios", price: 500, cost: 0, stock: 0 },
    { name: "Mantenimiento general", category: "Servicios", price: 1500, cost: 300, stock: 0 },
    { name: "Reparación (mano de obra)", category: "Servicios", price: 2000, cost: 0, stock: 0 },
    { name: "Repuesto genérico", category: "Repuestos", price: 900, cost: 500, stock: 10 },
  ],
}

const GENERIC: SampleProduct[] = [
  { name: "Producto de ejemplo A", category: "General", price: 500, cost: 300, stock: 10 },
  { name: "Producto de ejemplo B", category: "General", price: 1200, cost: 700, stock: 6 },
  { name: "Producto de ejemplo C", category: "General", price: 2500, cost: 1500, stock: 3 },
  { name: "Servicio de ejemplo", category: "Servicios", price: 1000, cost: 0, stock: 0 },
]

/** Samples for this kind of business; distribuidora uses the colmado list, unknown types a generic one. */
export function sampleProductsFor(type: string | null | undefined): SampleProduct[] {
  if (type === "distribuidora") return SAMPLES.colmado
  return (type && SAMPLES[type]) || GENERIC
}
