"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { normalizeHex } from "@/lib/brand"
import { saveDocumentColor } from "@/lib/data/branding-actions"
import { cn } from "@/lib/utils"

const DOCUMENT_COLORS = [
  { hex: "#0071e3", label: "Azul" },
  { hex: "#1e3a8a", label: "Azul marino" },
  { hex: "#111827", label: "Negro" },
  { hex: "#0f766e", label: "Verde azulado" },
  { hex: "#15803d", label: "Verde" },
  { hex: "#9f1239", label: "Vino" },
  { hex: "#be185d", label: "Fucsia" },
  { hex: "#7c3aed", label: "Morado" },
  { hex: "#c2410c", label: "Naranja" },
  { hex: "#a16207", label: "Dorado" },
]

/** A small replica of the PDF so the choice is obvious before saving. */
function Preview({ color, businessName }: { color: string; businessName: string }) {
  return (
    <div aria-hidden className="overflow-hidden rounded-lg border bg-white text-[8px] leading-tight text-slate-600 shadow-sm">
      <div className="h-1.5" style={{ background: color }} />
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-900">{businessName}</p>
            <p>Tel. (809) 000-0000</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] tracking-[0.2em] text-slate-900">FACTURA</p>
            <p className="font-bold" style={{ color }}>
              No. INV-0001
            </p>
          </div>
        </div>
        <div className="border-t" />
        <div className="flex justify-between bg-slate-900 px-1.5 py-1 font-bold uppercase tracking-wider text-white">
          <span>Descripción</span>
          <span>Importe</span>
        </div>
        <div className="flex justify-between border-b px-1.5 py-1">
          <span className="text-slate-900">Blusa de lino blanca</span>
          <span className="font-bold text-slate-900">RD$1,450.00</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="border-l-2 pl-1.5" style={{ borderColor: color }}>
            <p className="font-bold uppercase tracking-wider text-slate-900">Notas</p>
            <p>Gracias por su compra.</p>
          </div>
          <div className="min-w-24 border-t-2 border-slate-900 pt-1 text-right">
            <p className="text-[11px] font-extrabold" style={{ color }}>
              RD$1,450.00
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Configuración → Color de facturas y recibos (also quotes). Independent from the system color. */
export function DocumentColorForm({
  current,
  brandColor,
  businessName,
}: {
  current: string | null
  brandColor: string | null
  businessName: string
}) {
  const router = useRouter()
  const fallback = brandColor ?? "#0071e3"
  const [sameAsBrand, setSameAsBrand] = useState(current === null)
  const [color, setColor] = useState(current ?? fallback)
  const [hexText, setHexText] = useState(current ?? fallback)
  const [saving, setSaving] = useState(false)
  const shown = sameAsBrand ? fallback : color

  function pick(hex: string) {
    setSameAsBrand(false)
    setColor(hex)
    setHexText(hex)
  }

  async function save() {
    setSaving(true)
    const result = await saveDocumentColor(sameAsBrand ? null : color)
    setSaving(false)
    if (result.error) return toast.error(result.error)
    toast.success("Listo. Tus próximas facturas, recibos y cotizaciones salen con este color.")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color de facturas y recibos</CardTitle>
        <CardDescription>
          El color de tus facturas, recibos de venta y cotizaciones en PDF e impresos. Puede ser distinto al color del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color de los documentos">
            {DOCUMENT_COLORS.map((c) => {
              const selected = !sameAsBrand && color.toLowerCase() === c.hex
              return (
                <button
                  key={c.hex}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => pick(c.hex)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected && "ring-2 ring-foreground",
                  )}
                  style={{ background: c.hex }}
                >
                  {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc-color-picker">Otro color</Label>
              <input
                id="doc-color-picker"
                type="color"
                value={color}
                onChange={(e) => pick(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-md border bg-transparent p-1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-color-hex">Código</Label>
              <Input
                id="doc-color-hex"
                value={hexText}
                onChange={(e) => {
                  setHexText(e.target.value)
                  const hex = normalizeHex(e.target.value)
                  if (hex) pick(hex)
                }}
                className="w-28 font-mono"
                maxLength={7}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={sameAsBrand} onChange={(e) => setSameAsBrand(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
            Usar el mismo color de mi marca
          </label>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Vista previa</p>
          <Preview color={shown} businessName={businessName} />
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t pt-6">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Guardar color
        </Button>
      </CardFooter>
    </Card>
  )
}
