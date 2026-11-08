// Password rules for new accounts. The same rules live in the three Avero systems
// (Inventario, Citas, Condominios); keep them in sync if you change one.

export const PASSWORD_MIN_LENGTH = 10

// Very common passwords and words people reuse. Matching is case-insensitive and ignores digits/symbols.
const COMMON_WORDS = [
  "password", "contrasena", "contraseña", "qwerty", "asdfgh", "zxcvbn", "abcdef", "abc123", "admin", "administrador",
  "iloveyou", "teamo", "welcome", "bienvenido", "letmein", "dominicana", "santodomingo", "avero", "inventario",
  "citas", "condominio", "condominios", "negocio", "empresa", "usuario",
]
const COMMON_SEQUENCES = ["0123456789", "1234567890", "9876543210", "abcdefghij", "qwertyuiop", "asdfghjkl"]

export type PasswordCheck = { id: "length" | "lower" | "upper" | "number" | "symbol" | "personal"; label: string; ok: boolean }

function lettersOnly(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "")
}

/** True when the password contains a common word, an obvious sequence or part of the person's email or name. */
function isPredictable(password: string, personal: string[]) {
  const pw = password.toLowerCase()
  const letters = lettersOnly(password)
  // Four characters in a row from an obvious sequence: 1234, 6789, abcd, qwer…
  for (const seq of COMMON_SEQUENCES) {
    for (let i = 0; i + 4 <= seq.length; i++) if (pw.includes(seq.slice(i, i + 4))) return true
  }
  if (/(.)\1{3,}/.test(pw)) return true // four or more of the same character in a row
  if (COMMON_WORDS.some((w) => letters.includes(lettersOnly(w)))) return true
  return personal
    .map(lettersOnly)
    .filter((p) => p.length >= 4)
    .some((p) => letters.includes(p))
}

export function checkPassword(password: string, context: { email?: string; name?: string } = {}): PasswordCheck[] {
  const emailUser = (context.email ?? "").split("@")[0] ?? ""
  const nameParts = (context.name ?? "").split(/\s+/)
  return [
    { id: "length", label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`, ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: "lower", label: "Una letra minúscula", ok: /[a-zñáéíóúü]/.test(password) },
    { id: "upper", label: "Una letra mayúscula", ok: /[A-ZÑÁÉÍÓÚÜ]/.test(password) },
    { id: "number", label: "Un número", ok: /\d/.test(password) },
    { id: "symbol", label: "Un símbolo, por ejemplo ! ? # $ % *", ok: /[^A-Za-z0-9ñÑáéíóúÁÉÍÓÚüÜ\s]/.test(password) },
    { id: "personal", label: "Sin tu nombre, tu correo ni palabras o secuencias fáciles (1234, qwerty, avero)", ok: password.length > 0 && !isPredictable(password, [emailUser, ...nameParts]) },
  ]
}

export function isStrongPassword(checks: PasswordCheck[]) {
  return checks.every((c) => c.ok)
}

/** Message to show when someone tries to submit a weak password. */
export function weakPasswordMessage(checks: PasswordCheck[]) {
  const missing = checks.filter((c) => !c.ok).map((c) => c.label.charAt(0).toLowerCase() + c.label.slice(1))
  return missing.length ? `La contraseña necesita: ${missing.join("; ")}.` : ""
}
