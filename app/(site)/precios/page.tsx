import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/site/section-heading"
import { PlanCard } from "@/components/site/plan-card"
import { Faq } from "@/components/site/faq"
import { Breadcrumbs, JsonLd } from "@/components/site/blocks/structure"
import { Byline } from "@/components/site/blocks/primitives"
import { AnswerBlock } from "@/components/site/blocks/sections"
import { ServiceIcon } from "@/components/site/blocks/service-icon"
import { contentMetadata } from "@/components/site/blocks/content-page"
import { PENDING, hasPrice, priceInline, priceLabel } from "@/lib/business"
import { pageGraph } from "@/lib/schema"
import { getPublishedSystems, getTrialDays } from "@/lib/data/systems"
import { FALLBACK_GESTION, isAnnualOnly, type SaasSystem, type SystemPlan } from "@/lib/systems"
import { appUrl, formatUSD, service, whatsappUrl, type ServiceKey } from "@/lib/site"

const PATH = "/precios"
const TITLE = "Precios de webs, SEO, chatbots y sistemas"
const DESCRIPTION = "Precios de páginas web, portales, SEO, IA y chatbots en RD$, y los planes de Avero Inventario, Citas y Condominios. Qué incluye cada uno."
const CRUMBS = [
  { name: "Inicio", href: "/" },
  { name: "Precios", href: PATH },
]
const QUOTE = whatsappUrl("Hola, quiero cotizar un servicio")

export const metadata: Metadata = contentMetadata({ path: PATH, title: TITLE, description: DESCRIPTION })

type Row = { name: string; includes: string; price: string }
const SERVICE_TABLES: { key: ServiceKey; anchor: string; rows: Row[] }[] = [
  { key: "web", anchor: "paginas-web", rows: [
    { name: "Presentación", includes: "Hasta 5 secciones, WhatsApp, SEO básico, analítica, dominio a tu nombre", price: priceLabel("webPresentacion") },
    { name: "Catálogo", includes: "Todo lo anterior y catálogo editable con fotos, precios y filtros", price: priceLabel("webCatalogo") },
    { name: "A medida", includes: "Reservas, pagos en línea u otras funciones", price: priceLabel("webMedida") },
    { name: "Dominio y alojamiento", includes: "Renovación anual", price: priceLabel("webDominioAnual", " al año") },
    { name: "Mantenimiento (opcional)", includes: "Cambios, copias de seguridad y actualizaciones", price: priceLabel("webMantenimiento", " al mes") },
  ] },
  { key: "portal", anchor: "portales", rows: [
    { name: "Descubrimiento", includes: "Mapa del proceso, prototipo y presupuesto cerrado (se descuenta si continúas)", price: priceLabel("portalDescubrimiento") },
    { name: "Portal esencial", includes: "1 tipo de usuario externo, panel interno, hasta 2 integraciones", price: priceLabel("portalEsencial") },
    { name: "Plataforma", includes: "Varios roles, pagos, reportes e integraciones", price: priceLabel("portalPlataforma") },
    { name: "Mantenimiento", includes: "Alojamiento, copias, monitoreo y horas de mejoras", price: priceLabel("portalMantenimiento", " al mes") },
  ] },
  { key: "seo", anchor: "seo", rows: [
    { name: "Auditoría", includes: "Informe técnico, local, de contenido y de IA, con plan de 90 días", price: priceLabel("seoAuditoria") },
    { name: "Local", includes: "Perfil de Google, directorios, reseñas y 2 contenidos al mes", price: priceLabel("seoLocal", " al mes") },
    { name: "Crecimiento", includes: "SEO técnico continuo, 4 a 8 contenidos al mes y seguimiento en IA", price: priceLabel("seoCrecimiento", " al mes") },
  ] },
  { key: "ia", anchor: "ia", rows: [
    { name: "Diagnóstico", includes: "Mapa de procesos y plan priorizado", price: priceLabel("iaDiagnostico") },
    { name: "Piloto", includes: "Una automatización con datos reales y medición", price: priceLabel("iaPiloto") },
    { name: "Operación", includes: "Monitoreo, ajustes y soporte", price: priceLabel("iaOperacion", " al mes") },
    { name: "Uso de IA", includes: "Consumo del modelo, según el proveedor", price: "Según uso" },
  ] },
  { key: "bot", anchor: "chatbots", rows: [
    { name: "Creación", includes: "Asistente con tus datos, burbuja web, panel de pedidos, pruebas", price: priceLabel("botCreacion") },
    { name: "Operación", includes: "Ajustes, soporte y revisión de conversaciones", price: priceLabel("botOperacion", " al mes") },
    { name: "Mensajes de WhatsApp", includes: "Tarifa de Meta; 1,000 mensajes de servicio gratis al mes por número", price: "Según uso" },
    { name: "Uso de IA", includes: "Consumo del modelo de OpenAI", price: "Según uso" },
  ] },
  { key: "soporte", anchor: "soporte", rows: [
    { name: "Por visita", includes: "Diagnóstico y reparación en Santo Domingo; repuestos aparte", price: priceLabel("soporteVisita") },
    { name: "Iguala básica", includes: "Soporte remoto, mantenimiento trimestral y prioridad", price: priceLabel("soporteIguala", " al mes") },
    { name: "Iguala empresa", includes: "Todo lo anterior, red, servidor y copias de seguridad", price: priceLabel("soporteIgualaEmpresa") },
  ] },
]

