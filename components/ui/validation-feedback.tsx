"use client"

import { CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationFeedbackProps {
  isValid?: boolean
  isValidating?: boolean
  errorMessage?: string
  className?: string
}

export function ValidationFeedback({ isValid, isValidating, errorMessage, className }: ValidationFeedbackProps) {
  if (isValidating) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground text-sm animate-pulse", className)}>
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
        Validating...
      </div>
    )
  }

  if (isValid) {
    return (
      <div className={cn("flex items-center gap-2 text-success text-sm animate-in fade-in", className)}>
        <CheckCircle2 className="w-4 h-4" />
        Valid
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className={cn("flex items-center gap-2 text-destructive text-sm animate-in fade-in", className)}>
        <AlertCircle className="w-4 h-4" />
        {errorMessage}
      </div>
    )
  }

  return null
}
