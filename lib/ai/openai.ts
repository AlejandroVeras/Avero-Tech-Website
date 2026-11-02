import "server-only"

// OpenAI Responses API over fetch (same approach as lib/email.ts with Resend).
// Docs: developers.openai.com/api/docs/guides/function-calling
const API = "https://api.openai.com/v1"

export const chatModel = () => process.env.OPENAI_MODEL ?? "gpt-6-luna"
const transcribeModel = () => process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe"

export function openaiConfigured() {
  return !!process.env.OPENAI_API_KEY
}

// US$ per 1M tokens (input, cached input, output), from the pricing page on 2026-11-01.
const PRICES: Record<string, [number, number, number]> = {
  "gpt-6-luna": [0.1, 0.01, 0.5],
  "gpt-6.1-terra": [1, 0.05, 5],
  "gpt-6.1-sol": [2, 0.1, 10],
  "gpt-5.6-luna": [0.2, 0.02, 1.2],
}

export type Usage = { input: number; cached: number; output: number }

export function estimateCost(model: string, u: Usage) {
  const [inp, cached, out] = PRICES[model] ?? PRICES["gpt-6.1-terra"]
  return ((u.input - u.cached) * inp + u.cached * cached + u.output * out) / 1_000_000
}

export type InputItem =
  | { role: "user" | "assistant"; content: string | ({ type: "input_text"; text: string } | { type: "input_image"; image_url: string })[] }
  | { type: "function_call"; call_id: string; name: string; arguments: string }
  | { type: "function_call_output"; call_id: string; output: string }
  | Record<string, unknown>

export type FunctionTool = {
  type: "function"
  name: string
  description: string
  parameters: Record<string, unknown>
  strict: true
}

export type OutputItem =
  | { type: "message"; content: { type: string; text?: string }[] }
  | { type: "function_call"; call_id: string; name: string; arguments: string }
  | { type: string; [k: string]: unknown }

export async function createResponse(input: { instructions: string; input: InputItem[]; tools: FunctionTool[]; model?: string }) {
  const model = input.model ?? chatModel()
  const res = await fetch(`${API}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: input.instructions,
      input: input.input,
      tools: input.tools,
      reasoning: { effort: process.env.OPENAI_REASONING ?? "low" },
      max_output_tokens: 2000,
      store: false,
    }),
    cache: "no-store",
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${JSON.stringify(json).slice(0, 300)}`)
  const usage: Usage = {
    input: json.usage?.input_tokens ?? 0,
    cached: json.usage?.input_tokens_details?.cached_tokens ?? 0,
    output: json.usage?.output_tokens ?? 0,
  }
  const output = (json.output ?? []) as OutputItem[]
  const text = output
    .filter((o): o is Extract<OutputItem, { type: "message" }> => o.type === "message")
    .flatMap((o) => o.content)
    .map((c) => c.text ?? "")
    .join("")
    .trim()
  return { model, output, text, usage }
}

export async function transcribe(audio: Uint8Array, mimeType: string) {
  const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mpeg") ? "mp3" : mimeType.includes("mp4") ? "m4a" : "ogg"
  const form = new FormData()
  form.append("file", new Blob([audio as BlobPart], { type: mimeType }), `nota.${ext}`)
  form.append("model", transcribeModel())
  form.append("language", "es")
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
    cache: "no-store",
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`OpenAI transcripción ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
  return String(json.text ?? "").trim()
}
