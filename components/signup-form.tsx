"use client"

import type React from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/password-strength"
import { checkPassword, isStrongPassword, weakPasswordMessage } from "@/lib/password-policy"

function signupError(error: { message: string; status?: number; code?: string }) {
  if (error.status === 429) return "Demasiados intentos. Espera unos minutos e intenta de nuevo."
  if (error.code === "weak_password") return "Esa contraseña no es lo bastante segura. Usa una más larga y que no sea fácil de adivinar."
  if (error.code === "user_already_exists" || error.message.includes("already registered")) return "Ya existe una cuenta con ese correo. Entra con tu contraseña."
  return "No pudimos crear la cuenta. Revisa los datos e intenta de nuevo."
}

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const checks = useMemo(() => checkPassword(password, { email, name: businessName }), [password, email, businessName])
  const strong = isStrongPassword(checks)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!strong) {
      setError(weakPasswordMessage(checks))
      return
    }
    setLoading(true)
    setError("")
    const { data, error: signUpError } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: { data: { business_name: businessName.trim() } },
    })
    if (signUpError) {
      setError(signupError(signUpError))
      setLoading(false)
      return
    }
    if (data.user) {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input
          id="businessName"
          name="businessName"
          autoComplete="organization"
          placeholder="Ej: Colmado La Esquina"
          required
          disabled={loading}
          className="h-12 text-base"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          required
          disabled={loading}
          className="h-12 text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={10}
          disabled={loading}
          className="h-12 text-base"
          aria-describedby="password-rules"
          aria-invalid={password.length > 0 && !strong}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrength id="password-rules" checks={checks} show={password.length > 0} />
      </div>
      <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} {loading ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary underline underline-offset-4 dark:text-sky-signal">
          Entra aquí
        </Link>
      </p>
    </form>
  )
}
