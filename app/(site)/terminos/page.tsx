import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Condiciones de uso del sitio, la compra de equipos, los servicios de soporte y las suscripciones a los sistemas de Avero Technology.",
  alternates: { canonical: "/terminos" },
}

export default function TerminosPage() {
  return (
    <LegalPage
      current="/terminos"
      title="Términos y condiciones"
      intro="Estas condiciones aplican a averotechnology.com y a los sistemas Avero Inventario, Avero Citas y Avero Condominios. Al usar el sitio, comprar un equipo o crear una cuenta, aceptas estos términos."
      updated="14 de octubre de 2026"
      sections={[
        {
          title: "Quiénes somos",
          body: <p>Avero Technology es un negocio de tecnología con sede en Santo Domingo, República Dominicana. Vendemos equipos, damos soporte técnico y ofrecemos sistemas web por suscripción.</p>,
        },
        {
          title: "Compra de equipos",
          body: (
            <>
              <p>Los precios del catálogo están en pesos dominicanos (RD$) y pueden cambiar sin aviso. La disponibilidad se confirma por WhatsApp antes de cerrar la venta: publicar un equipo no garantiza que siga disponible.</p>
              <p>Aceptamos transferencia bancaria o efectivo, salvo que acordemos otra forma de pago. La entrega en Santo Domingo se coordina al confirmar el pedido; para otras provincias acordamos el envío y su costo.</p>
              <p>La garantía y las devoluciones se rigen por nuestra <Link href="/garantia">política de garantía y devoluciones</Link>.</p>
            </>
          ),
        },
        {
          title: "Soporte técnico",
          body: <p>Antes de cada servicio te indicamos el alcance y el precio. No somos responsables por datos que no tengan respaldo: te recomendamos hacer una copia de tu información antes de cualquier reparación.</p>,
        },
        {
          title: "Suscripciones a los sistemas",
          body: (
            <ul>
              <li><strong>Prueba gratis:</strong> cada sistema incluye días gratis (los indicados en su página). En Avero Inventario autorizas el pago con PayPal al crear la cuenta, sin cobro durante la prueba.</li>
              <li><strong>Cobro:</strong> al terminar la prueba eliges un plan. El pago es automático por PayPal según el período del plan (mensual o anual).</li>
              <li><strong>Cancelación:</strong> puedes cancelar cuando quieras, sin penalidad. Mantienes el acceso hasta el final del período pagado. No hacemos reembolsos parciales de períodos ya iniciados.</li>
              <li><strong>Falta de pago:</strong> si la suscripción vence, la cuenta pasa a modo solo lectura: puedes ver tu información, pero no crear ni editar. Al renovar, todo sigue como lo dejaste.</li>
              <li><strong>Precios:</strong> si cambiamos el precio de un plan, te avisamos con al menos 30 días de anticipación. El cambio aplica desde tu siguiente renovación.</li>
            </ul>
          ),
        },
        {
          title: "Tu cuenta y tu información",
          body: (
            <>
              <p>Eres responsable de mantener tu contraseña segura y de la información que registras en los sistemas (productos, clientes, citas, cobros). Esa información es tuya; nosotros la guardamos y procesamos solo para darte el servicio, como explica nuestra <Link href="/privacidad">política de privacidad</Link>.</p>
              <p>No está permitido usar los sistemas para actividades ilegales, enviar mensajes no deseados ni intentar acceder a cuentas de otras personas. Podemos suspender una cuenta que incumpla estas reglas.</p>
            </>
          ),
        },
        {
          title: "Disponibilidad y responsabilidad",
          body: <p>Trabajamos para que los sistemas estén disponibles todo el tiempo, pero puede haber interrupciones por mantenimiento o por fallas de proveedores. En la medida que permite la ley, nuestra responsabilidad se limita al monto que pagaste en los últimos 12 meses por el servicio afectado.</p>,
        },
        {
          title: "Cambios y ley aplicable",
          body: <p>Podemos actualizar estos términos; la fecha de arriba indica la última versión. Estos términos se rigen por las leyes de la República Dominicana, incluida la Ley 358-05 de Protección de los Derechos del Consumidor.</p>,
        },
      ]}
    />
  )
}
