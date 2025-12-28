"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAssessmentSession } from "@/components/assessment/AssessmentSessionProvider"
import { assessmentStorage } from "@/lib/assessment-storage"
import type { AssessmentStepKey } from "@/lib/types/assessment"
import { safeGetJSON, safeSetJSON, safeRemoveItem } from "@/lib/safe-storage"

export type SaveStatus = "idle" | "loading" | "saved" | "error"

interface UseStepDataOptions {
  /**
   * Legacy localStorage keys to migrate from (e.g., ["aria-goals", "ariaGoals"])
   */
  legacyLocalStorageKeys?: string[]
  /**
   * Debounce time in milliseconds for auto-save (default: 1000ms)
   */
  debounceMs?: number
}

interface UseStepDataReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  status: SaveStatus
  lastSavedAt: Date | null
  saveNow: () => Promise<void>
}

/**
 * Unified hook for managing step data with Supabase persistence and localStorage cache
 *
 * Features:
 * - Loads from localStorage cache first for instant UI
 * - Syncs with Supabase in background
 * - Auto-migrates legacy localStorage keys
 * - Debounced auto-save to Supabase
 * - Immediate localStorage cache updates
 * - Comprehensive error handling
 *
 * @example
 * const { value, setValue, status, lastSavedAt, saveNow } = useStepData<GoalsData>(
 *   'goals',
 *   { goals: [] },
 *   { legacyLocalStorageKeys: ['aria-goals'] }
 * )
 */
export function useStepData<T>(
  stepKey: AssessmentStepKey,
  defaultValue: T,
  options: UseStepDataOptions = {},
): UseStepDataReturn<T> {
  const { legacyLocalStorageKeys = [], debounceMs = 1000 } = options

  const { assessmentId, savePatch } = useAssessmentSession()

  const [value, setValueState] = useState<T>(defaultValue)
  const [status, setStatus] = useState<SaveStatus>("loading")
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastServerDataRef = useRef<T | null>(null)

  // Mark as client-side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initial data load
  useEffect(() => {
    if (!isClient || !assessmentId) return

    const loadInitialData = async () => {
      try {
        setStatus("loading")

        // Step 1: Load from localStorage cache immediately (instant UI)
        const cacheKey = `aria_step_cache_${assessmentId}_${stepKey}`
        const parsedCache = safeGetJSON<T>(cacheKey, defaultValue)
        if (parsedCache) {
          console.log(`[v0] Loaded ${stepKey} from cache`)
          setValueState(parsedCache)
        }

        // Step 2: Load from Supabase (authoritative source)
        const serverData = await assessmentStorage.getStepData(assessmentId, stepKey)

        if (serverData && Object.keys(serverData).length > 0) {
          console.log(`[v0] Loaded ${stepKey} from Supabase`)
          setValueState(serverData)
          lastServerDataRef.current = serverData

          // Update cache with server data
          safeSetJSON(cacheKey, serverData)
        } else {
          // Step 3: No server data, check for legacy migration
          const migratedData = migrateLegacyData()
          if (migratedData) {
            console.log(`[v0] Migrated legacy data for ${stepKey}`)
            setValueState(migratedData)
            lastServerDataRef.current = migratedData

            // Save migrated data to server and cache
            await savePatch(stepKey, migratedData)
            safeSetJSON(cacheKey, migratedData)

            // Clean up legacy keys
            legacyLocalStorageKeys.forEach((key) => {
              safeRemoveItem(key)
            })
          }
        }

        setStatus("idle")
      } catch (error) {
        console.error(`[v0] Error loading ${stepKey}:`, error)
        setStatus("error")
      } finally {
        setIsInitialLoad(false)
      }
    }

    loadInitialData()
  }, [isClient, assessmentId, stepKey])

  // Migrate data from legacy localStorage keys
  const migrateLegacyData = (): T | null => {
    for (const legacyKey of legacyLocalStorageKeys) {
      const data = safeGetJSON<T>(legacyKey, null as any)
      if (data) {
        return data
      }
    }
    return null
  }

  // Auto-save with debounce
  useEffect(() => {
    if (!isClient || !assessmentId || isInitialLoad) return

    // Save to localStorage cache immediately
    const cacheKey = `aria_step_cache_${assessmentId}_${stepKey}`
    safeSetJSON(cacheKey, value)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounced save to Supabase
    saveTimeoutRef.current = setTimeout(async () => {
      await saveToSupabase(value)
    }, debounceMs)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [value, isClient, assessmentId, isInitialLoad, stepKey, debounceMs])

  // Save to Supabase
  const saveToSupabase = async (dataToSave: T) => {
    if (!assessmentId) return

    try {
      setStatus("loading")

      await savePatch(stepKey, dataToSave)

      lastServerDataRef.current = dataToSave
      setLastSavedAt(new Date())
      setStatus("saved")

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus("idle")
      }, 2000)
    } catch (error) {
      console.error(`[v0] Failed to save ${stepKey} to Supabase:`, error)
      setStatus("error")

      // Keep localStorage cache intact on error
      // User can continue working offline
    }
  }

  // Manual save (for Continue button)
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveToSupabase(value)
  }, [value, assessmentId, stepKey])

  // setValue wrapper
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const updated = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue
      return updated
    })
  }, [])

  return {
    value,
    setValue,
    status,
    lastSavedAt,
    saveNow,
  }
}
