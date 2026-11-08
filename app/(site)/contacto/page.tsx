import { Mail, MapPin, MessageCircle, Truck } from "lucide-react"
import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { PENDING } from "@/lib/business"
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/site"

const PATH = "/contacto"
const HELLO = whatsappUrl("Hola Avero Technology, quisiera más información.")

const CARDS = [
  { icon: MessageCircle, title: "WhatsApp", value: `${WHATSAPP_DISPLAY} · 24/7`, href: HELLO },
  { icon: Mail, title: "Correo", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, title: "Ubicación", value: "Santo Domingo, República Dominicana. Sin local abierto al público: vamos a tu negocio o trabajamos a distancia." },
  { icon: Truck, title: "Cobertura", value: "Entrega de equipos y soporte en persona en todo Santo Domingo. Servicios digitales en cualquier país." },
]

function ContactCards() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {CARDS.map((c) => (
        <li key={c.title} className="flex gap-4 rounded-[28px] border border-pale-mist/70 bg-card p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
            <c.icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-caption uppercase tracking-wider text-pewter">{c.title}</h2>
            {c.href ? (
              <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="break-words text-[15px] text-obsidian dark:text-foreground hover:text-sapphire dark:hover:text-sky-signal">
                {c.value}
              </a>
            ) : (
              <p className="text-[15px] text-obsidian dark:text-foreground">{c.value}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

const spec: PageSpec = {
  path: PATH,
  title: "Contacto y cotizaciones en Santo Domingo",
  description: "Escríbenos por WhatsApp al (829) 812-2103 o a info@averotechnology.com. Respondemos al momento, 24/7. Santo Domingo, República Dominicana.",
  pageType: "ContactPage",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Contacto", href: PATH },
  ],
  hero: {
    eyebrow: "Contacto",
    h1: "Contacto",
    intro: "La forma más rápida de hablar con nosotros es WhatsApp. Respondemos al momento, las 24 horas, todos los días.",
    primary: { label: "Escribir por WhatsApp", href: HELLO },
    secondary: { label: "Enviar un correo", href: `mailto:${CONTACT_EMAIL}` },
    visual: <ContactCards />,
  },
  blocks: [
    {
      k: "section",
      tone: "fog",
      q: "¿Qué te conviene enviarnos para cotizar?",
      a: "Con estos datos te damos una idea de precio en la misma conversación:",
      items: [
        {
          k: "check",
          items: [
            "**Página web:** a qué se dedica tu negocio, si tienes dominio y si necesitas catálogo.",
            "**Portal o sistema:** qué proceso quieres resolver y quiénes lo usarían.",
            "**SEO:** el enlace de tu página y las zonas donde están tus clientes.",
            "**Chatbot o IA:** qué preguntan más tus clientes o qué tarea quieres automatizar.",
            "**Soporte técnico:** qué falla, en qué equipo y en qué sector de Santo Domingo estás.",
            "**Equipos:** el modelo que buscas o el uso que le darás y tu presupuesto.",
          ],
        },
      ],
    },
    { k: "faq", title: "Preguntas frecuentes", after: { href: "/preguntas-frecuentes", label: "Ver todas las preguntas frecuentes" } },
  ],
  faq: [
    { question: "¿Cuál es el teléfono de Avero Technology?", answer: "El (829) 812-2103, por WhatsApp. Atendemos las 24 horas, todos los días." },
    { question: "¿Tienen oficina para visitar?", answer: "No tenemos local abierto al público. Vamos a tu negocio en Santo Domingo o trabajamos contigo por videollamada y WhatsApp." },
    { question: "¿Cuánto tardan en responder?", answer: PENDING.emailResponseTime ? `Al momento, por WhatsApp. Por correo, ${PENDING.emailResponseTime}.` : "Al momento, por WhatsApp, las 24 horas." },
    { question: "¿La cotización tiene costo?", answer: "No. La conversación inicial y la propuesta con precio cerrado no tienen costo ni compromiso." },
  ],
}

export const metadata = contentMetadata(spec)

export default function ContactPage() {
  return <ContentPage spec={spec} />
}
