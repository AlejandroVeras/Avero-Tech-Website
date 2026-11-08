import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { AutomationMockup } from "@/components/site/illustrations"
import { SERVICE_PRICES, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { serviceNode } from "@/lib/schema"
import { whatsappUrl } from "@/lib/site"

const PATH = "/servicios/inteligencia-artificial-para-negocios"
const ASK = whatsappUrl("Hola, quiero automatizar algo con IA")
const priced = hasPrice("iaPiloto")

const spec: PageSpec = {
  path: PATH,
  title: "IA para negocios en República Dominicana",
  description: "Automatiza tareas repetitivas, analiza tus datos y crea asistentes internos con IA. Diagnóstico, piloto y puesta en marcha para pymes en RD.",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "IA para tu negocio", href: PATH },
  ],
  hero: {
    eyebrow: "Inteligencia artificial",
    h1: "Inteligencia artificial para negocios: automatización, datos y asistentes internos",
    intro: "Usamos inteligencia artificial para quitarle a tu equipo las tareas que repite todos los días: copiar datos de un comprobante, armar un reporte, contestar la misma pregunta interna. Empezamos por un proceso, lo medimos y solo después lo extendemos.",
    primary: { label: "Contar qué quiero automatizar", href: ASK },
    secondary: { label: "Ver el caso del asistente", href: "/servicios/chatbots-ia-whatsapp#caso" },
    micro: "Respondemos al momento, 24/7.",
    visual: <AutomationMockup />,
  },
  schemaNodes: [serviceNode(PATH, "Inteligencia artificial para negocios", "Consultoría e implementación de inteligencia artificial", "Automatización de procesos, análisis de datos, lectura de documentos y asistentes internos con inteligencia artificial para pequeñas y medianas empresas.", { priceFrom: SERVICE_PRICES.iaPiloto?.from })],
  blocks: [
    {
      k: "section",
      q: "¿Qué es la inteligencia artificial para negocios?",
      a: "Es usar modelos de IA, como los de OpenAI, para que un sistema entienda texto, imágenes o voz y haga una tarea que antes requería a una persona: leer una factura, clasificar un correo, resumir ventas o responder una pregunta con los documentos de tu empresa. La IA trabaja dentro de reglas que definimos contigo y una persona revisa lo importante.",
    },
    {
      k: "section",
      tone: "ice",
      q: "¿Qué tareas de mi negocio se pueden automatizar con IA?",
      a: "Las que siguen un patrón y consumen tiempo: pasar datos de un documento a un sistema, clasificar solicitudes, redactar respuestas, preparar reportes y buscar información interna. Las decisiones con dinero o con clientes delicados siguen pasando por una persona; la IA prepara el trabajo y tú apruebas.",
      items: [
        {
          k: "table",
          caption: "Tareas que la IA puede hacer en un negocio",
          headers: ["", "Cómo la hace la IA", "Ejemplo"],
          rows: [
            ["Leer documentos", "Extrae los datos de comprobantes, facturas, cédulas o formularios y los guarda en tu sistema.", "Un administrador de condominio recibe 60 comprobantes de transferencia al mes y la IA los registra para que él solo apruebe."],
            ["Clasificar y enrutar", "Lee correos o mensajes y los manda al área correcta con prioridad.", "Una distribuidora separa pedidos, reclamos y cotizaciones que llegan al mismo correo."],
            ["Responder preguntas internas", "Un asistente que responde con tus manuales, políticas y precios.", "Un vendedor nuevo pregunta «¿qué descuento tiene el cliente X?» y recibe la respuesta con la fuente."],
            ["Analizar datos", "Contesta en lenguaje normal preguntas sobre tus ventas, gastos o inventario.", "«¿Qué productos se vendieron menos este trimestre?» sin abrir Excel."],
            ["Redactar", "Borradores de cotizaciones, correos de cobro o descripciones de producto con tu tono.", "Una inmobiliaria genera la descripción de cada propiedad a partir de sus datos."],
            ["Atender clientes", "Un asistente en WhatsApp o en tu web que responde con tus datos reales.", "Ver [chatbots para WhatsApp y web](/servicios/chatbots-ia-whatsapp)."],
          ],
        },
      ],
    },
    {
      k: "section",
      title: "¿Para qué negocios es?",
      items: [
        {
          k: "check",
          items: [
            "**Clínicas y consultorios:** confirmar citas, resumir formularios de pacientes y responder preguntas frecuentes del personal.",
            "**Colmados, tiendas y distribuidoras:** registrar pedidos que llegan por WhatsApp, reponer inventario y preparar reportes de ventas.",
            "**Concesionarios e inmobiliarias:** calificar prospectos, redactar fichas y dar seguimiento a interesados.",
            "**Restaurantes:** tomar pedidos, contestar sobre el menú y analizar qué platos dejan más margen.",
            "**Oficinas de profesionales:** clasificar documentos, preparar borradores y buscar en expedientes.",
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Qué incluye?",
      items: [
        {
          k: "table",
          caption: "Entregables de un proyecto de IA",
          headers: ["", "Detalle"],
          rows: [
            ["Diagnóstico", "Mapa de tus procesos, horas que consume cada uno y lista de dónde la IA ahorra más tiempo con menos riesgo."],
            ["Piloto", "Una automatización funcionando con tus datos reales en un solo proceso, con métricas de antes y después."],
            ["Reglas y controles", "Qué puede hacer la IA sola, qué debe aprobar una persona y qué nunca hace. Registro de cada acción."],
            ["Integración", "Conexión con tu WhatsApp, correo, hojas de cálculo, sistema contable o con nuestros sistemas."],
            ["Pruebas", "Casos difíciles y mensajes con trampa antes de encenderlo, como hicimos con nuestro propio asistente."],
            ["Control de costos", "Tope diario de gasto en IA y un reporte del costo real por tarea."],
            ["Entrenamiento", "Sesión con tu equipo para usarlo y saber cuándo no confiar en la IA."],
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
            { title: "Diagnóstico", time: "1 semana", text: "Entrevistamos a quienes hacen la tarea y medimos cuánto tiempo lleva hoy." },
            { title: "Propuesta", time: "2 a 3 días", text: "Elegimos un proceso, definimos el resultado esperado y el costo." },
            { title: "Piloto", time: "2 a 4 semanas", text: "Construimos la automatización y la probamos con datos reales, con una persona revisando cada resultado." },
            { title: "Medición", time: "1 a 2 semanas", text: "Comparamos tiempo, errores y costo contra el proceso anterior." },
            { title: "Puesta en marcha", time: "1 semana", text: "Si el piloto funciona, lo dejamos operando y entrenamos al equipo." },
            { title: "Siguiente proceso", text: "Con el primero funcionando, elegimos el siguiente." },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      id: "precios",
      q: "¿Cuánto cuesta implementar IA en una pyme?",
      a: `${priced ? `Un piloto cuesta ${priceInline("iaPiloto")}.` : "Te damos el precio del diagnóstico y del piloto por escrito, sin costo."} Aparte está el uso del modelo de IA, que se paga por consumo y suele ser bajo: en las pruebas de nuestro propio asistente, diez conversaciones completas costaron US$0.0046 en IA. Siempre te mostramos el costo real por tarea antes de ampliar.`,
      items: [
        {
          k: "pricing",
          cta: { label: "Contar qué quiero automatizar", href: ASK },
          tiers: [
            { name: "Diagnóstico", audience: "Para saber dónde la IA ahorra más tiempo", price: priceLabel("iaDiagnostico"), includes: ["Mapa de procesos", "Horas que consume cada uno", "Plan priorizado"] },
            { name: "Piloto", audience: "Una automatización con tus datos reales", price: priceLabel("iaPiloto"), featured: true, includes: ["Un proceso automatizado", "Medición de antes y después", "Aprobación humana", "Tope de costo diario"] },
            { name: "Operación", audience: "Cuando el piloto funciona", price: priceLabel("iaOperacion", " al mes"), includes: ["Monitoreo", "Ajustes", "Soporte"] },
          ],
          note: "El uso del modelo de IA se paga aparte, según el consumo del proveedor.",
        },
      ],
    },
    {
      k: "section",
      q: "¿Es seguro usar IA con los datos de mi empresa?",
      a: "Sí, si se configura bien. Trabajamos con la API de OpenAI, que según la política de la empresa no usa los datos que recibe para entrenar sus modelos salvo que el cliente lo autorice ([OpenAI](https://openai.com/enterprise-privacy/)). Además, enviamos a la IA solo los datos necesarios para cada tarea, nunca contraseñas ni tarjetas, y cumplimos la Ley 172-13 de protección de datos personales.",
      items: [
        {
          k: "check",
          items: [
            "La IA no tiene acceso libre a tu base de datos: solo puede usar las herramientas que le damos, con permisos limitados.",
            "Las acciones con dinero se recalculan y validan en el servidor. La IA no decide precios.",
            "Cada acción queda registrada para que puedas revisar qué hizo y por qué.",
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Con qué tecnología trabajamos?",
      items: [
        {
          k: "table",
          caption: "Tecnologías de los proyectos de IA",
          headers: ["", "Qué significa para ti"],
          rows: [
            ["OpenAI (modelos GPT)", "Entienden texto, imágenes y voz. Elegimos el modelo más barato que haga bien la tarea y lo cambiamos sin reprogramar."],
            ["Supabase", "Donde viven tus datos, con reglas de acceso por usuario."],
            ["WhatsApp Cloud API", "La conexión oficial de Meta para que la automatización hable con tus clientes o tu equipo por WhatsApp."],
            ["Next.js y Vercel", "Los paneles donde apruebas, corriges y ves los resultados."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      title: "¿Lo hago yo con ChatGPT o contrato a alguien?",
      items: [
        {
          k: "table",
          caption: "Comparativa: ChatGPT, herramientas sin código, consultora o Avero Technology",
          headers: ["", "Usar ChatGPT tú mismo", "Herramientas sin código", "Consultora grande", "Avero Technology"],
          highlight: 4,
          rows: [
            ["Sirve para", "Tareas sueltas de una persona", "Conectar aplicaciones con reglas simples", "Proyectos corporativos", "Procesos completos de una pyme"],
            ["Conexión con tus sistemas", "No", "Limitada a lo que la herramienta soporta", "Sí", "Sí, programamos la integración"],
            ["Controles y registro", "No", "Básicos", "Sí", "Sí, con tope de costo y aprobación humana"],
            ["Costo de entrada", "Bajo", "Bajo a medio", "Alto", priced ? `Piloto ${priceInline("iaPiloto")}` : "Empieza con un piloto"],
          ],
        },
      ],
    },
    {
      k: "case",
      title: "Nuestro asistente de ventas con IA",
      text: [
        "Construimos un asistente que atiende clientes por WhatsApp y en este sitio con el catálogo real de Avero. Lo probamos en 10 escenarios difíciles, desde regateos hasta intentos de engañarlo para que diera descuentos, con un segundo modelo de IA que revisa si cada respuesta suena natural. Los detalles y los números están en la [página de chatbots](/servicios/chatbots-ia-whatsapp#caso).",
      ],
      metrics: [
        { value: "10", label: "escenarios difíciles probados antes de encenderlo" },
        { value: "US$0.0046", label: "costo de IA de las 10 conversaciones de prueba" },
      ],
    },
    { k: "faq", title: "Preguntas frecuentes sobre IA para negocios" },
    {
      k: "cta",
      title: "Empieza por un solo proceso",
      text: "Cuéntanos qué tarea le quita más horas a tu equipo. Te decimos si la IA puede hacerla, cuánto costaría y cómo mediríamos el resultado.",
      primary: { label: "Escribir por WhatsApp", href: ASK },
      secondary: { label: "Ver todos los servicios", href: "/servicios" },
    },
    {
      k: "related",
      items: [
        { key: "bot", why: "La IA aplicada a la atención y las ventas." },
        { key: "portal", why: "Cuando la automatización necesita un sistema propio donde vivir." },
        { key: "web", why: "Una página con catálogo donde empieza la conversación con tus clientes." },
      ],
    },
  ],
  faq: [
    { question: "¿Por dónde empiezo a usar IA en mi negocio?", answer: "Por la tarea repetitiva que más horas consume y que sigue un patrón, como registrar comprobantes o contestar las mismas preguntas. Se automatiza esa sola, se mide y después se decide el siguiente paso." },
    {
      question: "¿Cuánto cuesta implementar IA en una pyme?",
      answer: priced
        ? `En Avero, un piloto cuesta ${priceInline("iaPiloto")}. El uso del modelo de IA se paga aparte por consumo y suele costar centavos de dólar por tarea.`
        : "Depende del proceso. En Avero te damos el precio del diagnóstico y del piloto por escrito. El uso del modelo de IA se paga aparte por consumo y suele costar centavos de dólar por tarea.",
    },
    { question: "¿Es seguro poner los datos de mi empresa en ChatGPT?", answer: "La versión gratuita de ChatGPT no es el lugar para datos de clientes. Nosotros usamos la API de OpenAI, que no usa tus datos para entrenar modelos salvo autorización, y le enviamos solo lo necesario para cada tarea." },
    { question: "¿La IA va a reemplazar a mis empleados?", answer: "En las pymes, la IA se encarga de tareas, no de puestos completos. Lo habitual es que el equipo deje de copiar datos y dedique ese tiempo a vender, atender o revisar." },
    { question: "¿Necesito un programador en la empresa?", answer: "No. Nosotros construimos, mantenemos y ajustamos la automatización. Tu equipo solo aprende a usarla y a revisar sus resultados." },
    { question: "¿Qué pasa si la IA se equivoca?", answer: "Por eso definimos qué aprueba una persona. Las acciones con dinero se validan en el servidor y todo queda registrado para corregirlo." },
    { question: "¿Funciona con mis sistemas actuales?", answer: "Si tu sistema permite exportar datos o tiene una API, sí. Lo confirmamos en el diagnóstico." },
  ],
}

export const metadata = contentMetadata(spec)

export default function AiPage() {
  return <ContentPage spec={spec} />
}
