import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"
import { whatsappUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Garantía y devoluciones",
  description: "Qué cubre la garantía de los equipos de Avero Technology, cuánto dura, qué no cubre y cómo hacer un reclamo o una devolución.",
  alternates: { canonical: "/garantia" },
}

export default function GarantiaPage() {
  return (
    <LegalPage
      current="/garantia"
      title="Garantía y devoluciones"
      intro="Todos nuestros equipos se revisan antes de la entrega. Si algo falla por un defecto, lo resolvemos."
      updated="14 de octubre de 2026"
      sections={[
        {
          title: "Cuánto dura la garantía",
          body: <p>El período de garantía de cada equipo aparece en su página del catálogo y en tu factura. Empieza a contar desde el día de la entrega.</p>,
        },
        {
          title: "Qué cubre",
          body: <p>Fallas de funcionamiento por defectos de los componentes (pantalla, teclado, batería, disco, memoria, placa) que aparezcan con un uso normal.</p>,
        },
        {
          title: "Qué no cubre",
          body: (
            <ul>
              <li>Golpes, caídas, pantallas rotas o daños por líquidos.</li>
              <li>Equipos abiertos o reparados por terceros.</li>
              <li>Virus, programas instalados por el cliente o pérdida de información.</li>
              <li>El desgaste normal de la batería en equipos usados o reacondicionados, salvo que no cargue o no encienda.</li>
            </ul>
          ),
        },
        {
          title: "Cómo hacer un reclamo",
          body: (
            <p>
              Escríbenos por <a href={whatsappUrl("Hola, necesito usar la garantía de un equipo que les compré.")} target="_blank" rel="noopener noreferrer">WhatsApp</a> con tu factura o número de pedido y una descripción del problema. Revisamos el equipo y, según el caso, lo reparamos, lo cambiamos por uno equivalente o te devolvemos el dinero.
            </p>
          ),
        },
        {
          title: "Devoluciones",
          body: <p>Si el equipo llega con un defecto o no coincide con lo publicado, puedes devolverlo dentro de los 7 días siguientes a la entrega, con sus accesorios y en el mismo estado. Te devolvemos el pago por el mismo medio o lo cambiamos por otro equipo, como prefieras.</p>,
        },
        {
          title: "Tus derechos como consumidor",
          body: <p>Esta política no limita los derechos que te da la Ley 358-05 de Protección de los Derechos del Consumidor de la República Dominicana.</p>,
        },
      ]}
    />
  )
}
