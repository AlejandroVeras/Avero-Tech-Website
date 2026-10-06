"use client"

import { useState } from "react"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export function SupportForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    problemType: "hardware" as ProblemType,
    description: "",
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg =
      `*Solicitud de soporte técnico*\n\n` +
      `*Nombre:* ${form.name}\n` +
      `*Email:* ${form.email}\n` +
      (form.phone ? `*Teléfono:* ${form.phone}\n` : "") +
      `*Tipo:* ${PROBLEM_TYPES[form.problemType]}\n` +
      `*Descripción:*\n${form.description}`
    window.open(whatsappUrl(msg), "_blank", "noopener")
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
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sName">Nombre completo *</Label>
              <Input id="sName" required autoComplete="name" value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Juan Pérez" className="rounded-full border-pale-mist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sEmail">Correo electrónico *</Label>
              <Input id="sEmail" type="email" required autoComplete="email" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com" className="rounded-full border-pale-mist" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sPhone">Teléfono (opcional)</Label>
              <Input id="sPhone" type="tel" autoComplete="tel" value={form.phone}
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
            <Textarea id="sDesc" required rows={4} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Mi laptop no enciende, se queda en pantalla negra..."
              className="resize-none rounded-2xl border-pale-mist" />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full text-[14px] font-normal">
            Enviar por WhatsApp
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