const FAQ = [
  {
    question: "¿Cuánto cuesta una página web en República Dominicana con Avero?",
    answer: hasPrice("webPresentacion") && hasPrice("webCatalogo")
      ? `Una página de presentación cuesta ${priceInline("webPresentacion")} y una con catálogo, ${priceInline("webCatalogo")}. Aparte se renuevan cada año el dominio y el alojamiento.`
      : "Depende de las secciones y funciones. Te damos el precio cerrado por escrito en 24 a 48 horas, sin costo. Aparte se renuevan cada año el dominio y el alojamiento.",
  },
  {
    question: "¿Cuánto cuesta un chatbot de WhatsApp?",
    answer: `${hasPrice("botCreacion") ? `La creación cuesta ${priceInline("botCreacion")}.` : "La creación y la operación se cotizan por escrito, sin costo."} Los mensajes de Meta y el uso de IA se pagan según el consumo.`,
  },
  ...(PENDING.servicePricesIncludeItbis !== null
    ? [{ question: "¿Los precios incluyen ITBIS?", answer: PENDING.servicePricesIncludeItbis ? "Sí, los precios de los servicios incluyen ITBIS." : "No, al precio de los servicios se le suma el ITBIS." }]
    : []),
  ...(PENDING.paymentTerms ? [{ question: "¿Cómo se paga un servicio?", answer: PENDING.paymentTerms }] : []),
  { question: "¿Por qué los sistemas están en dólares?", answer: "Porque el cobro automático se hace con PayPal, que factura en dólares. Tu banco convierte el monto a pesos al cobrarlo." },
  { question: "¿Hay contratos de permanencia?", answer: "No en los sistemas: cancelas cuando quieras. En el SEO recomendamos 4 meses como mínimo para ver resultados, pero no hay penalidad por cancelar." },
  { question: "¿La cotización tiene costo?", answer: "No. La conversación inicial y la propuesta con precio cerrado no tienen costo ni compromiso." },
]

