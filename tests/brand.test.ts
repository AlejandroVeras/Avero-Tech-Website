import { test } from "node:test"
import assert from "node:assert/strict"
import {
  BRAND_PRESETS,
  DEFAULT_WIDGETS,
  brandProps,
  contrastRatio,
  facebookPage,
  normalizeHex,
  parseWidgets,
  readableOn,
  socialHandle,
  visibleOn,
} from "../lib/brand.ts"

test("normalizeHex accepts short and long forms only", () => {
  assert.equal(normalizeHex("#ABC"), "#aabbcc")
  assert.equal(normalizeHex("be185d"), "#be185d")
  assert.equal(normalizeHex("red"), null)
  assert.equal(normalizeHex("#12345"), null)
  assert.equal(normalizeHex(undefined), null)
})

test("button text stays readable on every preset", () => {
  for (const p of BRAND_PRESETS) assert.ok(contrastRatio(p.hex, readableOn(p.hex)) >= 4.5, p.label)
  assert.equal(readableOn("#facc15"), "#111111") // yellow gets dark text
  assert.equal(readableOn("#111827"), "#ffffff")
})

test("brandProps only recolors with a valid color", () => {
  assert.deepEqual(brandProps(null), {})
  assert.deepEqual(brandProps("nope"), {})
  const p = brandProps("#BE185D")
  assert.equal(p["data-brand"], "")
  assert.equal(p.style?.["--brand-light"], "#be185d")
  assert.equal(p.style?.["--brand-light-fg"], "#ffffff")
})

test("a black brand stays visible in dark mode, a yellow one in light mode", () => {
  const dark = brandProps("#111827").style!["--brand-dark"]
  assert.notEqual(dark, "#111827")
  assert.ok(contrastRatio(dark, "#0b1020") >= 3)
  const light = brandProps("#fde047").style!["--brand-light"]
  assert.ok(contrastRatio(light, "#ffffff") >= 3)
  // Colors that already stand out are kept as they are.
  assert.equal(visibleOn("#be185d", "#ffffff"), "#be185d")
  for (const p of BRAND_PRESETS) {
    const s = brandProps(p.hex).style!
    assert.ok(contrastRatio(s["--brand-dark"], s["--brand-dark-fg"]) >= 4.5, p.label)
    assert.ok(contrastRatio(s["--brand-light"], s["--brand-light-fg"]) >= 4.5, p.label)
  }
})

test("parseWidgets keeps the saved order and fills in the rest", () => {
  assert.deepEqual(parseWidgets(null), DEFAULT_WIDGETS)
  const parsed = parseWidgets([
    { id: "low-stock", visible: true },
    { id: "stats", visible: false },
    { id: "stats", visible: true },
    { id: "hack" },
  ])
  assert.deepEqual(parsed.slice(0, 2), [
    { id: "low-stock", visible: true },
    { id: "stats", visible: false },
  ])
  assert.equal(parsed.length, DEFAULT_WIDGETS.length)
  assert.ok(parsed.slice(2).every((w) => w.visible))
})

test("social links are reduced to the handle", () => {
  assert.equal(socialHandle("@boutique.ana", "instagram"), "boutique.ana")
  assert.equal(socialHandle("https://www.instagram.com/boutique.ana/?hl=es", "instagram"), "boutique.ana")
  assert.equal(socialHandle("https://www.tiktok.com/@ana_rd", "tiktok"), "ana_rd")
  assert.equal(socialHandle("@ana_rd", "tiktok"), "ana_rd")
  assert.equal(socialHandle("javascript:alert(1)", "instagram"), null)
  assert.equal(facebookPage("https://m.facebook.com/BoutiqueAna/"), "BoutiqueAna")
  assert.equal(facebookPage("javascript:alert(1)"), null)
})
