import type { Metadata } from "next"
import { Faq, type FaqEntry } from "@/components/site/faq"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { ActionButton, Byline, Lead, Section } from "@/components/site/blocks/primitives"
import { contentMetadata } from "@/components/site/blocks/content-page"
import { Reveal } from "@/components/site/blocks/reveal"
import { PENDING, hasPrice, priceInline } from "@/lib/business"
import { pageGraph } from "@/lib/schema"
import { whatsappUrl } from "@/lib/site"

const PATH = "/preguntas-frecuentes"
const TITLE = "Preguntas frecuentes sobre webs, SEO e IA"
const DESCRIPTION = "Respuestas cortas sobre precios, tiempos, pagos, garantía, propiedad del dominio y del código, soporte y privacidad de datos en Avero Technology."
const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Preguntas frecuentes", href: PATH },
]

export const metadata: Metadata = contentMetadata({ path: PATH, title: TITLE, description: DESCRIPTION })

const webPrice = hasPrice("webPresentacion") && hasPrice("webCatalogo")
const botPrice = hasPrice("botCreacion") && hasPrice("botOperacion")

const GROUPS: { title: string; entries: FaqEntry[] }[] = [
  {
    title: "Sobre Avero Technology",
    entries: [
      { question: "¿Qué hace Avero Technology?", answer: "Diseña páginas y portales web, hace SEO, crea chatbots e integraciones con IA, desarrolla los sistemas Avero Inventario, Avero Citas y Avero Condominios, vende equipos y da soporte técnico.", link: { href: "/servicios", label: "Ver servicios." } },
      { question: "¿Dónde están y a qué hora atienden?", answer: "En Santo Domingo, sin local abierto al público. Atendemos por WhatsApp al (829) 812-2103 las 24 horas, todos los días." },
      { question: "¿Trabajan con clientes fuera de Santo Domingo?", answer: "Sí. Los servicios digitales los damos a distancia para cualquier país. La entrega de equipos y el soporte en persona cubren todo Santo Domingo." },
    ],
  },
  {
    title: "Páginas web y portales",
    entries: [
      {
        question: "¿Cuánto cuesta una página web?",
        answer: webPrice ? `Una de presentación cuesta ${priceInline("webPresentacion")} y una con catálogo, ${priceInline("webCatalogo")}.` : "Depende de las secciones y funciones. Te damos el precio cerrado por escrito en 24 a 48 horas, sin costo.",
        link: { href: "/servicios/diseno-paginas-web", label: "Ver diseño de páginas web." },
      },
      { question: "¿Cuánto tarda una página web?", answer: "De 2 a 3 semanas una de presentación y de 3 a 5 una con catálogo, desde que tenemos tus fotos y datos." },
      { question: "¿Quién es el dueño del dominio, el código y los datos?", answer: "Tú. Quedan a tu nombre al terminar de pagar." },
      { question: "¿Qué diferencia hay entre una página web y un portal?", answer: "La página muestra lo mismo a todos; el portal tiene usuarios con sesión que ven sus propios datos.", link: { href: "/servicios/desarrollo-portales-web", label: "Ver portales y plataformas." } },
    ],
  },
  {
    title: "SEO, IA y chatbots",
    entries: [
      { question: "¿Pueden garantizar el primer lugar en Google?", answer: "No, y nadie puede. Garantizamos el trabajo del plan y un informe mensual.", link: { href: "/servicios/posicionamiento-seo", label: "Ver posicionamiento SEO." } },
      { question: "¿Cómo logro que ChatGPT recomiende mi negocio?", answer: "Permitiendo su rastreador de búsqueda, con páginas que respondan con datos concretos y con presencia consistente en directorios y medios. Es parte de nuestro plan de SEO." },
      {
        question: "¿Cuánto cuesta un chatbot de WhatsApp?",
        answer: botPrice ? `Creación ${priceInline("botCreacion")} y operación ${priceInline("botOperacion", " al mes")}, más el uso de Meta y de IA.` : "La creación y la operación se cotizan por escrito, sin costo. Aparte se paga el uso de Meta y de IA.",
        link: { href: "/servicios/chatbots-ia-whatsapp", label: "Ver chatbots." },
      },
      { question: "¿El chatbot puede inventar precios?", answer: "El nuestro no: los precios salen solo de tu sistema y el servidor recalcula cada pedido." },
      { question: "¿Es seguro usar IA con los datos de mi empresa?", answer: "Usamos la API de OpenAI, que no entrena con tus datos salvo autorización, y enviamos solo lo necesario.", link: { href: "/servicios/inteligencia-artificial-para-negocios", label: "Ver IA para negocios." } },
    ],
  },
  {
    title: "Sistemas y equipos",
    entries: [
      { question: "¿Puedo probar los sistemas gratis?", answer: "Sí. Avero Inventario y Avero Citas, 30 días; Avero Condominios, 60 días.", link: { href: "/sistemas", label: "Ver sistemas." } },
      { question: "¿Puedo cancelar un sistema cuando quiera?", answer: "Sí, sin penalidad. Mantienes el acceso hasta el final del período pagado y, si no renuevas, la cuenta queda en solo lectura sin borrar nada." },
      { question: "¿Los equipos tienen garantía?", answer: "Sí. El período aparece en cada ficha y en tu factura.", link: { href: "/garantia", label: "Ver garantía y devoluciones." } },
      { question: "¿Cómo pago un equipo?", answer: "Por transferencia o en efectivo." },
      { question: "¿Dan soporte técnico remoto?", answer: "Sí, en cualquier lugar, y en persona en todo Santo Domingo.", link: { href: "/servicios/soporte-tecnico", label: "Ver soporte técnico." } },
    ],
  },
  {
    title: "Pagos y privacidad",
    entries: [
      ...(PENDING.paymentTerms ? [{ question: "¿Cómo pago un servicio?", answer: PENDING.paymentTerms }] : []),
      { question: "¿Qué hacen con mis datos personales?", answer: "Solo los usamos para atenderte, según la Ley 172-13.", link: { href: "/privacidad", label: "Ver privacidad." } },
    ],
  },
]

