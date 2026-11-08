import { redirect } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"
import { getUser } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export const metadata = { title: "Iniciar sesión", robots: { index: false } }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  // Only same-site paths, so the login can't be used to bounce people to another site.
  const target = next && /^\/(?!\/)/.test(next) ? next : "/dashboard"
  const user = await getUser()

  if (user) {
    redirect(target)
  }

  return (
    <AuthShell title="Entrar a Avero Inventario" description="Tu inventario, tus facturas y lo que te deben, desde cualquier dispositivo.">
      <LoginForm next={target} />
    </AuthShell>
  )
}
