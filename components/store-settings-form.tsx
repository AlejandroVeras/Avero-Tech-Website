"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { Check, Copy, Download, ExternalLink, ImagePlus, Loader2, Store, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { updateMyStore, type MyStore } from "@/lib/data/store"
import { friendlyError } from "@/lib/data/errors"
import { compressImage } from "@/lib/image"
import { PRODUCT_IMAGES_BUCKET, slugify } from "@/lib/catalog"

function formatPhone(digits?: string) {
  if (!digits) return ""
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  return local.length === 10 ? `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}` : digits
}

export function StoreSettingsForm({ store, userId, siteUrl }: { store: MyStore; userId: string; siteUrl: string }) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(store.enabled)
  const [slug, setSlug] = useState(store.slug)
  const [savedSlug, setSavedSlug] = useState(store.slug)
  const [logoUrl, setLogoUrl] = useState(store.logoUrl)
  const [logoPath, setLogoPath] = useState<string>()
  const [removeLogo, setRemoveLogo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string }>()
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  const publicUrl = `${siteUrl}/t/${savedSlug}`
  const previewSlug = slugify(slug) || "tu-negocio"

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 640, margin: 2, errorCorrectionLevel: "M" })
      .then(setQr)
      .catch(() => setQr(undefined))
  }, [publicUrl])

  async function uploadLogo(file?: File) {
    if (!file) return
    setMessage(undefined)
    setUploading(true)
    try {
      const blob = await compressImage(file, 512, 0.9)
      const path = `${userId}/store/logo-${crypto.randomUUID()}.webp`
      const supabase = createClient()
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" })
      if (error) throw new Error(friendlyError(error))
      setLogoPath(path)
      setLogoUrl(supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl)
      setRemoveLogo(false)
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "No se pudo subir el logo" })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(undefined)
    const formData = new FormData(e.currentTarget)
    formData.set("enabled", enabled ? "true" : "false")
    if (logoPath) formData.set("logoPath", logoPath)
    formData.set("removeLogo", removeLogo ? "true" : "false")
    const result = await updateMyStore(formData)
    setSaving(false)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
      return
    }
    if (result.slug) {
      setSavedSlug(result.slug)
      setSlug(result.slug)
    }
    setLogoPath(undefined)
    setMessage({ type: "ok", text: enabled ? "Tienda guardada y publicada." : "Cambios guardados. La tienda está desactivada." })
    router.refresh()
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setMessage({ type: "error", text: "No se pudo copiar; selecciona el enlace y cópialo manualmente." })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Datos de la tienda</CardTitle>
            <CardDescription>Así te ven tus clientes cuando abren tu enlace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {message && (
              <div
                role={message.type === "error" ? "alert" : "status"}
                className={
                  message.type === "error"
                    ? "p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900"
                    : "p-3 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/40 dark:text-green-200 dark:border-green-900"
                }
              >
                {message.text}
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/40">
              <Checkbox id="enabled" checked={enabled} onCheckedChange={(c) => setEnabled(c === true)} disabled={saving} />
              <div>
                <Label htmlFor="enabled" className="font-semibold cursor-pointer">Tienda activa</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando está activa, cualquiera con el enlace ve los productos que marcaste como visibles.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Subiendo logo" />
                  ) : logoUrl && !removeLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="Logo de la tienda" className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-6 w-6 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={uploading || saving} onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="h-4 w-4" /> {logoUrl && !removeLogo ? "Cambiar" : "Subir logo"}
                  </Button>
                  {logoUrl && !removeLogo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={uploading || saving}
                      onClick={() => {
                        setRemoveLogo(true)
                        setLogoPath(undefined)
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Quitar
                    </Button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  hidden
                  onChange={(e) => uploadLogo(e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Dirección de tu tienda *</Label>
              <div className="flex items-center rounded-md border bg-muted/40 pl-3 focus-within:ring-[3px] focus-within:ring-ring/50">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{siteUrl.replace(/^https?:\/\//, "")}/t/</span>
                <Input
                  id="slug"
                  name="slug"
                  required
                  minLength={3}
                  maxLength={60}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={saving}
                  className="border-0 shadow-none focus-visible:ring-0 pl-0.5"
                />
              </div>
              {slugify(slug) !== slug && slug && (
                <p className="text-xs text-muted-foreground">Se guardará como: {previewSlug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp para pedidos *</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="829-555-1234"
                defaultValue={formatPhone(store.whatsapp)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">Los botones de &quot;Consultar&quot; de tu tienda abren un chat con este número.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción corta</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                maxLength={300}
                placeholder="Ej: Celulares, accesorios y reparaciones en Los Alcarrizos. Entregas el mismo día."
                defaultValue={store.description}
                disabled={saving}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tu enlace</CardTitle>
            <CardDescription>
              {store.publicProducts === 0
                ? "Aún no tienes productos visibles. Márcalos como \"Visible en la tienda\" en Productos."
                : `${store.publicProducts} ${store.publicProducts === 1 ? "producto visible" : "productos visibles"} en tu tienda.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm break-all rounded-md bg-muted px-3 py-2">{publicUrl}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado" : "Copiar"}
              </Button>
              {store.enabled && (
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={`/t/${savedSlug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Ver tienda
                  </a>
                </Button>
              )}
            </div>
            {!store.enabled && (
              <p className="text-xs text-muted-foreground">Activa la tienda y guarda para que el enlace funcione.</p>
            )}
            {qr && (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt={`Código QR de ${publicUrl}`} className="w-full max-w-[220px] mx-auto rounded-lg border bg-white p-2" />
                <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                  <a href={qr} download={`tienda-${savedSlug}-qr.png`}>
                    <Download className="h-4 w-4" /> Descargar QR
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">Imprímelo y ponlo en tu mostrador.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
