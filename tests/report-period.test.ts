import { test } from "node:test"
import assert from "node:assert/strict"
import { inPeriod, resolvePeriod } from "../lib/report-period.ts"

const today = "2026-11-20"

test("defaults to the current month", () => {
  const p = resolvePeriod({}, today)
  assert.equal(p.preset, "mes")
  assert.equal(p.start, "2026-11-01")
  assert.equal(p.end, "2026-11-30")
})

test("last month crosses the year boundary", () => {
  const p = resolvePeriod({ periodo: "mes-pasado" }, "2026-01-15")
  assert.equal(p.start, "2025-12-01")
  assert.equal(p.end, "2025-12-31")
})

test("a custom range is ordered and validated", () => {
  const p = resolvePeriod({ periodo: "rango", desde: "2026-10-31", hasta: "2026-10-01" }, today)
  assert.deepEqual([p.start, p.end], ["2026-10-01", "2026-10-31"])
  assert.equal(resolvePeriod({ periodo: "rango", desde: "ayer", hasta: "2026-10-01" }, today).preset, "mes")
})

test("last 3 months, this year and everything", () => {
  assert.equal(resolvePeriod({ periodo: "3-meses" }, today).start, "2026-09-01")
  assert.equal(resolvePeriod({ periodo: "ano" }, today).start, "2026-01-01")
  const all = resolvePeriod({ periodo: "todo" }, today)
  assert.ok(inPeriod("2020-01-01", all))
})

test("inPeriod is inclusive on both ends", () => {
  const p = { start: "2026-11-01", end: "2026-11-30" }
  assert.ok(inPeriod("2026-11-01", p))
  assert.ok(inPeriod("2026-11-30T15:00:00", p))
  assert.ok(!inPeriod("2026-12-01", p))
})
