import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { getWebChat, sendWebChatMessage } from "@/lib/chat/web"

export const runtime = "nodejs"
export const maxDuration = 60

// The chat bubble on the site. The browser is identified only by a random httpOnly cookie.
const COOKIE = "av_chat"
const tokenSchema = z.string().uuid()

const body = z.object({
  text: z.string().trim().min(1).max(1000),
  page: z.string().max(200).nullable().optional(),
})

function tokenFrom(request: NextRequest) {
  const parsed = tokenSchema.safeParse(request.cookies.get(COOKIE)?.value)
  return parsed.success ? parsed.data : null
}

export async function GET(request: NextRequest) {
  const token = tokenFrom(request)
  if (!token) return NextResponse.json({ status: "bot", messages: [] })
  return NextResponse.json(await getWebChat(token), { headers: { "Cache-Control": "no-store" } })
}

export async function POST(request: NextRequest) {
  const parsed = body.safeParse(await request.json().catch((): null => null))
  if (!parsed.success) return NextResponse.json({ error: "Mensaje vacío o demasiado largo" }, { status: 400 })

  const token = tokenFrom(request) ?? crypto.randomUUID()
  const page = parsed.data.page?.startsWith("/") ? parsed.data.page : null
  const result = await sendWebChatMessage(token, parsed.data.text, page)

  const res = NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 })
  return res
}
