#!/usr/bin/env node
// Full-page screenshots of a few routes for visual review.
// Uso: node scripts/qa/shots.mjs <outDir> /ruta1 /ruta2 ...  (BASE por defecto http://localhost:3010)
// Opciones: --widths 390,1440  --themes light,dark  --hover-menu (abre el mega menú en 1440)
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const puppeteer = require(process.env.PUPPETEER_PATH ?? "puppeteer-core")

const args = process.argv.slice(2)
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def)
const out = args[0]
const routes = args.slice(1).filter((a) => a.startsWith("/"))
const BASE = process.env.BASE ?? "http://localhost:3010"
const widths = opt("--widths", "390,1440").split(",").map(Number)
const themes = opt("--themes", "light,dark").split(",")
const hoverMenu = args.includes("--hover-menu")
fs.mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new" })
for (const route of routes) {
  for (const width of widths) {
    for (const theme of themes) {
      const p = await browser.newPage()
      await p.setViewport({ width, height: width < 768 ? 844 : 900, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 })
      await p.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }, { name: "prefers-reduced-motion", value: args.includes("--scroll") ? "no-preference" : "reduce" }])
      await p.evaluateOnNewDocument((t) => { try { localStorage.setItem("theme", t) } catch {} }, theme)
      await p.goto(BASE + route, { waitUntil: "networkidle2", timeout: 120000 })
      const name = `${route.replace(/\//g, "_") || "_home"}-${width}-${theme}`
      if (hoverMenu && width >= 1024) {
        await p.hover('nav[aria-label="Principal"] a[href="/servicios"]')
        await new Promise((r) => setTimeout(r, 400))
        await p.screenshot({ path: path.join(out, `${name}-menu.png`) })
      }
      if (args.includes("--scroll")) {
        // Viewport-sized shots while scrolling, so scroll-triggered animations play like for a real visitor.
        const vh = p.viewport().height
        const total = await p.evaluate(() => document.documentElement.scrollHeight)
        for (let y = 0, i = 0; y < total; y += vh, i++) {
          await p.evaluate((top) => window.scrollTo(0, top), y)
          await new Promise((r) => setTimeout(r, 700))
          await p.screenshot({ path: path.join(out, `${name}-${String(i).padStart(2, "0")}.png`) })
        }
      } else {
        await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: !hoverMenu })
      }
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      console.log(name, overflow > 0 ? `OVERFLOW ${overflow}px` : "ok")
      await p.close()
    }
  }
}
await browser.close()
