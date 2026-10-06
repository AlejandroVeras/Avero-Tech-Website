"use client"

import { useId, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FaqEntry {
  question: string
  answer: string
}

function FaqItem({ question, answer }: FaqEntry) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-medium text-obsidian dark:text-foreground group-hover:text-sapphire dark:group-hover:text-sky-signal transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          aria-hidden
          className={cn("h-5 w-5 shrink-0 transition-transform", open ? "rotate-180 text-sapphire dark:text-sky-signal" : "text-pewter")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-pewter text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Faq({ entries }: { entries: FaqEntry[] }) {
  return (
    <div className="max-w-2xl mx-auto bg-card rounded-3xl border border-pale-mist/70 px-6 py-2">
      {entries.map((e) => (
        <FaqItem key={e.question} {...e} />
      ))}
    </div>
  )
}
