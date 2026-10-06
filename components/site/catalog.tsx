"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Laptop, Package, Plus, Search, Filter, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PublicProduct } from "@/lib/data/products"
import { useCart } from "@/lib/cart-store"
import { formatDOP, whatsappUrl } from "@/lib/site"

const consultMessage = (p: PublicProduct) => `Hola, me interesa el ${p.name} (${formatDOP(p.price)})`

export function Catalog({ products }: { products: PublicProduct[] }) {
  const add = useCart((s) => s.add)
  const setOpen = useCart((s) => s.setOpen)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category || "Otros")))],
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return products.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)
      const matchCategory = category === "all" || (p.category || "Otros") === category
      return matchQuery && matchCategory
    })
  }, [products, query, category])

  const addToCart = (p: PublicProduct) => {
    add(p)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" aria-hidden />
          <Input
            aria-label="Buscar equipos"
            placeholder="Buscar equipos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 rounded-full border-pale-mist bg-card"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Categoría" className="w-full sm:w-[180px] rounded-full border-pale-mist bg-card">
            <Filter className="h-4 w-4 mr-2" aria-hidden />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "Todas" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border border-pale-mist rounded-full overflow-hidden bg-card self-start">
          <Button variant={view === "grid" ? "default" : "ghost"} size="icon" aria-label="Vista en cuadrícula" aria-pressed={view === "grid"} onClick={() => setView("grid")} className="rounded-none">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "list" ? "default" : "ghost"} size="icon" aria-label="Vista en lista" aria-pressed={view === "list"} onClick={() => setView("list")} className="rounded-none">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-pale-mist">
          <Package className="w-12 h-12 text-pewter/30 mx-auto mb-4" aria-hidden />
          <h3 className="font-medium text-lg">No se encontraron equipos</h3>
          <p className="text-pewter text-sm mt-1">
            {query || category !== "all" ? "Intenta con otra búsqueda" : "Pronto publicaremos nuestro inventario"}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
            >
              <Card className="h-full flex flex-col overflow-hidden group shadow-none border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors duration-300 py-0 gap-0">
                <div className="aspect-[4/3] bg-fog-white dark:bg-white/5 flex items-center justify-center relative">
                  <Laptop className="w-16 h-16 text-obsidian/10 dark:text-white/15 group-hover:scale-110 transition-transform" aria-hidden />
                  <Badge className="absolute top-3 right-3 text-[10px] rounded-full" variant={p.inStock ? "default" : "destructive"}>
                    {p.inStock ? "Disponible" : "Agotado"}
                  </Badge>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <Badge variant="outline" className="w-fit mb-2 text-[10px] rounded-full border-pale-mist text-pewter">
                    {p.category || "Equipos"}
                  </Badge>
                  <h3 className="font-semibold line-clamp-2 mb-1 text-obsidian dark:text-foreground">{p.name}</h3>
                  {p.description && <p className="text-xs text-pewter line-clamp-2 mb-3">{p.description}</p>}
                  <div className="mt-auto pt-3">
                    <p className="text-xl font-semibold text-obsidian dark:text-foreground">{formatDOP(p.price)}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 rounded-full text-[13px] font-normal" asChild>
                        <a href={whatsappUrl(consultMessage(p))} target="_blank" rel="noopener noreferrer">
                          Consultar
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Agregar ${p.name} al carrito`}
                        className="rounded-full border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
                        onClick={() => addToCart(p)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="shadow-none border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors py-0">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-fog-white dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Laptop className="w-8 h-8 text-obsidian/15 dark:text-white/20" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-obsidian dark:text-foreground">{p.name}</h3>
                  <p className="text-xs text-pewter truncate">{p.category || "Equipos"}</p>
                </div>
                <Badge variant={p.inStock ? "default" : "destructive"} className="hidden sm:flex shrink-0 rounded-full">
                  {p.inStock ? "Disponible" : "Agotado"}
                </Badge>
                <p className="text-lg font-semibold text-obsidian dark:text-foreground shrink-0">{formatDOP(p.price)}</p>
                <Button size="sm" className="rounded-full text-[13px] font-normal" asChild>
                  <a href={whatsappUrl(consultMessage(p))} target="_blank" rel="noopener noreferrer">
                    Consultar
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
