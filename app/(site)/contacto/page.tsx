import type { Metadata } from "next"
import { MapPin, Mail, MessageCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { CONTACT_EMAIL, LOCATION, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
  title: "Contacto",
  description: "Escríbenos por WhatsApp o correo. Avero Technology, Santo Domingo, República Dominicana.",
}

export default function ContactoPage() {
  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: WHATSAPP_DISPLAY,
      href: whatsappUrl("Hola Avero Technology, quisiera más información."),
      external: true,
    },
    { icon: Mail, title: "Correo", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false },
    { icon: MapPin, title: "Ubicación", value: LOCATION },
    { icon: Truck, title: "Cobertura", value: "Santo Domingo y alrededores. Otras provincias, coordinamos el envío." },
  ]

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeading
          as="h1"
          title="Hablemos"
          description="La forma más rápida de contactarnos es por WhatsApp."
          className="mb-10"
        />
        <div className="text-center mb-14">
          <Button size="lg" className="rounded-full px-8 text-[14px] font-normal" asChild>
            <a href={whatsappUrl("Hola Avero Technology, quisiera más información.")} target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
            </a>
          </Button>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {channels.map((c) => (
            <li key={c.title} className="rounded-3xl border border-pale-mist/70 bg-card p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-fog-white dark:bg-white/5 flex items-center justify-center text-sapphire dark:text-sky-signal shrink-0">
                <c.icon className="w-5 h-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-caption uppercase tracking-wider text-pewter">{c.title}</h2>
                {c.href ? (
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-body text-obsidian dark:text-foreground hover:text-sapphire dark:hover:text-sky-signal break-words"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="text-body text-obsidian dark:text-foreground">{c.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
