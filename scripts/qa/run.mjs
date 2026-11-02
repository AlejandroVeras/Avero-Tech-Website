#!/usr/bin/env node
// QA automático del sitio: cada página × ancho × tema.
// Uso: node scripts/qa/run.mjs [baseUrl] [--shots dir] [--only /ruta]
//   baseUrl por defecto http://localhost:3010 (los dos dominios se sirven en el mismo host en local).
// Variables opcionales: QA_LOGIN_FILE (JSON con email y password de una cuenta de prueba) para /dashboard.
// Escribe docs/qa/results.json y, con --shots, capturas de 390 y 1440 px.

import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const puppeteer = require(process.env.PUPPETEER_PATH ?? "puppeteer-core")
const AXE = fs.readFileSync(process.env.AXE_PATH ?? require.resolve("axe-core/axe.min.js"), "utf8")

const args = process.argv.slice(2)
const BASE = (args.find((a) => a.startsWith("http")) ?? "http://localhost:3010").replace(/\/$/, "")
const shotsDir = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null

const PUBLIC = [
  "/", "/catalogo", "/catalogo/demo-macbook-air-m2-13", "/catalogo/demo-samsung-galaxy-s21-ultra-256gb",
  "/catalogo/demo-hp-laptop-15-da1xxx-core-i5-16gb-512gb", "/catalogo/demo-logitech-k380",
  "/sistemas", "/sistemas/gestion", "/precios", "/soporte", "/contacto", "/garantia", "/terminos", "/privacidad",
  "/esta-pagina-no-existe", "/login", "/signup",
]
const PRIVATE = ["/dashboard", "/dashboard/products", "/dashboard/products/new", "/dashboard/tienda", "/dashboard/invoices", "/dashboard/customers", "/dashboard/reports", "/dashboard/suscripcion"]
const WIDTHS = [360, 390, 768, 1024, 1440]
const THEMES = ["light", "dark"]

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" })
const results = []
const linkStatus = new Map()

async function login() {
  const file = process.env.QA_LOGIN_FILE
  if (!file) return null
  const { email, password } = JSON.parse(fs.readFileSync(file, "utf8"))
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.goto(`${BASE}/login`, { waitUntil: "networkidle2" })
  await p.type("#email", email)
  await p.type("#password", password)
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}), p.click("form button[type=submit]")])
  await p.close()
  return ctx
}

async function audit(ctx, route, width, theme) {
  const p = await ctx.newPage()
  const consoleErrors = []
  p.on("console", (m) => {
    const t = m.text()
    if (m.type() === "error" || /hydrat/i.test(t)) consoleErrors.push(t.slice(0, 300))
  })
  p.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`))
  await p.setViewport({ width, height: width < 768 ? 844 : 900, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 })
  await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }])
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem("theme", t) } catch {} }, theme)
  const t0 = Date.now()
  const res = await p.goto(BASE + route, { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => ({ status: () => `ERR ${e.message}` }))
  const loadMs = Date.now() - t0
  await new Promise((r) => setTimeout(r, 500))
  const data = await p.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" }
    const small = [...document.querySelectorAll("a[href], button, input, select, textarea, [role=button]")]
      .filter(vis)
      .filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 44 || r.height < 44) && !el.closest("p, li > p, footer p, nav[aria-label='Ruta de navegación']") })
      .map((el) => `${el.tagName.toLowerCase()}:${(el.getAttribute("aria-label") || el.textContent || el.name || "").trim().slice(0, 30)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`)
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis).map((h) => Number(h.tagName[1]))
    const skips = headings.filter((h, i) => i > 0 && h - headings[i - 1] > 1).length
    return {
      title: document.title,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      h1: document.querySelectorAll("h1").length,
      headingSkips: skips,
      imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src.slice(-60)),
      smallTargets: small,
      links: [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => h.startsWith(location.origin)))],
      canonical: document.querySelector("link[rel=canonical]")?.href ?? null,
      ogImage: document.querySelector("meta[property='og:image']")?.content ?? null,
      jsonld: [...document.querySelectorAll("script[type='application/ld+json']")].map((s) => { try { return JSON.parse(s.textContent)["@type"] } catch { return "inválido" } }),
    }
  })
  let axe = []
  if (width === 390 || width === 1440) {
    await p.addScriptTag({ content: AXE })
    axe = await p.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" ") }))
    })
  }
  if (shotsDir && (width === 390 || width === 1440)) {
    const name = `${route === "/" ? "home" : route.replace(/^\//, "").replace(/[\/]/g, "_")}-${width}-${theme}.png`
    fs.mkdirSync(shotsDir, { recursive: true })
    await p.screenshot({ path: path.join(shotsDir, name), fullPage: true })
  }
  await p.close()
  return { route, width, theme, status: typeof res?.status === "function" ? res.status() : null, loadMs, consoleErrors, axe, ...data }
}

const pub = await browser.createBrowserContext()
const priv = await login()
const routes = [...PUBLIC.map((r) => [pub, r]), ...(priv ? PRIVATE.map((r) => [priv, r]) : [])].filter(([, r]) => !only || r === only)
for (const [ctx, route] of routes) {
  for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const r = await audit(ctx, route, width, theme)
      results.push(r)
      for (const l of r.links) if (!linkStatus.has(l)) linkStatus.set(l, null)
      process.stdout.write(`${route} ${width} ${theme}: ${r.status} ${r.consoleErrors.length}err ${r.axe.length}axe ${r.overflow ? "OVERFLOW" : ""}\n`)
    }
  }
}

// Internal links: one request each.
for (const l of linkStatus.keys()) {
  try {
    const res = await fetch(l, { redirect: "manual" })
    linkStatus.set(l, res.status)
  } catch (e) {
    linkStatus.set(l, `ERR ${e.message}`)
  }
}
const broken = [...linkStatus].filter(([, s]) => typeof s !== "number" || s >= 400)

fs.mkdirSync("docs/qa", { recursive: true })
fs.writeFileSync("docs/qa/results.json", JSON.stringify({ base: BASE, date: new Date().toISOString(), results, broken }, null, 1))
console.log(`\n${results.length} combinaciones; enlaces revisados: ${linkStatus.size}; rotos: ${broken.length}`)
for (const [l, s] of broken) console.log(`  roto ${s} ${l}`)
await browser.close()
