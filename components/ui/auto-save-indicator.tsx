"use client"

import { useEffect, useState } from "react"
import { Cloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface AutoSaveIndicatorProps {
  isSaving?: boolean
  lastSaved?: Date
  className?: string
}

export function AutoSaveIndicator({ isSaving, lastSaved, className }: AutoSaveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isSaving) {
      setIsVisible(true)
    } else if (lastSaved) {
      setIsVisible(true)
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSaving, lastSaved])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border",
        "animate-in slide-in-from-top-2 fade-in duration-300",
        className,
      )}
    >
      {isSaving ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Saving...</span>
        </>
      ) : (
        <>
          <Cloud className="w-4 h-4 text-success" />
          <span className="text-sm text-muted-foreground">All changes saved</span>
        </>
      )}
    </div>
  )
}
