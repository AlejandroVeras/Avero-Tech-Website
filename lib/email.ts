import "server-only"

const API_BASE = (process.env.RESEND_API_BASE ?? "https://api.resend.com").replace(/\/$/, "")

export function emailConfigured() {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
}

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  if (!emailConfigured()) throw new Error("El correo no está configurado")
  const res = await fetch(`${API_BASE}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`No se pudo enviar el correo (${res.status}): ${(await res.text().catch(() => "")).slice(0, 200)}`)
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

export function trialEndingEmail(input: { businessName: string; chargeDate: string; amount: string; period: string; manageUrl: string }) {
  const subject = `Tu prueba gratis termina el ${input.chargeDate}`
  const text =
    `Hola ${input.businessName}:\n\n` +
    `Tu prueba gratis del sistema de gestión de Avero Technology termina el ${input.chargeDate}. ` +
    `Ese día se cobrarán ${input.amount} con PayPal y luego cada ${input.period}.\n\n` +
    `Si quieres seguir, no tienes que hacer nada. Si prefieres no continuar, cancela antes de esa fecha desde ${input.manageUrl} y no se te cobrará.\n\n` +
    `Avero Technology`
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1d1d1f">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="background:#ffffff;border-radius:20px;padding:32px">
      <h1 style="margin:0 0 12px;font-size:22px">Tu prueba gratis termina el ${escapeHtml(input.chargeDate)}</h1>
      <p style="font-size:15px;line-height:1.5;color:#424245">Hola ${escapeHtml(input.businessName)}:</p>
      <p style="font-size:15px;line-height:1.5;color:#424245">Ese día se cobrarán <strong style="color:#1d1d1f">${escapeHtml(input.amount)}</strong> con PayPal y luego cada ${escapeHtml(input.period)}. Si quieres seguir usando el sistema, no tienes que hacer nada.</p>
      <p style="font-size:15px;line-height:1.5;color:#424245">Si prefieres no continuar, cancela antes de esa fecha y no se te cobrará.</p>
      <p style="margin:24px 0 0"><a href="${escapeHtml(input.manageUrl)}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:980px;font-size:15px">Ver mi suscripción</a></p>
    </div>
    <p style="text-align:center;font-size:12px;color:#636366;margin-top:16px">Avero Technology · Santo Domingo, República Dominicana</p>
  </div></body></html>`
  return { subject, html, text }
}
