"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart, cartTotals } from "@/lib/cart-store"
import { formatDOP, whatsappUrl } from "@/lib/site"

export function CartSheet() {
  const { items, isOpen, setOpen, setQuantity, remove } = useCart()
  const { count, total } = cartTotals(items)

  useEffect(() => {
    useCart.persist.rehydrate()
  }, [])

  const checkout = () => {
    let msg = `*Hola Avero Technology*, me gustaría ordenar:\n\n`
    items.forEach((i) => {
      msg += `• ${i.quantity}x ${i.name} — ${formatDOP(i.price)}\n`
    })
    msg += `\n*Total: ${formatDOP(total)}*\n\nQuedo atento a su respuesta.`
    window.open(whatsappUrl(msg), "_blank", "noopener")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label={`Carrito, ${count} artículos`}>
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {count}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Carrito ({count})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 border border-pale-mist/60 rounded-2xl"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-obsidian dark:text-foreground font-semibold text-sm">{formatDOP(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Quitar uno" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" aria-label="Agregar uno" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" aria-label="Eliminar del carrito" onClick={() => remove(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="text-center py-12 text-pewter">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-pale-mist/60 px-4 pt-4 pb-6 space-y-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatDOP(total)}</span>
            </div>
            <Button className="w-full rounded-full text-[14px] font-normal" size="lg" onClick={checkout}>
              Pedir por WhatsApp
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
