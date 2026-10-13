import { redirect } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/site/logo"
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
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background p-4">
      <Link href="/" aria-label="Avero Tech, inicio">
        <Logo className="h-10" />
      </Link>
      <LoginForm next={target} />
    </main>
  )
}
