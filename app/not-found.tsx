import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/site/logo"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <Link href="/" aria-label="Avero Tech, inicio">
        <Logo className="h-10" />
      </Link>
      <h1 className="mt-10 text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">
        No encontramos esta página
      </h1>
      <p className="mt-3 text-body text-pewter max-w-md">
        El enlace puede estar mal escrito o la página ya no existe.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button size="lg" className="rounded-full px-6 text-[14px] font-normal" asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-full px-6 text-[14px] font-normal border-sapphire text-sapphire bg-transparent hover:bg-sapphire/5 hover:text-sapphire dark:border-sky-signal dark:text-sky-signal"
          asChild
        >
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    </main>
  )
}
