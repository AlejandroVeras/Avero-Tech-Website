import type { Metadata } from "next"
import { Package, CreditCard, FileText, Users, Receipt, BarChart3 } from "lucide-react"
import { SectionHeading } from "@/components/site/section-heading"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { SYSTEM_FAQ } from "@/components/site/faq-content"

export const metadata: Metadata = {
  title: "Sistemas de gestión",
  description:
    "Sistema de gestión para pequeños negocios en República Dominicana: inventario, ventas a crédito, facturas con ITBIS, gastos y reportes.",
}

const FEATURES = [
  { icon: Package, title: "Inventario", description: "Tus productos, precios y existencias en un solo lugar." },
  { icon: CreditCard, title: "Ventas a crédito", description: "Lleva lo que te deben tus clientes y registra cada abono." },
  { icon: FileText, title: "Facturas y cotizaciones", description: "En PDF, con ITBIS y RNC, listas para enviar." },
  { icon: Users, title: "Clientes", description: "Datos de contacto e historial de cada cliente." },
  { icon: Receipt, title: "Gastos", description: "Registra en qué se va el dinero del negocio." },
  { icon: BarChart3, title: "Reportes", description: "Ingresos, gastos y ganancia por mes." },
]

export default function SistemasPage() {
  return (
    <>
      <section className="py-24 md:py-32 bg-obsidian text-white">
        <div className="container mx-auto px-4">
          <SectionHeading
            as="h1"
            inverted
            eyebrow="Software para tu negocio"
            title="Sistemas de gestión empresarial"
            description="Deja la libreta y el Excel. Administra inventario, ventas a crédito, facturas y gastos desde el navegador, sin instalar nada."
            className="mb-14"
          />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <f.icon className="w-6 h-6 text-sky-signal mb-4" aria-hidden />
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="text-[14px] text-white/60 mt-1">{f.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-obsidian text-white border-t border-white/5">
        <div className="container mx-auto px-4">
          <SectionHeading inverted title="Un plan, todo incluido" className="mb-10" />
          <PlanCard inverted />
        </div>
      </section>

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes" className="mb-12" />
          <Faq entries={SYSTEM_FAQ} />
        </div>
      </section>
    </>
  )
}
