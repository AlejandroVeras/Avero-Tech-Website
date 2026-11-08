import { ArrowLeft, Lock, ShieldCheck, CreditCard, FileText, Package, Store } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { SITE_URL } from "@/lib/site"

// Product shown in the brand panel of the login and sign-up screens.
const PRODUCT = {
  name: "Avero Inventario",
  lead: "Tu negocio, ",
  highlight: "organizado",
  tail: " desde el celular.",
  features: [{ icon: Package, text: "Inventario y existencias al día" }, { icon: FileText, text: "Facturas y cotizaciones con ITBIS" }, { icon: CreditCard, text: "Ventas a crédito y cobros" }, { icon: Store, text: "Tu catálogo en línea incluido" }],
}

/**
 * Split auth screen: a brand panel with the perspective grid and glows of averotechnology.com
 * (desktop only) and the form in a glass card. Follows light and dark mode.
 */
export function AuthShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative isolate hidden overflow-hidden bg-[#f4f7fc] p-12 text-obsidian lg:flex lg:flex-col lg:justify-between xl:p-16 dark:bg-[#05070d] dark:text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-[-20%] top-[-25%] h-[640px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(0,113,227,0.35),transparent)] opacity-50 dark:opacity-100" />
          <div className="absolute bottom-[-10%] right-[-20%] h-[520px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.25),transparent)] opacity-60 dark:opacity-100" />
          <div className="auth-grid absolute inset-x-[-30%] bottom-[-12%] h-[62%]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#f4f7fc_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_45%,#05070d_100%)]" />
        </div>

        <div className="relative"><a href={SITE_URL} aria-label="Avero Technology, inicio" className="inline-flex"><Logo className="h-9" /></a></div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-pale-mist bg-white/70 px-3 py-1.5 text-[13px] text-obsidian/75 backdrop-blur dark:border-white/15 dark:bg-white/[0.06] dark:text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-signal opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-signal" />
            </span>
            {PRODUCT.name} · Hecho en República Dominicana
          </p>
          <p className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-balance xl:text-[3rem]">
            {PRODUCT.lead}
            <span className="bg-gradient-to-r from-[#0071e3] via-[#2997ff] to-[#509be7] bg-clip-text text-transparent dark:from-[#2997ff] dark:via-[#7cc0ff] dark:to-[#aad0f6]">{PRODUCT.highlight}</span>
            {PRODUCT.tail}
          </p>
          <ul className="mt-9 grid gap-3">
            {PRODUCT.features.map((f, i) => (
              <li
                key={f.text}
                style={{ animationDelay: `${i * 90}ms` }}
                className="auth-rise flex items-center gap-3 rounded-2xl border border-pale-mist/80 bg-white/70 px-4 py-3 text-[15px] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sapphire dark:bg-sky-signal/15 dark:text-sky-signal">
                  <f.icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[13px] text-pewter dark:text-white/55">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          Conexión cifrada · Soporte por WhatsApp 24/7 · Avero Technology
        </p>
      </aside>

      <div className="relative isolate flex min-h-screen flex-col px-4 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-[-20%] top-[-15%] h-[480px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(41,151,255,0.14),transparent)]" />
          <div className="auth-dots absolute inset-0" />
        </div>
        <header className="flex h-16 items-center justify-between">
          <span className="lg:invisible"><a href={SITE_URL} aria-label="Avero Technology, inicio" className="inline-flex"><Logo className="h-8" /></a></span>
          <a href={SITE_URL} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Volver a averotechnology.com
          </a>
        </header>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-16">
          <div className="auth-rise rounded-[28px] border border-border/70 bg-card/85 p-7 shadow-[0_30px_80px_-40px_rgba(0,40,90,0.45)] backdrop-blur-xl sm:p-9 dark:shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-sapphire dark:bg-sky-signal/15 dark:text-sky-signal">
              <Lock className="h-3 w-3" aria-hidden /> Acceso seguro
            </p>
            <h1 className="mt-4 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
            {description && <p className="mt-2 text-[15px] text-muted-foreground">{description}</p>}
            <div className="mt-7">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