function ServicePrices() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
      <div className="container mx-auto max-w-6xl px-4">
        <AnswerBlock
          question="¿Cómo se calcula el precio de un servicio?"
          answer="Según el alcance: cuántas páginas o pantallas lleva, qué funciones necesita y con qué sistemas se conecta. Primero conversamos sin costo, después te enviamos una propuesta con precio cerrado, calendario y forma de pago. Si el alcance no cambia, el precio tampoco."
        >
          <ul className="grid gap-5 lg:grid-cols-2">
            {SERVICE_TABLES.map((t) => {
              const s = service(t.key)
              return (
                <li key={t.key} id={t.anchor} className="scroll-mt-24 rounded-[28px] border border-pale-mist/70 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fog-white dark:bg-white/5 text-sapphire dark:text-sky-signal">
                      <ServiceIcon name={s.icon} className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl font-semibold text-obsidian dark:text-foreground">
                      <Link href={s.href} className="hover:text-sapphire dark:hover:text-sky-signal">{s.name}</Link>
                    </h2>
                  </div>
                  <dl className="mt-5 divide-y divide-pale-mist/70">
                    {t.rows.map((r) => (
                      <div key={r.name} className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <dt className="text-[15px] font-medium text-obsidian dark:text-foreground">
                            {r.name}
                            <span className="block text-[13px] font-normal text-pewter">{r.includes}</span>
                          </dt>
                        </div>
                        <dd className="shrink-0 text-right text-[14px] font-semibold text-sapphire dark:text-sky-signal">{r.price}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              )
            })}
          </ul>
          <div className="mt-8">
            <Button size="lg" className="h-12 rounded-full px-7 text-[15px] font-normal" asChild>
              <a href={QUOTE} target="_blank" rel="noopener noreferrer">Cotizar un servicio por WhatsApp</a>
            </Button>
          </div>
        </AnswerBlock>
      </div>
    </section>
  )
}

// Section anchors, in the order the systems appear on the page.
const ANCHORS: Record<string, string> = { gestion: "inventario", citas: "citas", condominios: "condominios" }

export default async function PreciosPage() {
  const [all, trialDays] = await Promise.all([getPublishedSystems(), getTrialDays()])
  const systems = all.filter((s) => s.status === "disponible" && s.plans.length > 0)
  if (!systems.some((s) => s.slug === "gestion")) systems.unshift(FALLBACK_GESTION)

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          title: `${TITLE} | Avero Technology`,
          description: DESCRIPTION,
          crumbs: CRUMBS,
          faq: FAQ,
        })}
      />
      <section className="pt-10 md:pt-14 pb-12 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <Breadcrumbs crumbs={CRUMBS} className="mb-10" />
          <SectionHeading
            as="h1"
            eyebrow="Precios"
            title="Precios de servicios y sistemas"
            description="Aquí están los precios desde de cada servicio y los planes de nuestros sistemas. En los servicios, el precio final es cerrado y te lo damos por escrito antes de empezar. En los sistemas, pruebas gratis y pagas solo si te sirve."
          />
          <Byline path={PATH} className="mt-6 text-center" />
          <nav aria-label="Servicios" className="mt-8 flex flex-wrap justify-center gap-2">
            {SERVICE_TABLES.map((t) => (
              <a key={t.anchor} href={`#${t.anchor}`} className="rounded-full border border-pale-mist px-4 py-1.5 text-[14px] text-obsidian hover:border-sapphire/40 dark:text-foreground">
                {service(t.key).name}
              </a>
            ))}
          </nav>
          <nav aria-label="Sistemas" className="mt-3 flex flex-wrap justify-center gap-2">
            {systems.map((s) => (
              <a
                key={s.slug}
                href={`#${ANCHORS[s.slug] ?? s.slug}`}
                className="rounded-full border border-pale-mist px-4 py-1.5 text-[14px] text-obsidian hover:border-sapphire/40 dark:text-foreground"
              >
                {s.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <ServicePrices />

      <section className="pt-20 md:pt-28 bg-background">
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading
            title="Precios de los sistemas"
            description="Prueba gratis, paga solo si te sirve. Sin contratos de permanencia: usas el sistema completo durante la prueba y el pago es automático con PayPal."
          />
        </div>
      </section>

      {systems.map((s, i) => (
        <section
          key={s.slug}
          id={ANCHORS[s.slug] ?? s.slug}
          className={`scroll-mt-20 py-16 md:py-20 ${i % 2 ? "bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]" : "bg-background"}`}
        >
          <div className="container mx-auto px-4">
            <SectionHeading title={s.name} description={s.tagline} className="mb-10" />
            {s.slug === "gestion" ? <GestionPlans system={s} trialDays={trialDays} /> : <ExternalPlans system={s} trialDays={s.trialDays ?? trialDays} />}
          </div>
        </section>
      ))}

      <section className="py-20 md:py-28 bg-gradient-to-b from-fog-white to-background dark:from-white/[0.03]">
        <div className="container mx-auto px-4">
          <SectionHeading title="Preguntas frecuentes sobre precios" className="mb-12" />
          <Faq entries={FAQ} />
        </div>
      </section>
    </>
  )
}

function GestionPlans({ system, trialDays }: { system: SaasSystem; trialDays: number }) {
  const plans = system.plans
  return (
    <>
      <div className={plans.length > 1 ? "grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" : ""}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            trialDays={trialDays}
            cta={
              <div className="space-y-3 pt-2">
                <Button size="lg" className="w-full rounded-full text-[14px] font-normal" asChild>
                  <Link href={appUrl("/signup")}>Probar gratis {trialDays} días</Link>
                </Button>
                <p className="text-[12px] text-pewter">Al crear tu cuenta autorizas el pago con PayPal. No se cobra nada durante la prueba; después el cobro es automático cada mes o cada año.</p>
              </div>
            }
          />
        ))}
      </div>
      <p className="text-center mt-8">
        <Link href="/sistemas/inventario" className="text-[14px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
          Ver todo lo que incluye Avero Inventario &gt;
        </Link>
      </p>
    </>
  )
}

