"use client"

import { useEffect, useState } from "react"
import { UserPlus, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function AssessmentTypeBadge({ className }: { className?: string }) {
  const [assessmentType, setAssessmentType] = useState<"initial" | "reassessment">("initial")

  useEffect(() => {
    // Read assessment type from localStorage
    const stored = localStorage.getItem("aria-client-data")
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.assessmentType) {
          setAssessmentType(data.assessmentType)
        }
      } catch (error) {
        console.error("[v0] Error parsing client data:", error)
      }
    }
  }, [])

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm",
        assessmentType === "initial"
          ? "bg-gradient-to-r from-[#0D9488] to-[#0D9488]/80 text-white border border-[#0D9488]/20"
          : "bg-gradient-to-r from-amber-500 to-amber-500/80 text-white border border-amber-500/20",
        className,
      )}
    >
      {assessmentType === "initial" ? (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Initial Assessment</span>
        </>
      ) : (
        <>
          <TrendingUp className="h-4 w-4" />
          <span>Reassessment</span>
        </>
      )}
    </div>
  )
}
