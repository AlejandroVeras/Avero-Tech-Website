import { contentMetadata } from "@/components/site/blocks/content-page"
import { SystemDetail, type SystemCopy } from "@/components/site/system-detail"

const APP = "https://citas.averotechnology.com"

const copy: SystemCopy = {
  slug: "citas",
  path: "/sistemas/citas",
  title: "Avero Citas: agenda de citas en línea para negocios",
  description: "Agenda en línea para barberías, salones, spas y consultorios en RD: tus clientes reservan solos y les llega el recordatorio. Prueba gratis 30 días.",
  h1: "Avero Citas: tus clientes reservan solos y les llega el recordatorio",
  intro: "Un enlace de reservas para tu Instagram o WhatsApp: el cliente elige servicio, profesional y hora sin crear cuenta. Tú manejas la agenda del equipo, la cola de llegada, los cobros con propina y las comisiones, desde el celular.",
  definitionQuestion: "¿Qué es Avero Citas?",
  definition: "Avero Citas es un sistema web de Avero Technology para negocios que trabajan con citas en República Dominicana. Le da al negocio un enlace de reservas, envía confirmaciones y recordatorios, organiza la agenda de cada profesional, maneja turnos de llegada y calcula propinas y comisiones. Funciona desde el navegador, sin instalar nada.",
  audience: "Barberías, salones de belleza, spas y consultorios en República Dominicana, desde un profesional que trabaja solo hasta equipos de 12 personas.",
  steps: [
    { title: "Crea tu cuenta", text: "En citas.averotechnology.com." },
    { title: "Agrega tus servicios, tu equipo y tus horarios", text: "Con la duración y el precio de cada servicio." },
    { title: "Comparte tu enlace", text: "En Instagram, en WhatsApp o en un código QR en el local." },
  ],
  priceQuestion: "¿Cuánto cuesta Avero Citas?",
  priceAnswer: (trial) => `Hay tres planes según el tamaño del equipo: Solo, US$9 al mes; Negocio, US$19 al mes; y Plus, US$35 al mes. El pago anual equivale a diez meses. Los primeros ${trial} días son gratis.`,
  faq: [
    { question: "¿El cliente tiene que crear una cuenta para reservar?", answer: "No. Abre tu enlace, elige servicio, profesional y hora, y deja su nombre y teléfono." },
    { question: "¿Cómo le llega el recordatorio al cliente?", answer: "Por correo de forma automática, y por WhatsApp con un toque desde la agenda." },
    { question: "¿Sirve para clientes que llegan sin cita?", answer: "Sí. Los turnos de llegada ponen al cliente en la cola y le muestran su turno en el celular." },
    { question: "¿Calcula las comisiones de cada barbero o estilista?", answer: "Sí, en los planes Negocio y Plus. Cada profesional ve lo que ganó." },
    { question: "¿Hay prueba gratis?", answer: "Sí, 30 días con todas las funciones del plan." },
    { question: "¿Necesito instalar algo?", answer: "No. Funciona en el navegador del celular, la tablet o la computadora." },
  ],
  signupUrl: (external) => `${external ?? APP}/registro`,
  ctaTitle: "Que tus clientes reserven solos",
  ctaText: "Crea tu cuenta, agrega tus servicios y comparte tu enlace hoy mismo. Lo pruebas gratis antes de pagar.",
}

export const metadata = contentMetadata({ path: copy.path, title: copy.title, titleAbsolute: true, description: copy.description })

export default function CitasPage() {
  return <SystemDetail copy={copy} />
}
