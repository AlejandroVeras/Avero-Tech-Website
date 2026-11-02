import { createHmac, timingSafeEqual } from "node:crypto"

// Meta signs every webhook body with the app secret: X-Hub-Signature-256: sha256=<hex>.
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string | undefined) {
  if (!header || !appSecret || !header.startsWith("sha256=")) return false
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest()
  const received = Buffer.from(header.slice(7), "hex")
  return received.length === expected.length && timingSafeEqual(new Uint8Array(received), new Uint8Array(expected))
}
