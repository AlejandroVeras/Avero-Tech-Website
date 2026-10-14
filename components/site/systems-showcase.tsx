import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SystemIcon } from "@/components/site/system-icon"
import { isAnnualOnly, systemHref, type SaasSystem } from "@/lib/systems"
import { formatUSD } from "@/lib/site"

/** Light cards for every available system, used on the home page. */
export function SystemsShowcase({ systems, defaultTrialDays }: { systems: SaasSystem[]; defaultTrialDays: number }) {
  const available = systems.filter((s) => s.status === "disponible")
  if (available.length === 0) return null
  return (
    <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
      {available.map((s) => {
        const plan = s.plans[0]
        const freeDays = s.trialDays ?? defaultTrialDays
        const price = plan
          ? isAnnualOnly(plan)
            ? `${formatUSD(plan.annual_usd!)}/año`
            : `${formatUSD(plan.annual_usd ? plan.annual_usd / 12 : plan.monthly_usd)}/mes`
          : null
        return (
          <li key={s.id} className="flex">
            <Link
              href={systemHref(s)}
              className="group flex flex-1 flex-col rounded-[28px] border border-pale-mist/70 bg-card p-7 transition-colors hover:border-sapphire/40"
            >
              <h3 className="text-heading-sm font-semibold text-obsidian dark:text-foreground">{s.name}</h3>
              {s.tagline && <p className="mt-2 text-[15px] text-pewter">{s.tagline}</p>}
              <ul className="mt-5 space-y-2.5 text-[14px] text-obsidian/85 dark:text-foreground/85">
                {s.features.slice(0, 4).map((f) => (
                  <li key={f.title} className="flex items-center gap-2.5">
                    <SystemIcon name={f.icon} className="h-4 w-4 shrink-0 text-sapphire dark:text-sky-signal" />
                    {f.title}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-end justify-between gap-3 pt-7">
                <p className="text-[13px] text-pewter">
                  {price && <>Desde <span className="text-base font-semibold text-obsidian dark:text-foreground">{price}</span><br /></>}
                  {freeDays} días gratis
                </p>
                <span className="inline-flex items-center gap-1 text-[14px] text-sapphire dark:text-sky-signal">
                  Conocer
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
