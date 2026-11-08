import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { SearchMockup } from "@/components/site/illustrations"
import { SERVICE_PRICES, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { serviceNode } from "@/lib/schema"
import { whatsappUrl } from "@/lib/site"

const PATH = "/servicios/posicionamiento-seo"
const AUDIT = whatsappUrl("Hola, quiero una auditoría SEO")
const priced = hasPrice("seoLocal")
const priceLine = priced
  ? `En Avero, el plan mensual cuesta ${priceInline("seoLocal", " al mes")}.`
  : "Te damos el precio por escrito después de la auditoría."

const spec: PageSpec = {
  path: PATH,
  title: "Agencia de posicionamiento SEO en RD",
  description: "SEO técnico, local, de contenidos y para respuestas de IA (ChatGPT, Perplexity, AI Overviews) para negocios en RD. Auditoría, plan mensual y precios.",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Posicionamiento SEO", href: PATH },
  ],
  hero: {
    eyebrow: "Posicionamiento SEO",
    h1: "Posicionamiento SEO en República Dominicana: Google, Maps y respuestas de IA",
    intro: "Hacemos que tu negocio aparezca cuando alguien lo busca: en los resultados de Google, en Google Maps y en las respuestas de ChatGPT, Perplexity y los resúmenes de IA de Google. Trabajamos con un plan mensual, informes claros y sin promesas de primer lugar.",
    primary: { label: "Pedir una auditoría por WhatsApp", href: AUDIT },
    secondary: { label: "Ver precios", href: "/precios#seo" },
    micro: "Respondemos al momento, 24/7.",
    visual: <SearchMockup />,
  },
  schemaNodes: [serviceNode(PATH, "Posicionamiento SEO y LLMO", "Optimización para motores de búsqueda", "SEO técnico, SEO local, contenidos y optimización para respuestas de IA (ChatGPT, Perplexity, Gemini, Google AI Overviews) para negocios.", { priceFrom: SERVICE_PRICES.seoLocal?.from })],
  blocks: [
    {
      k: "section",
      q: "¿Qué es el posicionamiento SEO?",
      a: "El SEO es el trabajo de hacer que Google y otros buscadores entiendan tu página, confíen en ella y la muestren a quien busca lo que vendes. Incluye la parte técnica (que la página cargue rápido y se pueda leer), el contenido (que responda lo que la gente pregunta) y la autoridad (que otros sitios hablen de ti).",
    },
    {
      k: "section",
      tone: "ice",
      q: "¿Qué es el SEO para inteligencia artificial (LLMO o GEO)?",
      a: "Es el trabajo de que los asistentes de IA, como ChatGPT, Perplexity, Gemini o los resúmenes de IA de Google, mencionen tu negocio cuando alguien les pide una recomendación. Estos asistentes buscan en la web y citan fuentes, así que premian lo mismo que el SEO: contenido claro, datos concretos y una marca de la que se habla en otros sitios.",
      items: [
        { k: "prose", text: ["Google lo dice en su documentación: para aparecer en AI Overviews y AI Mode no hay requisitos adicionales ni marcado especial, y las prácticas de SEO de siempre siguen aplicando ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)). Por eso no vendemos el LLMO como un servicio aparte: va dentro del plan."] },
      ],
    },
    {
      k: "section",
      title: "¿Para quién es?",
      items: [
        {
          k: "table",
          caption: "Qué buscamos que pase según el tipo de negocio",
          headers: ["", "Qué buscamos que pase"],
          rows: [
            ["Clínicas y consultorios", "Salir en Maps para «ginecólogo en Naco» o «pediatra en Santiago» y que el perfil tenga horarios, seguros y reseñas."],
            ["Restaurantes", "Aparecer en «dónde comer» de tu zona, con menú, fotos y horario correctos."],
            ["Inmobiliarias y dealers", "Posicionar cada propiedad o vehículo, y búsquedas como «apartamentos en venta en Piantini»."],
            ["Tiendas y distribuidoras", "Que las fichas de producto salgan en Google con precio y disponibilidad."],
            ["Profesionales y servicios B2B", "Que un gerente que pregunta a ChatGPT «¿quién hace X en República Dominicana?» reciba tu nombre."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Qué incluye el servicio de SEO?",
      items: [
        {
          k: "table",
          caption: "Áreas del servicio de SEO",
          headers: ["", "Qué hacemos"],
          rows: [
            ["SEO técnico", "Velocidad (Core Web Vitals), rastreo e indexación, sitemap con fechas reales, canonical, datos estructurados, errores en Search Console."],
            ["SEO local", "Perfil de empresa de Google completo y verificado, categorías, zonas de servicio, fotos, publicaciones y respuesta a reseñas. Mismo nombre, teléfono y dirección en todos los directorios."],
            ["Contenido", "Investigación de lo que busca tu cliente, páginas de servicio y artículos que responden preguntas reales con datos."],
            ["LLMO / GEO", "Respuestas directas bajo cada pregunta, tablas comparativas, definición clara de tu marca, permiso de acceso para los rastreadores de búsqueda de IA y seguimiento mensual de 20 preguntas clave en ChatGPT, Perplexity, Gemini y Copilot."],
            ["Autoridad", "Alta en directorios de calidad, menciones en medios locales y perfiles de la empresa y del responsable."],
            ["Medición", "Search Console, Google Analytics 4, visitas que llegan desde chatgpt.com y perplexity.ai, e informe mensual en lenguaje sencillo."],
          ],
        },
      ],
    },
    {
      k: "section",
      title: "¿Cómo trabajamos?",
      items: [
        {
          k: "steps",
          steps: [
            { title: "Auditoría", time: "1 semana", text: "Revisamos la parte técnica, el contenido, el perfil de Google, la competencia y qué responden hoy los asistentes de IA sobre tu sector." },
            { title: "Plan de 90 días", time: "2 a 3 días", text: "Una lista priorizada: qué arreglamos primero y qué palabras clave atacamos." },
            { title: "Arreglos técnicos", time: "2 a 4 semanas", text: "Lo que impide que Google lea o valore tu página." },
            { title: "Perfil de Google y directorios", time: "1 a 2 semanas", text: "Verificación, categorías, zonas de servicio y consistencia de datos." },
            { title: "Contenido mensual", time: "Continuo", text: "Páginas y artículos según el plan. Tú apruebas cada texto." },
            { title: "Informe mensual", time: "Cada mes", text: "Qué hicimos, qué cambió y qué sigue." },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Cuánto tarda el SEO en dar resultados?",
      a: "Los arreglos técnicos y el perfil de Google se notan en semanas. Subir posiciones en búsquedas con competencia toma meses, por eso pedimos un mínimo de 4 meses antes de juzgar el plan. Desconfía de quien te prometa el primer lugar: Google lo dice en su guía para contratar SEO, «nadie puede garantizar el puesto número 1 en Google» ([Google Search Central](https://developers.google.com/search/docs/fundamentals/do-i-need-seo)).",
    },
    {
      k: "section",
      id: "precios",
      q: "¿Cuánto cuesta el SEO en República Dominicana?",
      a: `${priceLine} El precio mensual depende de cuántas páginas y artículos producimos y de cuántas zonas o sucursales cubres. Sin contratos de permanencia: recomendamos un mínimo de 4 meses porque es lo que tarda en verse el efecto.`,
      items: [
        {
          k: "pricing",
          cta: { label: "Pedir una auditoría", href: AUDIT },
          tiers: [
            { name: "Auditoría", audience: "Cualquier negocio con página web", price: priceLabel("seoAuditoria"), includes: ["Informe técnico", "SEO local y de contenido", "Qué responden las IA de tu sector", "Plan de 90 días"] },
            { name: "Local", audience: "Negocios con clientes en una zona", price: priceLabel("seoLocal", " al mes"), featured: true, includes: ["Perfil de empresa de Google", "Directorios y reseñas", "2 contenidos al mes", "Informe mensual"] },
            { name: "Crecimiento", audience: "Negocios que compiten a nivel nacional o en varias ciudades", price: priceLabel("seoCrecimiento", " al mes"), includes: ["Todo lo del plan Local", "SEO técnico continuo", "4 a 8 contenidos al mes", "Seguimiento en IA"] },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      q: "¿SEO o anuncios de Google?",
      a: "Los anuncios traen visitas desde el primer día y se apagan cuando dejas de pagar. El SEO tarda meses, pero las visitas siguen llegando sin pagar por cada clic. Con poco presupuesto, recomendamos el perfil de Google y el SEO local primero, y anuncios solo para campañas puntuales.",
      items: [
        {
          k: "table",
          caption: "Comparativa: hacerlo tú, anuncios, freelancer o Avero Technology",
          headers: ["", "Hacerlo tú", "Anuncios de Google", "Freelancer de SEO", "Avero Technology"],
          highlight: 4,
          rows: [
            ["Resultados", "Lentos si no conoces el método", "Inmediatos mientras pagas", "Variables", "Medidos cada mes"],
            ["Costo continuo", "Tu tiempo", "Cada clic", "Mensualidad", "Mensualidad"],
            ["Respuestas de IA", "Difícil de medir", "No aplica", "Pocas veces incluido", "Incluido: 20 preguntas medidas cada mes"],
            ["Puede tocar el código", "Depende de tu plataforma", "No aplica", "A veces", "Sí: somos programadores"],
          ],
        },
      ],
    },
    {
      k: "section",
      title: "¿Con qué herramientas trabajamos?",
      items: [
        {
          k: "table",
          caption: "Herramientas de SEO",
          headers: ["", "Para qué la usamos"],
          rows: [
            ["Google Search Console", "Ver qué búsquedas te muestran, en qué posición y qué errores ve Google."],
            ["Google Analytics 4", "Medir visitas, clics a WhatsApp y visitas que llegan desde asistentes de IA."],
            ["Perfil de empresa de Google", "Tu ficha en Google Maps y en la búsqueda local."],
            ["Lighthouse y PageSpeed Insights", "Medir velocidad y accesibilidad en celulares."],
            ["Datos estructurados (schema.org)", "Decirle a Google y a la IA, en un formato que entienden, qué eres, qué vendes y dónde."],
          ],
        },
      ],
    },
    {
      k: "case",
      title: "Cómo aplicamos esto a averotechnology.com",
      text: [
        "Este sitio sigue el mismo plan que proponemos: una definición única de la marca, páginas por servicio con respuestas directas, datos estructurados en cada página, permiso de acceso para los rastreadores de búsqueda de IA y seguimiento mensual de 20 preguntas en los asistentes. El sitio ya tenía 100 en SEO en Lighthouse móvil en la auditoría de noviembre de 2026.",
      ],
      metrics: [
        { value: "100", label: "en SEO (Lighthouse móvil, noviembre de 2026)" },
        { value: "20", label: "preguntas medidas cada mes en los asistentes de IA" },
      ],
    },
    { k: "faq", title: "Preguntas frecuentes sobre SEO" },
    {
      k: "cta",
      title: "Empieza por saber dónde estás",
      text: "Escríbenos con el enlace de tu página y tu zona. Te decimos qué ve Google de tu negocio, qué responde ChatGPT cuando alguien pregunta por tu sector y qué arreglarías primero.",
      primary: { label: "Pedir una auditoría por WhatsApp", href: AUDIT },
      secondary: { label: "Ver todos los servicios", href: "/servicios" },
    },
    {
      k: "related",
      items: [
        { key: "web", why: "Si tu página actual no se puede arreglar o no tienes una." },
        { key: "bot", why: "Para atender al momento a las visitas que trae el SEO." },
        { key: "ia", why: "Para automatizar lo que pasa después del primer contacto." },
      ],
    },
  ],
  faq: [
    {
      question: "¿Cuánto cuesta el SEO en República Dominicana?",
      answer: priced
        ? `En Avero, el plan mensual cuesta ${priceInline("seoLocal")} al mes. El precio depende de la cantidad de contenido y de las zonas que cubras. No hay contrato de permanencia.`
        : "Depende de la cantidad de contenido y de las zonas que cubras. En Avero te damos el precio por escrito después de la auditoría, y no hay contrato de permanencia.",
    },
    { question: "¿En cuánto tiempo se ven resultados?", answer: "Los arreglos técnicos y el perfil de Google se notan en semanas. Las posiciones en búsquedas con competencia tardan meses; por eso recomendamos evaluar el plan después de 4 meses de trabajo." },
    { question: "¿Cómo hago para que mi negocio salga en Google Maps?", answer: "Necesitas un perfil de empresa de Google verificado, con la categoría correcta, horario, fotos, zona de servicio y reseñas. Si no atiendes en un local, Google permite ocultar la dirección y mostrar solo las zonas que cubres." },
    { question: "¿Cómo logro que ChatGPT recomiende mi negocio?", answer: "ChatGPT busca en la web y cita fuentes. Necesitas permitir su rastreador de búsqueda (OAI-SearchBot), tener páginas que respondan con datos concretos y que tu marca aparezca en directorios, medios y perfiles con la misma información." },
    { question: "¿Pueden garantizar el primer lugar en Google?", answer: "No, y nadie puede. Google lo advierte en su propia guía para contratar SEO. Lo que sí garantizamos es el trabajo del plan, un informe mensual y acceso a todos los datos." },
    { question: "¿Me conviene más SEO o anuncios de Google?", answer: "Los anuncios dan visitas inmediatas mientras pagas; el SEO tarda, pero las visitas no se cobran por clic. Con poco presupuesto, empieza por el SEO local." },
    { question: "¿Necesito cambiar mi página para hacer SEO?", answer: "No siempre. La auditoría dice si tu página actual se puede mejorar o si conviene rehacerla. Como también programamos, podemos hacer los cambios técnicos nosotros mismos." },
    { question: "¿Trabajan con negocios fuera de RD?", answer: "Sí. El SEO se hace a distancia y trabajamos para negocios en cualquier país de habla hispana." },
  ],
}

export const metadata = contentMetadata(spec)

export default function SeoPage() {
  return <ContentPage spec={spec} />
}
