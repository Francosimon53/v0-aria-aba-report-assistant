"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SmoothTransitionProps {
  children: ReactNode
  duration?: number
  className?: string
  type?: "fade" | "slide" | "slideUp"
}

export function SmoothTransition({ children, duration = 300, className, type = "fade" }: SmoothTransitionProps) {
  const animations = {
    fade: "animate-in fade-in",
    slide: "animate-in slide-in-from-left",
    slideUp: "animate-in slide-in-from-bottom",
  }

  return (
    <div className={cn(animations[type], className)} style={{ animationDuration: `${duration}ms` }}>
      {children}
    </div>
  )
}
