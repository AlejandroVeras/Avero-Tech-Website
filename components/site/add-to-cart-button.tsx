"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-store"
import type { PublicProduct } from "@/lib/catalog"

export function AddToCartButton({ product }: { product: Pick<PublicProduct, "id" | "name" | "price" | "inStock"> }) {
  const add = useCart((s) => s.add)
  const setOpen = useCart((s) => s.setOpen)
  return (
    <Button
      size="lg"
      variant="outline"
      disabled={!product.inStock}
      className="rounded-full px-6 text-[14px] font-normal border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
      onClick={() => {
        add(product)
        setOpen(true)
      }}
    >
      Agregar al carrito
    </Button>
  )
}
