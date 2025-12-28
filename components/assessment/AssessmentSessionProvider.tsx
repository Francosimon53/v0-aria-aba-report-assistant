"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { assessmentStorage } from "@/lib/assessment-storage"
import type { AssessmentStepKey } from "@/lib/types/assessment"
import { type EvaluationType, normalizeEvaluationType, EVALUATION_TYPES } from "@/lib/evaluation-type"
import { safeGetString, safeSetString } from "@/lib/safe-storage"
import { getAssessmentId, setAssessmentId, isValidAssessmentId } from "@/lib/assessment-id-resolver"
import { withAid } from "@/lib/navigation-helpers"

interface AssessmentSessionContextType {
  assessmentId: string | null
  evaluationType: EvaluationType
  isLoading: boolean
  setEvaluationType: (type: EvaluationType) => void
  loadAssessment: (assessmentId: string) => Promise<void>
  savePatch: (stepKey: AssessmentStepKey, partialData: any) => Promise<void>
  saveAll: () => Promise<void>
}

const AssessmentSessionContext = createContext<AssessmentSessionContextType | null>(null)

export function AssessmentSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [assessmentId, setAssessmentIdState] = useState<string | null>(null)
  const [evaluationType, setEvaluationTypeState] = useState<EvaluationType>(EVALUATION_TYPES.INITIAL)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    if (typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    console.log("[v0] Initializing assessment session...")
    setIsLoading(true)

    try {
      // 1. Get logged in user
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      if (!currentUser) {
        console.log("[v0] No user logged in, skipping assessment initialization")
        setIsLoading(false)
        return
      }

      const { id: resolvedId, source } = getAssessmentId()

      // Load evaluation type from storage
      const savedEvalType = safeGetString("aria_evaluation_type", null)
      const normalizedType = normalizeEvaluationType(savedEvalType)
      setEvaluationTypeState(normalizedType)

      // Persist normalized type
      safeSetString("aria_evaluation_type", normalizedType)

      let finalId = resolvedId

      if (!finalId || !isValidAssessmentId(finalId)) {
        console.log("[v0] No valid assessment_id found, creating new draft...")
        const newAssessment = await assessmentStorage.createAssessment(normalizedType)
        finalId = newAssessment.id

        // Persist the new ID
        setAssessmentIdState(finalId)

        if (pathname?.startsWith("/assessment/")) {
          const newUrl = withAid(pathname, finalId)
          router.replace(newUrl)
        }

        console.log("[v0] Created new assessment:", finalId)
      } else if (source === "storage") {
        if (pathname?.startsWith("/assessment/")) {
          const newUrl = withAid(pathname, finalId)
          router.replace(newUrl)
        }
      }

      setAssessmentIdState(finalId)
      console.log("[v0] Assessment session initialized with ID:", finalId, "from", source)
    } catch (error) {
      console.error("[v0] Error initializing assessment session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setEvaluationType = useCallback((type: EvaluationType) => {
    console.log("[v0] Setting evaluation type:", type)
    setEvaluationTypeState(type)
    if (typeof window !== "undefined") {
      safeSetString("aria_evaluation_type", type)
    }
  }, [])

  const loadAssessment = useCallback(
    async (id: string) => {
      console.log("[v0] Loading assessment:", id)
      setAssessmentIdState(id)

      if (typeof window !== "undefined") {
        setAssessmentId(id)
      }

      if (pathname?.startsWith("/assessment/")) {
        const newUrl = withAid(pathname, id)
        router.replace(newUrl)
      }
    },
    [pathname, router],
  )

  const savePatch = useCallback(
    async (stepKey: AssessmentStepKey, partialData: any) => {
      if (!assessmentId) {
        console.warn("[v0] Cannot save patch: no assessmentId")
        return
      }

      try {
        console.log(`[v0] Saving patch for ${stepKey}`)
        await assessmentStorage.saveStep(assessmentId, stepKey, partialData)
      } catch (error) {
        console.error("[v0] Error saving patch:", error)
        throw error
      }
    },
    [assessmentId],
  )

  const saveAll = useCallback(async () => {
    if (!assessmentId) {
      console.warn("[v0] Cannot save: no assessmentId")
      return
    }

    try {
      console.log("[v0] Saving all data for assessment:", assessmentId)
      // The actual saving is handled by savePatch calls from individual steps
      // This is a marker function for explicit "Continue" button saves
    } catch (error) {
      console.error("[v0] Error saving all:", error)
      throw error
    }
  }, [assessmentId])

  const value: AssessmentSessionContextType = {
    assessmentId,
    evaluationType,
    isLoading,
    setEvaluationType,
    loadAssessment,
    savePatch,
    saveAll,
  }

  return <AssessmentSessionContext.Provider value={value}>{children}</AssessmentSessionContext.Provider>
}

export function useAssessmentSession() {
  const context = useContext(AssessmentSessionContext)
  if (!context) {
    throw new Error("useAssessmentSession must be used within AssessmentSessionProvider")
  }
  return context
}
