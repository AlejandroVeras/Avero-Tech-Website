import type { Metadata } from "next"
import { Faq } from "@/components/site/faq"
import { JsonLd } from "@/components/site/blocks/structure"
import { ArrowLink, CheckList, H2, Prose, Section } from "@/components/site/blocks/primitives"
import { AnswerBlock, CardGrid, CaseBlock, CompareTable, CtaBand, PricingTiers, ProcessSteps, RelatedServices, ServiceHero } from "@/components/site/blocks/sections"
import { Reveal } from "@/components/site/blocks/reveal"
import { WebsiteMockup } from "@/components/site/illustrations"
import { LaptopMock } from "@/components/site/home/device-mockups"
import { PENDING, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { pageGraph, serviceNode } from "@/lib/schema"
import { SERVICE_PRICES } from "@/lib/business"
import { whatsappUrl } from "@/lib/site"
import { Car, Home, Scale, Stethoscope, Store, UtensilsCrossed } from "lucide-react"

const PATH = "/servicios/diseno-paginas-web"
const TITLE = "Diseño de páginas web en Santo Domingo"
const DESCRIPTION = "Páginas web rápidas para negocios en RD: catálogo, botón de WhatsApp, SEO básico y tu dominio. Proceso, tiempos y precios. Cotiza por WhatsApp."
const QUOTE = whatsappUrl("Hola, quiero cotizar una página web")

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: `${TITLE} | Avero Technology`, description: DESCRIPTION, url: PATH },
}

const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Servicios", href: "/servicios" },
  { name: "Páginas web", href: PATH },
]

const priced = hasPrice("webPresentacion") && hasPrice("webCatalogo")
const priceSentence = priced
  ? `En Avero, una página de presentación cuesta ${priceInline("webPresentacion")} y una página con catálogo, ${priceInline("webCatalogo")}.`
  : "Te damos el precio por escrito en 24 a 48 horas, sin costo."

const FAQ = [
  {
    question: "¿Cuánto cuesta una página web en República Dominicana?",
    answer: priced
      ? `En Avero, una página de presentación cuesta ${priceInline("webPresentacion")} y una con catálogo, ${priceInline("webCatalogo")}. El precio depende de las secciones y funciones, y es cerrado: lo sabes antes de empezar. Aparte se paga el dominio y el alojamiento.`
      : "Depende de las secciones y funciones. En Avero el precio es cerrado: lo recibes por escrito en 24 a 48 horas, sin costo, y no cambia si el alcance no cambia. Aparte se paga cada año el dominio y el alojamiento.",
  },
  { question: "¿Cuánto tarda en estar lista?", answer: "De 2 a 3 semanas una página de presentación y de 3 a 5 semanas una con catálogo, contando desde que tenemos tus fotos y datos." },
  { question: "¿Necesito página web si ya vendo por Instagram y WhatsApp?", answer: "Si quieres que te encuentren personas que todavía no te siguen, sí. Google muestra páginas web, no perfiles de Instagram, cuando alguien busca un producto en su zona. La página no reemplaza tus redes: les da un lugar fijo con tu catálogo y tus datos." },
  { question: "¿Quién es el dueño del dominio y de la página?", answer: "Tú. Registramos el dominio a tu nombre y te entregamos los accesos. Si un día quieres irte con otro proveedor, te llevas el dominio y el contenido." },
  { question: "¿Puedo cambiar precios y fotos yo mismo?", answer: "Sí. La página trae un panel sencillo para editar productos, precios, fotos y textos, y te damos una sesión de entrenamiento al publicarla." },
  { question: "¿Qué pagos tengo después de publicarla?", answer: "El dominio y el alojamiento, que se pagan cada año. El mantenimiento mensual es opcional e incluye cambios, copias de seguridad y actualizaciones." },
  { question: "¿Trabajan con negocios fuera de Santo Domingo?", answer: "Sí. Atendemos negocios de Santiago, el resto del país y otros países. Todo el proceso se puede hacer por WhatsApp y videollamada." },
  { question: "¿La página sale en Google desde el primer día?", answer: "La damos de alta en Google Search Console al publicarla, así que Google la conoce en pocos días. Salir en las primeras posiciones para búsquedas con competencia toma más tiempo y es parte del servicio de posicionamiento SEO." },
]

