#!/usr/bin/env node
// Inventario de prueba para el catálogo de averotechnology.com (QA, Fase 1).
//
// Lee scripts/demo-catalog.json y trabaja solo con la cuenta is_store_owner:
//   node --env-file=.env.local scripts/seed-demo-images.mjs              simulación: descarga y comprime las fotos, no escribe nada
//   node --env-file=.env.local scripts/seed-demo-images.mjs --apply      crea/actualiza los productos demo- y sube sus fotos
//   node --env-file=.env.local scripts/seed-demo-images.mjs --rollback   borra los productos demo-, sus fotos y los archivos
//   node scripts/seed-demo-images.mjs --write-sql                        regenera DATABASE_DEMO_SEED.sql y docs/demo-credits.md
//
// Solo toca products y product_images. Al terminar compara el conteo de facturas, cotizaciones,
// pagos, clientes, financiamientos, tickets y gastos para demostrar que no cambiaron.
// Necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY (solo servidor).

import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const catalog = JSON.parse(fs.readFileSync(path.join(root, "scripts/demo-catalog.json"), "utf8")).products
const CACHE = path.join(root, "scripts/.demo-cache")
const BUCKET = "product-images"
const UA = { "User-Agent": "AveroDemoSeed/1.0 (info@averotechnology.com)" }
// Tables the seed must never change.
const UNTOUCHED = ["invoices", "invoice_items", "quotes", "quote_items", "payments", "customers", "financing_payments", "tickets", "ticket_messages", "expenses"]

const mode = process.argv.includes("--apply") ? "apply" : process.argv.includes("--rollback") ? "rollback" : process.argv.includes("--write-sql") ? "sql" : "dry"

if (mode === "sql") {
  writeSql()
  writeCredits()
  process.exit(0)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SECRET_KEY
if (!url || !key) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY (usa --env-file=.env.local)")
const db = createClient(url, key, { auth: { persistSession: false } })

const { data: owner, error: ownerError } = await db.from("profiles").select("id, business_name").eq("is_store_owner", true).limit(1).maybeSingle()
if (ownerError || !owner) throw new Error(`No encontré la cuenta is_store_owner: ${ownerError?.message ?? "sin filas"}`)
const folder = `${owner.id}/demo`
console.log(`Cuenta dueña del catálogo: ${owner.business_name} (${mode})`)

const before = await counts()

if (mode === "dry" || mode === "apply") {
  const { data: sample, error } = await db.from("products").select("*").limit(1)
  if (error) throw new Error(`products: ${error.message}`)
  const columns = new Set(Object.keys(sample?.[0] ?? {}))
  const missing = ["slug", "brand", "condition", "warranty_months", "specs", "featured", "is_public", "track_inventory"].filter((c) => columns.size && !columns.has(c))
  if (missing.length) throw new Error(`A products le faltan columnas: ${missing.join(", ")}`)

  let photos = 0
  for (const p of catalog) {
    const files = []
    for (let i = 0; i < p.images.length; i++) files.push(await photo(p.slug, i, p.images[i].file))
    photos += files.length
    if (mode === "apply") await upsert(p, files)
    console.log(`  ${mode === "apply" ? "✓" : "·"} ${p.slug} (${files.length} fotos)`)
  }
  console.log(`${catalog.length} productos, ${photos} fotos en WebP ≤ 1600 px${mode === "dry" ? ". Simulación: no se escribió nada." : ""}`)
}

if (mode === "rollback") {
  const { data: rows } = await db.from("products").select("id").eq("user_id", owner.id).like("slug", "demo-%")
  const ids = (rows ?? []).map((r) => r.id)
  if (ids.length) {
    await must(db.from("product_images").delete().in("product_id", ids), "borrar product_images")
    await must(db.from("products").delete().in("id", ids), "borrar products")
  }
  const { data: objects } = await db.storage.from(BUCKET).list(folder, { limit: 1000 })
  const paths = (objects ?? []).map((o) => `${folder}/${o.name}`)
  if (paths.length) await must(db.storage.from(BUCKET).remove(paths), "borrar archivos")
  console.log(`Borrados ${ids.length} productos demo- y ${paths.length} archivos de ${BUCKET}/${folder}`)
}

const after = await counts()
const changed = UNTOUCHED.filter((t) => before[t] !== after[t])
console.log("\nTablas que no deben cambiar (antes → después):")
for (const t of UNTOUCHED) console.log(`  ${t.padEnd(20)} ${before[t]} → ${after[t]}`)
if (changed.length) {
  console.error(`ATENCIÓN: cambiaron ${changed.join(", ")}`)
  process.exit(1)
}

// ─────────────────────────────────────────────────────────────

async function counts() {
  const out = {}
  for (const t of UNTOUCHED) {
    const { count, error } = await db.from(t).select("*", { count: "exact", head: true })
    out[t] = error ? `n/d (${error.message})` : count
  }
  return out
}

async function must(promise, what) {
  const { error } = await promise
  if (error) throw new Error(`${what}: ${error.message}`)
}

/** Downloads one Commons photo once and keeps a WebP copy no larger than 1600 px, like lib/image.ts. */
async function photo(slug, index, file) {
  fs.mkdirSync(CACHE, { recursive: true })
  const out = path.join(CACHE, `${slug}-${index + 1}.webp`)
  if (!fs.existsSync(out)) {
    const src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`
    const res = await fetch(src, { headers: UA, redirect: "follow" })
    if (!res.ok) throw new Error(`No pude descargar ${file}: HTTP ${res.status}`)
    const input = Buffer.from(await res.arrayBuffer())
    await sharp(input).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toFile(out)
  }
  return out
}

async function upsert(p, files) {
  const row = {
    user_id: owner.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    condition: p.condition,
    price: p.price,
    warranty_months: p.warranty_months,
    featured: p.featured,
    stock_quantity: p.stock_quantity,
    track_inventory: true,
    is_public: true,
    description: p.description,
    specs: p.specs,
  }
  const { data: existing } = await db.from("products").select("id").eq("user_id", owner.id).eq("slug", p.slug).maybeSingle()
  const { data: saved, error } = existing
    ? await db.from("products").update(row).eq("id", existing.id).select("id").single()
    : await db.from("products").insert(row).select("id").single()
  if (error) throw new Error(`${p.slug}: ${error.message}`)

  await must(db.from("product_images").delete().eq("product_id", saved.id), `${p.slug}: limpiar fotos`)
  for (let i = 0; i < files.length; i++) {
    const storagePath = `${folder}/${path.basename(files[i])}`
    await must(
      db.storage.from(BUCKET).upload(storagePath, fs.readFileSync(files[i]), { contentType: "image/webp", cacheControl: "31536000", upsert: true }),
      `${p.slug}: subir foto ${i + 1}`,
    )
    const publicUrl = db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
    await must(
      db.from("product_images").insert({ product_id: saved.id, user_id: owner.id, storage_path: storagePath, url: publicUrl, position: i }),
      `${p.slug}: registrar foto ${i + 1}`,
    )
  }
}

function sql(v) {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
  return `'${String(v).replace(/'/g, "''")}'`
}

