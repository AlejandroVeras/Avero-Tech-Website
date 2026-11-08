import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { PortalMockup } from "@/components/site/illustrations"
import { SERVICE_PRICES, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { serviceNode } from "@/lib/schema"
import { whatsappUrl } from "@/lib/site"

const PATH = "/servicios/desarrollo-portales-web"
const QUOTE = whatsappUrl("Hola, quiero cotizar un portal web")
const priced = hasPrice("portalEsencial")

const spec: PageSpec = {
  path: PATH,
  title: "Portales web y sistemas a medida en RD",
  description: "Portales de clientes, intranets, marketplaces y plataformas a medida para empresas en RD. Qué incluye, cuánto tarda y cómo se cotiza un portal web.",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Portales y plataformas", href: PATH },
  ],
  hero: {
    dark: true,
    eyebrow: "Portales y plataformas",
    h1: "Desarrollo de portales web y plataformas a medida",
    intro: "Construimos el sistema web que tu empresa necesita y que no existe listo para comprar: un portal donde tus clientes ven sus pedidos y facturas, una intranet para tu equipo o una plataforma que conecte compradores y vendedores. Lo hacemos con el mismo método con el que creamos nuestros tres sistemas en producción.",
    primary: { label: "Contar mi proyecto por WhatsApp", href: QUOTE },
    secondary: { label: "Ver nuestros sistemas", href: "/sistemas" },
    micro: "Primera conversación sin costo. Respondemos al momento, 24/7.",
    visual: <PortalMockup />,
  },
  schemaNodes: [serviceNode(PATH, "Desarrollo de portales web y plataformas a medida", "Desarrollo de software web a medida", "Diseño y desarrollo de portales de clientes, intranets, marketplaces y plataformas web a medida, con usuarios, permisos, pagos e integraciones.", { priceFrom: SERVICE_PRICES.portalEsencial?.from })],
  blocks: [
    {
      k: "section",
      q: "¿Qué es un portal web?",
      a: "Un portal web es un sitio con usuarios que inician sesión y ven información propia: un cliente ve sus facturas, un empleado sus solicitudes, un proveedor sus órdenes. Una página web muestra la misma información a todos; un portal muestra a cada persona lo suyo y le permite hacer trámites sin llamar ni escribir.",
    },
    {
      k: "section",
      tone: "ice",
      q: "¿Qué diferencia hay entre una página web, un portal y un sistema por suscripción?",
      a: "La página web te presenta, el portal trabaja con los datos de cada usuario y el sistema por suscripción es un portal ya hecho que alquilas. Si un sistema existente resuelve el 80 % de lo que necesitas, empieza por ahí. Si tu proceso es lo que te diferencia, conviene uno a medida.",
      items: [
        {
          k: "table",
          caption: "Página web, portal a medida y sistema por suscripción",
          headers: ["", "Página web", "Portal a medida", "Sistema por suscripción"],
          highlight: 2,
          rows: [
            ["Para qué sirve", "Presentar el negocio y atraer clientes", "Que clientes, empleados o socios hagan gestiones en línea", "Resolver un proceso común (inventario, citas, cuotas)"],
            ["Usuarios con sesión", "No", "Sí, con permisos por rol", "Sí"],
            ["Se adapta a tu proceso", "No aplica", "Totalmente", "Hasta donde el sistema lo permita"],
            ["Tiempo para tenerlo", "2 a 5 semanas", "6 a 16 semanas", "El mismo día"],
            ["Costo", "Pago único", "Inversión mayor por etapas", "Mensualidad baja"],
            ["Ejemplo en Avero", "[averotechnology.com](/)", "Desarrollos para empresas", "[Avero Inventario, Citas y Condominios](/sistemas)"],
          ],
        },
      ],
    },
    {
      k: "section",
      title: "¿Qué tipos de portales y plataformas desarrollamos?",
      items: [
        {
          k: "table",
          caption: "Tipos de portales y plataformas",
          headers: ["", "Qué hace", "Ejemplos de negocio"],
          rows: [
            ["Portal de clientes", "El cliente entra y ve pedidos, facturas, estado de cuenta, documentos o el avance de su caso.", "Distribuidoras, aseguradoras, firmas de abogados, contadores, constructoras"],
            ["Intranet", "Tu equipo encuentra procesos, solicitudes, vacaciones, inventario interno y anuncios en un solo lugar.", "Empresas de 10 a 200 empleados, colegios, clínicas"],
            ["Marketplace", "Varios vendedores publican y los compradores comparan, piden y pagan.", "Repuestos, servicios a domicilio, alquileres"],
            ["Plataforma de reservas", "Clientes reservan citas, mesas, habitaciones o áreas sin crear choques de horario.", "Clínicas, restaurantes, hoteles pequeños, condominios"],
            ["Panel de operaciones", "Unifica pedidos, entregas, cobros y reportes que hoy viven en hojas de Excel.", "Colmados con delivery, distribuidoras, talleres"],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Qué problemas resuelve un portal a medida?",
      a: "Elimina el trabajo de responder a mano lo que el cliente podría consultar solo y junta en un sistema la información que hoy está repartida entre WhatsApp, Excel y correos. También reduce errores: cuando los datos se escriben una sola vez, no hay dos versiones de la misma factura.",
      items: [
        {
          k: "check",
          items: [
            "Tu equipo pasa horas contestando «¿cómo va mi pedido?» o «¿cuánto debo?».",
            "Cada área tiene su propia hoja de Excel y los números no cuadran entre ellas.",
            "No sabes quién cambió un dato ni cuándo.",
            "Los sistemas que encontraste en el mercado te obligan a cambiar tu forma de trabajar.",
          ],
        },
      ],
    },
    {
      k: "section",
      title: "¿Qué incluye el desarrollo?",
      items: [
        {
          k: "table",
          caption: "Entregables del desarrollo de un portal",
          headers: ["", "Detalle"],
          rows: [
            ["Descubrimiento", "Entrevistas con quienes usarán el sistema, mapa del proceso actual y lista priorizada de funciones."],
            ["Prototipo navegable", "Las pantallas principales en el celular y la computadora, antes de programar."],
            ["Usuarios y permisos", "Inicio de sesión con correo, contraseña o código por WhatsApp. Cada rol ve solo lo que le toca."],
            ["Base de datos segura", "Reglas de acceso dentro de la propia base de datos, copias de seguridad y registro de cambios."],
            ["Integraciones", "Pagos (PayPal, tarjetas o transferencias), WhatsApp, correo, tu sistema contable o facturación electrónica."],
            ["Pruebas", "Pruebas automáticas de las reglas importantes (precios, saldos, permisos) antes de cada entrega."],
            ["Entrega por etapas", "Una versión usable cada 2 semanas para que veas el avance y corrijas el rumbo a tiempo."],
            ["Documentación y entrenamiento", "Manual corto para los usuarios y sesión de entrenamiento por rol."],
            ["Código y datos", "El código y los datos son tuyos al terminar de pagar."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Cuánto tarda desarrollar un portal web?",
      a: "Un portal con una sola función principal, como un portal de clientes con facturas y estado de cuenta, toma de 6 a 8 semanas. Una plataforma con varios roles, pagos e integraciones, de 10 a 16 semanas. Lo dividimos en etapas para que uses una primera versión antes del final.",
      items: [
        {
          k: "steps",
          steps: [
            { title: "Descubrimiento", time: "1 a 2 semanas", text: "Entendemos el proceso y definimos qué entra en la primera versión." },
            { title: "Prototipo", time: "1 a 2 semanas", text: "Revisas las pantallas antes de que escribamos código." },
            { title: "Desarrollo por etapas", time: "4 a 10 semanas", text: "Entregas cada 2 semanas con funciones que ya puedes probar." },
            { title: "Pruebas con usuarios reales", time: "1 semana", text: "Un grupo pequeño de tu equipo o tus clientes lo usa y ajustamos." },
            { title: "Lanzamiento", time: "1 a 3 días", text: "Migramos los datos, activamos los accesos y entrenamos a cada rol." },
            { title: "Acompañamiento", time: "30 días", text: "Corregimos lo que aparezca en el uso diario." },
          ],
        },
      ],
    },
    {
      k: "section",
      id: "precios",
      q: "¿Cuánto cuesta un sistema web a medida en República Dominicana?",
      a: priced
        ? `Un portal a medida con una función principal cuesta ${priceInline("portalEsencial")}. El precio final depende del número de roles, pantallas e integraciones, y lo fijamos al terminar el descubrimiento.`
        : "Depende del número de roles, pantallas e integraciones. Lo fijamos por escrito al terminar el descubrimiento, que se descuenta del proyecto si continúas con nosotros.",
      items: [
        {
          k: "pricing",
          cta: { label: "Contar mi proyecto", href: QUOTE },
          tiers: [
            { name: "Descubrimiento", audience: "El primer paso de cualquier portal", price: priceLabel("portalDescubrimiento"), includes: ["Mapa del proceso", "Lista de funciones", "Prototipo navegable", "Presupuesto cerrado"] },
            { name: "Portal esencial", audience: "Una función principal, como un portal de clientes", price: priceLabel("portalEsencial"), featured: true, includes: ["1 tipo de usuario externo", "1 panel interno", "Hasta 2 integraciones"] },
            { name: "Plataforma", audience: "Varios roles, pagos e integraciones", price: priceLabel("portalPlataforma"), includes: ["Varios roles", "Pagos en línea", "Reportes", "Integraciones"] },
          ],
          note: "El mantenimiento (alojamiento, copias de seguridad, monitoreo y horas de mejoras) se contrata aparte, cada mes.",
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Con qué tecnología lo construimos?",
      items: [
        {
          k: "table",
          caption: "Tecnologías de los portales",
          headers: ["", "Qué significa para ti"],
          rows: [
            ["Next.js", "Una sola aplicación que funciona en el celular y en la computadora, sin descargar nada de una tienda de apps."],
            ["Supabase (PostgreSQL)", "Una base de datos con reglas de acceso por fila: aunque haya un error en una pantalla, un cliente no puede ver los datos de otro."],
            ["Vercel", "Alojamiento con HTTPS y despliegues sin interrumpir a los usuarios."],
            ["WhatsApp Cloud API", "Avisos y códigos de acceso por WhatsApp, el canal que tus clientes ya usan."],
            ["PayPal y otros medios de pago", "Cobros únicos o suscripciones automáticas."],
            ["OpenAI y otros modelos de IA", "Cuando hace falta: leer documentos, clasificar solicitudes o responder preguntas sobre tus datos."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      title: "¿A medida o un sistema que ya existe?",
      items: [
        {
          k: "table",
          caption: "Comparativa: Excel, software listo, freelancer o Avero Technology",
          headers: ["", "Hojas de Excel", "Software listo (SaaS)", "Freelancer", "Avero Technology"],
          highlight: 4,
          rows: [
            ["Se adapta a tu proceso", "Sí, pero a mano", "Parcialmente", "Sí", "Sí"],
            ["Seguridad y permisos", "Débil", "Buena", "Depende de la persona", "Reglas en la base de datos y pruebas automáticas"],
            ["Continuidad", "Depende de quien la maneja", "La del proveedor", "Riesgo si la persona se va", "Empresa con documentación y código entregado"],
            ["Experiencia propia", "No aplica", "Sí", "Variable", "3 plataformas propias en producción"],
          ],
        },
        { k: "prose", text: ["Si lo que necesitas es inventario y facturación, citas o administración de condominios, probablemente te conviene uno de [nuestros sistemas](/sistemas) antes que un desarrollo a medida. Te lo diremos en la primera conversación."] },
      ],
    },
    {
      k: "case",
      eyebrow: "Casos reales",
      title: "Tres plataformas propias en producción",
      text: [
        "Antes de ofrecer este servicio construimos y operamos nuestras propias plataformas. Cada una resolvió un problema de ingeniería que también aparece en los proyectos de clientes:",
      ],
      check: [
        "**[Avero Inventario](/sistemas/inventario):** muchos negocios en una sola base de datos, cada uno viendo solo lo suyo, y cobro de suscripciones con PayPal.",
        "**[Avero Citas](/sistemas/citas):** reservas para clientes externos sin crear cuenta y reglas de horario por profesional.",
        "**[Avero Condominios](/sistemas/condominios):** un portal de clientes. Cada propietario entra con un código y ve solo su saldo. Los movimientos de dinero no se borran: se corrigen con otro movimiento.",
      ],
      metrics: [
        { value: "3", label: "plataformas propias en producción" },
        { value: "50 → 1", label: "reservas simultáneas de la misma área: solo 1 confirmada (prueba de arquitectura)" },
      ],
    },
    { k: "faq", title: "Preguntas frecuentes sobre portales a medida", after: { href: "/sistemas", label: "Ver nuestros sistemas listos para usar" } },
    {
      k: "cta",
      title: "Cuéntanos qué quieres resolver",
      text: "Descríbenos el proceso que hoy te quita tiempo. Te diremos si conviene un portal a medida, un sistema existente o una combinación, y cuánto costaría cada opción.",
      primary: { label: "Escribir por WhatsApp", href: QUOTE },
      secondary: { label: "Ver todos los servicios", href: "/servicios" },
    },
    {
      k: "related",
      items: [
        { key: "web", why: "Si solo necesitas presentar tu negocio y recibir pedidos." },
        { key: "ia", why: "Para que el portal lea documentos o responda preguntas sobre tus datos." },
        { key: "bot", why: "Para atender a tus clientes por WhatsApp con los datos del portal." },
      ],
    },
  ],
  faq: [
    { question: "¿Qué diferencia hay entre una página web y un portal web?", answer: "Una página web muestra la misma información a todos los visitantes. Un portal tiene usuarios con sesión y le muestra a cada uno sus propios datos, como facturas, pedidos o solicitudes, y le permite hacer trámites en línea." },
    {
      question: "¿Cuánto cuesta un sistema web a medida en RD?",
      answer: priced
        ? `Un portal con una función principal cuesta ${priceInline("portalEsencial")}. El precio final se fija al terminar el descubrimiento, según los roles, las pantallas y las integraciones que necesites.`
        : "Depende de los roles, las pantallas y las integraciones que necesites. El precio final se fija por escrito al terminar el descubrimiento.",
    },
    { question: "¿Cuánto tarda en estar listo un portal de clientes?", answer: "Entre 6 y 8 semanas si tiene una función principal, y entre 10 y 16 si tiene varios roles, pagos e integraciones. Recibes versiones usables cada 2 semanas." },
    { question: "¿Me conviene un sistema a medida o uno que ya existe?", answer: "Si un sistema existente cubre la mayor parte de tu proceso, empieza por él: es más barato y lo tienes el mismo día. Conviene a medida cuando tu proceso es lo que te diferencia o cuando ningún sistema se adapta sin forzarte a cambiar." },
    { question: "¿El código es mío al terminar?", answer: "Sí. Al terminar de pagar te entregamos el código, la base de datos y los accesos." },
    { question: "¿Se puede conectar con mi facturación o mi sistema contable?", answer: "Sí, si el sistema tiene una API o permite importar y exportar archivos. Lo revisamos en el descubrimiento, incluida la facturación electrónica de la DGII." },
    { question: "¿Qué pasa si Avero deja de darme servicio?", answer: "Tienes el código, la documentación y los accesos, así que otro equipo puede continuar el trabajo. Usamos tecnologías comunes (Next.js y PostgreSQL) para que encontrar programadores no sea un problema." },
    { question: "¿Pueden trabajar con empresas fuera de República Dominicana?", answer: "Sí. El proceso completo funciona a distancia, por videollamada y WhatsApp, para clientes en cualquier país." },
  ],
}

export const metadata = contentMetadata(spec)

export default function PortalsPage() {
  return <ContentPage spec={spec} />
}
