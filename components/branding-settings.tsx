"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BRAND_PRESETS, DASHBOARD_WIDGETS, brandProps, normalizeHex, type WidgetSetting } from "@/lib/brand"
import { saveBrandColor, saveDashboardWidgets } from "@/lib/data/branding-actions"
import { cn } from "@/lib/utils"

const AVERO_BLUE = "#0071e3"

/** Configuración → Color de tu marca. */
export function BrandColorForm({ current }: { current: string | null }) {
  const router = useRouter()
  const [color, setColor] = useState(current ?? AVERO_BLUE)
  const [hexText, setHexText] = useState(current ?? AVERO_BLUE)
  const [saving, setSaving] = useState(false)

  function pick(hex: string) {
    setColor(hex)
    setHexText(hex)
  }

  async function save(value: string | null) {
    setSaving(true)
    const result = await saveBrandColor(value)
    setSaving(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success(value ? "Color guardado. Ya se ve en tu sistema, tu catálogo y tus facturas." : "Volviste al azul de Avero.")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Color de tu marca</CardTitle>
        <CardDescription>Se usa en los botones de tu sistema, en tu catálogo en línea y en tus facturas y tickets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div role="radiogroup" aria-label="Colores sugeridos" className="flex flex-wrap gap-3">
          {BRAND_PRESETS.map((p) => (
            <button
              key={p.hex}
              type="button"
              role="radio"
              aria-checked={color === p.hex}
              aria-label={p.label}
              title={p.label}
              onClick={() => pick(p.hex)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/20 ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: p.hex }}
            >
              {color === p.hex && <Check className="h-5 w-5 text-white" aria-hidden />}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="brand-picker">Otro color</Label>
            <input
              id="brand-picker"
              type="color"
              value={color}
              onChange={(e) => pick(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-md border bg-transparent p-1"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand-hex">Código</Label>
            <Input
              id="brand-hex"
              value={hexText}
              onChange={(e) => {
                setHexText(e.target.value)
                const hex = normalizeHex(e.target.value)
                if (hex) setColor(hex)
              }}
              className="w-32 font-mono"
              maxLength={7}
            />
          </div>
        </div>

        <div className="rounded-xl border p-4" {...(brandProps(color) as React.HTMLAttributes<HTMLDivElement>)}>
          <p className="mb-3 text-xs text-muted-foreground">Vista previa</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button">Cobrar RD$1,250.00</Button>
            <Button type="button" variant="outline">Ver ticket</Button>
            <span className="text-sm font-medium text-primary">Enlace de ejemplo</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-between">
        <Button type="button" variant="ghost" disabled={saving || current === null} onClick={() => save(null)}>
          Volver al azul de Avero
        </Button>
        <Button type="button" disabled={saving || color === current} onClick={() => save(color)}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Guardar color
        </Button>
      </CardFooter>
    </Card>
  )
}

/** Configuración → Inicio del dashboard: show, hide and order the cards. */
export function DashboardWidgetsForm({ current }: { current: WidgetSetting[] }) {
  const router = useRouter()
  const [widgets, setWidgets] = useState(current)
  const [saving, setSaving] = useState(false)
  const info = new Map(DASHBOARD_WIDGETS.map((w) => [w.id, w]))

  function move(index: number, delta: -1 | 1) {
    setWidgets((list) => {
      const next = [...list]
      const target = index + delta
      if (target < 0 || target >= next.length) return list
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function save() {
    setSaving(true)
    const result = await saveDashboardWidgets(widgets)
    setSaving(false)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Listo. Tu inicio ya muestra estas tarjetas.")
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicio del dashboard</CardTitle>
        <CardDescription>Escoge qué ves al entrar y en qué orden.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="divide-y rounded-xl border">
          {widgets.map((w, i) => {
            const meta = info.get(w.id)!
            return (
              <li key={w.id} className={cn("flex items-center gap-3 p-3", !w.visible && "opacity-60")}>
                <Checkbox
                  id={`widget-${w.id}`}
                  checked={w.visible}
                  onCheckedChange={(checked) =>
                    setWidgets((list) => list.map((x) => (x.id === w.id ? { ...x, visible: checked === true } : x)))
                  }
                />
                <Label htmlFor={`widget-${w.id}`} className="flex-1 cursor-pointer font-normal">
                  <span className="block font-medium">{meta.label}</span>
                  <span className="block text-xs text-muted-foreground">{meta.hint}</span>
                </Label>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Subir ${meta.label}`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Bajar ${meta.label}`} disabled={i === widgets.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
      <CardFooter className="justify-end border-t pt-6">
        <Button type="button" onClick={save} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Guardar inicio
        </Button>
      </CardFooter>
    </Card>
  )
}
