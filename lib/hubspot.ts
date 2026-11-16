// HubSpot Forms Submissions API v3, called only from the server.
// The endpoint needs no token: portal ID + form GUID are enough, and the form keeps its
// HubSpot features (lead source "Form submission", notifications, workflows).
// Only standard contact properties are sent, so no custom properties have to exist in HubSpot:
// the service, language and campaign data travel inside "message".
import { LEAD_SERVICES, type ContactLead } from "./contact-lead.ts"

export type HubSpotConfig = { portalId: string; formGuid: string; host: string }

export function hubspotConfig(env: Record<string, string | undefined> = process.env, form: "contacto" | "soporte" = "contacto"): HubSpotConfig | null {
  const portalId = env.HUBSPOT_PORTAL_ID?.trim()
  const formGuid = (form === "contacto" ? env.HUBSPOT_FORM_GUID_CONTACTO : env.HUBSPOT_FORM_GUID_SOPORTE)?.trim()
  if (!portalId || !formGuid) return null
  const host = (env.HUBSPOT_FORMS_HOST?.trim() || "https://api.hsforms.com").replace(/\/$/, "")
  return { portalId, formGuid, host }
}

export const CONSENT_TEXT =
  "Acepto que Avero Technology guarde mis datos para responder a mi solicitud, según su política de privacidad."

export function splitName(full: string): { firstname: string; lastname: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return { firstname: parts[0], lastname: "" }
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") }
}

export function hubspotMessage(lead: Pick<ContactLead, "service" | "message" | "language" | "pageUri" | "utm">): string {
  const lines = [lead.message, "", `Servicio de interés: ${LEAD_SERVICES[lead.service]}`, `Idioma de la página: ${lead.language}`]
  if (lead.pageUri) lines.push(`Página de origen: ${lead.pageUri}`)
  const utm = Object.entries(lead.utm ?? {})
  if (utm.length) lines.push(`Campaña: ${utm.map(([k, v]) => `${k}=${v}`).join(", ")}`)
  return lines.join("\n")
}

export function hubspotPayload(lead: ContactLead & { hutk?: string | null }, submittedAt = Date.now()) {
  const { firstname, lastname } = splitName(lead.name)
  const fields: { objectTypeId: "0-1"; name: string; value: string }[] = [
    { objectTypeId: "0-1", name: "firstname", value: firstname },
    { objectTypeId: "0-1", name: "lastname", value: lastname },
    { objectTypeId: "0-1", name: "email", value: lead.email },
    { objectTypeId: "0-1", name: "phone", value: lead.phone },
    { objectTypeId: "0-1", name: "company", value: lead.company ?? "" },
    { objectTypeId: "0-1", name: "message", value: hubspotMessage(lead) },
  ].filter((f) => f.value !== "") as { objectTypeId: "0-1"; name: string; value: string }[]

  const context: Record<string, string> = {}
  if (lead.hutk) context.hutk = lead.hutk
  if (lead.pageUri) context.pageUri = lead.pageUri
  if (lead.pageName) context.pageName = lead.pageName

  return {
    submittedAt: String(submittedAt),
    fields,
    context,
    legalConsentOptions: { consent: { consentToProcess: true, text: CONSENT_TEXT } },
  }
}

export type SubmitResult = { ok: boolean; error?: string }

export async function submitToHubSpot(
  config: HubSpotConfig,
  payload: ReturnType<typeof hubspotPayload>,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  const url = `${config.host}/submissions/v3/integration/submit/${encodeURIComponent(config.portalId)}/${encodeURIComponent(config.formGuid)}`
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    })
    if (res.ok) return { ok: true }
    const body = await res.text().catch(() => "")
    return { ok: false, error: `HubSpot ${res.status}: ${body.slice(0, 300)}` }
  } catch (e) {
    return { ok: false, error: `HubSpot sin respuesta: ${e instanceof Error ? e.message : String(e)}` }
  }
}
