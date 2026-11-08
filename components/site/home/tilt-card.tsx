"use client"

import { useRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

/** Link card that tilts slightly toward the pointer and shows a soft spotlight under it (mouse only). */
export function TiltCard({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const raf = useRef(0)

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x * 100}%`)
      el.style.setProperty("--my", `${y * 100}%`)
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-2px)`
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    if (ref.current) ref.current.style.transform = ""
  }

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("spotlight-card group block transition-[transform,border-color] duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </Link>
  )
}
