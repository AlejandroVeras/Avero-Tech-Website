import { contentMetadata } from "@/components/site/blocks/content-page"
import { SystemDetail, type SystemCopy } from "@/components/site/system-detail"

const APP = "https://condominios.averotechnology.com"

const copy: SystemCopy = {
  slug: "condominios",
  path: "/sistemas/condominios",
  title: "Avero Condominios: administración de condominios en RD",
  description: "Cuotas, gas, pagos y estado de cuenta por apartamento para administradores de condominios en RD. Los propietarios lo ven en el celular. 60 días gratis.",
  h1: "Avero Condominios: cuotas, gas y pagos de tu edificio, claros para todos",
  intro: "Factura el mantenimiento y el gas de cada apartamento, recibe los comprobantes de transferencia, entrega recibos al instante y muestra en qué se usa cada peso. Los propietarios ven su estado de cuenta desde el celular, sin descargar nada.",
  definitionQuestion: "¿Qué es Avero Condominios?",
  definition: "Avero Condominios es un sistema web de Avero Technology para administrar condominios, torres y residenciales en República Dominicana. Calcula cuotas de mantenimiento y gas, registra pagos con su comprobante, emite recibos y le muestra a cada propietario su saldo. Los movimientos de dinero no se borran: se corrigen con otro movimiento, así que el historial siempre cuadra.",
  audience: "Administradores independientes, empresas que administran varios edificios y juntas de condominio que hoy cobran con hojas de cálculo y mensajes de WhatsApp.",
  note: "En desarrollo: reservas de áreas sociales, reporte de averías y registro de visitas.",
  steps: [
    { title: "Crea la cuenta del edificio", text: "En condominios.averotechnology.com." },
    { title: "Carga las unidades y las cuotas", text: "En los planes Torre y Residencial te ayudamos a cargarlas." },
    { title: "Invita a los propietarios", text: "Entran desde el celular con un código, sin contraseña." },
  ],
  priceQuestion: "¿Cuánto cuesta Avero Condominios?",
  priceAnswer: (trial) => `Se paga por año según el tamaño del condominio: Edificio, hasta 24 unidades, US$320 al año; Torre, de 25 a 60 unidades, US$560 al año; y Residencial, de 61 a 150 unidades, US$960 al año. Los primeros ${trial} días son gratis. Para un edificio de 24 unidades, el plan Edificio equivale a unos US$1.11 por apartamento al mes.`,
  faq: [
    { question: "¿Los propietarios tienen que descargar una aplicación?", answer: "No. Entran desde el navegador del celular con un código, sin contraseña." },
    { question: "¿Sirve para el gas medido?", answer: "Sí. Puedes cobrar el gas común repartido o el gas medido por apartamento, y cada propietario ve el detalle." },
    { question: "¿Cómo se registran los pagos por transferencia?", answer: "El propietario o el administrador sube el comprobante, el administrador lo concilia y el sistema emite el recibo al instante." },
    { question: "¿Se puede borrar un pago por error?", answer: "No se borra: se corrige con un movimiento de ajuste. Así el historial queda completo y nadie puede alterar las cuentas sin dejar rastro." },
    { question: "¿Tiene reservas de áreas sociales?", answer: "Están en desarrollo, junto con el reporte de averías y el registro de visitas." },
    { question: "¿Hay prueba gratis?", answer: "Sí, 60 días con todas las funciones." },
  ],
  signupUrl: (external) => `${external ?? APP}/registro`,
  ctaTitle: "Cuentas claras para todo el edificio",
  ctaText: "Prueba Avero Condominios 60 días con todas las funciones. Si administras varios edificios, escríbenos y te ayudamos a empezar.",
}

export const metadata = contentMetadata({ path: copy.path, title: copy.title, titleAbsolute: true, description: copy.description })

export default function CondominiosPage() {
  return <SystemDetail copy={copy} />
}
