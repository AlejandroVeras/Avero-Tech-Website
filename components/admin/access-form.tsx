"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAccount, setAccess } from "@/lib/data/admin-actions"
import { ACCESS_KINDS, type AccessKind, type PaidPlan } from "@/lib/admin"
import { appUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

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

/** YYYY-MM-DD in Santo Domingo, `months` months (or `days` days) from today. */
function dateFromToday({ months = 0, days = 0 }: { months?: number; days?: number }) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  d.setDate(d.getDate() + days)
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(d)
}

function defaultUntil(kind: AccessKind, plan: PaidPlan) {
  if (kind === "courtesy") return ""
  if (kind === "trial") return dateFromToday({ days: 30 })
  return dateFromToday({ months: plan === "annual" ? 12 : 1 })
}

/** Strong random password that passes lib/password-policy: Xxxx-xxxx-0000-!. */
function generatePassword() {
  const letters = "abcdefghjkmnpqrstuvwxyz"
  const pick = (set: string) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length]
  const word = () => pick(letters).toUpperCase() + Array.from({ length: 4 }, () => pick(letters)).join("")
  const digits = Array.from({ length: 4 }, () => pick("23456789")).join("")
  return `${word()}-${word()}-${digits}${pick("!#$%*?")}`
}

function AccessFields({
  kind,
  plan,
  until,
  onKind,
  onPlan,
  onUntil,
  disabled,
}: {
  kind: AccessKind
  plan: PaidPlan
  until: string
  onKind: (k: AccessKind) => void
  onPlan: (p: PaidPlan) => void
  onUntil: (d: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Tipo de acceso" className="grid gap-2 sm:grid-cols-3">
        {ACCESS_KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            role="radio"
            aria-checked={kind === k.id}
            disabled={disabled}
            onClick={() => onKind(k.id)}
            className={cn(
              "rounded-lg border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              kind === k.id ? "border-primary bg-primary/10" : "hover:bg-muted",
            )}
          >
            <span className="block font-medium">{k.label}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{k.hint}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {kind === "paid" && (
          <div className="space-y-1.5">
            <Label htmlFor="access-plan">Plan</Label>
            <select
              id="access-plan"
              value={plan}
              disabled={disabled}
              onChange={(e) => onPlan(e.target.value as PaidPlan)}
              className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
            >
              <option value="monthly">Mensual</option>
              <option value="annual">Anual</option>
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="access-until">{kind === "courtesy" ? "Hasta (opcional)" : "Acceso hasta"}</Label>
          <Input
            id="access-until"
            type="date"
            value={until}
            required={kind !== "courtesy"}
            disabled={disabled}
            onChange={(e) => onUntil(e.target.value)}
          />
          {kind === "courtesy" && !until && <p className="text-xs text-muted-foreground">Sin fecha: cortesía sin vencimiento.</p>}
        </div>
      </div>
    </div>
  )
}

function useAccessState(initialKind: AccessKind = "paid") {
  const [kind, setKind] = useState<AccessKind>(initialKind)
  const [plan, setPlan] = useState<PaidPlan>("monthly")
  const [until, setUntil] = useState(defaultUntil(initialKind, "monthly"))
  return {
    kind,
    plan,
    until,
    onKind: (k: AccessKind) => {
      setKind(k)
      setUntil(defaultUntil(k, plan))
    },
    onPlan: (p: PaidPlan) => {
      setPlan(p)
      setUntil(defaultUntil("paid", p))
    },
    onUntil: setUntil,
  }
}

/** On a business's page: change its access to paid / courtesy / trial up to a date. */
export function SetAccessForm({ account }: { account: string }) {
  const router = useRouter()
  const access = useAccessState()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(undefined)
    const fd = new FormData()
    fd.set("account", account)
    fd.set("kind", access.kind)
    fd.set("plan", access.plan)
    fd.set("until", access.until)
    const result = await setAccess(fd)
    setSaving(false)
    if (result.error) setMessage({ type: "error", text: result.error })
    else {
      setMessage({ type: "ok", text: "Acceso actualizado." })
      router.refresh()
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Feedback message={message} />
      <AccessFields {...access} disabled={saving} />
      <p className="text-xs text-muted-foreground">
        Reemplaza la fecha actual. Para dejar constancia de un cobro usa “Registrar pago”.
      </p>
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar acceso"}</Button>
    </form>
  )
}

/** /admin/negocios/nuevo: creates the login and its access in one step. */
export function CreateAccountForm() {
  const access = useAccessState()
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState(generatePassword)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message>()
  const [created, setCreated] = useState<{ id: string; email: string; password: string; warning?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(undefined)
    const fd = new FormData()
    fd.set("businessName", businessName)
    fd.set("email", email)
    fd.set("password", password)
    fd.set("kind", access.kind)
    fd.set("plan", access.plan)
    fd.set("until", access.until)
    const result = await createAccount(fd)
    setSaving(false)
    if (result.error || !result.id) {
      setMessage({ type: "error", text: result.error ?? "No se pudo crear el usuario." })
      return
    }
    setCreated({ id: result.id, email: email.trim().toLowerCase(), password, warning: result.warning })
  }

  if (created) {
    const loginUrl = appUrl("/login")
    const text = `Tu acceso a Avero Inventario:\n${loginUrl}\nCorreo: ${created.email}\nContraseña: ${created.password}\n\nTe recomendamos cambiar la contraseña al entrar.`
    return (
      <div className="space-y-4">
        <Feedback message={{ type: "ok", text: "Usuario creado. Ya puede entrar." }} />
        {created.warning && <Feedback message={{ type: "error", text: created.warning }} />}
        <pre className="whitespace-pre-wrap rounded-lg border bg-muted/50 p-4 text-sm">{text}</pre>
        <p className="text-xs text-muted-foreground">La contraseña no se vuelve a mostrar. Cópiala ahora y envíasela al cliente.</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(text)
              setCopied(true)
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copiado" : "Copiar datos de acceso"}
          </Button>
          <Button asChild>
            <Link href={`/admin/negocios/${created.id}`}>Ver negocio</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Feedback message={message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="businessName">Nombre del negocio</Label>
          <Input id="businessName" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={saving} placeholder="Ej: Boutique Ana" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo del cliente</Label>
          <Input id="email" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} disabled={saving} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña temporal</Label>
          <div className="flex gap-2">
            <Input id="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={saving} className="font-mono" />
            <Button type="button" variant="outline" size="icon" aria-label="Generar otra contraseña" onClick={() => setPassword(generatePassword())} disabled={saving}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Acceso</p>
        <AccessFields {...access} disabled={saving} />
      </div>

      <Button type="submit" disabled={saving}>{saving ? "Creando..." : "Crear usuario"}</Button>
    </form>
  )
}
