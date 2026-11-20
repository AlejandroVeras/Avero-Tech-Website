"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { saveStoreAppearance } from "@/lib/data/branding-actions"
import type { StoreAppearance } from "@/lib/data/branding"
import { friendlyError } from "@/lib/data/errors"
import { compressImage } from "@/lib/image"
import { PRODUCT_IMAGES_BUCKET } from "@/lib/catalog"
import { cn } from "@/lib/utils"

/** Mi tienda → Portada y datos: cover image, hours, address, social links, featured categories. */
export function StoreAppearanceForm({ appearance, userId }: { appearance: StoreAppearance; userId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [coverUrl, setCoverUrl] = useState(appearance.coverUrl)
  const [coverPath, setCoverPath] = useState<string>()
  const [removeCover, setRemoveCover] = useState(false)
  const [featured, setFeatured] = useState<string[]>(appearance.featuredCategories)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function upload(file?: File) {
    if (!file) return
    setUploading(true)
    try {
      const blob = await compressImage(file, 1600, 0.85)
      const path = `${userId}/store/cover-${crypto.randomUUID()}.webp`
      const supabase = createClient()
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" })
      if (error) throw new Error(friendlyError(error))
      setCoverPath(path)
      setCoverUrl(supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl)
      setRemoveCover(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la portada")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function toggleCategory(c: string) {
    setFeatured((list) => (list.includes(c) ? list.filter((x) => x !== c) : list.length >= 8 ? list : [...list, c]))
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    fd.set("featuredCategories", JSON.stringify(featured))
    if (coverPath) fd.set("coverPath", coverPath)
    fd.set("removeCover", removeCover ? "true" : "false")
    const result = await saveStoreAppearance(fd)
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setCoverPath(undefined)
    toast.success("Portada y datos guardados.")
    router.refresh()
  }

  const showCover = coverUrl && !removeCover
  // Categories that were featured but no longer have visible products still show, so they can be removed.
  const categories = [...new Set([...appearance.categories, ...featured])]

  return (
    <form onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Portada y datos del catálogo</CardTitle>
          <CardDescription>Lo que tus clientes ven arriba de tus productos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Imagen de portada</Label>
            <div className="relative flex aspect-[3/1] w-full items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Subiendo portada" />
              ) : showCover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt="Portada del catálogo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm text-muted-foreground">Sin portada. Recomendado: 1600 × 530 px.</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" disabled={uploading || saving} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-4 w-4" /> {showCover ? "Cambiar portada" : "Subir portada"}
              </Button>
              {showCover && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading || saving}
                  onClick={() => {
                    setRemoveCover(true)
                    setCoverPath(undefined)
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Quitar
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files?.[0])} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hours">Horario</Label>
              <Input id="hours" name="hours" maxLength={200} defaultValue={appearance.hours} placeholder="Lun a sáb, 9:00 a. m. a 7:00 p. m." disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" maxLength={200} defaultValue={appearance.address} placeholder="Av. Duarte 25, Santiago" disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" defaultValue={appearance.instagram ? `@${appearance.instagram}` : ""} placeholder="@tunegocio" disabled={saving} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input id="tiktok" name="tiktok" defaultValue={appearance.tiktok ? `@${appearance.tiktok}` : ""} placeholder="@tunegocio" disabled={saving} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" name="facebook" defaultValue={appearance.facebook} placeholder="facebook.com/tunegocio" disabled={saving} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categorías destacadas</Label>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cuando tus productos visibles tengan categoría (por ejemplo “Blusas” o “Jeans”), podrás destacarlas aquí.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = featured.includes(c)
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCategory(c)}
                        disabled={saving}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                        )}
                      >
                        {c}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Salen como botones arriba del catálogo. Hasta 8.</p>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Guardando..." : "Guardar portada y datos"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
