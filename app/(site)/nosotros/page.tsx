import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { PENDING } from "@/lib/business"
import { ENTITY_DEFINITION, FOUNDER, whatsappUrl } from "@/lib/site"

const PATH = "/nosotros"
const live = PENDING.assistantLiveSince ? "En producción" : "En pruebas"

function FounderCard() {
  return (
    <div className="mx-auto max-w-[420px] rounded-[28px] border border-pale-mist/70 bg-card p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,40,90,0.3)]">
      {PENDING.founderPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={PENDING.founderPhotoUrl} alt={`${FOUNDER}, fundador de Avero Technology, en Santo Domingo`} className="mx-auto h-40 w-40 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#0058b3] via-[#0071e3] to-[#2997ff] text-3xl font-semibold text-white">AV</span>
      )}
      <p className="mt-5 text-xl font-semibold text-obsidian dark:text-foreground">{FOUNDER}</p>
      <p className="text-[14px] text-pewter">Fundador de Avero Technology</p>
      <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[["2024", "inicio"], ["3", "sistemas"], ["24/7", "WhatsApp"]].map(([v, l]) => (
          <div key={l} className="flex flex-col-reverse rounded-2xl bg-fog-white dark:bg-white/5 p-3">
            <dt className="text-[12px] text-pewter">{l}</dt>
            <dd className="text-lg font-semibold text-obsidian dark:text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const spec: PageSpec = {
  path: PATH,
  title: "Quiénes somos y cómo trabajamos",
  description: "Quién está detrás de Avero Technology, dónde trabajamos, qué hemos construido y cómo es nuestro método, de la primera llamada a la entrega.",
  pageType: "AboutPage",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Quiénes somos", href: PATH },
  ],
  hero: {
    eyebrow: "Quiénes somos",
    h1: "Quiénes somos",
    intro: `${ENTITY_DEFINITION} La fundó ${FOUNDER} en 2024. Trabajamos desde Santo Domingo, sin local abierto al público: vamos a donde está el cliente o trabajamos a distancia. Respondemos por WhatsApp las 24 horas, todos los días.`,
    primary: { label: "Escribir por WhatsApp", href: whatsappUrl("Hola Avero Technology") },
    secondary: { label: "Ver servicios", href: "/servicios" },
    visual: <FounderCard />,
  },
  blocks: [
    {
      k: "section",
      q: "¿Quién está detrás de Avero Technology?",
      a: `${FOUNDER}, fundador de Avero Technology. Alejandro dirige la empresa y responde personalmente por cada proyecto que entregamos: si algo no funciona como se acordó, es a quien le escribes.${PENDING.founderBio ? ` ${PENDING.founderBio}` : ""}`,
      items: PENDING.founderLinkedIn ? [{ k: "link", href: PENDING.founderLinkedIn, label: "Ver perfil de LinkedIn" }] : [],
    },
    {
      k: "section",
      tone: "ice",
      q: "¿Qué hemos construido?",
      a: "Antes de vender un servicio, lo construimos para nosotros. Todo lo de esta lista está en funcionamiento o en pruebas y se puede ver:",
      items: [
        {
          k: "table",
          caption: "Proyectos propios de Avero Technology",
          headers: ["", "Qué es", "Estado"],
          rows: [
            ["averotechnology.com", "Este sitio: catálogo con carrito que envía el pedido por WhatsApp, fichas con datos estructurados y 100 en SEO, accesibilidad y buenas prácticas en Lighthouse móvil.", "En producción"],
            ["[Avero Inventario](/sistemas/inventario)", "Inventario, ventas a crédito, facturas con ITBIS y catálogo en línea para pequeños negocios.", "En producción"],
            ["[Avero Citas](/sistemas/citas)", "Reservas en línea, recordatorios, agenda del equipo y comisiones para barberías, salones y consultorios.", "En producción"],
            ["[Avero Condominios](/sistemas/condominios)", "Cuotas, gas, comprobantes y estado de cuenta por apartamento para administradores.", "En producción"],
            ["[Asistente de ventas con IA](/servicios/chatbots-ia-whatsapp#caso)", "Atiende por WhatsApp y en este sitio con el catálogo real; probado en 10 escenarios con un juez de naturalidad.", live],
          ],
        },
        ...(PENDING.projectsDelivered !== null ? [{ k: "prose" as const, text: [`Proyectos entregados a clientes: ${PENDING.projectsDelivered}.`] }] : []),
      ],
    },
    {
      k: "section",
      q: "¿Cómo trabajamos?",
      a: "Con cinco reglas que aplicamos a todos los proyectos, desde una página de presentación hasta una plataforma:",
      items: [
        {
          k: "steps",
          steps: [
            { title: "Entender antes de proponer", text: "La primera conversación es sobre tu negocio, no sobre tecnología." },
            { title: "Precio cerrado y por escrito", text: "Sabes cuánto cuesta y cuánto tarda antes de empezar." },
            { title: "Avances cortos", text: "Ves el trabajo seguido y corriges a tiempo." },
            { title: "Probar antes de publicar", text: "Velocidad, permisos, precios y casos difíciles. Si hay IA, la ponemos a prueba con mensajes difíciles antes de que hable con un cliente." },
            { title: "Todo a tu nombre", text: "Dominio, código, datos y accesos son tuyos." },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Dónde trabajamos?",
      a: "En Santo Domingo, República Dominicana. Entregamos equipos y damos soporte técnico en persona en todo Santo Domingo. Los servicios digitales los damos a distancia para clientes de toda República Dominicana, Latinoamérica, Estados Unidos y cualquier otro país.",
      items: [
        {
          k: "table",
          caption: "Datos de la empresa",
          headers: ["Dato", "Valor"],
          rows: [
            ["Nombre", "Avero Technology"],
            ["Fundador", FOUNDER],
            ["Año de inicio", "2024"],
            ["Ubicación", "Santo Domingo, República Dominicana (sin local abierto al público)"],
            ["Horario", "24 horas, todos los días"],
            ["WhatsApp", "[(829) 812-2103](https://wa.me/18298122103)"],
            ["Correo", "[info@averotechnology.com](mailto:info@averotechnology.com)"],
            ...(PENDING.legalNameAndRnc ? [["Razón social y RNC", PENDING.legalNameAndRnc]] : []),
          ],
        },
      ],
    },
    { k: "faq", title: "Preguntas frecuentes" },
    {
      k: "cta",
      title: "Hablemos de tu negocio",
      text: "Escríbenos por WhatsApp con una línea sobre lo que quieres resolver. Te responde alguien de Avero al momento, a cualquier hora.",
      primary: { label: "Escribir por WhatsApp", href: whatsappUrl("Hola Avero Technology") },
      secondary: { label: "Ver servicios", href: "/servicios" },
    },
  ],
  faq: [
    { question: "¿Quién es el dueño de Avero Technology?", answer: "Alejandro Veras, que fundó la empresa en 2024 en Santo Domingo." },
    { question: "¿Avero Technology tiene oficina?", answer: "No tiene local abierto al público. Atiende por WhatsApp las 24 horas, visita a los clientes en Santo Domingo y trabaja a distancia para el resto del país y el mundo." },
    { question: "¿Avero Technology es confiable?", answer: "Puedes comprobar su trabajo antes de contratar: este sitio, los sistemas Avero Inventario, Avero Citas y Avero Condominios, y el asistente de ventas con IA están a la vista y se pueden probar. Además, los precios se dan cerrados y por escrito." },
    { question: "¿Desde cuándo existe Avero Technology?", answer: "Desde 2024." },
  ],
}

export const metadata = contentMetadata(spec)

export default function AboutPage() {
  return <ContentPage spec={spec} />
}
