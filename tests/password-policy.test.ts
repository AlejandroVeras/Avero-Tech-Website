import { test } from "node:test"
import assert from "node:assert/strict"
import { checkPassword, isStrongPassword, weakPasswordMessage } from "../lib/password-policy.ts"

const strong = (pw: string, ctx = {}) => isStrongPassword(checkPassword(pw, ctx))

test("accepts a long mixed password", () => {
  assert.equal(strong("Mango-Verde.47x"), true)
  assert.equal(strong("Río#Ozama2026"), true)
})

test("rejects short or incomplete passwords", () => {
  assert.equal(strong("Ab1!"), false) // short
  assert.equal(strong("mangoverde.47x"), false) // no uppercase
  assert.equal(strong("MANGOVERDE.47X"), false) // no lowercase
  assert.equal(strong("Mango-Verde.xx"), false) // no number
  assert.equal(strong("MangoVerde47xz"), false) // no symbol
})

test("rejects common words, sequences and repeats", () => {
  assert.equal(strong("Password!2026"), false)
  assert.equal(strong("Contraseña#2026"), false)
  assert.equal(strong("Mango!12345Az"), false)
  assert.equal(strong("Qwerty!Mango9"), false)
  assert.equal(strong("Maaaango!97x"), false)
})

test("rejects the person's email or name", () => {
  assert.equal(strong("Carlosmendez!7", { email: "carlosmendez@gmail.com" }), false)
  assert.equal(strong("Mango-Ramirez.47", { name: "Ana Ramírez" }), false)
  assert.equal(strong("Mango-Verde.47x", { email: "ana@gmail.com", name: "Ana Ramírez" }), true)
})

test("explains what is missing", () => {
  assert.match(weakPasswordMessage(checkPassword("abc")), /al menos 10 caracteres/)
  assert.equal(weakPasswordMessage(checkPassword("Mango-Verde.47x")), "")
})
