/**
 * Navigation helpers to preserve aid (assessment_id) across routes
 */

import { getAssessmentId } from "@/lib/assessment-id-resolver"

/**
 * Appends ?aid=${aid} to a path if aid is provided
 * @param path - The path to navigate to (e.g., "/assessment/client-info")
 * @param aid - The assessment ID to preserve (optional, will auto-resolve if not provided)
 * @returns Path with aid query parameter
 */
export function withAid(path: string, aid?: string | null): string {
  // If aid not provided, try to resolve it from URL or storage
  const finalAid = aid || getAssessmentId().id

  if (!finalAid) return path

  // Check if path already has query parameters
  const separator = path.includes("?") ? "&" : "?"

  return `${path}${separator}aid=${finalAid}`
}

/**
 * Gets aid from URL search params
 * @param searchParams - URLSearchParams object
 * @returns The aid value or null
 */
export function getAidFromParams(searchParams: URLSearchParams | null): string | null {
  if (!searchParams) return null
  return searchParams.get("aid")
}

/**
 * Gets aid from current URL (client-side only)
 * @returns The aid value or null
 */
export function getAidFromURL(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get("aid")
}
