"use client"

import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"
import type { PublicProduct } from "@/lib/catalog"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  add: (product: Pick<PublicProduct, "id" | "name" | "price">) => void
  setQuantity: (id: string, quantity: number) => void
  remove: (id: string) => void
  clear: () => void
  setOpen: (open: boolean) => void
}

// Storage can throw in private windows or when site data is blocked; the cart
// must keep working in memory in that case.
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, value) } catch {}
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name) } catch {}
  },
}

export const useCart = create<CartState>()(
  persist<CartState, [], [], Pick<CartState, "items">>(
    (set) => ({
      items: [],
      isOpen: false,
      add: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            }
          }
          return { items: [...state.items, { id: product.id, name: product.name, price: product.price, quantity: 1 }] }
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i)),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "avero-cart",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ items: state.items }),
      // Rehydrated after mount by the header so server and first client render match.
      skipHydration: true,
    },
  ),
)

export function cartTotals(items: CartItem[]) {
  return {
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
  }
}
