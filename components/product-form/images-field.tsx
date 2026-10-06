"use client"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { MAX_PRODUCT_IMAGES, PRODUCT_IMAGES_BUCKET } from "@/lib/catalog"
import type { ProductImage } from "@/lib/data/products"

const MAX_DIMENSION = 1600

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la imagen"))), "image/webp", 0.85),
  )
}

export function ImagesField({
  userId,
  images,
  onChange,
  onUploaded,
  disabled,
}: {
  userId: string
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  onUploaded: (paths: string[]) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState("")
  const remaining = MAX_PRODUCT_IMAGES - images.length

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError("")
    const selected = Array.from(files).slice(0, remaining)
    if (files.length > remaining) setError(`Solo puedes tener ${MAX_PRODUCT_IMAGES} fotos por producto.`)

    const supabase = createClient()
    setUploading(selected.length)
    const added: ProductImage[] = []
    for (const file of selected) {
      try {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} no es una imagen`)
        const blob = await compress(file)
        const path = `${userId}/${crypto.randomUUID()}.webp`
        const { error: upError } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" })
        if (upError) throw upError
        const url = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
        added.push({ path, url })
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo subir una de las fotos")
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (added.length > 0) {
      onUploaded(added.map((a) => a.path))
      onChange([...images, ...added])
    }
    if (inputRef.current) inputRef.current.value = ""
  }

  function move(index: number, delta: number) {
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <Label>Fotos</Label>
      <p className="text-xs text-muted-foreground">
        La primera foto es la portada. Hasta {MAX_PRODUCT_IMAGES} fotos; se optimizan automáticamente al subirlas.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <li key={img.path} className="relative aspect-square rounded-lg border overflow-hidden bg-muted group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                Portada
              </span>
            )}
            <button
              type="button"
              aria-label={`Quitar foto ${i + 1}`}
              disabled={disabled}
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between">
              <button
                type="button"
                aria-label={`Mover foto ${i + 1} a la izquierda`}
                disabled={disabled || i === 0}
                onClick={() => move(i, -1)}
                className="rounded-full bg-black/70 p-1 text-white disabled:opacity-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Mover foto ${i + 1} a la derecha`}
                disabled={disabled || i === images.length - 1}
                onClick={() => move(i, 1)}
                className="rounded-full bg-black/70 p-1 text-white disabled:opacity-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <li key={`up-${i}`} className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Subiendo foto" />
          </li>
        ))}
        {remaining > 0 && uploading === 0 && (
          <li>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="aspect-square h-auto w-full flex-col gap-1 border-dashed"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs">Agregar fotos</span>
            </Button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
