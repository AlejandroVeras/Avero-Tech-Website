"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bubbleGapMs } from "@/lib/whatsapp/humanize"
import { whatsappUrl } from "@/lib/site"
import { cn } from "@/lib/utils"

// Chat bubble on every public page. Answers come from the same AI seller as WhatsApp (/api/chat).

type Msg = { id: string; from: "cliente" | "bot" | "humano"; text: string }

const GREETING: Msg = { id: "saludo", from: "bot", text: "¡Hola! ¿Qué está buscando hoy? Le ayudo con precios, disponibilidad y pedidos." }
const POLL_MS = 6000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function ChatWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [status, setStatus] = useState<"bot" | "humano" | "cerrada">("bot")
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState("")
  const [loaded, setLoaded] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load the previous conversation the first time the panel opens.
  useEffect(() => {
    if (!open || loaded) return
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { status: typeof status; messages: Msg[] }) => {
        setMessages(d.messages)
        setStatus(d.status)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [open, loaded])

  // While a person is answering from /admin/pedidos, pick up their replies.
  useEffect(() => {
    if (!open || status !== "humano") return
    const id = setInterval(() => {
      fetch("/api/chat")
        .then((r) => r.json())
        .then((d: { status: typeof status; messages: Msg[] }) => {
          setMessages(d.messages)
          setStatus(d.status)
        })
        .catch(() => {})
    }, POLL_MS)
    return () => clearInterval(id)
  }, [open, status])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    const body = text.trim()
    if (!body || typing) return
    setText("")
    setMessages((m) => [...m, { id: `c-${Date.now()}`, from: "cliente", text: body }])
    setTyping(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body, page: pathname }),
      })
      const data: { status?: typeof status; bubbles?: string[]; error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error)
      // The model's own latency already reads as typing; later bubbles get a short pause.
      for (const [i, bubble] of (data.bubbles ?? []).entries()) {
        if (i > 0) {
          setTyping(true)
          await sleep(bubbleGapMs())
        }
        setTyping(false)
        setMessages((m) => [...m, { id: `b-${Date.now()}-${i}`, from: "bot", text: bubble }])
      }
      if (data.status) setStatus(data.status)
    } catch {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, from: "bot", text: "No pude enviar su mensaje. Intente de nuevo o escríbanos por WhatsApp." }])
    } finally {
      setTyping(false)
    }
  }

  // Product pages have a sticky buy bar on phones; sit above it.
  const raised = /^\/catalogo\/[^/]+$/.test(pathname)
  const shown = [GREETING, ...messages]

  return (
    <div className={cn("fixed right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6", raised ? "bottom-24" : "bottom-4")}>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            aria-label="Chat con Avero Technology"
            className={cn(
              "flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-pale-mist/70 bg-background shadow-2xl md:h-[min(560px,calc(100dvh-7rem))]",
              raised ? "h-[min(560px,calc(100dvh-13rem))]" : "h-[min(560px,calc(100dvh-7rem))]",
            )}
          >
            <header className="flex items-center gap-3 border-b border-pale-mist/70 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Avero Technology</p>
                <p className="text-xs text-muted-foreground">{status === "humano" ? "Le atiende una persona del equipo" : "Asistente virtual · responde al instante"}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpen(false)} aria-label="Cerrar el chat">
                <X className="h-4 w-4" />
              </Button>
            </header>

            <ol ref={listRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4" aria-live="polite">
              {shown.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.from === "cliente" ? "self-end rounded-br-md bg-primary text-primary-foreground" : "self-start rounded-bl-md bg-muted",
                  )}
                >
                  {m.text}
                </li>
              ))}
              {typing && (
                <li className="self-start rounded-2xl rounded-bl-md bg-muted px-3.5 py-3" aria-label="Escribiendo">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </span>
                </li>
              )}
            </ol>

            {status === "humano" && (
              <div className="px-4 pb-2">
                <Button asChild className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                  <a href={whatsappUrl("Hola, vengo del chat de la página web.")} target="_blank" rel="noopener noreferrer">
                    Seguir por WhatsApp
                  </a>
                </Button>
              </div>
            )}

            <form onSubmit={send} className="flex items-end gap-2 border-t border-pale-mist/70 px-3 py-3">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) send(e)
                }}
                rows={1}
                maxLength={1000}
                placeholder="Escriba su mensaje…"
                aria-label="Mensaje"
                className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-pale-mist/70 bg-background px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!text.trim() || typing} aria-label="Enviar">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="px-4 pb-3 text-[11px] text-muted-foreground">
              Usamos sus datos solo para atender su pedido.{" "}
              <Link href="/privacidad" className="underline underline-offset-2">
                Privacidad
              </Link>
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar el chat" : "Abrir el chat"}
        aria-expanded={open}
        className="h-14 w-14 rounded-full shadow-lg"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
