import { test } from "node:test"
import assert from "node:assert/strict"
import { parseContactLead } from "../lib/contact-lead.ts"
import { hubspotConfig, hubspotPayload, splitName, submitToHubSpot } from "../lib/hubspot.ts"

const valid = {
  name: "Ana María Ramírez",
  email: "Ana@Ejemplo.com ",
  phone: "829-555-1234",
  company: "Colmado Ana",
  service: "web",
  message: "Necesito una página para mi negocio con catálogo.",
  consent: true,
  pageUri: "https://averotechnology.com/contacto?utm_source=google",
  pageName: "Contacto",
  utm: { utm_source: "google", utm_medium: "cpc", evil: "x" },
}

test("accepts a valid lead and normalizes it", () => {
  const r = parseContactLead(valid)
  assert.equal(r.ok, true)
  if (!r.ok) return
  assert.equal(r.lead.email, "ana@ejemplo.com")
  assert.equal(r.lead.language, "es")
  assert.deepEqual(r.lead.utm, { utm_source: "google", utm_medium: "cpc" })
})

test("rejects missing consent, bad email, short message and bad phone", () => {
  for (const bad of [{ consent: false }, { email: "no-es-correo" }, { message: "hola" }, { phone: "12" }, { service: "x" }]) {
    const r = parseContactLead({ ...valid, ...bad })
    assert.equal(r.ok, false)
    assert.equal(r.spam, false)
  }
})

test("flags the honeypot as spam", () => {
  const r = parseContactLead({ ...valid, website: "http://spam" })
  assert.deepEqual(r, { ok: false, spam: true })
})

test("splits names for HubSpot", () => {
  assert.deepEqual(splitName("Ana María Ramírez"), { firstname: "Ana", lastname: "María Ramírez" })
  assert.deepEqual(splitName("Cher"), { firstname: "Cher", lastname: "" })
})

test("maps the lead to a Forms API v3 payload", () => {
  const r = parseContactLead(valid)
  assert.ok(r.ok)
  const p = hubspotPayload({ ...r.lead, hutk: "abc123" }, 1700000000000)
  const field = (n: string) => p.fields.find((f) => f.name === n)?.value
  assert.equal(p.submittedAt, "1700000000000")
  assert.equal(field("firstname"), "Ana")
  assert.equal(field("email"), "ana@ejemplo.com")
  assert.equal(field("company"), "Colmado Ana")
  assert.match(field("message")!, /Servicio de interés: Página web/)
  assert.match(field("message")!, /utm_source=google/)
  assert.equal(p.context.hutk, "abc123")
  assert.equal(p.legalConsentOptions.consent.consentToProcess, true)
  assert.ok(p.fields.every((f) => f.objectTypeId === "0-1"))
})

test("omits empty optional fields", () => {
  const r = parseContactLead({ ...valid, company: "" })
  assert.ok(r.ok)
  assert.equal(hubspotPayload(r.lead).fields.some((f) => f.name === "company"), false)
})

test("config needs portal and form", () => {
  assert.equal(hubspotConfig({}), null)
  assert.equal(hubspotConfig({ HUBSPOT_PORTAL_ID: "1" }), null)
  assert.deepEqual(hubspotConfig({ HUBSPOT_PORTAL_ID: "247980952", HUBSPOT_FORM_GUID_CONTACTO: "g-1" }), {
    portalId: "247980952",
    formGuid: "g-1",
    host: "https://api.hsforms.com",
  })
})

const cfg = { portalId: "247980952", formGuid: "g-1", host: "https://api.hsforms.com" }

test("posts to the submissions endpoint", async () => {
  let url = ""
  const res = await submitToHubSpot(cfg, { submittedAt: "1", fields: [], context: {}, legalConsentOptions: { consent: { consentToProcess: true, text: "" } } }, (async (u: string) => {
    url = u
    return new Response("{}", { status: 200 })
  }) as typeof fetch)
  assert.deepEqual(res, { ok: true })
  assert.equal(url, "https://api.hsforms.com/submissions/v3/integration/submit/247980952/g-1")
})

test("reports HubSpot errors and network failures without throwing", async () => {
  const payload = hubspotPayload(parseContactLead(valid).lead!)
  const bad = await submitToHubSpot(cfg, payload, (async () => new Response("INVALID_EMAIL", { status: 400 })) as typeof fetch)
  assert.equal(bad.ok, false)
  if (!bad.ok) assert.match(bad.error, /400/)
  const down = await submitToHubSpot(cfg, payload, (async () => { throw new Error("ECONNRESET") }) as typeof fetch)
  assert.equal(down.ok, false)
  if (!down.ok) assert.match(down.error, /ECONNRESET/)
})