/** Plans of a system that lives on its own domain: compact cards that send people to its signup. */
function ExternalPlans({ system, trialDays }: { system: SaasSystem; trialDays: number }) {
  const signup = system.externalUrl ? `${system.externalUrl}/registro` : whatsappUrl(`Hola, quiero probar ${system.name}.`)
  const annualOnly = system.plans.every(isAnnualOnly)
  return (
    <>
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        {system.plans.map((plan, i) => (
          <li key={plan.id} className="flex">
            <PlanBox plan={plan} featured={system.plans.length === 3 && i === 1} signup={signup} trialDays={trialDays} />
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-8 max-w-xl text-center text-[14px] text-pewter">
        {annualOnly
          ? `${trialDays} días gratis y después un solo pago al año.`
          : `${trialDays} días gratis. Si pagas el año completo, te regalamos 2 meses.`}{" "}
        {system.externalUrl && (
          <a href={system.externalUrl} className="text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
            Conocer {system.name} &gt;
          </a>
        )}
      </p>
    </>
  )
}

function PlanBox({ plan, featured, signup, trialDays }: { plan: SystemPlan; featured: boolean; signup: string; trialDays: number }) {
  const annualOnly = isAnnualOnly(plan)
  return (
    <div
      className={`flex flex-1 flex-col rounded-3xl p-7 ${
        featured ? "bg-obsidian text-white dark:bg-white/[0.06] dark:ring-2 dark:ring-sky-signal" : "bg-card border border-pale-mist/70"
      }`}
    >
      <h3 className={`text-lg font-semibold ${featured ? "" : "text-obsidian dark:text-foreground"}`}>{plan.name}</h3>
      {plan.description && <p className={`text-[14px] ${featured ? "text-white/70" : "text-pewter"}`}>{plan.description}</p>}
      <p className="mt-5">
        <span className={`text-4xl font-semibold tracking-tight ${featured ? "" : "text-obsidian dark:text-foreground"}`}>
          {formatUSD(annualOnly ? plan.annual_usd! : plan.monthly_usd)}
        </span>
        <span className={featured ? "text-white/70" : "text-pewter"}>{annualOnly ? "/año" : "/mes"}</span>
      </p>
      <p className={`text-[13px] ${featured ? "text-white/70" : "text-pewter"}`}>
        {annualOnly ? `Equivale a ${formatUSD(Math.round(plan.annual_usd! / 12))} al mes` : plan.annual_usd ? `o ${formatUSD(plan.annual_usd)} al año` : "Facturado cada mes"}
      </p>
      <ul className="mt-5 space-y-2.5 text-[14px]">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-sky-signal" : "text-sapphire dark:text-sky-signal"}`} aria-hidden />
            <span className={featured ? "text-white/85" : "text-obsidian/85 dark:text-foreground/85"}>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <Button
          size="lg"
          variant={featured ? "default" : "outline"}
          className={`w-full rounded-full text-[14px] font-normal ${featured ? "bg-white text-obsidian hover:bg-white/90" : ""}`}
          asChild
        >
          <a href={signup}>Probar {trialDays} días gratis</a>
        </Button>
      </div>
    </div>
  )
}
