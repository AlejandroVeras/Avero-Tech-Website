"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Password field with a button to show or hide what the person is typing. */
export function PasswordInput({ className, id, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} className={cn("pr-12", className)} autoCapitalize="none" autoCorrect="off" spellCheck={false} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        aria-controls={id}
        className="absolute inset-y-0 right-1 my-auto flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
      </button>
    </div>
  )
}
