// Which dates "¿Cuánto gané?" covers. No imports: tests run this file directly.

export const PERIOD_PRESETS = [
  { id: "mes", label: "Este mes" },
  { id: "mes-pasado", label: "Mes pasado" },
  { id: "3-meses", label: "Últimos 3 meses" },
  { id: "ano", label: "Este año" },
  { id: "todo", label: "Todo" },
] as const
export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["id"] | "rango"

export interface ReportPeriod {
  preset: PeriodPreset
  /** YYYY-MM-DD, inclusive; null = from the beginning. */
  start: string | null
  /** YYYY-MM-DD, inclusive; null = until today. */
  end: string | null
  label: string
}

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Today in the Dominican Republic as YYYY-MM-DD. */
export function todayInDR(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santo_Domingo" }).format(now)
}

function ymd(y: number, m: number, d: number) {
  const date = new Date(Date.UTC(y, m, d))
  return date.toISOString().slice(0, 10)
}

function lastDay(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}

function longDay(day: string) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })
}

/** Reads ?periodo=…&desde=…&hasta=… ; anything invalid falls back to this month. */
export function resolvePeriod(params: { periodo?: string; desde?: string; hasta?: string }, today = todayInDR()): ReportPeriod {
  const [y, m] = today.split("-").map(Number)
  const month = m - 1
  const preset = params.periodo

  if (preset === "rango" && params.desde && params.hasta && DAY.test(params.desde) && DAY.test(params.hasta)) {
    const [start, end] = params.desde <= params.hasta ? [params.desde, params.hasta] : [params.hasta, params.desde]
    return { preset: "rango", start, end, label: `Del ${longDay(start)} al ${longDay(end)}` }
  }
  switch (preset) {
    case "mes-pasado": {
      const py = month === 0 ? y - 1 : y
      const pm = month === 0 ? 11 : month - 1
      const start = ymd(py, pm, 1)
      const name = new Date(`${start}T12:00:00`).toLocaleDateString("es-DO", { month: "long", year: "numeric" })
      return { preset, start, end: ymd(py, pm, lastDay(py, pm)), label: `Mes pasado (${name})` }
    }
    case "3-meses":
      return { preset, start: ymd(y, month - 2, 1), end: today, label: "Últimos 3 meses" }
    case "ano":
      return { preset, start: ymd(y, 0, 1), end: today, label: `Este año (${y})` }
    case "todo":
      return { preset, start: null, end: null, label: "Desde que empezaste" }
    default: {
      const start = ymd(y, month, 1)
      const name = new Date(`${start}T12:00:00`).toLocaleDateString("es-DO", { month: "long", year: "numeric" })
      return { preset: "mes", start, end: ymd(y, month, lastDay(y, month)), label: `Este mes (${name})` }
    }
  }
}

/** True when a YYYY-MM-DD day falls inside the period. */
export function inPeriod(day: string, p: Pick<ReportPeriod, "start" | "end">) {
  const d = day.slice(0, 10)
  return (!p.start || d >= p.start) && (!p.end || d <= p.end)
}
