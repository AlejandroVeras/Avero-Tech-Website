// The site chat bubble needs the OpenAI key and the WhatsApp leads tables (DATABASE_WHATSAPP_LEADS.sql).
// Until OPENAI_API_KEY is set in Vercel, the bubble stays hidden and the copy stops inviting people to try it.
export const CHAT_ENABLED = Boolean(process.env.OPENAI_API_KEY)

// Avero Inventario billing. While false, accounts get the free trial without PayPal and the owner
// collects the monthly fee by hand (registered from /admin/negocios). Flip to true to bring back
// automatic PayPal checkout; existing PayPal subscriptions keep syncing either way.
export const PAYPAL_CHECKOUT_ENABLED = false
