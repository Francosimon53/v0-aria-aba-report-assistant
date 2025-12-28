/**
 * Assessment ID Resolution - URL as Source of Truth
 *
 * This module provides a single helper to resolve the assessment ID with the following priority:
 * 1. URL query parameter (?aid=...)
 * 2. localStorage fallback (aria_current_assessment_id)
 * 3. localStorage fallback (aria_active_assessment_id)
 *
 * The resolved ID is persisted to aria_current_assessment_id for consistency.
 */

import { safeGetString, safeSetString, safeRemoveItem } from "@/lib/safe-storage"

export interface AssessmentIdResult {
  id: string | null
  source: "url" | "storage" | "none"
}

/**
 * Get assessment ID from URL search params (server-safe)
 */
export function getAssessmentIdFromURL(searchParams?: URLSearchParams): string | null {
  if (typeof window === "undefined" && !searchParams) return null

  const params = searchParams || (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null)
  return params?.get("aid") || null
}

/**
 * Resolve assessment ID with priority: URL → storage fallbacks
 * Persists the resolved ID to aria_current_assessment_id
 *
 * @param searchParams - Optional URLSearchParams (for server components)
 * @returns AssessmentIdResult with id and source
 */
export function getAssessmentId(searchParams?: URLSearchParams): AssessmentIdResult {
  // Priority 1: URL query parameter
  const urlId = getAssessmentIdFromURL(searchParams)
  if (urlId) {
    console.log("[v0] Resolved assessment ID from URL:", urlId)

    // Persist to storage for consistency
    if (typeof window !== "undefined") {
      safeSetString("aria_current_assessment_id", urlId)
    }

    return { id: urlId, source: "url" }
  }

  // Priority 2: aria_current_assessment_id
  if (typeof window !== "undefined") {
    const currentId = safeGetString("aria_current_assessment_id", null)
    if (currentId) {
      console.log("[v0] Resolved assessment ID from aria_current_assessment_id:", currentId)
      return { id: currentId, source: "storage" }
    }

    // Priority 3: aria_active_assessment_id (legacy)
    const activeId = safeGetString("aria_active_assessment_id", null)
    if (activeId) {
      console.log("[v0] Resolved assessment ID from aria_active_assessment_id (legacy):", activeId)

      // Migrate to aria_current_assessment_id
      safeSetString("aria_current_assessment_id", activeId)
      console.log("[v0] Migrated assessment ID to aria_current_assessment_id")

      return { id: activeId, source: "storage" }
    }
  }

  // No ID found
  console.log("[v0] No assessment ID found in URL or storage")
  return { id: null, source: "none" }
}

/**
 * Set the current assessment ID and persist to storage
 */
export function setAssessmentId(id: string): void {
  if (typeof window === "undefined") return

  console.log("[v0] Setting assessment ID:", id)
  safeSetString("aria_current_assessment_id", id)
}

/**
 * Clear the current assessment ID from storage
 */
export function clearAssessmentId(): void {
  if (typeof window === "undefined") return

  console.log("[v0] Clearing assessment ID")
  safeRemoveItem("aria_current_assessment_id")
  safeRemoveItem("aria_active_assessment_id") // Also clear legacy key
}

/**
 * Validate that an ID looks like a valid UUID or demo ID
 */
export function isValidAssessmentId(id: string | null): boolean {
  if (!id) return false

  // UUID format or demo-* format
  return /^[a-f0-9-]{36}$/i.test(id) || id.startsWith("demo-")
}
