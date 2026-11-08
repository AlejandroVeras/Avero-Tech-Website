import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { CheckList, Section } from "@/components/site/blocks/primitives"
import { Reveal } from "@/components/site/blocks/reveal"
import { ServiceIcon } from "@/components/site/blocks/service-icon"
import { PENDING, hasPrice, priceInline, priceLabel, type PriceKey } from "@/lib/business"
import { SERVICES, SITE_URL, ENTITY_DEFINITION, service, whatsappUrl, type ServiceKey } from "@/lib/site"

const PATH = "/servicios"
const HELP = whatsappUrl("Hola, quiero saber qué servicio necesito")

/** "Desde RD$ X" when confirmed, otherwise a neutral line. */
const from = (key: PriceKey, label: string, suffix = "") => (hasPrice(key) ? `${label} ${priceInline(key, suffix)}` : null)

const OVERVIEW: { key: ServiceKey; anchor: string; q: string; text: string; bullets: (string | null)[]; link: string }[] = [
  {
    key: "web",
    anchor: "paginas-web",
    q: "¿Qué incluye el diseño de páginas web?",
    text: "Diseñamos y programamos la página de tu negocio: textos, diseño para el celular, catálogo con precios, botón de WhatsApp en cada producto, SEO básico y analítica. El dominio queda a tu nombre y aprendes a editarla. Una página de presentación toma de 2 a 3 semanas y una con catálogo, de 3 a 5.",
    bullets: ["Para colmados, clínicas, dealers, inmobiliarias, restaurantes y profesionales.", from("webPresentacion", "Presentación") ?? "Precio cerrado, por escrito y sin costo de cotización.", "Caso real: averotechnology.com, con 100 en SEO en Lighthouse móvil."],
    link: "Ver diseño de páginas web",
  },
  {
    key: "portal",
    anchor: "portales",
    q: "¿Qué es un portal o plataforma a medida?",
    text: "Es un sistema web con usuarios que inician sesión y ven sus propios datos: un portal de clientes con facturas y pedidos, una intranet para tu equipo, un marketplace o una plataforma de reservas. Lo construimos por etapas, con una versión usable cada 2 semanas, y el código queda a tu nombre.",
    bullets: ["Para empresas con procesos que ningún sistema del mercado resuelve bien.", from("portalEsencial", "Portal esencial") ?? "El precio final se fija por escrito tras el descubrimiento.", "Experiencia propia: Avero Inventario, Avero Citas y Avero Condominios."],
    link: "Ver portales y plataformas",
  },
  {
    key: "seo",
    anchor: "seo",
    q: "¿Qué hace el servicio de posicionamiento SEO?",
    text: "Hace que tu negocio aparezca en Google, en Google Maps y en las respuestas de asistentes de IA como ChatGPT y Perplexity. Incluye SEO técnico, perfil de empresa de Google, contenido que responde a lo que busca tu cliente, presencia en directorios y un informe mensual con datos de Search Console y Analytics.",
    bullets: ["Para negocios que ya tienen página y no reciben clientes de Google.", from("seoLocal", "Plan mensual", " al mes") ?? "Empieza con una auditoría y un plan de 90 días.", "Incluye el seguimiento de 20 preguntas clave en los asistentes de IA cada mes."],
    link: "Ver posicionamiento SEO",
  },
  {
    key: "ia",
    anchor: "ia",
    q: "¿Cómo ayuda la inteligencia artificial a un negocio?",
    text: "La IA hace tareas que siguen un patrón: leer comprobantes y facturas, clasificar mensajes, preparar reportes y responder preguntas internas con tus documentos. Empezamos con un piloto en un solo proceso, medimos el tiempo ahorrado y el costo real, y una persona aprueba lo importante.",
    bullets: ["Para pymes que pierden horas en trabajo repetitivo.", from("iaPiloto", "Piloto") ?? "Empieza con un diagnóstico y un piloto en un solo proceso.", "Usamos la API de OpenAI, que no entrena sus modelos con tus datos salvo autorización."],
    link: "Ver IA para tu negocio",
  },
  {
    key: "bot",
    anchor: "chatbots",
    q: "¿Qué hace un chatbot de WhatsApp con IA?",
    text: "Responde a tus clientes por WhatsApp y en tu web a cualquier hora, con tus precios y existencias reales, arma el pedido y te lo pasa solo cuando el cliente lo confirma. No inventa precios y pasa la conversación a una persona cuando hace falta. Usa la conexión oficial de Meta.",
    bullets: ["Para negocios que reciben muchas preguntas repetidas por WhatsApp.", from("botCreacion", "Creación") ?? "Se cotiza por escrito; Meta y la IA se pagan por uso.", "Caso real: nuestro asistente costó US$0.0046 en IA en 10 conversaciones de prueba."],
    link: "Ver chatbots para WhatsApp y web",
  },
  {
    key: "soporte",
    anchor: "soporte",
    q: "¿Qué cubre el soporte técnico?",
    text: "Reparación y mantenimiento de computadoras, redes, servidores, soporte remoto y asesoría de compra. Visitamos negocios en todo Santo Domingo y damos soporte remoto en cualquier lugar. Puedes pedirlo por visita o contratar una iguala mensual con prioridad.",
    bullets: ["Para oficinas, clínicas y comercios sin técnico propio.", from("soporteVisita", "Visita") ?? "Por visita o con una iguala mensual.", "Respuesta inmediata por WhatsApp, 24/7."],
    link: "Ver soporte técnico",
  },
]

