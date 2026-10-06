import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <section className="py-28 bg-background">
      <div className="container mx-auto px-4 text-center max-w-lg">
        <h1 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">
          Este equipo ya no está disponible
        </h1>
        <p className="mt-3 text-body text-pewter">
          Puede que se haya vendido o que el enlace haya cambiado. Mira lo que tenemos ahora en el catálogo.
        </p>
        <Button size="lg" className="mt-8 rounded-full px-6 text-[14px] font-normal" asChild>
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    </section>
  )
}
