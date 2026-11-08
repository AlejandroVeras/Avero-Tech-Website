import { ContentPage, contentMetadata, type PageSpec } from "@/components/site/blocks/content-page"
import { SupportMockup } from "@/components/site/illustrations"
import { SupportForm } from "@/components/site/support-form"
import { H2 } from "@/components/site/blocks/primitives"
import { PENDING, SERVICE_PRICES, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { serviceNode } from "@/lib/schema"
import { whatsappUrl } from "@/lib/site"

const PATH = "/servicios/soporte-tecnico"
const HELP = whatsappUrl("Hola, necesito soporte técnico")

const spec: PageSpec = {
  path: PATH,
  title: "Soporte técnico en Santo Domingo",
  description: "Reparación, mantenimiento, redes, servidores y soporte remoto para negocios en Santo Domingo. Igualas mensuales o servicio por visita. Escríbenos.",
  crumbs: [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "/servicios" },
    { name: "Soporte técnico", href: PATH },
  ],
  hero: {
    eyebrow: "Soporte técnico",
    h1: "Soporte técnico para negocios en Santo Domingo",
    intro: "Reparamos, mantenemos y configuramos las computadoras, la red y los servidores de tu negocio. Atendemos en tu oficina en Santo Domingo y a distancia en cualquier lugar, con respuesta inmediata por WhatsApp las 24 horas.",
    primary: { label: "Pedir soporte por WhatsApp", href: HELP },
    secondary: { label: "Ver igualas", href: "#igualas" },
    micro: "Respondemos al momento, 24/7. Si se puede resolver a distancia, empezamos en la misma conversación.",
    visual: <SupportMockup />,
  },
  schemaNodes: [serviceNode(PATH, "Soporte técnico para negocios", "Soporte técnico informático", "Reparación y mantenimiento de computadoras, instalación de redes, administración de servidores, soporte remoto e igualas mensuales para negocios en Santo Domingo.", { local: true, priceFrom: SERVICE_PRICES.soporteVisita?.from })],
  blocks: [
    {
      k: "section",
      q: "¿Qué incluye el soporte técnico de Avero?",
      a: "Incluye diagnóstico y reparación de equipos, mantenimiento preventivo, instalación y arreglo de redes, administración de servidores, soporte remoto y asesoría para comprar equipos. Puedes pedirlo por visita cuando surge un problema o contratar una iguala mensual que cubre tus equipos y te da prioridad.",
      items: [
        {
          k: "table",
          caption: "Servicios de soporte técnico",
          headers: ["", "Qué hacemos"],
          rows: [
            ["Diagnóstico", "Revisamos el equipo y te decimos qué tiene, cuánto cuesta arreglarlo y si vale la pena antes de tocar nada."],
            ["Reparación", "Hardware (pantalla, teclado, batería, disco, memoria) y software (sistema lento, virus, programas que fallan)."],
            ["Mantenimiento preventivo", "Limpieza interna, revisión de disco y batería, actualizaciones y copias de seguridad."],
            ["Redes", "Wi-Fi que llega a toda la oficina, cableado, routers, impresoras compartidas y redes separadas para clientes."],
            ["Servidores", "Instalación, usuarios y permisos, carpetas compartidas, copias de seguridad y monitoreo."],
            ["Soporte remoto", "Conexión segura a tu equipo para resolver problemas de software sin esperar una visita."],
            ["Asesoría", "Qué equipo comprar según el uso y el presupuesto, con opciones de nuestro [catálogo](/catalogo) o de otros proveedores."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      title: "¿Para qué negocios es?",
      items: [
        {
          k: "check",
          items: [
            "Oficinas de 2 a 50 computadoras sin un técnico propio.",
            "Clínicas y consultorios que no pueden parar porque se cayó el sistema o la impresora.",
            "Colmados, tiendas y restaurantes con punto de venta, impresora de facturas y Wi-Fi para clientes.",
            "Profesionales que trabajan desde casa y dependen de una sola laptop.",
          ],
        },
      ],
    },
    {
      k: "section",
      id: "igualas",
      q: "¿Qué es una iguala de soporte técnico?",
      a: "Una iguala es un pago mensual fijo que cubre el soporte de tus equipos: mantenimiento preventivo programado, soporte remoto ilimitado y prioridad en las visitas. Conviene cuando tienes varias computadoras o cuando una falla te cuesta ventas, porque sabes cuánto pagas cada mes y los problemas se previenen.",
      items: [
        {
          k: "pricing",
          cta: { label: "Pedir soporte", href: HELP },
          tiers: [
            { name: "Por visita", audience: "Problemas puntuales", price: priceLabel("soporteVisita"), includes: ["Diagnóstico", "Reparación", "Repuestos aparte, con presupuesto previo"] },
            {
              name: "Iguala básica",
              audience: PENDING.basicRetainerDevices ? `Hasta ${PENDING.basicRetainerDevices} equipos` : "Oficinas pequeñas",
              price: priceLabel("soporteIguala", " al mes"),
              featured: true,
              includes: ["Soporte remoto", "Mantenimiento trimestral", "Prioridad en las visitas"],
            },
            { name: "Iguala empresa", audience: "Oficinas con servidor o red propia", price: priceLabel("soporteIgualaEmpresa"), includes: ["Todo lo de la iguala básica", "Red y servidor", "Copias de seguridad"] },
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Cómo funciona?",
      items: [
        {
          k: "steps",
          steps: [
            { title: "Nos escribes por WhatsApp", time: "Respuesta inmediata, 24/7", text: "Nos cuentas el problema; si puedes, manda una foto o un video corto." },
            { title: "Diagnóstico a distancia", time: "Minutos", text: "Si es de software, nos conectamos de forma segura y lo intentamos resolver ahí mismo." },
            { title: "Visita", time: PENDING.supportVisitTime ?? "Según disponibilidad en Santo Domingo", text: "Si hace falta, coordinamos la visita." },
            { title: "Presupuesto antes de reparar", text: "Te decimos qué tiene y cuánto cuesta. No hacemos nada sin tu aprobación." },
            { title: "Reparación y prueba", text: "Lo arreglamos y lo probamos contigo." },
            { title: "Reporte", text: "Te mandamos por WhatsApp qué se hizo y qué recomendamos para que no vuelva a pasar." },
          ],
        },
      ],
    },
    {
      k: "section",
      q: "¿Cada cuánto hay que darle mantenimiento a una computadora?",
      a: "En una oficina, recomendamos un mantenimiento preventivo cada 3 a 6 meses: limpieza interna, revisión del disco y de la batería, actualizaciones del sistema y comprobación de las copias de seguridad. En lugares con mucho polvo o calor, como un colmado o un taller, conviene cada 3 meses.",
      items: [
        { k: "prose", text: ["Estas señales indican que un equipo necesita revisión antes de que falle del todo:"] },
        {
          k: "check",
          items: [
            "Tarda más de dos o tres minutos en encender o en abrir los programas de siempre.",
            "El ventilador suena fuerte o la laptop se calienta con tareas sencillas.",
            "La batería dura mucho menos que antes o el equipo se apaga sin aviso.",
            "Aparecen ventanas, programas o extensiones del navegador que nadie instaló.",
            "El Wi-Fi funciona en una parte de la oficina y en otra no.",
            "Nadie recuerda cuándo fue la última copia de seguridad.",
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "fog",
      q: "¿Qué hago mientras llega el soporte?",
      a: "Si el equipo hace un ruido extraño, huele a quemado o se mojó, apágalo y desconéctalo; encenderlo de nuevo puede empeorar el daño. Si sospechas un virus o un correo falso, desconéctalo de internet y no escribas contraseñas. En los demás casos, anota el mensaje de error o tómale una foto y mándanoslo por WhatsApp.",
      items: [
        {
          k: "check",
          items: [
            "No abras el equipo ni pruebes reparaciones de videos si tiene garantía: abrirlo puede anularla.",
            "Guarda lo que puedas en una memoria USB o en la nube si el equipo todavía enciende.",
            "Si es la red, reinicia el router desenchufándolo 30 segundos antes de llamarnos.",
            "Escríbenos con el modelo del equipo y lo que pasó justo antes de la falla.",
          ],
        },
      ],
    },
    {
      k: "section",
      q: "¿Dónde dan soporte?",
      a: "Visitamos negocios en todo Santo Domingo. El soporte remoto funciona en cualquier parte del país y del mundo, siempre que el equipo tenga internet. No tenemos un taller abierto al público: vamos a tu negocio o, si el equipo necesita taller, coordinamos la recogida.",
    },
    {
      k: "section",
      tone: "fog",
      title: "¿Con qué herramientas trabajamos?",
      items: [
        {
          k: "table",
          caption: "Herramientas de soporte",
          headers: ["", "Qué significa para ti"],
          rows: [
            ["Acceso remoto cifrado", "Solo nos conectamos cuando tú lo autorizas y ves en pantalla todo lo que hacemos."],
            ["Copias de seguridad en la nube", "Si un disco falla o te roban la laptop, recuperas tus archivos."],
            ["Equipos de red administrables", "Puedes ver quién está conectado a tu Wi-Fi y separar la red de clientes de la de la oficina."],
          ],
        },
      ],
    },
    {
      k: "section",
      tone: "ice",
      title: "¿Técnico propio, freelancer o empresa de soporte?",
      items: [
        {
          k: "table",
          caption: "Comparativa: empleado técnico, técnico independiente o Avero Technology",
          headers: ["", "Empleado técnico", "Técnico independiente", "Avero Technology"],
          highlight: 3,
          rows: [
            ["Costo", "Salario fijo y cargas", "Por visita", "Por visita o iguala"],
            ["Disponibilidad", "Horario laboral", "Según su agenda", "WhatsApp 24/7 y soporte remoto inmediato"],
            ["Si se enferma o renuncia", "Te quedas sin soporte", "Te quedas sin soporte", "El servicio sigue"],
            ["Software y automatización", "Depende de la persona", "Pocas veces", "También programamos sistemas e IA"],
          ],
        },
      ],
    },
    {
      k: "node",
      node: (
        <section id="solicitud" className="scroll-mt-20 py-20 md:py-28 bg-background">
          <div className="container mx-auto max-w-2xl px-4">
            <H2 className="text-center">Pide soporte por escrito</H2>
            <p className="mt-4 text-center text-body text-pewter">Si prefieres no escribir por WhatsApp, cuéntanos aquí qué pasa y te contactamos.</p>
            <div className="mt-10">
              <SupportForm />
            </div>
          </div>
        </section>
      ),
    },
    { k: "faq", title: "Preguntas frecuentes sobre soporte técnico" },
    {
      k: "cta",
      title: "¿Se te cayó algo ahora mismo?",
      text: "Escríbenos por WhatsApp con una foto o una descripción del problema. Respondemos al momento, a cualquier hora.",
      primary: { label: "Pedir soporte ahora", href: HELP },
      secondary: { label: "Ver todos los servicios", href: "/servicios" },
    },
    {
      k: "related",
      title: "También te puede interesar",
      items: [
        { name: "Catálogo de equipos", href: "/catalogo", icon: "laptop", cta: "Ver catálogo", why: "Laptops y equipos con garantía y entrega en Santo Domingo." },
        { key: "ia", why: "Para cuando lo que te quita tiempo son las tareas repetitivas." },
        { key: "portal", why: "Cuando tu negocio necesita un sistema a la medida." },
      ],
    },
  ],
  faq: [
    {
      question: "¿Cuánto cobra un técnico de computadoras en Santo Domingo?",
      answer: `${hasPrice("soporteVisita") ? `En Avero, la visita cuesta ${priceInline("soporteVisita")} e incluye el diagnóstico.` : "En Avero, la visita incluye el diagnóstico y te damos el precio antes de ir."} Los repuestos se cobran aparte y te los presupuestamos antes de reparar. Con una iguala mensual, el soporte remoto y el mantenimiento están incluidos.`,
    },
    { question: "¿Dan soporte técnico remoto?", answer: "Sí. Muchos problemas de software se resuelven a distancia en minutos. Solo nos conectamos con tu autorización y ves en pantalla lo que hacemos." },
    { question: "¿Qué incluye una iguala de soporte?", answer: "Soporte remoto, mantenimiento preventivo programado y prioridad en las visitas por un pago fijo al mes. La iguala para oficinas con servidor incluye también red y copias de seguridad." },
    { question: "¿Van a mi oficina?", answer: "Sí, en todo Santo Domingo. Fuera de Santo Domingo ofrecemos soporte remoto." },
    { question: "¿Cuánto tardan en responder?", answer: "Respondemos por WhatsApp al momento, las 24 horas, todos los días." },
    { question: "¿Pierdo mis datos si reparan mi computadora?", answer: "Antes de cualquier reparación hacemos o te pedimos una copia de seguridad. Te recomendamos tener siempre una copia de tus archivos importantes." },
    { question: "¿Reparan equipos que no compré con ustedes?", answer: "Sí. No hace falta que el equipo se haya comprado con nosotros." },
  ],
}

export const metadata = contentMetadata(spec)

export default function SupportPage() {
  return <ContentPage spec={spec} />
}
