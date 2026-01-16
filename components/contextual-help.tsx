"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpCircle, Loader2 } from "@/components/icons"
import { cn } from "@/lib/utils"

interface ContextualHelpProps {
  section: string
  className?: string
}

export function ContextualHelp({ section, className }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [helpText, setHelpText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const fetchHelp = async () => {
    if (helpText) {
      setIsOpen(true)
      return
    }

    setIsLoading(true)
    setIsOpen(true)

    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `How to use ${section} in ARIA`,
          category: "user_manual",
          topK: 1,
        }),
      })

      const data = await response.json()
      setHelpText(data.chunks?.[0]?.content || "No help available for this section.")
    } catch {
      setHelpText("Unable to load help. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 text-gray-400 hover:text-teal-500", className)}
          onClick={fetchHelp}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading help...
          </div>
        ) : (
          <div className="text-sm text-gray-600 whitespace-pre-wrap">{helpText}</div>
        )}
      </PopoverContent>
    </Popover>
  )
}
