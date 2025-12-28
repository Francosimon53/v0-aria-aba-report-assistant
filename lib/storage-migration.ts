/**
 * Storage Migration & Cleanup Utilities
 * Runs once per session to normalize legacy data and remove corrupt entries
 */

import { safeGetJSON, safeSetJSON, safeGetString, safeSetString, safeRemoveItem } from "@/lib/safe-storage"
import { normalizeEvaluationType } from "@/lib/evaluation-type"

const SESSION_FLAG = `aria_migration_session_${Date.now()}`

// Known localStorage keys that store JSON data
const JSON_STORAGE_KEYS = [
  "aria-client-info",
  "aria-background-history",
  "aria-assessment-context",
  "aria-domains",
  "aria-abc-observation",
  "aria-risk-assessment",
  "aria-goals",
  "aria-service-plan",
  "aria-cpt-authorization",
  "aria-medical-necessity",
  "aria-progress-data",
]

/**
 * Check if migration has already run this session
 */
function shouldRunMigration(): boolean {
  if (typeof window === "undefined") return false

  // Check if already run this session
  if (sessionStorage.getItem(SESSION_FLAG)) {
    return false
  }

  return true
}

/**
 * Mark migration as complete for this session
 */
function markMigrationComplete(): void {
  try {
    sessionStorage.setItem(SESSION_FLAG, "true")
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[v0] Failed to mark migration complete:", e)
    }
  }
}

/**
 * Migrate and normalize aria_evaluation_type
 * CRITICAL: This key must ALWAYS be a plain string, never JSON
 */
function migrateEvaluationType(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Migrating evaluation type...")
  }

  const KEY = "aria_evaluation_type"

  // Read raw value directly from localStorage (NOT via safeGetJSON)
  const raw = localStorage.getItem(KEY)

  if (!raw) {
    // No value exists, set default
    safeSetString(KEY, "Initial Assessment")
    if (process.env.NODE_ENV !== "production") {
      console.log("[v0] No evaluation type found, defaulting to 'Initial Assessment'")
    }
    return
  }

  // Normalize the value
  const normalized = normalizeEvaluationType(raw)

  // If value changed, update it
  if (raw !== normalized) {
    safeSetString(KEY, normalized)
    if (process.env.NODE_ENV !== "production") {
      console.log(`[v0] Normalized ${KEY}: "${raw}" → "${normalized}"`)
    }
  }
}

/**
 * Normalize evaluation types inside JSON objects
 */
function migrateEvaluationTypesInJSON(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Checking evaluation types in JSON objects...")
  }

  let migrationCount = 0

  JSON_STORAGE_KEYS.forEach((key) => {
    const data = safeGetJSON<any>(key)
    if (!data || typeof data !== "object") return

    let updated = false

    // Check for assessmentType field
    if (data.assessmentType && typeof data.assessmentType === "string") {
      const normalized = normalizeEvaluationType(data.assessmentType)
      if (data.assessmentType !== normalized) {
        data.assessmentType = normalized
        updated = true
        migrationCount++
      }
    }

    // Check for evaluationType field
    if (data.evaluationType && typeof data.evaluationType === "string") {
      const normalized = normalizeEvaluationType(data.evaluationType)
      if (data.evaluationType !== normalized) {
        data.evaluationType = normalized
        updated = true
        migrationCount++
      }
    }

    if (updated) {
      safeSetJSON(key, data)
      if (process.env.NODE_ENV !== "production") {
        console.log(`[v0] Updated evaluation type in ${key}`)
      }
    }
  })

  if (migrationCount > 0 && process.env.NODE_ENV !== "production") {
    console.log(`[v0] Migrated ${migrationCount} evaluation type(s) in JSON objects`)
  }
}

/**
 * Validate all JSON storage keys to remove corrupt data
 */
function validateJSONStorage(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Validating JSON storage keys...")
  }

  let cleanedCount = 0

  JSON_STORAGE_KEYS.forEach((key) => {
    // safeGetJSON will automatically remove corrupt data
    const data = safeGetJSON(key)

    // If it returns empty object after attempting to read, it was cleaned
    if (data && Object.keys(data).length === 0) {
      const rawValue = localStorage.getItem(key)
      if (rawValue && rawValue !== "{}") {
        cleanedCount++
        if (process.env.NODE_ENV !== "production") {
          console.log(`[v0] Cleaned corrupt data from ${key}`)
        }
      }
    }
  })

  if (cleanedCount > 0 && process.env.NODE_ENV !== "production") {
    console.log(`[v0] Cleaned ${cleanedCount} corrupt storage key(s)`)
  }
}

