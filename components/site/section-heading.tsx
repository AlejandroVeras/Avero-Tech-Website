import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Tag = "h2",
  className,
  inverted = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  as?: "h1" | "h2"
  className?: string
  inverted?: boolean
}) {
  return (
    <div className={cn("text-center max-w-2xl mx-auto", className)}>
      {eyebrow && (
        <p className={cn("text-caption uppercase tracking-[0.16em] mb-3", inverted ? "text-white/50" : "text-pewter")}>
          {eyebrow}
        </p>
      )}
      <Tag
        className={cn(
          "font-semibold tracking-[-0.02em] text-balance",
          Tag === "h1" ? "text-4xl sm:text-5xl md:text-display" : "text-3xl md:text-heading-lg",
          inverted ? "text-white" : "text-obsidian dark:text-foreground",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p className={cn("text-body mt-3 text-balance", inverted ? "text-white/60" : "text-pewter")}>{description}</p>
      )}
    </div>
  )
}
