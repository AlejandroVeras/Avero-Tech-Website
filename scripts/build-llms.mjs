#!/usr/bin/env node
// Builds public/llms.txt and public/llms-full.txt from the pages as they render, so the files
// never carry pending placeholders and always match what visitors read.
// Uso: node scripts/build-llms.mjs [baseUrl]   (por defecto http://localhost:3010; necesita puppeteer-core, como scripts/qa)
import fs from "node:fs"

const BASE = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "")
const SITE = "https://averotechnology.com"
const PAGES = [
  "/", "/servicios", "/servicios/diseno-paginas-web", "/servicios/desarrollo-portales-web", "/servicios/posicionamiento-seo",
  "/servicios/inteligencia-artificial-para-negocios", "/servicios/chatbots-ia-whatsapp", "/servicios/soporte-tecnico",
  "/sistemas", "/sistemas/inventario", "/sistemas/citas", "/sistemas/condominios", "/precios", "/nosotros", "/contacto",
]
const PLACEHOLDER = /\[(DATO REAL|PRECIO|CASO REAL|X)\b/

// Read the rendered DOM (skipping decorative aria-hidden parts, navigation and scripts) and emit Markdown.
function domToMarkdown() {
  const out = []
  document.querySelectorAll("[aria-hidden='true'], svg").forEach((e) => e.remove())
  document.querySelectorAll("details").forEach((d) => (d.open = true))
  // innerText keeps block boundaries; join them as sentences.
  const clean = (s) => s.split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x, i, a) => (i < a.length - 1 && !/[.:;?!]$/.test(x) ? `${x}:` : x)).join(" ").replace(/\s+/g, " ").trim()
  const nodes = document.querySelectorAll("main h1, main h2, main h3, main p, main li, main tr, main summary")
  for (const el of nodes) {
    if (el.closest("[aria-hidden='true'], nav")) continue
    if (el.tagName === "TR") {
      const cells = [...el.children].map((c) => clean(c.innerText))
      if (!cells.some(Boolean)) continue
      out.push(`| ${cells.join(" | ")} |`)
      if (el.parentElement.tagName === "THEAD") out.push(`|${cells.map(() => "---").join("|")}|`)
      continue
    }
    if (el.closest("li") && el.tagName !== "LI") continue
    if (el.closest("td, th")) continue
    const t = clean(el.innerText)
    if (!t) continue
    if (el.tagName === "H1") out.push(`\n# ${t}\n`)
    else if (el.tagName === "H2") out.push(`\n## ${t}\n`)
    else if (el.tagName === "H3" || el.tagName === "SUMMARY") out.push(`\n### ${t}\n`)
    else if (el.tagName === "LI") { if (!el.querySelector("h2, h3")) out.push(`- ${t}`) }
    else out.push(t)
  }
  return out.filter((l, i) => l !== out[i - 1]).join("\n").replace(/\n{3,}/g, "\n\n").trim()
}

const llms = fs.readFileSync(new URL("../docs/contenido/llms.txt", import.meta.url), "utf8")
if (PLACEHOLDER.test(llms)) throw new Error("docs/contenido/llms.txt has placeholders")

const { createRequire } = await import("node:module")
const puppeteer = createRequire(import.meta.url)(process.env.PUPPETEER_PATH ?? "puppeteer-core")
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" })
const sections = []
for (const path of PAGES) {
  const page = await browser.newPage()
  const res = await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 120000 })
  if (!res.ok()) throw new Error(`${path}: ${res.status()}`)
  const md = await page.evaluate(domToMarkdown)
  sections.push(`URL: ${SITE}${path === "/" ? "/" : path}\n\n${md}`)
  await page.close()
}
await browser.close()
const full = `${llms.trim()}\n\n---\n\n${sections.join("\n\n---\n\n")}\n`
if (PLACEHOLDER.test(full)) throw new Error("llms-full.txt would publish a placeholder")

fs.writeFileSync(new URL("../public/llms.txt", import.meta.url), llms)
fs.writeFileSync(new URL("../public/llms-full.txt", import.meta.url), full)
console.log(`llms.txt ${llms.length} chars, llms-full.txt ${full.length} chars, ${PAGES.length} pages`)
