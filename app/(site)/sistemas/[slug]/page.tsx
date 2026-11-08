import { notFound, permanentRedirect, redirect } from "next/navigation"
import { getPublishedSystem } from "@/lib/data/systems"

// Every published system has its own page (/sistemas/inventario, /citas, /condominios).
// This route only catches other slugs: it sends them to the system's app or to the list.
const PAGES: Record<string, string> = { gestion: "/sistemas/inventario", citas: "/sistemas/citas", condominios: "/sistemas/condominios" }

type Params = { params: Promise<{ slug: string }> }

export default async function SystemSlugPage({ params }: Params) {
  const { slug } = await params
  if (PAGES[slug]) permanentRedirect(PAGES[slug])
  const system = await getPublishedSystem(slug)
  if (!system) notFound()
  redirect(system.externalUrl ?? "/sistemas")
}