function ServiceMap() {
  return (
    <ul aria-label="Servicios" className="grid grid-cols-2 gap-3">
      {OVERVIEW.map((o) => {
        const s = service(o.key)
        return (
          <li key={o.key}>
            <a href={`#${o.anchor}`} className="group flex h-full flex-col rounded-[22px] border border-pale-mist/70 bg-card p-4 transition-colors hover:border-sapphire/40">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                <ServiceIcon name={s.icon} className="h-4 w-4" />
              </span>
              <span className="mt-3 text-[15px] font-semibold text-obsidian dark:text-foreground">{s.name}</span>
              <span className="mt-1 text-[12.5px] text-pewter">{s.menu}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

function Overview() {
  return (
    <Section tone="fog">
      <ul className="grid gap-6 lg:grid-cols-2">
        {OVERVIEW.map((o) => {
          const s = service(o.key)
          return (
            <li key={o.key} id={o.anchor} className="scroll-mt-24">
              <Reveal className="h-full">
                <article className="flex h-full flex-col rounded-[28px] border border-pale-mist/70 bg-card p-7 md:p-9">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-[26px] leading-tight font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">{o.q}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-pewter">{o.text}</p>
                  <CheckList className="mt-5" items={o.bullets.filter(Boolean) as string[]} />
                  <Link href={s.href} className="group mt-auto pt-7 inline-flex items-center gap-1 text-[15px] text-sapphire dark:text-sky-signal">
                    {o.link} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

const PRICE_ROWS: [string, PriceKey, string?][] = [
  ["Página web de presentación", "webPresentacion"],
  ["Página web con catálogo", "webCatalogo"],
  ["Portal esencial", "portalEsencial"],
  ["SEO, plan mensual", "seoLocal", " al mes"],
  ["IA, piloto", "iaPiloto"],
  ["Chatbot con IA, creación", "botCreacion"],
  ["Soporte técnico, visita", "soporteVisita"],
]

const spec: PageSpec = {
  path: PATH,
  title: "Servicios de desarrollo web, SEO e IA",
  description: "Páginas web, portales a medida, SEO, IA para procesos internos, chatbots de WhatsApp y soporte técnico. Qué incluye cada servicio, tiempos y precios.",
  pageType: "CollectionPage",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: PATH },
  ],
  hero: {
    eyebrow: "Servicios",
    h1: "Servicios de tecnología para negocios en República Dominicana",
    intro: `${ENTITY_DEFINITION} En esta página tienes los seis servicios que ofrecemos, para quién es cada uno, cuánto tarda y cuánto cuesta, y cómo elegir por dónde empezar.`,
    primary: { label: "Ayúdame a elegir por WhatsApp", href: HELP },
    secondary: { label: "Ver precios", href: "/precios" },
    micro: "Respondemos al momento, 24/7.",
    visual: <ServiceMap />,
  },
  schemaNodes: [
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}${PATH}#servicios`,
      name: "Servicios de Avero Technology",
      itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}${s.href}`, name: s.name })),
    },
  ],
  blocks: [
    {
      k: "section",
      q: "¿Qué servicio necesito?",
      a: "Empieza por el problema, no por la tecnología. Si quieres que te encuentren, necesitas página web y SEO. Si quieres responder más rápido, un chatbot. Si tu equipo pierde horas en tareas repetitivas o en hojas de Excel, IA o un portal a medida. Esta tabla resume los casos más comunes:",
      items: [
        {
          k: "table",
          caption: "Qué servicio elegir según tu problema",
          headers: ["Si tu problema es…", "Empieza por", "Tiempo para tenerlo"],
          rows: [
            ["No tienes página o la que tienes no te trae clientes", "[Diseño de páginas web](/servicios/diseno-paginas-web)", "2 a 5 semanas"],
            ["Tienes página, pero Google, Maps o ChatGPT no te muestran", "[Posicionamiento SEO](/servicios/posicionamiento-seo)", "Auditoría en 1 semana; resultados en meses"],
            ["Contestas lo mismo por WhatsApp todo el día", "[Chatbots para WhatsApp y web](/servicios/chatbots-ia-whatsapp)", "2 a 4 semanas"],
            ["Tu equipo copia datos, arma reportes o busca información a mano", "[IA para tu negocio](/servicios/inteligencia-artificial-para-negocios)", "Piloto en 2 a 4 semanas"],
            ["Tus clientes o empleados necesitan hacer trámites en línea", "[Portales y plataformas](/servicios/desarrollo-portales-web)", "6 a 16 semanas"],
            ["Se cae la red, las computadoras fallan o no tienes técnico", "[Soporte técnico](/servicios/soporte-tecnico)", "Respuesta inmediata"],
            ["Necesitas inventario, citas o administrar un condominio", "[Nuestros sistemas](/sistemas), listos para usar", "El mismo día"],
          ],
        },
      ],
    },
    { k: "node", node: <Overview /> },
    {
      k: "section",
      q: "¿Cómo trabaja Avero Technology?",
      a: "Todos los servicios siguen el mismo método, el que usamos para construir nuestros propios sistemas: entender el problema antes de proponer, dar un precio cerrado, mostrar avances cortos y probar todo antes de publicarlo.",
      items: [
        {
          k: "steps",
          steps: [
            { title: "Conversación inicial", text: "Sin costo, por WhatsApp o videollamada. Nos cuentas qué quieres resolver." },
            { title: "Propuesta escrita", text: "Alcance, precio y calendario. Si un sistema existente te sirve mejor que un desarrollo, te lo decimos." },
            { title: "Avances cortos", text: "Ves el trabajo cada pocos días o cada 2 semanas, según el proyecto, y corriges a tiempo." },
            { title: "Pruebas antes de publicar", text: "Velocidad, enlaces, permisos, precios y casos difíciles. En nuestro sitio probamos 250 combinaciones de página y pantalla antes de cada cambio grande." },
            { title: "Entrega con accesos", text: "Dominio, código, datos y contraseñas quedan a tu nombre." },
            { title: "Acompañamiento", text: "Seguimos disponibles por WhatsApp 24/7." },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      q: "¿Por qué confiar en Avero Technology?",
      a: "Porque lo que ofrecemos ya lo construimos y lo usamos. Avero Technology empezó en 2024 en Santo Domingo y hoy opera tres sistemas propios en producción, un catálogo de equipos con pedidos por WhatsApp y un asistente de ventas con IA probado con métricas publicadas en esta web.",
      items: [
        {
          k: "table",
          caption: "Lo que construimos y lo que demuestra",
          headers: ["Lo que construimos", "Qué demuestra"],
          rows: [
            ["averotechnology.com", "Diseño web, SEO técnico y datos estructurados: 100 en SEO, accesibilidad y buenas prácticas en Lighthouse móvil."],
            ["[Avero Inventario](/sistemas/inventario)", "Plataforma con muchos negocios en una sola base de datos, facturas con ITBIS y cobro de suscripciones."],
            ["[Avero Citas](/sistemas/citas)", "Reservas en línea para clientes externos con agenda por profesional."],
            ["[Avero Condominios](/sistemas/condominios)", "Portal de clientes: cada propietario ve solo su estado de cuenta y entra con un código."],
            ["[Asistente de ventas con IA](/servicios/chatbots-ia-whatsapp#caso)", "WhatsApp Cloud API, OpenAI, reglas contra precios inventados y pruebas con un juez de naturalidad."],
          ],
        },
        ...(PENDING.projectsDelivered !== null ? [{ k: "prose" as const, text: [`Proyectos entregados a clientes: ${PENDING.projectsDelivered}.`] }] : []),
      ],
    },
    {
      k: "section",
      q: "¿Dónde trabajan?",
      a: "Estamos en Santo Domingo, República Dominicana, y no tenemos local abierto al público. Los servicios digitales (páginas, portales, SEO, IA y chatbots) los damos a distancia para clientes de todo el país, de Latinoamérica, de Estados Unidos y de cualquier otro lugar. El soporte técnico en persona y la entrega de equipos cubren todo Santo Domingo.",
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Cuánto cuestan los servicios?",
      a: "Cada servicio tiene un precio desde, que ves en su página y en la página de [precios](/precios). El precio final es cerrado y se da por escrito antes de empezar. La primera conversación y la cotización no tienen costo.",
      items: PRICE_ROWS.some(([, k]) => hasPrice(k))
        ? [{ k: "table", caption: "Precios desde de cada servicio", headers: ["Servicio", "Desde"], rows: PRICE_ROWS.map(([name, k, suf]) => [name, priceLabel(k, suf)]) }]
        : [{ k: "link", href: "/precios", label: "Ver qué incluye cada paquete" }],
    },
    { k: "faq", title: "Preguntas frecuentes sobre nuestros servicios" },
    {
      k: "cta",
      title: "Cuéntanos qué quieres lograr",
      text: "Escríbenos por WhatsApp con una línea sobre tu negocio y lo que te gustaría resolver. Te respondemos al momento con el servicio que te conviene y una idea del precio.",
      primary: { label: "Escribir por WhatsApp", href: HELP },
      secondary: { label: "Conocer al equipo", href: "/nosotros" },
    },
  ],
  faq: [
    { question: "¿Qué servicios ofrece Avero Technology?", answer: "Diseño de páginas web, desarrollo de portales y plataformas a medida, posicionamiento SEO, inteligencia artificial para negocios, chatbots con IA para WhatsApp y web, y soporte técnico. También vende equipos y ofrece los sistemas Avero Inventario, Avero Citas y Avero Condominios." },
    { question: "¿Trabajan con negocios fuera de Santo Domingo?", answer: "Sí. Los servicios digitales los damos a distancia para cualquier país. El soporte técnico en persona y la entrega de equipos cubren todo Santo Domingo." },
    { question: "¿Cuánto cuesta cotizar?", answer: "Nada. La conversación inicial y la cotización por escrito no tienen costo ni compromiso." },
    { question: "¿Puedo contratar varios servicios juntos?", answer: "Sí. Lo más común es página web con SEO, o página web con chatbot. Te damos una sola propuesta con el calendario de todo." },
    ...(PENDING.paymentTerms ? [{ question: "¿Cómo se paga?", answer: PENDING.paymentTerms }] : []),
    { question: "¿Quién es el dueño de lo que hacen?", answer: "Tú. El dominio, el contenido, el código y los datos quedan a tu nombre al terminar de pagar." },
    { question: "¿En cuánto tiempo responden?", answer: "Al momento, por WhatsApp, las 24 horas, todos los días." },
  ],
}

export const metadata = contentMetadata(spec)

export default function ServicesPage() {
  return <ContentPage spec={spec} />
}
