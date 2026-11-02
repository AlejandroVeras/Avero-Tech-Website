#!/usr/bin/env node
// Runs the 10 simulated WhatsApp conversations (ADR-003 §11) against each model and writes the
// transcripts side by side. Nothing is sent to WhatsApp and no order is stored.
// Uso (con `pnpm dev -p 3010` corriendo): node scripts/whatsapp-sim.mjs [modelo...] [--base http://localhost:3010] [--only id,id]
import fs from "node:fs"

const args = process.argv.slice(2)
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null)
const BASE = flag("--base") ?? "http://localhost:3010"
const ids = flag("--only")?.split(",")
const models = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"))
if (models.length === 0) models.push("gpt-6-luna", "gpt-6.1-terra")

const summary = []
let md = `# Simulación del asistente de WhatsApp\n\nFecha: ${new Date().toISOString().slice(0, 10)} · Catálogo real · Sin envíos a WhatsApp\n\n`

for (const model of models) {
  const res = await fetch(`${BASE}/api/dev/whatsapp-sim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, ids }),
  })
  const json = await res.json()
  if (!res.ok) {
    console.error(`${model}: ${json.error}`)
    process.exitCode = 1
    continue
  }
  const turns = json.results.flatMap((r) => r.turns)
  const latencies = turns.map((t) => t.ms).sort((a, b) => a - b)
  const pct = (p) => latencies[Math.min(latencies.length - 1, Math.floor(p * latencies.length))]
  const row = {
    model,
    cost: json.results.reduce((s, r) => s + r.cost, 0),
    p50: pct(0.5),
    p95: pct(0.95),
    styleIssues: turns.reduce((s, t) => s + t.issues.length, 0),
    judgeFlags: json.results.reduce((s, r) => s + r.judge.flags.length, 0),
    avgScore: json.results.reduce((s, r) => s + r.judge.score, 0) / json.results.length,
  }
  summary.push(row)

  md += `## ${model}\n\n`
  for (const r of json.results) {
    md += `### ${r.title} · nota del juez ${r.judge.score}/10\n\n`
    for (const t of r.turns) {
      md += `> **Cliente:** ${t.customer.replace(/\n+/g, " ")}\n>\n`
      for (const b of t.bubbles) md += `> **Avero:** ${b.replace(/\n/g, " ")}\n>\n`
      if (t.calls.length) md += `> _herramientas: ${t.calls.join(", ")}_\n>\n`
      if (t.issues.length) md += `> ⚠️ estilo: ${t.issues.join("; ")}\n>\n`
    }
    md += r.judge.flags.length ? `\nJuez: ${r.judge.flags.join("; ")}\n\n` : "\nJuez: sin marcas.\n\n"
  }
  console.log(`${model}: US$${row.cost.toFixed(4)} · p50 ${row.p50} ms · p95 ${row.p95} ms · estilo ${row.styleIssues} · juez ${row.judgeFlags} marcas · nota ${row.avgScore.toFixed(1)}`)
}

const table =
  "| Modelo | Costo de las 10 | Latencia p50 | p95 | Marcas de estilo | Marcas del juez | Nota media |\n|---|---|---|---|---|---|---|\n" +
  summary.map((r) => `| \`${r.model}\` | US$${r.cost.toFixed(4)} | ${(r.p50 / 1000).toFixed(1)} s | ${(r.p95 / 1000).toFixed(1)} s | ${r.styleIssues} | ${r.judgeFlags} | ${r.avgScore.toFixed(1)} |`).join("\n")
md = md.replace("\n\n", `\n\n${table}\n\n`)
fs.mkdirSync("docs/whatsapp-sim", { recursive: true })
fs.writeFileSync("docs/whatsapp-sim/resultados.md", md)
console.log("Escrito docs/whatsapp-sim/resultados.md")
