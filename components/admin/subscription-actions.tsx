"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { changeSubscription, recordPayment } from "@/lib/data/admin-actions"
import type { SystemPlan } from "@/lib/systems"

type Message = { type: "ok" | "error"; text: string } | undefined

function Feedback({ message }: { message: Message }) {
  if (!message) return null
  return (
    <p
      role={message.type === "error" ? "alert" : "status"}
      className={
        message.type === "error"
          ? "rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-100"
          : "rounded-md border border-green-200 bg-green-50 p-2.5 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-100"
      }
    >
      {message.text}
    </p>
  )
}

export function RecordPaymentForm({ account, plan }: { account: string; plan?: SystemPlan }) {
  const router = useRouter()
  const [planId, setPlanId] = useState<"monthly" | "annual" | "courtesy">("monthly")
  const [months, setMonths] = useState("1")
  const [amount, setAmount] = useState(plan ? String(plan.monthly_usd) : "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>()

  function choosePlan(value: "monthly" | "annual" | "courtesy") {
    setPlanId(value)
    if (value === "annual") {
      setMonths("12")
      if (plan?.annual_usd) setAmount(String(plan.annual_usd))
    } else if (value === "monthly") {
      setMonths("1")
      if (plan) setAmount(String(plan.monthly_usd))
    } else {
      setAmount("0")
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSaving(true)
    setMessage(undefined)
    const fd = new FormData(form)
    fd.set("account", account)
    fd.set("plan", planId)
    const result = await recordPayment(fd)
    setSaving(false)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
      return
    }
    setMessage({ type: "ok", text: "Pago registrado y suscripción extendida." })
    form.reset()
    choosePlan("monthly")
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Feedback message={message} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="plan">Plan</Label>
          <Select value={planId} onValueChange={(v) => choosePlan(v as typeof planId)} disabled={saving}>
            <SelectTrigger id="plan" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
              <SelectItem value="courtesy">Cortesía</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="months">Meses</Label>
          <Input id="months" name="months" type="number" min={1} max={36} required value={months} onChange={(e) => setMonths(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Monto</Label>
          <div className="flex gap-2">
            <Input id="amount" name="amount" type="number" min={0} step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} disabled={saving} />
            <select name="currency" aria-label="Moneda" defaultValue="USD" disabled={saving} className="rounded-md border bg-transparent px-2 text-sm">
              <option value="USD">USD</option>
              <option value="DOP">DOP</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="method">Método</Label>
          <Input id="method" name="method" list="payment-methods" required placeholder="Transferencia" disabled={saving} />
          <datalist id="payment-methods">
            <option value="Transferencia" />
            <option value="Efectivo" />
            <option value="Depósito" />
            <option value="Tarjeta" />
          </datalist>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reference">Referencia</Label>
          <Input id="reference" name="reference" placeholder="Número de transacción" disabled={saving} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={2} disabled={saving} />
      </div>
      <p className="text-xs text-muted-foreground">
        Si la suscripción sigue vigente, los meses se suman al final del período actual; si venció o estaba en prueba, cuentan
        desde hoy.
      </p>
      <Button type="submit" disabled={saving}>{saving ? "Registrando..." : "Registrar pago y extender"}</Button>
    </form>
  )
}

export function StatusButtons({ account, hasAccess }: { account: string; hasAccess: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string>()
  const [message, setMessage] = useState<Message>()

  async function run(action: "suspend" | "reactivate" | "courtesy", confirmText: string) {
    if (!window.confirm(confirmText)) return
    setBusy(action)
    setMessage(undefined)
    const fd = new FormData()
    fd.set("account", account)
    fd.set("action", action)
    const result = await changeSubscription(fd)
    setBusy(undefined)
    if (result.error) setMessage({ type: "error", text: result.error })
    else {
      setMessage({ type: "ok", text: "Estado actualizado." })
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <Feedback message={message} />
      <div className="flex flex-wrap gap-2">
        {hasAccess ? (
          <Button variant="destructive" size="sm" disabled={!!busy} onClick={() => run("suspend", "¿Suspender este negocio? Quedará en solo lectura y su tienda dejará de ser pública. No se borra nada.")}>
            {busy === "suspend" ? "Suspendiendo..." : "Suspender"}
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("reactivate", "¿Reactivar? Solo devuelve el acceso si el período pagado sigue vigente; si venció, registra un pago.")}>
            {busy === "reactivate" ? "Reactivando..." : "Reactivar"}
          </Button>
        )}
        <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("courtesy", "¿Dar acceso de cortesía sin vencimiento a este negocio?")}>
          {busy === "courtesy" ? "Guardando..." : "Cortesía sin vencimiento"}
        </Button>
      </div>
    </div>
  )
}
