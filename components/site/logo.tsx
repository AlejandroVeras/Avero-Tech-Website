import Image from "next/image"
import { cn } from "@/lib/utils"

// Source PNG is 316x160 (cropped from public/LOGO.png); the white variant is for dark mode.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-8 items-center", className)}>
      <Image
        src="/logo-horizontal.png"
        alt="Avero Tech"
        width={316}
        height={160}
        priority
        className="h-full w-auto dark:hidden"
      />
      <Image
        src="/logo-horizontal-dark.png"
        alt="Avero Tech"
        width={316}
        height={160}
        priority
        className="hidden h-full w-auto dark:block"
      />
    </span>
  )
}
