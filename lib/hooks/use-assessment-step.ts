"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { assessmentStorage } from "@/lib/assessment-storage"
import type { AssessmentStepKey } from "@/lib/types/assessment"
import { normalizeEvaluationType } from "@/lib/evaluation-type"
import { safeGetString, safeSetString, safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

interface UseAssessmentStepOptions<T> {
  stepKey: AssessmentStepKey
  defaultValue: T
  autoSave?: boolean
  debounceMs?: number
}

export function useAssessmentStep<T>({
  stepKey,
  defaultValue,
  autoSave = true,
  debounceMs = 1000,
}: UseAssessmentStepOptions<T>) {
  const [data, setData] = useState<T>(defaultValue)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load assessment data on mount
  useEffect(() => {
    if (!isClient) return

    const loadData = async () => {
      try {
        setIsLoading(true)

        const savedType = safeGetString("aria_evaluation_type", null)
        const evaluationType = normalizeEvaluationType(savedType)

        safeSetString("aria_evaluation_type", evaluationType)

        // Get or create assessment
        const assessment = await assessmentStorage.getOrCreateAssessment(evaluationType)
        setAssessmentId(assessment.id)

        // Load step data
        const stepData = await assessmentStorage.getStepData(assessment.id, stepKey)

        if (stepData && Object.keys(stepData).length > 0) {
          setData(stepData)
        }
      } catch (err) {
        console.error(`[v0] Failed to load ${stepKey}:`, err)
        setError(err instanceof Error ? err.message : "Failed to load data")

        // Fallback to cache
        const cached = safeGetJSON<T>(`aria_cache_${stepKey}`, defaultValue)
        setData(cached)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isClient, stepKey])

  // Auto-save with debounce
  useEffect(() => {
    if (!isClient || !autoSave || !assessmentId || isLoading) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveData(data)
    }, debounceMs)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [data, autoSave, assessmentId, isLoading, debounceMs, isClient])

  // Save data function
  const saveData = useCallback(
    async (dataToSave: T) => {
      if (!assessmentId) return

      try {
        setIsSaving(true)
        await assessmentStorage.saveStep(assessmentId, stepKey, dataToSave)
        setError(null)
      } catch (err) {
        console.error(`[v0] Failed to save ${stepKey}:`, err)
        setError(err instanceof Error ? err.message : "Failed to save data")

        safeSetJSON(`aria_cache_${stepKey}`, dataToSave)
      } finally {
        setIsSaving(false)
      }
    },
    [assessmentId, stepKey],
  )

  // Manual save (for Continue button)
  const save = useCallback(async () => {
    await saveData(data)
  }, [data, saveData])

  return {
    data,
    setData,
    assessmentId,
    isLoading,
    isSaving,
    error,
    save,
  }
}
