import Link from "next/link"

export default function TenantNotFound() {
  return (
    <section className="py-28">
      <div className="container mx-auto px-4 text-center max-w-lg">
        <h1 className="text-3xl md:text-heading-lg font-semibold tracking-[-0.02em] text-obsidian dark:text-foreground">
          No encontramos esta página
        </h1>
        <p className="mt-3 text-body text-pewter">
          Puede que el producto ya no esté disponible o que la tienda haya cambiado su dirección.
        </p>
        <Link href="/sistemas/gestion" className="mt-8 inline-block text-[14px] text-sapphire dark:text-sky-signal hover:underline underline-offset-4">
          ¿Tienes un negocio? Crea tu catálogo en línea &gt;
        </Link>
      </div>
    </section>
  )
}
