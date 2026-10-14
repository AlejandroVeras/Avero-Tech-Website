"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SystemIcon, SYSTEM_ICON_NAMES } from "@/components/site/system-icon"
import { saveSystem } from "@/lib/data/admin-actions"
import { slugify } from "@/lib/catalog"
import type { SaasSystem, SystemFeature, SystemPlan } from "@/lib/systems"

type PlanDraft = Omit<SystemPlan, "monthly_usd" | "annual_usd" | "features"> & {
  monthly_usd: string
  annual_usd: string
  features: string
}

function move<T>(list: T[], i: number, delta: number) {
  const next = [...list]
  const [item] = next.splice(i, 1)
  next.splice(i + delta, 0, item)
  return next
}

export function SystemForm({ system }: { system?: SaasSystem }) {
  const router = useRouter()
  const [name, setName] = useState(system?.name ?? "")
  const [slug, setSlug] = useState(system?.slug ?? "")
  const [status, setStatus] = useState(system?.status ?? "proximamente")
  const [published, setPublished] = useState(system?.published ?? false)
  const [features, setFeatures] = useState<SystemFeature[]>(system?.features ?? [])
  const [plans, setPlans] = useState<PlanDraft[]>(
    (system?.plans ?? []).map((p) => ({
      ...p,
      monthly_usd: String(p.monthly_usd),
      annual_usd: p.annual_usd != null ? String(p.annual_usd) : "",
      features: p.features.join("\n"),
    })),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const updateFeature = (i: number, patch: Partial<SystemFeature>) =>
    setFeatures((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const updatePlan = (i: number, patch: Partial<PlanDraft>) => setPlans((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    if (system) fd.set("id", system.id)
    if (system?.externalUrl) fd.set("hadExternalUrl", "true")
    fd.set("status", status)
    fd.set("published", published ? "true" : "false")
    fd.set("slug", slug || slugify(name))
    fd.set("features", JSON.stringify(features.filter((f) => f.title.trim())))
    fd.set(
      "plans",
      JSON.stringify(
        plans.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          monthly_usd: p.monthly_usd,
          annual_usd: p.annual_usd === "" ? undefined : p.annual_usd,
          features: p.features.split("\n").map((l) => l.trim()).filter(Boolean),
        })),
      ),
    )
    const result = await saveSystem(fd)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push("/admin/sistemas")
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" name="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Dirección</Label>
              <div className="flex items-center rounded-md border pl-3 bg-muted/40">
                <span className="text-xs text-muted-foreground">/sistemas/</span>
                <Input id="slug" value={slug} placeholder={slugify(name) || "nombre-del-sistema"} onChange={(e) => setSlug(e.target.value)} className="border-0 shadow-none pl-0.5 focus-visible:ring-0" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="externalUrl">Enlace externo (opcional)</Label>
            <Input id="externalUrl" name="externalUrl" type="url" maxLength={200} defaultValue={system?.externalUrl} placeholder="https://condominios.averotechnology.com" aria-describedby="externalUrl-help" />
            <p id="externalUrl-help" className="text-xs text-muted-foreground">Si el sistema vive en su propio sitio, la tarjeta lleva directo ahí en lugar de a /sistemas/.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Frase corta</Label>
            <Input id="tagline" name="tagline" maxLength={160} defaultValue={system?.tagline} placeholder="Qué hace, en una línea" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} maxLength={1200} defaultValue={system?.description} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audience">Para quién es</Label>
            <Input id="audience" name="audience" maxLength={400} defaultValue={system?.audience} placeholder="Ej: salones de belleza y consultorios" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger id="status" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="proximamente">Próximamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={system?.sortOrder ?? 0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trialDays">Días gratis</Label>
              <Input id="trialDays" name="trialDays" type="number" min={1} max={120} defaultValue={system?.trialDays} placeholder="Los generales" />
            </div>
            <div className="flex items-center gap-2 h-9">
              <Checkbox id="published" checked={published} onCheckedChange={(c) => setPublished(c === true)} />
              <Label htmlFor="published">Publicado en la web</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funciones</CardTitle>
          <CardDescription>Se muestran como tarjetas en la página del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.map((f, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[150px_1fr_1.5fr_auto] gap-2 items-start rounded-md border p-2">
              <Select value={f.icon ?? "sparkles"} onValueChange={(v) => updateFeature(i, { icon: v })}>
                <SelectTrigger aria-label={`Ícono de la función ${i + 1}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...SYSTEM_ICON_NAMES, "sparkles"].map((n) => (
                    <SelectItem key={n} value={n}>
                      <SystemIcon name={n} className="h-4 w-4" /> {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input aria-label={`Título de la función ${i + 1}`} placeholder="Título" maxLength={80} value={f.title} onChange={(e) => updateFeature(i, { title: e.target.value })} />
              <Input aria-label={`Descripción de la función ${i + 1}`} placeholder="Descripción" maxLength={240} value={f.description} onChange={(e) => updateFeature(i, { description: e.target.value })} />
              <div className="flex">
                <Button type="button" variant="ghost" size="icon" aria-label="Subir" disabled={i === 0} onClick={() => setFeatures((x) => move(x, i, -1))}><ArrowUp className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Bajar" disabled={i === features.length - 1} onClick={() => setFeatures((x) => move(x, i, 1))}><ArrowDown className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Eliminar función" onClick={() => setFeatures((x) => x.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((f) => [...f, { icon: "sparkles", title: "", description: "" }])}>
            <Plus className="h-4 w-4" /> Agregar función
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planes</CardTitle>
          <CardDescription>Precios en dólares. Un sistema disponible y publicado necesita al menos un plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((p, i) => (
            <div key={i} className="space-y-3 rounded-md border p-3">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px_auto] gap-2 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor={`plan-name-${i}`}>Nombre</Label>
                  <Input id={`plan-name-${i}`} value={p.name} maxLength={80} onChange={(e) => updatePlan(i, { name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`plan-monthly-${i}`}>US$/mes</Label>
                  <Input id={`plan-monthly-${i}`} type="number" min={0} step="0.01" placeholder="0 = solo anual" value={p.monthly_usd} onChange={(e) => updatePlan(i, { monthly_usd: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`plan-annual-${i}`}>US$/año</Label>
                  <Input id={`plan-annual-${i}`} type="number" min={0} step="0.01" placeholder="Opcional" value={p.annual_usd} onChange={(e) => updatePlan(i, { annual_usd: e.target.value })} />
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Eliminar plan" onClick={() => setPlans((x) => x.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`plan-desc-${i}`}>Descripción</Label>
                <Input id={`plan-desc-${i}`} value={p.description ?? ""} maxLength={200} onChange={(e) => updatePlan(i, { description: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`plan-features-${i}`}>Qué incluye (una línea por punto)</Label>
                <Textarea id={`plan-features-${i}`} rows={4} value={p.features} onChange={(e) => updatePlan(i, { features: e.target.value })} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={plans.length >= 4}
            onClick={() => setPlans((x) => [...x, { id: "", name: "", description: "", monthly_usd: "", annual_usd: "", features: "" }])}
          >
            <Plus className="h-4 w-4" /> Agregar plan
          </Button>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/sistemas")} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar sistema"}</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
