// Helpers that make the bot read like a person typing on WhatsApp.
// Meta bills every service message above 1,000/month, so replies stay at 1–2 bubbles (ADR-003 §6).

export const BUBBLE_SEPARATOR = "\n\n"

// The model separates bubbles with a blank line. Extra bubbles are folded into the last one.
export function splitBubbles(text: string, max = 2) {
  const parts = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+\n/g, "\n").trim())
    .filter(Boolean)
  if (parts.length <= max) return parts
  return [...parts.slice(0, max - 1), parts.slice(max - 1).join(" ")]
}

// Roughly how long a person takes to type it: 2–8 s, with some jitter so it never feels mechanical.
export function typingDelayMs(text: string, random: () => number = Math.random) {
  const base = 1500 + text.length * 45
  const jitter = (random() - 0.5) * 1200
  return Math.round(Math.min(8000, Math.max(2000, base + jitter)))
}

// Short pause between two bubbles of the same reply.
export function bubbleGapMs(random: () => number = Math.random) {
  return Math.round(900 + random() * 900)
}

const BANNED_PHRASES = [
  "estoy aquí para ayudarte",
  "estoy aqui para ayudarte",
  "como asistente",
  "excelente pregunta",
  "no dudes en",
  "algo más en lo que pueda ayudarte",
  "algo mas en lo que pueda ayudarte",
  "como modelo de lenguaje",
]

const SLANG = [/\bpa'?\s/i, /\bvaina\b/i, /\bchequearte\b/i, /\bvuela\b/i, /\bklk\b/i, /\bq\b/i]

// Opening ¿ ¡ are only required in Spanish; English replies are allowed.
const SPANISH = /\b(de|que|la|el|en|es|lo|su|para|con|usted|tiene|está|tenemos|quiere|verdad)\b/i

const EMOJI = /\p{Extended_Pictographic}/gu

// Deterministic part of the naturalness judge (ADR-003, apéndice B). Returns the problems found.
export function styleIssues(bubble: string) {
  const issues: string[] = []
  const lower = bubble.toLowerCase()
  for (const phrase of BANNED_PHRASES) if (lower.includes(phrase)) issues.push(`frase prohibida: "${phrase}"`)
  if (/(^|\n)\s*([-*•]|\d+[.)])\s/.test(bubble)) issues.push("usa listas")
  if (/\*\*|__|^#|`/m.test(bubble)) issues.push("usa markdown")
  if (bubble.split("\n").length > 2) issues.push("más de 2 líneas")
  if (bubble.length > 320) issues.push("burbuja demasiado larga")
  for (const re of SLANG) if (re.test(bubble)) issues.push(`jerga: ${re.source}`)
  if (SPANISH.test(bubble) && /\?/.test(bubble) && !/¿/.test(bubble)) issues.push("falta el signo ¿")
  if (SPANISH.test(bubble) && /!/.test(bubble) && !/¡/.test(bubble)) issues.push("falta el signo ¡")
  if ((bubble.match(EMOJI) ?? []).length > 1) issues.push("más de un emoji")
  return issues
}

// Strips what WhatsApp would show literally (markdown) as a last safety net before sending.
export function cleanForWhatsApp(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .trim()
}
