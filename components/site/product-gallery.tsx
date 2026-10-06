"use client"

import { useState } from "react"
import Image from "next/image"
import { Laptop } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-fog-white dark:bg-white/5 flex items-center justify-center">
        <Laptop className="w-1/4 h-1/4 text-obsidian/10 dark:text-white/15" aria-hidden />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-3xl bg-fog-white dark:bg-white/5 overflow-hidden">
        <Image
          src={images[active]}
          alt={images.length > 1 ? `${name}, foto ${active + 1} de ${images.length}` : name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Fotos del equipo">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block w-20 h-20 rounded-2xl overflow-hidden bg-fog-white dark:bg-white/5 border-2 transition-colors",
                  i === active ? "border-primary" : "border-transparent hover:border-pale-mist",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
