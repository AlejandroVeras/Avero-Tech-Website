"use client"

import { useEffect, useRef, useState } from "react"

// Santo Domingo and the places we serve remotely. Arcs go from Santo Domingo to each one.
const HOME: [number, number] = [18.4861, -69.9312]
const PLACES: { name: string; location: [number, number] }[] = [
  { name: "Santiago", location: [19.4517, -70.697] },
  { name: "San Juan", location: [18.4655, -66.1057] },
  { name: "Miami", location: [25.7617, -80.1918] },
  { name: "Nueva York", location: [40.7128, -74.006] },
  { name: "Ciudad de México", location: [19.4326, -99.1332] },
  { name: "Bogotá", location: [4.711, -74.0721] },
  { name: "Madrid", location: [40.4168, -3.7038] },
]

const BLUE: [number, number, number] = [0.16, 0.59, 1]

/** Angles that put a lat/long in front of the camera. */
function anglesFor([lat, long]: [number, number]): [number, number] {
  return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

/**
 * Interactive WebGL globe (cobe, ~5 KB) that starts over the Caribbean, rotates slowly and can be dragged.
 * It loads after the page is idle, pauses off-screen and stays still for people who prefer reduced motion.
 */
export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let globe: { update: (s: object) => void; destroy: () => void } | null = null
    let frame = 0
    let visible = true
    let cancelled = false
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const [startPhi, theta] = anglesFor(HOME)
    let phi = startPhi - 0.35
    let drag: { x: number; phi: number } | null = null
    let velocity = 0

    const isDark = () => document.documentElement.classList.contains("dark")
    // Light theme: white land dots on a pale sphere; dark theme: blue on navy.
    const palette = (dark: boolean) =>
      dark
        ? { dark: 1, diffuse: 1.4, mapBrightness: 5, mapBaseBrightness: 0.02, baseColor: [0.12, 0.16, 0.24] as [number, number, number], glowColor: [0.18, 0.36, 0.7] as [number, number, number], homeColor: [0.66, 0.84, 1] as [number, number, number] }
        : { dark: 0, diffuse: 1.2, mapBrightness: 7, mapBaseBrightness: 0, baseColor: [0.92, 0.95, 1] as [number, number, number], glowColor: [0.78, 0.86, 1] as [number, number, number], homeColor: [0, 0.44, 0.89] as [number, number, number] }

    const create = async () => {
      const { default: createGlobe } = await import("cobe")
      if (cancelled || !canvas) return
      globe?.destroy()
      const size = canvas.offsetWidth
      const small = size < 420
      const c = palette(isDark())
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: size * 2,
        height: size * 2,
        phi,
        theta: theta - 0.12,
        dark: c.dark,
        diffuse: c.diffuse,
        mapSamples: small ? 9000 : 16000,
        mapBrightness: c.mapBrightness,
        mapBaseBrightness: c.mapBaseBrightness,
        baseColor: c.baseColor,
        markerColor: BLUE,
        glowColor: c.glowColor,
        markers: [{ location: HOME, size: 0.09, color: c.homeColor }, ...PLACES.map((p) => ({ location: p.location, size: 0.035 }))],
        arcs: PLACES.map((p) => ({ from: HOME, to: p.location })),
        arcColor: BLUE,
        arcWidth: 0.6,
        arcHeight: 0.28,
        markerElevation: 0.015,
        opacity: 0.95,
      })
      setReady(true)
    }

    const start = async () => {
      await create()
      const tick = () => {
        if (!drag) {
          velocity *= 0.95
          phi += (reduce ? 0 : 0.0018) + velocity
        }
        if (visible) globe?.update({ phi })
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    // Rebuild the globe with the other palette when the visitor switches theme.
    let wasDark = isDark()
    const themeObserver = new MutationObserver(() => {
      const now = isDark()
      if (now !== wasDark && globe) {
        wasDark = now
        void create()
      }
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    // Wait until the browser is idle so the globe never competes with the first paint.
    const idle = (cb: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 600))
    idle(() => void start())

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" })
    io.observe(canvas)

    const onDown = (e: PointerEvent) => {
      drag = { x: e.clientX, phi }
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = "grabbing"
    }
    const onMove = (e: PointerEvent) => {
      if (!drag) return
      const next = drag.phi + (e.clientX - drag.x) / 220
      velocity = next - phi
      phi = next
    }
    const onUp = () => {
      drag = null
      canvas.style.cursor = "grab"
    }
    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointercancel", onUp)

    return () => {
      cancelled = true
      themeObserver.disconnect()
      cancelAnimationFrame(frame)
      io.disconnect()
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onUp)
      globe?.destroy()
    }
  }, [])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        aria-label="Globo con Santo Domingo y las ciudades donde atendemos a distancia"
        role="img"
        className="aspect-square h-full w-full cursor-grab touch-pan-y transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0, contain: "layout paint size" }}
      />
    </div>
  )
}
