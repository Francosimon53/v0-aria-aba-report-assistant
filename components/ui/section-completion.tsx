"use client"

import { useEffect, useState } from "react"
import { Toast } from "@/components/ui/toast"

interface SectionCompletionProps {
  isComplete: boolean
  sectionName: string
  onComplete?: () => void
}

export function SectionCompletion({ isComplete, sectionName, onComplete }: SectionCompletionProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isComplete && !showCelebration) {
      setShowCelebration(true)
      onComplete?.()

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isComplete, showCelebration, onComplete])

  if (!showCelebration) return null

  return (
    <Toast
      type="success"
      title="Section Complete!"
      description={`${sectionName} has been completed successfully.`}
      duration={2000}
    />
  )
}
