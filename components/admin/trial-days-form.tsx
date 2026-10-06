"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateTrialDays } from "@/lib/data/admin-actions"

export function TrialDaysForm({ value }: { value: number }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string }>()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(undefined)
    const result = await updateTrialDays(new FormData(e.currentTarget))
    setSaving(false)
    if (result.error) setMessage({ type: "error", text: result.error })
    else {
      setMessage({ type: "ok", text: "Guardado. Aplica a las cuentas que se registren desde ahora." })
      router.refresh()
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="trialDays">Días de prueba gratis</Label>
          <Input id="trialDays" name="trialDays" type="number" min={1} max={90} required defaultValue={value} className="w-32" />
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </div>
      {message && (
        <p role={message.type === "error" ? "alert" : "status"} className={message.type === "error" ? "text-sm text-red-600" : "text-sm text-green-700 dark:text-green-400"}>
          {message.text}
        </p>
      )}
    </form>
  )
}
