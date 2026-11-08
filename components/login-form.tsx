"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

function loginError(error: { message: string; status?: number }) {
  if (error.status === 429) return "Demasiados intentos. Espera unos minutos e intenta de nuevo."
  if (error.message.includes("Email not confirmed")) return "Confirma tu correo primero: te enviamos un enlace al registrarte."
  return "Correo o contraseña incorrectos."
}

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(e.currentTarget)
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    })
    if (signInError) {
      setError(loginError(signInError))
      setLoading(false)
      return
    }
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required disabled={loading} className="h-12 text-base" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required disabled={loading} className="h-12 text-base" />
      </div>
      <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {loading ? "Entrando…" : "Entrar"}
      </Button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="text-primary underline underline-offset-4 dark:text-sky-signal">
          Crea una gratis
        </Link>
      </p>
    </form>
  )
}