export default function WebDesignPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          title: `${TITLE} | Avero Technology`,
          description: DESCRIPTION,
          crumbs: CRUMBS,
          faq: FAQ,
          nodes: [serviceNode(PATH, "Diseño de páginas web", "Diseño y desarrollo de páginas web", "Diseño y programación de páginas web para negocios: catálogo, botón de WhatsApp, SEO básico, analítica y dominio a nombre del cliente.", { priceFrom: SERVICE_PRICES.webPresentacion?.from })],
        })}
      />

      <ServiceHero
        crumbs={CRUMBS}
        path={PATH}
        eyebrow="Páginas web"
        title="Diseño de páginas web en Santo Domingo para negocios que venden por WhatsApp"
        intro="Hacemos páginas web rápidas que aparecen en Google, muestran lo que vendes con precios claros y llevan al cliente a escribirte por WhatsApp. El dominio queda a tu nombre y aprendes a cambiar precios y fotos tú mismo."
        primary={{ label: "Cotizar mi página por WhatsApp", href: QUOTE }}
        secondary={{ label: "Ver precios", href: "/precios#paginas-web" }}
        micro="Respondemos al momento, 24/7. Cotización sin costo."
        visual={<WebsiteMockup />}
      />

      <Section>
        <AnswerBlock
          question="¿Qué es el servicio de diseño de páginas web de Avero Technology?"
          answer="Es el diseño y la programación de la página web de tu negocio, de principio a fin: estructura, textos, diseño, programación, SEO básico, analítica y publicación. Avero Technology lo hace desde Santo Domingo para negocios de toda República Dominicana y, a distancia, para clientes en cualquier país."
        >
          <Prose className="max-w-3xl">
            <p>
              En República Dominicana hay 10.5 millones de personas usando internet, el 91 % de la población, según{" "}
              <a href="https://datareportal.com/reports/digital-2026-dominican-republic" target="_blank" rel="noopener noreferrer">DataReportal (Digital 2026)</a>. Tus clientes te buscan en Google antes de escribirte. Si no te encuentran, encuentran a otro.
            </p>
          </Prose>
        </AnswerBlock>
      </Section>

      <Section tone="ice">
        <AnswerBlock
          question="¿Para qué negocios es?"
          answer="Para negocios que reciben clientes por WhatsApp o Instagram y quieren que Google los muestre cuando alguien busca lo que venden. Estos son los casos más comunes:"
        >
          <CardGrid
            items={[
              { icon: <Store className="h-5 w-5" aria-hidden />, title: "Colmados, tiendas y distribuidoras", text: "Catálogo con precios en pesos, botón para pedir por WhatsApp y zonas de entrega." },
              { icon: <Stethoscope className="h-5 w-5" aria-hidden />, title: "Clínicas y consultorios", text: "Especialidades, médicos, seguros que aceptan, ubicación y botón para pedir cita." },
              { icon: <Car className="h-5 w-5" aria-hidden />, title: "Concesionarios y dealers", text: "Inventario de vehículos con fotos, precio, financiamiento y contacto por cada unidad." },
              { icon: <Home className="h-5 w-5" aria-hidden />, title: "Inmobiliarias y agentes", text: "Propiedades con filtros por sector y precio, ficha con fotos y contacto directo." },
              { icon: <UtensilsCrossed className="h-5 w-5" aria-hidden />, title: "Restaurantes y cafeterías", text: "Menú legible en el celular, horario, ubicación y pedidos o reservas por WhatsApp." },
              { icon: <Scale className="h-5 w-5" aria-hidden />, title: "Profesionales independientes", text: "Abogados, contadores o arquitectos: servicios, experiencia y una forma fácil de agendar." },
            ]}
          />
        </AnswerBlock>
      </Section>

      <Section>
        <AnswerBlock
          question="¿Qué problemas resuelve una página web bien hecha?"
          answer="Resuelve tres problemas: que Google no te muestre, que el cliente no confíe y que repitas las mismas respuestas todo el día. Una buena página contesta antes de que pregunten: qué vendes, cuánto cuesta, dónde estás y cómo pagar."
        >
          <CompareTable
            caption="Lo que pasa hoy y lo que cambia con una página web"
            headers={["Lo que pasa hoy", "Lo que cambia con la página"]}
            highlight={1}
            rows={[
              ["Te encuentran solo quienes ya te conocen.", "Apareces cuando alguien busca tu producto o servicio en tu zona."],
              ["Contestas «¿precio?» decenas de veces al día.", "El cliente llega por WhatsApp sabiendo qué quiere y cuánto cuesta."],
              ["Tu catálogo vive en estados de WhatsApp que duran 24 horas.", "El catálogo está siempre en línea, con un enlace que puedes mandar."],
              ["Un perfil de Instagram no muestra tu seriedad a un cliente empresarial.", "Una página con tu dominio y tus datos de contacto da confianza."],
            ]}
          />
          <p className="mt-6 max-w-3xl text-[15px] text-pewter">
            No prometemos un número de ventas. Lo que sí podemos medir desde el primer mes: visitas, búsquedas que te encuentran en Google y clics al botón de WhatsApp.
          </p>
        </AnswerBlock>
      </Section>

      <Section tone="fog">
        <Reveal>
          <H2>¿Qué incluye?</H2>
          <CompareTable
            className="mt-10"
            caption="Entregables del diseño de una página web"
            headers={["", "Detalle"]}
            rows={[
              ["Estructura y textos", "Arquitectura de secciones y textos escritos para tus clientes y para Google. Tú los revisas y apruebas."],
              ["Diseño adaptado al celular", "Pensado primero para el teléfono, donde entra la mayoría de tus visitas. También se ve bien en computadora."],
              ["Botón y enlaces de WhatsApp", "Cada producto o servicio abre WhatsApp con un mensaje que dice qué le interesa al cliente."],
              ["Catálogo o lista de servicios", "Con fotos, precios en RD$ o US$ y la opción de marcar productos agotados."],
              ["SEO básico", "Título y descripción por página, datos estructurados, mapa del sitio, velocidad y alta en Google Search Console."],
              ["Analítica", "Google Analytics 4 y medición de clics a WhatsApp y llamadas."],
              ["Dominio y correo", "Te ayudamos a registrar el dominio a tu nombre (.com o .do) y a configurar el correo de tu negocio."],
              ["Panel para editar", "Cambias precios, fotos y textos sin programar. Incluye una sesión de entrenamiento."],
              ["Seguridad y legal", "Certificado HTTPS, aviso de privacidad según la Ley 172-13 y formulario protegido contra spam."],
            ]}
          />
        </Reveal>
      </Section>

      <Section>
        <AnswerBlock
          question="¿Cuánto tarda hacer una página web?"
          answer="Una página de presentación tarda de 2 a 3 semanas desde que recibimos tus fotos y datos. Una página con catálogo, de 3 a 5 semanas. El paso que más alarga el proyecto suele ser reunir el contenido, así que te damos una lista exacta desde el primer día."
        >
          <ProcessSteps
            className="max-w-4xl"
            steps={[
              { title: "Conversación inicial", time: "30 minutos, el mismo día", text: "Nos cuentas qué vendes, a quién y qué quieres lograr." },
              { title: "Propuesta y cotización", time: "24 a 48 horas", text: "Alcance, precio cerrado y calendario por escrito." },
              { title: "Contenido y estructura", time: "2 a 5 días", text: "Definimos las secciones y redactamos los textos con la información que nos das." },
              { title: "Diseño", time: "3 a 7 días", text: "Te mostramos la página en el celular antes de programarla. Incluye 2 rondas de cambios." },
              { title: "Programación", time: "1 a 3 semanas", text: "Construimos la página, el catálogo y las conexiones con WhatsApp y Google." },
              { title: "Pruebas", time: "2 a 3 días", text: "Revisamos velocidad, enlaces, formularios y cómo se ve en distintos teléfonos." },
              { title: "Publicación y entrenamiento", time: "1 día", text: "La ponemos en línea con tu dominio y te enseñamos a editarla." },
            ]}
          />
        </AnswerBlock>
      </Section>

      <Section tone="fog" id="precios">
        <AnswerBlock
          question="¿Cuánto cuesta una página web en República Dominicana?"
          answer={`Depende de cuántas secciones tenga y de si lleva catálogo o funciones especiales. ${priceSentence} El precio es cerrado: lo sabes antes de empezar y no cambia si el alcance no cambia.`}
        >
          <PricingTiers
            cta={{ label: "Pedir mi cotización", href: QUOTE }}
            tiers={[
              { name: "Presentación", audience: "Profesionales y negocios que necesitan aparecer en Google", price: priceLabel("webPresentacion"), includes: ["Hasta 5 secciones", "Botón de WhatsApp", "SEO básico", "Analítica"] },
              { name: "Catálogo", audience: "Tiendas, colmados, dealers e inmobiliarias", price: priceLabel("webCatalogo"), featured: true, includes: ["Todo lo de Presentación", "Catálogo editable con fotos", "Precios y filtros", "Pedido por WhatsApp en cada producto"] },
              { name: "A medida", audience: "Negocios con reservas, pagos en línea u otras funciones", price: priceLabel("webMedida"), includes: ["Se cotiza según las funciones", "Reservas o pagos en línea", "Integraciones con tus sistemas"] },
            ]}
            note="Después de publicada, la página tiene costos de dominio y alojamiento. Te decimos cuánto son antes de empezar, junto con el plan de mantenimiento opcional."
          />
        </AnswerBlock>
      </Section>

      <Section>
        <AnswerBlock
          question="¿Con qué tecnología hacemos tu página?"
          answer="Usamos las mismas herramientas con las que programamos nuestros propios sistemas. Te las explicamos en lo que significan para ti:"
        >
          <CompareTable
            caption="Tecnologías y lo que significan para tu negocio"
            headers={["", "Qué significa para tu negocio"]}
            rows={[
              ["Next.js", "La página carga rápido en celulares con datos móviles y Google puede leer todo el contenido sin problemas."],
              ["Vercel", "El alojamiento sirve la página desde servidores cercanos a quien la visita, con HTTPS incluido."],
              ["Supabase", "Si la página lleva catálogo, formularios o usuarios, guarda la información en una base de datos segura con permisos por usuario."],
              ["Google Search Console y GA4", "Ves qué buscan las personas que te encuentran y cuántas te escriben."],
            ]}
          />
        </AnswerBlock>
      </Section>

      <Section tone="ice">
        <AnswerBlock
          question="¿Me conviene Wix, un freelancer o una agencia?"
          answer="Wix o Shopify te sirven si tienes tiempo para armarla tú y no te importa una mensualidad fija. Un freelancer puede salir más barato, pero el soporte depende de una sola persona. Con Avero pagas un precio cerrado, el dominio queda a tu nombre y tienes respuesta 24/7."
        >
          <CompareTable
            caption="Comparativa: hacerlo tú, un freelancer o Avero Technology"
            headers={["", "Hacerlo tú (Wix, Shopify)", "Freelancer", "Avero Technology"]}
            highlight={3}
            rows={[
              ["Costo inicial", "Bajo o nulo", "Variable", hasPrice("webPresentacion") ? priceLabel("webPresentacion") : "Precio cerrado, por escrito"],
              ["Mensualidad", "Plan de la plataforma, en dólares", "Según el acuerdo", "Dominio y alojamiento, o mantenimiento opcional"],
              ["Quién lo hace", "Tú", "Una persona", "Avero, con proceso y pruebas"],
              ["SEO y velocidad", "Depende de la plantilla", "Depende de la persona", "Incluidos y medidos antes de publicar"],
              ["Propiedad", "Atada a la plataforma", "Variable", "Dominio y contenido a tu nombre"],
              ["Soporte", "Centro de ayuda", "Según disponibilidad", "WhatsApp 24/7"],
            ]}
          />
        </AnswerBlock>
      </Section>

      <CaseBlock
        title="Caso real: averotechnology.com"
        metrics={[
          { value: "100", label: "SEO, accesibilidad y buenas prácticas (Lighthouse móvil)" },
          { value: "250", label: "combinaciones probadas, con 0 enlaces rotos y 0 errores" },
        ]}
        visual={<LaptopMock />}
      >
        <p>
          El sitio que estás leyendo lo diseñamos y programamos nosotros, con catálogo de productos, carrito que envía el pedido por WhatsApp y un asistente de ventas con IA. Antes de cada cambio grande lo probamos en 250 combinaciones de página, ancho de pantalla y tema claro u oscuro.
        </p>
        <CheckList
          items={[
            "100 en SEO, accesibilidad y buenas prácticas en Lighthouse móvil (auditoría de noviembre de 2026).",
            "0 enlaces rotos y 0 errores de consola en las 250 combinaciones probadas.",
            "Datos estructurados de producto con precio y disponibilidad en cada ficha del catálogo.",
          ]}
        />
        {PENDING.projectsDelivered !== null && <p>Páginas web entregadas a clientes: {PENDING.projectsDelivered}.</p>}
      </CaseBlock>

      <Section narrow>
        <Reveal>
          <H2 className="text-center">Preguntas frecuentes sobre páginas web</H2>
          <div className="mt-10">
            <Faq entries={FAQ} />
          </div>
          <p className="mt-8 text-center">
            <ArrowLink href="/servicios/posicionamiento-seo">Cómo hacemos que tu página salga en Google</ArrowLink>
          </p>
        </Reveal>
      </Section>

      <CtaBand
        title="¿Listo para tener tu página?"
        text="Cuéntanos por WhatsApp qué vendes y a quién. En la misma conversación te decimos qué tipo de página necesitas y cuánto cuesta."
        primary={{ label: "Escribir por WhatsApp", href: QUOTE }}
        secondary={{ label: "Ver todos los servicios", href: "/servicios" }}
      />

      <RelatedServices
        items={[
          { key: "seo", why: "Para que la página aparezca en Google Maps y en las respuestas de IA." },
          { key: "bot", why: "Un asistente que responde con tu catálogo mientras duermes." },
          { key: "portal", why: "Cuando necesitas usuarios, pagos o un panel para tus clientes." },
        ]}
      />
    </>
  )
}
