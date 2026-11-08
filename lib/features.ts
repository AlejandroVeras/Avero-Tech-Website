// The site chat bubble needs the OpenAI key and the WhatsApp leads tables (DATABASE_WHATSAPP_LEADS.sql).
// Until OPENAI_API_KEY is set in Vercel, the bubble stays hidden and the copy stops inviting people to try it.
export const CHAT_ENABLED = Boolean(process.env.OPENAI_API_KEY)