export default function FaqPage() {
  const all = GROUPS.flatMap((g) => g.entries)
  return (
    <>
      <JsonLd data={pageGraph({ path: PATH, title: `${TITLE} | Avero Technology`, description: DESCRIPTION, crumbs: CRUMBS, faq: all })} />
      <section className="pt-10 md:pt-14 pb-10 bg-background">
        <div className="container mx-auto max-w-3xl px-4">
          <Breadcrumbs crumbs={CRUMBS} className="mb-10" />
          <h1 className="text-[2.35rem] leading-[1.06] sm:text-5xl font-semibold tracking-[-0.03em] text-obsidian dark:text-foreground">Preguntas frecuentes</h1>
          <Lead className="mt-5">Las preguntas que más nos hacen sobre servicios, sistemas, equipos, pagos y privacidad. Si no encuentras la tuya, escríbenos por WhatsApp: respondemos al momento, a cualquier hora.</Lead>
          <Byline path={PATH} className="mt-6" />
          <nav aria-label="Temas" className="mt-8 flex flex-wrap gap-2">
            {GROUPS.map((g, i) => (
              <a key={g.title} href={`#tema-${i}`} className="rounded-full border border-pale-mist px-4 py-1.5 text-[14px] text-obsidian hover:border-sapphire/40 dark:text-foreground">{g.title}</a>
            ))}
          </nav>
        </div>
      </section>
      {GROUPS.map((g, i) => (
        <Section key={g.title} id={`tema-${i}`} narrow tone={i % 2 ? "fog" : "default"} className="!py-12 md:!py-16">
          <Reveal>
            <h2 className="mb-6 text-heading-sm font-semibold text-obsidian dark:text-foreground">{g.title}</h2>
            <Faq entries={g.entries} />
          </Reveal>
        </Section>
      ))}
      <Section narrow className="text-center">
        <p className="text-body text-pewter">¿No encontraste tu pregunta?</p>
        <div className="mt-4 flex justify-center">
          <ActionButton action={{ label: "Preguntar por WhatsApp", href: whatsappUrl("Hola, tengo una pregunta") }} />
        </div>
      </Section>
    </>
  )
}
