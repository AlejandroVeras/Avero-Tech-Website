"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  createProduct,
  updateProduct,
  discardUploadedImages,
  type Product,
  type ProductImage,
} from "@/lib/data/products"
import { CONDITIONS, CONDITION_LABELS, slugify, type Spec } from "@/lib/catalog"
import { ImagesField } from "@/components/product-form/images-field"
import { SpecsField } from "@/components/product-form/specs-field"
import type { ProductFormConfig } from "@/lib/business-setup"

interface ProductFormProps {
  product?: Product
  userId: string
  /** Fields and examples for this kind of business (productFormFor). */
  config: ProductFormConfig
  /** Public address prefix of this business's catalog, e.g. "/t/boutique-marina/". */
  catalogPrefix: string
}

export function ProductForm({ product, userId, config, catalogPrefix }: ProductFormProps) {
  // A field hidden for this business still shows if the product already has a value, so it can be changed or cleared.
  const showCondition = config.showCondition || !!product?.condition
  const showWarranty = config.showWarranty || product?.warrantyMonths != null
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [trackInventory, setTrackInventory] = useState(product?.trackInventory !== false)
  const [isPublic, setIsPublic] = useState(product?.isPublic || false)
  const [featured, setFeatured] = useState(product?.featured || false)
  const [name, setName] = useState(product?.name ?? "")
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? [])
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? [])
  // Files uploaded in this session that are not yet attached to a saved product.
  const unsaved = useRef(new Set<string>())

  function handleImagesChange(next: ProductImage[]) {
    const kept = new Set(next.map((i) => i.path))
    const dropped = images.map((i) => i.path).filter((p) => !kept.has(p) && unsaved.current.has(p))
    if (dropped.length > 0) {
      dropped.forEach((p) => unsaved.current.delete(p))
      void discardUploadedImages(dropped)
    }
    setImages(next)
  }

  async function handleCancel() {
    const paths = Array.from(unsaved.current)
    unsaved.current.clear()
    if (paths.length > 0) await discardUploadedImages(paths)
    router.push("/dashboard/products")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("trackInventory", trackInventory ? "true" : "false")
      formData.set("isPublic", isPublic ? "true" : "false")
      formData.set("featured", featured ? "true" : "false")
      formData.set("specs", JSON.stringify(specs))
      formData.set("images", JSON.stringify(images.map((i) => i.path)))

      const result = product ? await updateProduct(product.id, formData) : await createProduct(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        unsaved.current.clear()
        toast.success(product ? "Cambios guardados" : "Producto guardado")
        // The action already revalidates the list. A refresh() fired together with push() could
        // leave the navigation hanging and the button stuck on "Guardando…", so only navigate,
        // and release the button if the page has not changed after a few seconds.
        router.push("/dashboard/products")
        setTimeout(() => setLoading(false), 6000)
      }
    } catch (err) {
      console.error(err)
      const stale = err instanceof Error && /server action|unexpected response/i.test(err.message)
      setError(
        stale
          ? "Hay una versión nueva del sistema. Recarga la página (Cmd+R o deslizando hacia abajo) y vuelve a guardar."
          : "No se pudo guardar el producto. Revisa tu conexión e intenta de nuevo.",
      )
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lo básico</CardTitle>
          <CardDescription>Con esto ya puedes vender el producto. Lo marcado con * es obligatorio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={config.namePlaceholder}
              required
              maxLength={200}
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de venta (RD$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={loading}
                defaultValue={product?.price}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">¿Cuántos tienes?</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                disabled={loading || !trackInventory}
                defaultValue={product?.stockQuantity || 0}
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  id="trackInventory"
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked === true)}
                  disabled={loading}
                />
                Llevar la cuenta (baja sola con cada venta). Quítalo para servicios.
              </label>
            </div>
          </div>

          <ImagesField
            userId={userId}
            images={images}
            onChange={handleImagesChange}
            onUploaded={(paths) => paths.forEach((p) => unsaved.current.add(p))}
            disabled={loading}
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3">
            <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(checked === true)} disabled={loading} className="mt-0.5" />
            <span>
              <span className="block text-sm font-medium">Mostrar en mi tienda en línea</span>
              <span className="block text-xs text-muted-foreground">Tus clientes lo ven en el enlace de tu tienda. Con 0 en existencias sale como agotado.</span>
            </span>
          </label>
        </CardContent>
      </Card>

      <details className="group rounded-xl border bg-card shadow-xs" open={!!product}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-semibold">Más detalles</span>
            <span className="block text-sm text-muted-foreground">Opcional: costo, código, categoría, marca, descripción y más.</span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="space-y-5 border-t p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Lo que te costó (RD$)</Label>
              <Input id="cost" name="cost" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00" disabled={loading} defaultValue={product?.cost} />
              <p className="text-xs text-muted-foreground">Privado. Sirve para calcular cuánto ganas.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" name="category" type="text" placeholder={config.categoryPlaceholder} disabled={loading} defaultValue={product?.category} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">Código</Label>
              <Input id="sku" name="sku" type="text" placeholder="Ej: BL-001 o el código de barras" disabled={loading} defaultValue={product?.sku} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" placeholder={config.brandPlaceholder} maxLength={80} disabled={loading} defaultValue={product?.brand} />
            </div>
            {showCondition && (
              <div className="space-y-2">
                <Label htmlFor="condition">Condición</Label>
                <Select name="condition" defaultValue={product?.condition ?? "none"} disabled={loading}>
                  <SelectTrigger id="condition" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CONDITION_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showWarranty && (
              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Garantía (meses)</Label>
                <Input id="warrantyMonths" name="warrantyMonths" type="number" inputMode="numeric" min="0" max="120" step="1" placeholder="Ej: 3" disabled={loading} defaultValue={product?.warrantyMonths} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="Lo que el cliente debe saber del producto" disabled={loading} defaultValue={product?.description} rows={3} />
          </div>

          <SpecsField specs={specs} onChange={setSpecs} disabled={loading} template={config.specsTemplate} example={config.specsExample} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Enlace del producto</Label>
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{catalogPrefix}</span>
                <Input
                  id="slug"
                  name="slug"
                  placeholder={slugify(name) || "se-genera-del-nombre"}
                  maxLength={100}
                  disabled={loading}
                  defaultValue={product?.slug}
                  className="border-0 shadow-none focus-visible:ring-0 pl-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Déjalo vacío y se crea solo con el nombre.</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 self-end">
              <Checkbox id="featured" checked={featured} onCheckedChange={(checked) => setFeatured(checked === true)} disabled={loading} className="mt-0.5" />
              <span>
                <span className="block text-sm font-medium">Destacado</span>
                <span className="block text-xs text-muted-foreground">Sale primero en tu tienda.</span>
              </span>
            </label>
          </div>
        </div>
      </details>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="min-w-40">
          {loading ? "Guardando…" : product ? "Guardar cambios" : "Guardar producto"}
        </Button>
      </div>
    </form>
  )
}
