import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { CONTACT_EMAIL, ENTITY_SHORT, SERVICES, WHATSAPP_DISPLAY, appUrl, whatsappUrl } from "@/lib/site"
import { PENDING } from "@/lib/business"

const SYSTEM_LINKS = [
  { label: "Avero Inventario", href: "/sistemas/inventario" },
  { label: "Avero Citas", href: "/sistemas/citas" },
  { label: "Avero Condominios", href: "/sistemas/condominios" },
  { label: "Catálogo de equipos", href: "/catalogo" },
  { label: "Precios", href: "/precios" },
]

const COMPANY_LINKS = [
  { label: "Quiénes somos", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
]

const LEGAL_LINKS = [
  { label: "Términos", href: "/terminos" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Garantía y devoluciones", href: "/garantia" },
]

const linkCls = "hover:text-obsidian dark:hover:text-foreground transition-colors"
const headCls = "font-semibold text-caption text-obsidian dark:text-foreground mb-3"

function Column({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className={headCls}>{title}</h2>
      <ul className="space-y-2 text-caption text-pewter">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={linkCls}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <footer className="bg-fog-white dark:bg-white/[0.03] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr] gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
            <Logo className="h-8" />
            <p className="text-caption text-pewter max-w-xs">{ENTITY_SHORT}</p>
            {PENDING.socialProfiles.length > 0 && (
              <ul className="flex gap-3 text-caption">
                {PENDING.socialProfiles.map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noopener noreferrer me" className="text-pewter hover:text-obsidian dark:hover:text-foreground">
                      {new URL(url).hostname.replace(/^www\./, "")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Column title="Servicios" links={SERVICES.map((s) => ({ label: s.name, href: s.href }))} />
          <Column title="Sistemas y tienda" links={SYSTEM_LINKS} />
          <Column title="Empresa" links={COMPANY_LINKS} />

          <div className="col-span-2 md:col-span-1">
            <h2 className={headCls}>Contacto</h2>
            <ul className="space-y-2.5 text-caption text-pewter">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>Santo Domingo, República Dominicana. Atendemos en todo Santo Domingo y a distancia en cualquier país.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={linkCls}>{WHATSAPP_DISPLAY}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${CONTACT_EMAIL}`} className={linkCls}>{CONTACT_EMAIL}</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" aria-hidden />
                <span>24 horas, todos los días</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-pale-mist mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-pewter">&copy; {new Date().getFullYear()} Avero Technology. Todos los derechos reservados.</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[11px] text-pewter hover:text-obsidian dark:hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={appUrl(isLoggedIn ? "/dashboard" : "/login")} className="text-[11px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
            {isLoggedIn ? "Ir al sistema" : "Entrar al sistema"}
          </Link>
        </div>
      </div>
    </footer>
  )
}
