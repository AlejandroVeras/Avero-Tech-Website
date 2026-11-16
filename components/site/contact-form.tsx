"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LEAD_SERVICES, type LeadService } from "@/lib/contact-lead"
import { submitContactLead } from "@/lib/data/contact"
import { whatsappUrl } from "@/lib/site"

type Form = {
  name: string
  email: string
  phone: string
  company: string
  service: LeadService | ""
  message: string
  consent: boolean
  website: string
}

const EMPTY: Form = { name: "", email: "", phone: "", company: "", service: "", message: "", consent: false, website: "" }

function pageContext() {
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = params.get(k)
    if (v) utm[k] = v.slice(0, 200)
  }
  return {
    pageUri: window.location.href.slice(0, 500),
    pageName: document.title.slice(0, 200),
    language: (document.documentElement.lang?.startsWith("en") ? "en" : "es") as "es" | "en",
    utm,
  }
}

export function ContactForm({ defaultService }: { defaultService?: LeadService }) {
  const [form, setForm] = useState<Form>({ ...EMPTY, service: defaultService ?? "" })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((p) => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.service) return setError("Elige el servicio que te interesa")
    if (!form.consent) return setError("Acepta la política de privacidad para enviar el formulario")
    setSending(true)
    setError(undefined)
    const res = await submitContactLead({ ...form, service: form.service, consent: true, ...pageContext() }).catch(() => ({
      ok: false,
      error: "No pudimos enviar tu mensaje. Escríbenos por WhatsApp y te respondemos al momento.",
    }))
    setSending(false)
    if (res.ok) setDone(true)
    else setError(res.error)
  }

  if (done) {
    return (
      <Card className="shadow-none border-pale-mist/70 bg-card">
        <CardContent className="py-10 text-center space-y-4" role="status">
          <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 dark:text-green-400" aria-hidden />
          <h3 className="text-xl font-semibold text-obsidian dark:text-foreground">Recibimos tu mensaje</h3>
          <p className="text-[15px] text-pewter max-w-md mx-auto">
            Te contactamos pronto por WhatsApp o por correo. Si te urge, escríbenos ahora y te respondemos al momento.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
              <a href={whatsappUrl(`Hola Avero Technology, soy ${form.name}. Les acabo de escribir desde el formulario de la página.`)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden /> Escribir por WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full text-[14px] font-normal" onClick={() => { setForm(EMPTY); setDone(false) }}>
              Enviar otro mensaje
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
          <Send className="h-5 w-5 text-sapphire dark:text-sky-signal" aria-hidden />
          Pide tu cotización
        </CardTitle>
        <p className="text-[13px] text-pewter">Sin costo ni compromiso. Te respondemos por WhatsApp o por correo.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cName">Nombre completo *</Label>
              <Input id="cName" required minLength={2} maxLength={120} autoComplete="name" value={form.name}
                onChange={(e) => set("name", e.target.value)} placeholder="Juan Pérez" className="rounded-full border-pale-mist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cEmail">Correo electrónico *</Label>
              <Input id="cEmail" type="email" required maxLength={200} autoComplete="email" value={form.email}
                onChange={(e) => set("email", e.target.value)} placeholder="tu@email.com" className="rounded-full border-pale-mist" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cPhone">Teléfono o WhatsApp *</Label>
              <Input id="cPhone" type="tel" required maxLength={40} autoComplete="tel" value={form.phone}
                onChange={(e) => set("phone", e.target.value)} placeholder="829-000-0000" className="rounded-full border-pale-mist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cCompany">Empresa (opcional)</Label>
              <Input id="cCompany" maxLength={120} autoComplete="organization" value={form.company}
                onChange={(e) => set("company", e.target.value)} placeholder="Nombre de tu negocio" className="rounded-full border-pale-mist" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cService">Servicio de interés *</Label>
            <Select value={form.service} onValueChange={(v) => set("service", v as LeadService)}>
              <SelectTrigger id="cService" className="rounded-full border-pale-mist w-full"><SelectValue placeholder="Elige una opción" /></SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_SERVICES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cMessage">¿En qué te podemos ayudar? *</Label>
            <Textarea id="cMessage" required minLength={10} maxLength={4000} rows={4} value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Cuéntanos a qué se dedica tu negocio y qué necesitas..."
              className="resize-none rounded-2xl border-pale-mist" />
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="cConsent" checked={form.consent} onCheckedChange={(v) => set("consent", v === true)} className="mt-0.5" />
            <Label htmlFor="cConsent" className="text-[13px] font-normal leading-snug text-pewter">
              Acepto que Avero Technology guarde mis datos para responder a mi solicitud, según la{" "}
              <Link href="/privacidad" className="underline hover:text-sapphire dark:hover:text-sky-signal">política de privacidad</Link>.
            </Label>
          </div>
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="cWebsite">No llenes este campo</label>
            <input id="cWebsite" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </div>
          <Button type="submit" size="lg" disabled={sending} className="w-full rounded-full text-[14px] font-normal">
            {sending ? "Enviando..." : "Enviar mensaje"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
