import { contentMetadata } from "@/components/site/blocks/content-page"
import { SystemDetail, type SystemCopy } from "@/components/site/system-detail"
import { appUrl } from "@/lib/site"

const copy: SystemCopy = {
  slug: "gestion",
  path: "/sistemas/inventario",
  title: "Avero Inventario: inventario y facturas con ITBIS",
  description: "Controla inventario, ventas a crédito, facturas y cotizaciones con ITBIS y tu catálogo en línea. En español, desde el celular. Prueba gratis 14 días.",
  h1: "Avero Inventario: inventario, ventas y facturas para tu negocio",
  intro: "Lleva el inventario, lo que te deben tus clientes, tus facturas con ITBIS y tus gastos en un solo lugar, desde el celular. Incluye un catálogo en línea para mandarles a tus clientes. Lo pruebas gratis 14 días.",
  definitionQuestion: "¿Qué es Avero Inventario?",
  definition: "Avero Inventario es un sistema web de Avero Technology para pequeños negocios en República Dominicana. Controla productos y existencias, ventas al contado y a crédito, clientes, facturas y cotizaciones en PDF con ITBIS y RNC, gastos y reportes de ganancia mensual. Funciona en el navegador del celular o la computadora, sin instalar nada.",
  audience: "Colmados, ferreterías, tiendas de celulares y accesorios, distribuidoras pequeñas, talleres y cualquier negocio que hoy lleva sus cuentas en una libreta o en un Excel que nadie actualiza.",
  pains: [
    "Anotas las ventas y lo que te deben en una libreta que se pierde o se moja.",
    "Tienes el inventario en un Excel que nadie actualiza.",
    "A fin de mes no sabes cuánto ganaste de verdad.",
  ],
  steps: [
    { title: "Crea tu cuenta", text: "14 días gratis, sin tarjeta y sin compromiso." },
    { title: "Sube tus productos", text: "Con sus precios, existencias y fotos." },
    { title: "Vende y comparte", text: "Factura, lleva tus cuentas y manda el enlace de tu catálogo." },
  ],
  priceQuestion: "¿Cuánto cuesta Avero Inventario?",
  priceAnswer: () => "Un solo plan con todo incluido: US$12 al mes o US$120 al año, que equivale a dos meses gratis. Los primeros 14 días son gratis y no piden tarjeta. Después pagas la mensualidad directamente a Avero; te enviamos los datos de pago por WhatsApp.",
  faq: [
    { question: "¿Cómo funciona Avero Inventario?", answer: "Es una aplicación web: entras desde el navegador y tienes inventario, ventas a crédito, clientes, facturas y cotizaciones con ITBIS, gastos y reportes. Pagas una suscripción mensual o anual." },
    { question: "¿Necesito instalar algo?", answer: "No. Funciona desde el navegador de cualquier celular, tablet o computadora con internet." },
    { question: "¿Hay prueba gratis?", answer: "Sí, 14 días con todas las funciones. No necesitas tarjeta: creas tu cuenta y empiezas a usarlo. Si al terminar no te quedas, no pagas nada." },
    { question: "¿Cómo pago la suscripción?", answer: "Directamente a Avero, cada mes o cada año según tu plan. Escríbenos por WhatsApp o entra a «Mi suscripción» y te enviamos los datos para pagar; al recibir el pago activamos tu período." },
    { question: "¿Puedo cancelar cuando quiera?", answer: "Sí, sin contratos ni penalizaciones: simplemente no renuevas. Mantienes el acceso hasta el final del período que ya pagaste." },
    { question: "¿Qué pasa con mis datos si dejo de pagar?", answer: "Tu cuenta pasa a modo solo lectura: sigues viendo todo, pero no puedes crear ni editar. No se borra nada, y al renovar todo sigue exactamente como lo dejaste." },
  ],
  signupUrl: () => appUrl("/signup"),
  ctaTitle: "Deja la libreta hoy",
  ctaText: "Crea tu cuenta y prueba Avero Inventario 14 días con todas las funciones. Si tienes dudas, escríbenos por WhatsApp a cualquier hora.",
}

export const metadata = contentMetadata({ path: copy.path, title: copy.title, titleAbsolute: true, description: copy.description })

export default function InventarioPage() {
  return <SystemDetail copy={copy} />
}
