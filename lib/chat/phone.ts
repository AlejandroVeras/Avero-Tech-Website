// Web chat conversations live in wa_conversations with phone = "web:<token>"; these helpers keep
// that key out of the UI and turn what the customer types into a WhatsApp number.

export const WEB_PREFIX = "web:"

export const isWebPhone = (phone: string) => phone.startsWith(WEB_PREFIX)

export function displayPhone(phone: string) {
  return isWebPhone(phone) ? "Chat de la web" : `+${phone}`
}

// "809-555-1234", "(829) 555 1234" and "+1 849 555 1234" all become "18095551234". Null if it doesn't look like a number.
export function normalizePhone(input: string | null | undefined) {
  const digits = (input ?? "").replace(/\D/g, "")
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) return `1${digits}`
  if (digits.length >= 10 && digits.length <= 15) return digits
  return null
}
