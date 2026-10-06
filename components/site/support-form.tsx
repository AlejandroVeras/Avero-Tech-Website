"use client"

import { useState } from "react"
import { CheckCircle2, MessageCircle, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitSupportRequest, type SupportResult } from "@/lib/data/support"
import { whatsappUrl } from "@/lib/site"

const PROBLEM_TYPES = {
  hardware: "Falla de hardware",
  software: "Problema de software",
  network: "Red / Internet",
  server: "Servidor",
  security: "Seguridad / Virus",
  other: "Otro",
} as const

type ProblemType = keyof typeof PROBLEM_TYPES

const EMPTY = { name: "", email: "", phone: "", problemType: "hardware" as ProblemType, description: "", website: "" }

export function SupportForm() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SupportResult & { message: string }>()

  const whatsappMessage = (ref?: string) =>
    `*Solicitud de soporte técnico*${ref ? ` (ref. ${ref})` : ""}\n\n` +
    `*Nombre:* ${form.name}\n` +
    `*Email:* ${form.email}\n` +
    (form.phone ? `*Teléfono:* ${form.phone}\n` : "") +
    `*Tipo:* ${PROBLEM_TYPES[form.problemType]}\n` +
    `*Descripción:*\n${form.description}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setResult(undefined)
    const res = await submitSupportRequest(form)
    setSending(false)
    setResult({ ...res, message: whatsappMessage(res.ticketRef) })
  }

  if (result && !result.error) {
    return (
      <Card className="shadow-none border-pale-mist/70 bg-card">
        <CardContent className="py-10 text-center space-y-4" role="status">
          <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 dark:text-green-400" aria-hidden />
          <h3 className="text-xl font-semibold text-obsidian dark:text-foreground">
            {result.saved ? "Recibimos tu solicitud" : "Ya casi"}
          </h3>
          <p className="text-[15px] text-pewter max-w-md mx-auto">
            {result.saved
              ? `Tu número de referencia es ${result.ticketRef}. Para una respuesta más rápida, envíanos también los detalles por WhatsApp.`
              : "Envíanos los detalles por WhatsApp y te respondemos en menos de 2 horas."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
              <a href={whatsappUrl(result.message)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden /> Continuar en WhatsApp
              </a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full text-[14px] font-normal"
              onClick={() => {
                setForm(EMPTY)
                setResult(undefined)
              }}
            >
              Enviar otra solicitud
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-none border-pale-mist/70 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-obsidian dark:text-foreground font-semibold">
          <Wrench className="h-5 w-5 text-sapphire dark:text-sky-signal" aria-hidden />
          Solicitar soporte técnico
        </CardTitle>
        <p className="text-[13px] text-pewter">Completa el formulario y recibirás respuesta por WhatsApp en menos de 2 horas.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4" noValidate={false}>
          {result?.error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
              {result.error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sName">Nombre completo *</Label>
              <Input id="sName" required minLength={2} maxLength={120} autoComplete="name" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Juan Pérez" className="rounded-full border-pale-mist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sEmail">Correo electrónico *</Label>
              <Input id="sEmail" type="email" required maxLength={200} autoComplete="email" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com" className="rounded-full border-pale-mist" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sPhone">Teléfono (opcional)</Label>
              <Input id="sPhone" type="tel" maxLength={40} autoComplete="tel" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="829-000-0000" className="rounded-full border-pale-mist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sType">Tipo de problema *</Label>
              <Select value={form.problemType} onValueChange={(v) => setForm((p) => ({ ...p, problemType: v as ProblemType }))}>
                <SelectTrigger id="sType" className="rounded-full border-pale-mist w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PROBLEM_TYPES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sDesc">Descripción del problema *</Label>
            <Textarea id="sDesc" required minLength={10} maxLength={4000} rows={4} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Mi laptop no enciende, se queda en pantalla negra..."
              className="resize-none rounded-2xl border-pale-mist" />
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="sWebsite">No llenes este campo</label>
            <input id="sWebsite" tabIndex={-1} autoComplete="off" value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
          </div>
          <Button type="submit" size="lg" disabled={sending} className="w-full rounded-full text-[14px] font-normal">
            {sending ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
