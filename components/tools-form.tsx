"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, Loader2, ShoppingCart, Users, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Features } from "@/lib/business-setup"
import { saveTools } from "@/lib/data/business-setup-actions"

const TOOLS: { key: keyof Features; icon: typeof FileText; title: string; text: string }[] = [
  { key: "quickSale", icon: ShoppingCart, title: "Vender en mostrador", text: "Pantalla rápida para cobrar al cliente que llega, sin registrarlo. El recibo sale solo." },
  { key: "customers", icon: Users, title: "Clientes y crédito", text: "Guarda clientes con su RNC y lleva lo que te deben." },
  { key: "quotes", icon: FileText, title: "Cotizaciones", text: "Presupuestos en PDF con tu logo, que luego pasas a factura." },
  { key: "serviceOrders", icon: Wrench, title: "Órdenes de servicio", text: "Para talleres y técnicos: equipo recibido, problema, estado y entrega." },
]

/** Configuración → Herramientas: switch whole sections of the menu on or off. Nothing is deleted. */
export function ToolsForm({ current }: { current: Features }) {
  const router = useRouter()
  const [value, setValue] = useState<Features>(current)
  const [saving, setSaving] = useState(false)
  const changed = TOOLS.some((t) => value[t.key] !== current[t.key])

  async function save() {
    setSaving(true)
    const result = await saveTools(value)
    setSaving(false)
    if (result.error) return toast.error(result.error)
    toast.success("Listo. El menú ya se actualizó.")
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Herramientas del negocio</CardTitle>
        <CardDescription>
          Prende solo lo que usas y el menú queda más simple. Apagar una herramienta no borra nada: al prenderla, todo vuelve.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {TOOLS.map((t) => (
          <label key={t.key} htmlFor={`tool-${t.key}`} className="flex cursor-pointer items-start gap-4 py-4 first:pt-0 last:pb-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <t.icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{t.title}</span>
              <span className="block text-xs text-muted-foreground">{t.text}</span>
            </span>
            <Switch
              id={`tool-${t.key}`}
              checked={value[t.key]}
              onCheckedChange={(on) => setValue((v) => ({ ...v, [t.key]: on }))}
              disabled={saving}
            />
          </label>
        ))}
      </CardContent>
      <CardFooter className="justify-end border-t pt-6">
        <Button onClick={save} disabled={!changed || saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Guardar herramientas
        </Button>
      </CardFooter>
    </Card>
  )
}
