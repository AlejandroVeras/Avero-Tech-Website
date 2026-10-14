// A date-only value like "2026-10-14" parses as UTC midnight, which is the previous
// evening in Santo Domingo; read it as local midday so the day never shifts.
export function parseDay(value: string | Date) {
  if (value instanceof Date) return value
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value)
}