function writeSql() {
  const values = catalog
    .map((p) => `  (${[p.slug, p.name, p.brand, p.category, p.condition, p.price, p.warranty_months, p.featured, p.stock_quantity, p.description, p.specs].map(sql).join(", ")})`)
    .join(",\n")
  const text = `-- ============================================================================
-- AVERO TECHNOLOGY — INVENTARIO DE PRUEBA DEL CATÁLOGO (QA, noviembre 2026)
-- ----------------------------------------------------------------------------
-- * ${catalog.length} productos de tecnología en la cuenta is_store_owner, todos con
--   slug "demo-…" para poder borrarlos sin tocar los productos reales.
-- * Solo inserta en products. Las fotos (Wikimedia Commons, ver
--   docs/demo-credits.md) se suben con scripts/seed-demo-images.mjs --apply,
--   que también ejecuta lo equivalente a este archivo. Úsalo solo si quieres
--   los productos sin fotos.
-- * No crea facturas, cotizaciones, pagos, clientes, financiamientos,
--   tickets ni gastos.
-- * Idempotente: si el producto demo ya existe, lo actualiza.
-- Generado con: node scripts/seed-demo-images.mjs --write-sql
-- ============================================================================

WITH owner AS (
  SELECT id FROM public.profiles WHERE is_store_owner = true LIMIT 1
),
demo (slug, name, brand, category, condition, price, warranty_months, featured, stock_quantity, description, specs) AS (
  VALUES
${values}
)
INSERT INTO public.products (user_id, slug, name, brand, category, condition, price, warranty_months, featured, stock_quantity, track_inventory, is_public, description, specs)
SELECT owner.id, d.slug, d.name, d.brand, d.category, d.condition, d.price, d.warranty_months, d.featured, d.stock_quantity, true, true, d.description, d.specs
FROM demo d CROSS JOIN owner
ON CONFLICT (user_id, slug) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, category = EXCLUDED.category, condition = EXCLUDED.condition,
  price = EXCLUDED.price, warranty_months = EXCLUDED.warranty_months, featured = EXCLUDED.featured,
  stock_quantity = EXCLUDED.stock_quantity, is_public = true, description = EXCLUDED.description, specs = EXCLUDED.specs;

SELECT count(*) AS productos_demo FROM public.products WHERE slug LIKE 'demo-%';

-- ROLLBACK -------------------------------------------------------------------
-- Borra los productos de prueba y sus filas de fotos. Los archivos de Storage
-- (carpeta <id del dueño>/demo/ del bucket product-images) se borran con:
--   node --env-file=.env.local scripts/seed-demo-images.mjs --rollback
-- que hace todo esto y además elimina los archivos.
--
-- DELETE FROM public.product_images WHERE product_id IN (SELECT id FROM public.products WHERE slug LIKE 'demo-%');
-- DELETE FROM public.products WHERE slug LIKE 'demo-%';
`
  fs.writeFileSync(path.join(root, "DATABASE_DEMO_SEED.sql"), text)
  console.log("DATABASE_DEMO_SEED.sql escrito")
}

function writeCredits() {
  const lines = catalog.flatMap((p) =>
    p.images.map((img, i) => `| \`${p.slug}-${i + 1}.webp\` | [${img.file}](${img.page}) | ${img.author || "Sin autor indicado"} | ${img.license} |`),
  )
  const text = `# Créditos de las fotos del inventario de prueba

Las fotos de los productos \`demo-…\` vienen de [Wikimedia Commons](https://commons.wikimedia.org) y tienen licencia libre: CC0, dominio público, CC BY o CC BY-SA. Se usan solo para probar el catálogo y se borran con \`node --env-file=.env.local scripts/seed-demo-images.mjs --rollback\`.

Unsplash y Pexels bloquean la descarga automática, por eso se usó Commons, que además tiene fotos de los modelos exactos.

Las licencias CC BY y CC BY-SA piden mencionar al autor y la licencia. Si alguna foto se queda publicada fuera de las pruebas, hay que mostrar este crédito junto a ella.

| Archivo | Original | Autor | Licencia |
|---|---|---|---|
${lines.join("\n")}
`
  fs.mkdirSync(path.join(root, "docs"), { recursive: true })
  fs.writeFileSync(path.join(root, "docs/demo-credits.md"), text)
  console.log("docs/demo-credits.md escrito")
}
