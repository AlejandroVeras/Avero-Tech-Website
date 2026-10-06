import { Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AccessState } from "@/lib/data/access"
import { whatsappUrl } from "@/lib/site"

const dateFormat = new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric" })

export function SubscriptionBanner({ access, businessName }: { access: AccessState; businessName: string }) {
  if (access.kind === "trialing") {
    const urgent = access.daysLeft <= 3
    return (
      <div
        role="status"
        className={
          urgent
            ? "border-b bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
            : "border-b bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-100"
        }
      >
        <div className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              Estás en tu prueba gratis: {access.daysLeft === 1 ? "queda 1 día" : `quedan ${access.daysLeft} días`} (hasta
              el {dateFormat.format(access.endsAt)}).
            </span>
          </p>
          <Button size="sm" variant={urgent ? "default" : "outline"} asChild>
            <a
              href={whatsappUrl(`Hola, quiero activar la suscripción del sistema para mi negocio "${businessName}".`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Activar suscripción
            </a>
          </Button>
        </div>
      </div>
    )
  }

  if (access.kind === "expired") {
    return (
      <div role="alert" className="border-b bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100">
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-start gap-2 text-sm">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong>Modo solo lectura.</strong>{" "}
              {access.wasTrial ? "Tu prueba gratis terminó" : "Tu suscripción venció"}
              {access.endsAt ? ` el ${dateFormat.format(access.endsAt)}` : ""}. Puedes ver todos tus datos, pero no
              crear ni editar hasta renovar. No se ha borrado nada.
            </span>
          </p>
          <Button size="sm" asChild>
            <a
              href={whatsappUrl(`Hola, quiero renovar la suscripción del sistema para mi negocio "${businessName}".`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Renovar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
