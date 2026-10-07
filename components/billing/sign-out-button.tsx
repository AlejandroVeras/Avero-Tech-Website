"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth"

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await signOut()
        router.push("/login")
        router.refresh()
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden /> Salir
    </Button>
  )
}
