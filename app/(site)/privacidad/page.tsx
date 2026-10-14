import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"
import { CONTACT_EMAIL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recoge Avero Technology, para qué los usa, con quién los comparte y cómo ejercer tus derechos según la Ley 172-13.",
  alternates: { canonical: "/privacidad" },
}

export default function PrivacidadPage() {
  return (
    <LegalPage
      current="/privacidad"
      title="Política de privacidad"
      intro="Explicamos qué información recogemos, para qué la usamos y qué derechos tienes, conforme a la Ley 172-13 sobre protección de datos personales de la República Dominicana."
      updated="14 de octubre de 2026"
      sections={[
        {
          title: "Qué datos recogemos",
          body: (
            <ul>
              <li><strong>Cuando nos escribes:</strong> nombre, teléfono, correo y lo que nos cuentas en el formulario de soporte o por WhatsApp.</li>
              <li><strong>Cuando compras:</strong> los datos necesarios para la factura y la entrega.</li>
              <li><strong>Cuando creas una cuenta en un sistema:</strong> nombre del negocio, correo y la información que registras (productos, clientes, citas, cobros).</li>
              <li><strong>Datos técnicos:</strong> cookies necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad.</li>
            </ul>
          ),
        },
        {
          title: "Para qué los usamos",
          body: (
            <ul>
              <li>Responderte, cotizar, vender y entregar equipos.</li>
              <li>Darte acceso a los sistemas y cobrar la suscripción.</li>
              <li>Enviarte avisos del servicio (por ejemplo, que tu prueba gratis está por terminar).</li>
            </ul>
          ),
        },
        {
          title: "Información de tus clientes",
          body: <p>Si usas uno de nuestros sistemas, la información de tus clientes, pacientes o propietarios es tuya. Tú decides qué registras; nosotros solo la guardamos y procesamos para prestarte el servicio, nunca la vendemos ni la usamos para otros fines.</p>,
        },
        {
          title: "Con quién la compartimos",
          body: (
            <>
              <p>No vendemos tus datos. Solo los compartimos con los proveedores que necesitamos para operar:</p>
              <ul>
                <li><strong>Supabase:</strong> base de datos y cuentas de usuario.</li>
                <li><strong>Vercel:</strong> alojamiento del sitio y los sistemas.</li>
                <li><strong>PayPal:</strong> procesamiento de pagos de suscripciones. No guardamos números de tarjeta.</li>
                <li><strong>Resend:</strong> envío de correos del servicio.</li>
                <li><strong>WhatsApp (Meta):</strong> cuando nos escribes por ese canal.</li>
              </ul>
              <p>Estos proveedores pueden almacenar datos fuera de la República Dominicana, con medidas de seguridad propias. También compartiremos información si una autoridad competente lo exige por ley.</p>
            </>
          ),
        },
        {
          title: "Cuánto tiempo la guardamos",
          body: <p>Mientras tengas una cuenta o una relación comercial con nosotros. Si cierras tu cuenta y nos pides borrar tus datos, los eliminamos en un plazo de 30 días, salvo lo que debamos conservar por obligaciones fiscales o legales.</p>,
        },
        {
          title: "Tus derechos",
          body: (
            <p>
              Puedes pedir acceso, corrección, actualización o eliminación de tus datos, u oponerte a su uso, escribiendo a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Te respondemos en un máximo de 10 días hábiles.
            </p>
          ),
        },
        {
          title: "Seguridad",
          body: <p>Usamos conexiones cifradas (HTTPS), contraseñas protegidas y permisos por usuario para que cada negocio vea solo su información. Ningún sistema es infalible: si detectamos un incidente que afecte tus datos, te avisaremos.</p>,
        },
      ]}
    />
  )
}
