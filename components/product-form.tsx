"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface ProductFormProps {
  product?: Product
  userId: string
}

export function ProductForm({ product, userId }: ProductFormProps) {
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
        router.refresh()
        router.push("/dashboard/products")
      }
    } catch (err) {
      console.error(err)
      setError("Error al guardar el producto")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div role="alert" className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nombre del producto o servicio"
                required
                maxLength={200}
                disabled={loading}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descripción del producto o servicio"
                disabled={loading}
                defaultValue={product?.description}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Código</Label>
              <Input id="sku" name="sku" type="text" placeholder="SKU-001" disabled={loading} defaultValue={product?.sku} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                name="category"
                type="text"
                placeholder="Ej: Laptops, Monitores, Servicios"
                disabled={loading}
                defaultValue={product?.category}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta (RD$) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={loading}
                defaultValue={product?.price}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo (RD$)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={loading}
                defaultValue={product?.cost}
              />
              <p className="text-xs text-muted-foreground">Privado: nunca se muestra en la tienda.</p>
            </div>

            <div className="md:col-span-1 pt-2">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Checkbox
                  id="trackInventory"
                  checked={trackInventory}
                  onCheckedChange={(checked) => setTrackInventory(checked === true)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label htmlFor="trackInventory" className="cursor-pointer font-semibold">
                    Controlar inventario
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Reduce stock al vender</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 pt-2">
              <div className="flex items-center space-x-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <Label htmlFor="isPublic" className="cursor-pointer font-semibold">
                    Visible en la tienda
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">Aparece en tu tienda en línea (actívala en Mi tienda)</p>
                </div>
              </div>
            </div>

            {trackInventory && (
              <div className="space-y-2 md:col-span-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Label htmlFor="stockQuantity" className="font-semibold">
                  Cantidad disponible en stock
                </Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  disabled={loading}
                  defaultValue={product?.stockQuantity || 0}
                />
                <p className="text-xs text-muted-foreground">
                  Esta cantidad se reducirá automáticamente cuando hagas una venta. Con 0 el equipo aparece como
                  agotado en la tienda.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles para la tienda en línea</CardTitle>
          <CardDescription>
            Opcional. Se muestran en la página pública del producto cuando está visible en la tienda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImagesField
            userId={userId}
            images={images}
            onChange={handleImagesChange}
            onUploaded={(paths) => paths.forEach((p) => unsaved.current.add(p))}
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" placeholder="Ej: Dell" maxLength={80} disabled={loading} defaultValue={product?.brand} />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="warrantyMonths">Garantía (meses)</Label>
              <Input
                id="warrantyMonths"
                name="warrantyMonths"
                type="number"
                min="0"
                max="120"
                step="1"
                placeholder="Ej: 3"
                disabled={loading}
                defaultValue={product?.warrantyMonths}
              />
            </div>
          </div>

          <SpecsField specs={specs} onChange={setSpecs} disabled={loading} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Dirección web</Label>
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="text-xs text-muted-foreground whitespace-nowrap">/catalogo/</span>
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
              <p className="text-xs text-muted-foreground">Déjalo vacío para generarla del nombre.</p>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border self-end">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setFeatured(checked === true)}
                disabled={loading}
              />
              <div className="flex-1">
                <Label htmlFor="featured" className="cursor-pointer font-semibold">
                  Destacado
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Aparece primero en el catálogo y en el inicio</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : product ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
