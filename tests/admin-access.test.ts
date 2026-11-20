import { test } from "node:test"
import assert from "node:assert/strict"
import { accessToSubscription, endOfDaySantoDomingo } from "../lib/admin.ts"

const id = "00000000-0000-0000-0000-000000000001"

test("the chosen day ends at midnight Santo Domingo time", () => {
  assert.equal(endOfDaySantoDomingo("2026-12-31"), "2027-01-01T03:59:59.000Z")
  assert.equal(endOfDaySantoDomingo("31/12/2026"), null)
})

test("paid access needs a date and keeps the plan", () => {
  assert.deepEqual(accessToSubscription(id, { kind: "paid", plan: "annual", until: "2027-11-17" }), {
    args: { account: id, new_status: "active", new_plan: "annual", new_end: "2027-11-18T03:59:59.000Z", keep_end: false },
  })
  assert.deepEqual(accessToSubscription(id, { kind: "paid", plan: "monthly" }), { error: "Pon hasta qué fecha tiene acceso" })
})

test("courtesy can have no end date; trial cannot", () => {
  const c = accessToSubscription(id, { kind: "courtesy", until: "" })
  assert.ok("args" in c && c.args.new_end === null && c.args.new_plan === "courtesy" && c.args.new_status === "active")
  assert.ok("error" in accessToSubscription(id, { kind: "trial" }))
  const t = accessToSubscription(id, { kind: "trial", until: "2026-12-01" })
  assert.ok("args" in t && t.args.new_status === "trialing" && t.args.new_plan === "trial")
})
