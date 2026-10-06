"use client"

import { useMemo, useState } from "react"
import { Package, Search, LayoutGrid, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductCard, ProductRow } from "@/components/site/product-card"
import { CONDITIONS, CONDITION_LABELS, type PublicProduct } from "@/lib/catalog"

type Sort = "featured" | "price-asc" | "price-desc" | "newest"

const SORT_LABELS: Record<Sort, string> = {
  featured: "Destacados",
  newest: "Más recientes",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
}

const ALL = "all"

function uniqueSorted(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, "es"))
}

const pill = "rounded-full border-pale-mist bg-card"

export function Catalog({ products }: { products: PublicProduct[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(ALL)
  const [brand, setBrand] = useState(ALL)
  const [condition, setCondition] = useState(ALL)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState<Sort>("featured")
  const [view, setView] = useState<"grid" | "list">("grid")

  const categories = useMemo(() => uniqueSorted(products.map((p) => p.category)), [products])
  const brands = useMemo(() => uniqueSorted(products.map((p) => p.brand)), [products])
  const conditions = useMemo(() => CONDITIONS.filter((c) => products.some((p) => p.condition === c)), [products])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = minPrice ? Number(minPrice) : null
    const max = maxPrice ? Number(maxPrice) : null
    const list = products.filter((p) => {
      if (q && ![p.name, p.description, p.brand, p.category].some((f) => f?.toLowerCase().includes(q))) return false
      if (category !== ALL && p.category !== category) return false
      if (brand !== ALL && p.brand !== brand) return false
      if (condition !== ALL && p.condition !== condition) return false
      if (min !== null && p.price < min) return false
      if (max !== null && p.price > max) return false
      return true
    })
    const byStock = (a: PublicProduct, b: PublicProduct) => Number(b.inStock) - Number(a.inStock)
    return list.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "newest":
          return b.createdAt.localeCompare(a.createdAt)
        default:
          return byStock(a, b) || Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)
      }
    })
  }, [products, query, category, brand, condition, minPrice, maxPrice, sort])

  const hasFilters = !!query || category !== ALL || brand !== ALL || condition !== ALL || !!minPrice || !!maxPrice
  const clearFilters = () => {
    setQuery("")
    setCategory(ALL)
    setBrand(ALL)
    setCondition(ALL)
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto mb-8 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" aria-hidden />
            <Input
              type="search"
              aria-label="Buscar equipos"
              placeholder="Buscar por nombre, marca o categoría..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`pl-10 ${pill}`}
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger aria-label="Ordenar" className={`w-full sm:w-[210px] ${pill}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABELS[s]}
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

        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 0 && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Categoría" size="sm" className={pill}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las categorías</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {brands.length > 0 && (
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger aria-label="Marca" size="sm" className={pill}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las marcas</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {conditions.length > 0 && (
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger aria-label="Condición" size="sm" className={pill}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Cualquier condición</SelectItem>
                {conditions.map((c) => (
                  <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label="Precio mínimo en pesos"
              placeholder="RD$ mín."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={`h-8 w-28 text-sm ${pill}`}
            />
            <span className="text-pewter text-sm" aria-hidden>–</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label="Precio máximo en pesos"
              placeholder="RD$ máx."
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={`h-8 w-28 text-sm ${pill}`}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full text-sapphire dark:text-sky-signal">
              <X className="h-3.5 w-3.5" /> Limpiar
            </Button>
          )}
        </div>
        <p className="text-caption text-pewter" aria-live="polite">
          {filtered.length === 1 ? "1 equipo" : `${filtered.length} equipos`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-pale-mist">
          <Package className="w-12 h-12 text-pewter/30 mx-auto mb-4" aria-hidden />
          <h2 className="font-medium text-lg">No se encontraron equipos</h2>
          <p className="text-pewter text-sm mt-1">
            {hasFilters ? "Prueba con otros filtros" : "Pronto publicaremos nuestro inventario"}
          </p>
        </div>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p, i) => (
            <li key={p.id}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductRow product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
