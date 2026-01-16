"use client"

import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  count?: number
  className?: string
  variant?: "text" | "card" | "input" | "button"
}

export function SkeletonLoader({ count = 3, className, variant = "text" }: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse rounded bg-muted"

  const variants = {
    text: "h-4 w-full mb-3 last:mb-0",
    card: "h-32 w-full mb-4 rounded-lg last:mb-0",
    input: "h-10 w-full mb-3 rounded-md last:mb-0",
    button: "h-10 w-24 rounded-md",
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(baseClasses, variants[variant])} />
      ))}
    </div>
  )
}
