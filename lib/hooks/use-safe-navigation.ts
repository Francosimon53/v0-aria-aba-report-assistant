"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { toast } from "sonner"
import { useAssessmentSession } from "@/components/assessment/AssessmentSessionProvider"

export function useSafeNavigation() {
  const router = useRouter()
  const { assessmentId } = useAssessmentSession()

  const navigateWithSave = useCallback(
    async (targetRoute: string, saveFunction?: () => Promise<void>, options?: { skipSave?: boolean }) => {
      // If save function provided and not skipping save
      if (saveFunction && !options?.skipSave) {
        try {
          await saveFunction()
        } catch (error) {
          console.error("[v0] Save failed before navigation:", error)
          toast.error("Couldn't save. Check your connection.")
          return false
        }
      }

      const url = new URL(targetRoute, window.location.origin)
      if (assessmentId) {
        url.searchParams.set("aid", assessmentId)
      }

      router.push(url.pathname + url.search)
      return true
    },
    [router, assessmentId],
  )

  return { navigateWithSave }
}