/**
 * Clean up incorrectly stored assessment_id values
 * assessment_id should always be a plain UUID string, never JSON
 */
function cleanAssessmentIds(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Cleaning assessment_id values...")
  }

  const keysToCheck = ["assessment_id", "aria_assessment_id", "aria_active_assessment_id", "aria_current_assessment_id"]

  keysToCheck.forEach((key) => {
    const rawValue = localStorage.getItem(key)
    if (!rawValue) return

    // If it's "{}" or looks like JSON, remove it
    if (rawValue === "{}" || rawValue === "null" || rawValue.startsWith("{") || rawValue.startsWith("[")) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[v0] Removing invalid assessment_id from ${key}: ${rawValue}`)
      }
      localStorage.removeItem(key)
      return
    }

    // Try to parse as JSON to see if it's a JSON object with an id field
    try {
      const parsed = JSON.parse(rawValue)
      if (parsed && typeof parsed === "object" && parsed.id) {
        // Convert { id: "uuid" } to just "uuid"
        if (process.env.NODE_ENV !== "production") {
          console.log(`[v0] Converting JSON assessment_id to string in ${key}`)
        }
        localStorage.setItem(key, parsed.id)
      } else {
        // Invalid JSON object, remove it
        if (process.env.NODE_ENV !== "production") {
          console.log(`[v0] Removing invalid JSON assessment_id from ${key}`)
        }
        localStorage.removeItem(key)
      }
    } catch {
      // Not JSON, which is good - it's a plain UUID string
      // Just verify it looks like a UUID or demo ID
      if (!rawValue.match(/^[a-f0-9-]{36}$/i) && !rawValue.startsWith("demo-")) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[v0] Removing malformed assessment_id from ${key}: ${rawValue}`)
        }
        localStorage.removeItem(key)
      }
    }
  })
}

/**
 * Migrate legacy assessment_id keys to aria_current_assessment_id
 */
function migrateLegacyAssessmentId(): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Migrating legacy assessment_id keys...")
  }

  // Check for legacy "assessment_id" key
  const legacyId = safeGetString("assessment_id", null)
  if (legacyId) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[v0] Found legacy assessment_id, migrating to aria_current_assessment_id")
    }
    safeSetString("aria_current_assessment_id", legacyId)
    safeRemoveItem("assessment_id")
  }

  // If aria_active_assessment_id exists but aria_current_assessment_id doesn't, migrate it
  const activeId = safeGetString("aria_active_assessment_id", null)
  const currentId = safeGetString("aria_current_assessment_id", null)

  if (activeId && !currentId) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[v0] Migrating aria_active_assessment_id to aria_current_assessment_id")
    }
    safeSetString("aria_current_assessment_id", activeId)
  }
}

/**
 * Run all migration and cleanup tasks
 * Executes once per session
 *
 * IMPORTANT: This runs BEFORE any page code executes via StorageBootstrap component
 */
export function runStorageMigration(): void {
  if (!shouldRunMigration()) {
    return
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[v0] Running storage migration and cleanup...")
  }

  try {
    // Step 1: Migrate legacy assessment_id keys
    migrateLegacyAssessmentId()

    // Step 2: Clean incorrectly stored assessment_id values
    cleanAssessmentIds()

    // Step 3: Migrate and normalize aria_evaluation_type (CRITICAL - plain string only)
    migrateEvaluationType()

    // Step 4: Normalize evaluation types inside JSON objects
    migrateEvaluationTypesInJSON()

    // Step 5: Validate and clean corrupt JSON data
    validateJSONStorage()

    // Mark as complete
    markMigrationComplete()

    if (process.env.NODE_ENV !== "production") {
      console.log("[v0] Storage migration complete")
    }
  } catch (error) {
    console.error("[v0] Storage migration failed:", error)
    // Still mark as complete to avoid infinite retries
    markMigrationComplete()
  }
}
