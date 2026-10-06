import type { FaqEntry } from "@/components/site/faq"

export const SYSTEM_FAQ: FaqEntry[] = [
  {
    question: "¿Cómo funciona el sistema de gestión?",
    answer:
      "Es una aplicación web: entras desde el navegador y tienes inventario, ventas a crédito, clientes, facturas y cotizaciones con ITBIS, gastos y reportes. Pagas una suscripción mensual o anual.",
  },
  {
    question: "¿Necesito instalar algo?",
    answer:
      "No. Funciona desde el navegador de cualquier celular, tablet o computadora con internet.",
  },
  {
    question: "¿Hay prueba gratis?",
    answer:
      "Sí. Al crear tu cuenta empiezas una prueba gratis con todas las funciones, sin poner tarjeta. Desde el sistema ves cuántos días te quedan.",
  },
  {
    question: "¿Cómo pago la suscripción?",
    answer:
      "Por ahora coordinamos el pago por WhatsApp. Te indicamos los métodos disponibles y activamos tu cuenta.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer: "Sí. No hay contratos de permanencia ni penalizaciones; solo avísanos por WhatsApp.",
  },
  {
    question: "¿Qué pasa con mis datos si dejo de pagar?",
    answer:
      "Tu cuenta pasa a modo solo lectura: sigues viendo todo, pero no puedes crear ni editar. No se borra nada, y al renovar todo sigue exactamente como lo dejaste.",
  },
]

export const STORE_FAQ: FaqEntry[] = [
  {
    question: "¿Los equipos tienen garantía?",
    answer:
      "Sí. Todos nuestros equipos nuevos y reacondicionados incluyen garantía. El período varía según el producto; te lo confirmamos al momento de la compra.",
  },
  {
    question: "¿Cómo compro un equipo?",
    answer:
      "Toca \"Consultar\" en el equipo que te interesa o arma tu carrito y envíanos el pedido por WhatsApp. Te confirmamos disponibilidad y coordinamos la entrega.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Para equipos puedes pagar con transferencia o en efectivo.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Operamos en Santo Domingo y alrededores. Para otras provincias, escríbenos por WhatsApp y coordinamos el envío.",
  },
]

export const SUPPORT_FAQ: FaqEntry[] = [
  {
    question: "¿Ofrecen soporte técnico remoto?",
    answer:
      "Sí. Muchos problemas los diagnosticamos y resolvemos de forma remota. Si hace falta intervención física, coordinamos una visita.",
  },
  {
    question: "¿Cuánto tardan en responder?",
    answer: "Respondemos por WhatsApp en menos de 2 horas.",
  },
]
