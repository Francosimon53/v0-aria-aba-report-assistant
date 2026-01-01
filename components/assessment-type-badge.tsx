"use client"

import { useEffect, useState } from "react"
import { FileText, RefreshCw } from "lucide-react"
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
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
        assessmentType === "initial"
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-purple-50 text-purple-700 border-purple-200",
        className,
      )}
    >
      {assessmentType === "initial" ? (
        <>
          <FileText className="h-4 w-4" />
          <span>Initial Assessment</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Reassessment</span>
        </>
      )}
    </div>
  )
}
