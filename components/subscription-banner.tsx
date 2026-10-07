import Link from "next/link"
import { AlertTriangle, CalendarClock, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AccessState } from "@/lib/data/access"
import { whatsappUrl } from "@/lib/site"

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric" })

function Bar({
  tone,
  icon: Icon,
  children,
  action,
  role = "status",
}: {
  tone: "info" | "warn" | "danger"
  icon: typeof Clock
  children: React.ReactNode
  action?: React.ReactNode
  role?: "status" | "alert"
}) {
  const tones = {
    info: "bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-100",
    warn: "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
    danger: "bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100",
  }
  return (
    <div role={role} className={`border-b ${tones[tone]}`}>
      <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-start gap-2 text-sm">
          <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <span>{children}</span>
        </p>
        {action}
      </div>
    </div>
  )
}

export function SubscriptionBanner({ access, businessName }: { access: AccessState; businessName: string }) {
  if (access.kind === "trialing") {
    const days = access.daysLeft === 1 ? "queda 1 día" : `quedan ${access.daysLeft} días`
    if (access.billing.provider === "paypal") {
      return (
        <Bar
          tone="info"
          icon={CalendarClock}
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/suscripcion">Ver suscripción</Link>
            </Button>
          }
        >
          Prueba gratis: {days}. El {dateFormat.format(access.endsAt)} se cobrará automáticamente con PayPal.
        </Bar>
      )
    }
    const urgent = access.daysLeft <= 3
    return (
      <Bar
        tone={urgent ? "warn" : "info"}
        icon={Clock}
        action={
          <Button size="sm" variant={urgent ? "default" : "outline"} asChild>
            <Link href="/dashboard/suscripcion">Activar suscripción</Link>
          </Button>
        }
      >
        Estás en tu prueba gratis: {days} (hasta el {dateFormat.format(access.endsAt)}).
      </Bar>
    )
  }

  if (access.kind === "active" && access.pastDue) {
    return (
      <Bar
        tone="warn"
        icon={AlertTriangle}
        role="alert"
        action={
          <Button size="sm" asChild>
            <Link href="/dashboard/suscripcion">Ver suscripción</Link>
          </Button>
        }
      >
        No pudimos cobrar tu suscripción con PayPal. Seguiremos intentando unos días; revisa tu forma de pago en
        PayPal para no perder el acceso.
      </Bar>
    )
  }

  if (access.kind === "active" && access.canceled && access.endsAt) {
    return (
      <Bar
        tone="info"
        icon={CalendarClock}
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/suscripcion">Ver suscripción</Link>
          </Button>
        }
      >
        Cancelaste tu suscripción. Tienes acceso completo hasta el {dateFormat.format(access.endsAt)}.
      </Bar>
    )
  }

  if (access.kind === "expired") {
    return (
      <Bar
        tone="danger"
        icon={Lock}
        role="alert"
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/dashboard/suscripcion">Reactivar</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a
                href={whatsappUrl(`Hola, quiero renovar la suscripción del sistema para mi negocio "${businessName}".`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        }
      >
        <strong>Modo solo lectura.</strong> {access.wasTrial ? "Tu prueba gratis terminó" : "Tu suscripción venció"}
        {access.endsAt ? ` el ${dateFormat.format(access.endsAt)}` : ""}. Puedes ver todos tus datos, pero no crear ni editar
        hasta reactivar. No se ha borrado nada.
      </Bar>
    )
  }

  return null
}
