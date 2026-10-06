"use client"

import Link from "next/link"
import Image from "next/image"
import { Laptop, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-store"
import { CONDITION_LABELS, type PublicProduct } from "@/lib/catalog"
import { formatDOP } from "@/lib/site"
import { cn } from "@/lib/utils"

function Cover({
  product,
  className,
  sizes,
  tech,
}: {
  product: PublicProduct
  className?: string
  sizes: string
  tech: boolean
}) {
  const Placeholder = tech ? Laptop : Package
  return (
    <div className={cn("relative bg-fog-white dark:bg-white/5 flex items-center justify-center overflow-hidden", className)}>
      {product.coverUrl ? (
        <Image
          src={product.coverUrl}
          alt={product.name}
          fill
          sizes={sizes}
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Placeholder className="w-1/4 h-1/4 text-obsidian/10 dark:text-white/15" aria-hidden />
      )}
    </div>
  )
}

function AddToCart({ product, compact }: { product: PublicProduct; compact?: boolean }) {
  const add = useCart((s) => s.add)
  const setOpen = useCart((s) => s.setOpen)
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={!product.inStock}
      aria-label={`Agregar ${product.name} al carrito`}
      className={cn(
        "relative z-10 rounded-full border-sapphire text-sapphire hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal",
        compact && "shrink-0",
      )}
      onClick={() => {
        add(product)
        setOpen(true)
      }}
    >
      <Plus className="h-3 w-3" />
    </Button>
  )
}

export function ProductCard({
  product,
  priority,
  basePath = "/catalogo",
  showCart = true,
}: {
  product: PublicProduct
  priority?: boolean
  basePath?: string
  showCart?: boolean
}) {
  const href = `${basePath}/${product.slug}`
  return (
    <article className="group relative h-full flex flex-col overflow-hidden rounded-3xl border border-pale-mist/70 bg-card hover:border-sapphire/40 transition-colors duration-300">
      <Cover product={product} tech={basePath === "/catalogo"} className="aspect-[4/3]" sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" />
      <div className="absolute top-3 left-3 right-3 flex justify-between gap-2 pointer-events-none">
        {product.featured ? <Badge className="rounded-full text-[10px] bg-obsidian text-white dark:bg-white dark:text-obsidian">Destacado</Badge> : <span />}
        <Badge className="rounded-full text-[10px]" variant={product.inStock ? "default" : "destructive"}>
          {product.inStock ? "Disponible" : "Agotado"}
        </Badge>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-wider text-pewter">
          {[product.brand, product.condition && CONDITION_LABELS[product.condition]].filter(Boolean).join(" · ") ||
            product.category ||
            "Equipos"}
        </p>
        <h3 className="font-semibold line-clamp-2 mt-1 text-obsidian dark:text-foreground">
          <Link href={href} prefetch={priority} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <p className="text-xl font-semibold text-obsidian dark:text-foreground">{formatDOP(product.price)}</p>
          {showCart && <AddToCart product={product} />}
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-3xl ring-primary ring-offset-2 group-has-[a:focus-visible]:ring-2" />
    </article>
  )
}

export function ProductRow({
  product,
  basePath = "/catalogo",
  showCart = true,
}: {
  product: PublicProduct
  basePath?: string
  showCart?: boolean
}) {
  const href = `${basePath}/${product.slug}`
  return (
    <article className="group relative flex items-center gap-4 rounded-3xl border border-pale-mist/70 bg-card p-3 pr-4 hover:border-sapphire/40 transition-colors">
      <Cover product={product} tech={basePath === "/catalogo"} className="w-20 h-20 rounded-2xl shrink-0" sizes="80px" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate text-obsidian dark:text-foreground">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="text-xs text-pewter truncate">
          {[product.category, product.brand, product.condition && CONDITION_LABELS[product.condition]].filter(Boolean).join(" · ") || "Equipos"}
        </p>
      </div>
      <Badge variant={product.inStock ? "default" : "destructive"} className="hidden sm:flex shrink-0 rounded-full">
        {product.inStock ? "Disponible" : "Agotado"}
      </Badge>
      <p className="text-lg font-semibold text-obsidian dark:text-foreground shrink-0">{formatDOP(product.price)}</p>
      {showCart && <AddToCart product={product} compact />}
      <span className="pointer-events-none absolute inset-0 rounded-3xl ring-primary ring-offset-2 group-has-[a:focus-visible]:ring-2" />
    </article>
  )
}
