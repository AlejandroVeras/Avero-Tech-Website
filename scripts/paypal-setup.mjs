#!/usr/bin/env node
// Crea en PayPal el producto, los 4 planes del sistema de gestión y el webhook, e imprime las
// variables de entorno para pegarlas en Vercel y .env.local.
//
// Uso (primero en sandbox):
//   PAYPAL_ENV=sandbox PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... \
//   node scripts/paypal-setup.mjs --webhook-url https://averotechnology.com/api/webhooks/paypal
//
// Opciones: --monthly 12 --annual 120 --trial-days 30 --currency USD --webhook-url <url>

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, arg, i, all) => (arg.startsWith("--") ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), []),
)
const monthly = String(args.monthly ?? "12")
const annual = String(args.annual ?? "120")
const trialDays = Number(args["trial-days"] ?? 30)
const currency = String(args.currency ?? "USD")
const webhookUrl = args["webhook-url"]

const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox"
const base = env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
const { PAYPAL_CLIENT_ID: clientId, PAYPAL_CLIENT_SECRET: clientSecret } = process.env
if (!clientId || !clientSecret) {
  console.error("Falta PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET (developer.paypal.com → Apps & Credentials).")
  process.exit(1)
}

const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: "grant_type=client_credentials",
})
if (!tokenRes.ok) {
  console.error(`PayPal rechazó las credenciales (${tokenRes.status}). ¿Son de ${env}?`)
  process.exit(1)
}
const { access_token: token } = await tokenRes.json()

async function call(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`Error en ${path} (${res.status}):`, JSON.stringify(json, null, 2))
    process.exit(1)
  }
  return json
}

const product = await call("/v1/catalogs/products", {
  name: "Sistema de gestión Avero",
  description: "Inventario, ventas a crédito, facturas con ITBIS y catálogo en línea.",
  type: "SERVICE",
  category: "SOFTWARE",
})

const regular = (unit, price) => ({
  frequency: { interval_unit: unit, interval_count: 1 },
  tenure_type: "REGULAR",
  sequence: 2,
  total_cycles: 0,
  pricing_scheme: { fixed_price: { value: price, currency_code: currency } },
})
const trial = { frequency: { interval_unit: "DAY", interval_count: trialDays }, tenure_type: "TRIAL", sequence: 1, total_cycles: 1 }

async function plan(name, cycles) {
  const created = await call("/v1/billing/plans", {
    product_id: product.id,
    name,
    status: "ACTIVE",
    billing_cycles: cycles,
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: { value: "0", currency_code: currency },
      setup_fee_failure_action: "CANCEL",
      // After 3 failed charges PayPal suspends the subscription (the app then goes read-only).
      payment_failure_threshold: 3,
    },
  })
  return created.id
}

const noTrial = (c) => c.map((x) => ({ ...x, sequence: 1 }))
const ids = {
  PAYPAL_PLAN_MONTHLY: await plan(`Mensual (${trialDays} días gratis)`, [trial, regular("MONTH", monthly)]),
  PAYPAL_PLAN_ANNUAL: await plan(`Anual (${trialDays} días gratis)`, [trial, regular("YEAR", annual)]),
  PAYPAL_PLAN_MONTHLY_NO_TRIAL: await plan("Mensual", noTrial([regular("MONTH", monthly)])),
  PAYPAL_PLAN_ANNUAL_NO_TRIAL: await plan("Anual", noTrial([regular("YEAR", annual)])),
}

let webhookId = ""
if (webhookUrl) {
  const hook = await call("/v1/notifications/webhooks", {
    url: webhookUrl,
    event_types: [
      "BILLING.SUBSCRIPTION.ACTIVATED",
      "BILLING.SUBSCRIPTION.UPDATED",
      "BILLING.SUBSCRIPTION.RE-ACTIVATED",
      "BILLING.SUBSCRIPTION.CANCELLED",
      "BILLING.SUBSCRIPTION.SUSPENDED",
      "BILLING.SUBSCRIPTION.EXPIRED",
      "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
      "PAYMENT.SALE.COMPLETED",
    ].map((name) => ({ name })),
  })
  webhookId = hook.id
}

console.log(`\nListo (${env}). Copia estas variables en Vercel y en .env.local:\n`)
console.log(`PAYPAL_ENV=${env}`)
console.log(`PAYPAL_CLIENT_ID=${clientId}`)
console.log("PAYPAL_CLIENT_SECRET=(el mismo que usaste aquí)")
for (const [k, v] of Object.entries(ids)) console.log(`${k}=${v}`)
console.log(webhookId ? `PAYPAL_WEBHOOK_ID=${webhookId}` : "PAYPAL_WEBHOOK_ID=(crea el webhook: vuelve a correr con --webhook-url)")
console.log(`\nDías de prueba configurados: ${trialDays}. Pon el mismo número en /admin/ajustes.`)
