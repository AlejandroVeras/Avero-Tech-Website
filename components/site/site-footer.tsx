import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { NAV_LINKS, WHATSAPP_DISPLAY, CONTACT_EMAIL, LOCATION, whatsappUrl } from "@/lib/site"

const SERVICE_LINKS = [
  { label: "Venta de equipos", href: "/catalogo" },
  { label: "Sistemas de gestión", href: "/sistemas" },
  { label: "Soporte técnico", href: "/soporte" },
  { label: "Planes y precios", href: "/precios" },
]

export function SiteFooter({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <footer className="bg-fog-white dark:bg-white/[0.03] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Logo className="h-8" />
            <p className="text-caption text-pewter max-w-xs">
              Tecnología clara, honesta y funcional, lista para trabajar desde el primer día.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Navegación</h2>
            <ul className="space-y-2 text-caption text-pewter">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-obsidian dark:hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Servicios</h2>
            <ul className="space-y-2 text-caption text-pewter">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-obsidian dark:hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-caption text-obsidian dark:text-foreground mb-3">Contacto</h2>
            <ul className="space-y-2.5 text-caption text-pewter">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>{LOCATION}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-obsidian dark:hover:text-foreground transition-colors">
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-obsidian dark:hover:text-foreground transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pale-mist mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-pewter">&copy; {new Date().getFullYear()} Avero Technology. Todos los derechos reservados.</p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="text-[11px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4"
          >
            {isLoggedIn ? "Dashboard" : "Iniciar sesión"}
          </Link>
        </div>
      </div>
    </footer>
  )
}
