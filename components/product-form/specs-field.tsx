"use client"

import { Plus, Trash2, ListPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MAX_SPECS, type Spec } from "@/lib/catalog"

export function SpecsField({
  specs,
  onChange,
  disabled,
  template,
  example = { label: "Ej: Característica", value: "Ej: Valor" },
}: {
  specs: Spec[]
  onChange: (specs: Spec[]) => void
  disabled?: boolean
  /** Shortcut that adds the usual rows for this kind of business (lib/business-setup.ts). */
  template?: { label: string; fields: string[] } | null
  /** Greyed-out example for empty rows, matching the kind of business. */
  example?: { label: string; value: string }
}) {
  const update = (i: number, patch: Partial<Spec>) =>
    onChange(specs.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  const addTemplate = () => {
    const existing = new Set(specs.map((s) => s.label.trim().toLowerCase()))
    if (!template) return
    const missing = template.fields.filter((l) => !existing.has(l.toLowerCase())).map((label) => ({ label, value: "" }))
    onChange([...specs, ...missing].slice(0, MAX_SPECS))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Especificaciones</Label>
        {template && (
          <Button type="button" variant="ghost" size="sm" onClick={addTemplate} disabled={disabled}>
            <ListPlus className="h-4 w-4" /> {template.label}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Se muestran en la página del producto. Las filas vacías no se guardan.
      </p>
      {specs.length > 0 && (
        <ul className="space-y-2">
          {specs.map((s, i) => (
            <li key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
              <Input
                aria-label={`Característica ${i + 1}`}
                placeholder={example.label}
                value={s.label}
                maxLength={60}
                disabled={disabled}
                onChange={(e) => update(i, { label: e.target.value })}
              />
              <Input
                aria-label={`Valor de la característica ${i + 1}`}
                placeholder={example.value}
                value={s.value}
                maxLength={200}
                disabled={disabled}
                onChange={(e) => update(i, { value: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Eliminar característica ${i + 1}`}
                disabled={disabled}
                onClick={() => onChange(specs.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {specs.length < MAX_SPECS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onChange([...specs, { label: "", value: "" }])}
        >
          <Plus className="h-4 w-4" /> Agregar característica
        </Button>
      )}
    </div>
  )
}
