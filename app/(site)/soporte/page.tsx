import type { Metadata } from "next"
import { Monitor, Shield, Wifi, Server, HardDrive, Headphones } from "lucide-react"
import { SectionHeading } from "@/components/site/section-heading"
import { SupportForm } from "@/components/site/support-form"
import { Faq } from "@/components/site/faq"
import { SUPPORT_FAQ } from "@/components/site/faq-content"

export const metadata: Metadata = {
  alternates: { canonical: "/soporte" },
  title: "Soporte técnico IT",
  description: "Reparación, mantenimiento, redes, servidores y consultoría IT en Santo Domingo.",
}

const SERVICES = [
  { icon: Monitor, title: "Reparación", description: "Hardware y software" },
  { icon: Shield, title: "Mantenimiento", description: "Preventivo y correctivo" },
  { icon: Wifi, title: "Redes", description: "Instalación y configuración" },
  { icon: Server, title: "Servidores", description: "Instalación y administración" },
  { icon: HardDrive, title: "Diagnóstico", description: "Análisis completo del equipo" },
  { icon: Headphones, title: "Consultoría", description: "Asesoría IT empresarial" },
]

export default function SoportePage() {
  return (
    <>
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            title="Soporte técnico IT"
            description="Diagnóstico, reparación y consultoría tecnológica profesional"
            className="mb-12"
          />
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-14">
            {SERVICES.map((s) => (
              <li key={s.title} className="rounded-3xl border border-pale-mist/70 bg-card p-5 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal">
                  <s.icon className="w-5 h-5" aria-hidden />
                </div>
                <h2 className="font-semibold text-sm text-obsidian dark:text-foreground">{s.title}</h2>
                <p className="text-xs text-pewter">{s.description}</p>
              </li>
            ))}
          </ul>
          <div className="max-w-2xl mx-auto">
            <SupportForm />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes" className="mb-12" />
          <Faq entries={SUPPORT_FAQ} />
        </div>
      </section>
    </>
  )
}
