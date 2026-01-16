/**
 * ARIA Assessment Storage System
 *
 * This file centralizes ALL localStorage keys used in the assessment.
 * This ensures data from each step flows correctly into the final report.
 *
 * STORAGE KEYS MAP:
 * ─────────────────────────────────────────────────────────────────
 * Step 1: Client Info      → aria-client-info
 * Step 2: Background       → aria-background-history
 * Step 3: Assessment Data  → aria-assessment-data
 * Step 4: ABC Observations → aria-abc-observations
 * Step 5: Risk Assessment  → aria-risk-assessment
 * Step 6: Goals            → aria-goals
 * Step 7: Interventions    → aria-interventions
 * Step 8: Teaching Protocol→ aria-teaching-protocols
 * Step 9: Parent Training  → aria-parent-training-data
 * Step 10: Service Schedule→ aria-service-schedule
 * Step 11: Medical Necessity→ aria-medical-necessity
 *
 * MASTER DOCUMENT: aria-complete-assessment (contains all data unified)
 * ─────────────────────────────────────────────────────────────────
 */

export const STORAGE_KEYS = {
  // Individual sections
  CLIENT_INFO: "aria-client-info",
  BACKGROUND_HISTORY: "aria-background-history",
  ASSESSMENT_DATA: "aria-assessment-data",
  ABC_OBSERVATIONS: "aria-abc-observations",
  RISK_ASSESSMENT: "aria-risk-assessment",
  GOALS: "aria-goals",
  GOALS_TRACKER: "aria-goals-tracker",
  INTERVENTIONS: "aria-interventions",
  SELECTED_INTERVENTIONS: "aria-selected-interventions",
  TEACHING_PROTOCOLS: "aria-teaching-protocols",
  PARENT_TRAINING: "aria-parent-training-data",
  SERVICE_SCHEDULE: "aria-service-schedule",
  MEDICAL_NECESSITY: "aria-medical-necessity",
  CONSENT_FORM: "aria-consent-form",

  // Master document that unifies everything
  COMPLETE_ASSESSMENT: "aria-complete-assessment",

  // List of all assessments
  ASSESSMENTS_LIST: "aria-assessments",

  // Current assessment ID
  CURRENT_ASSESSMENT_ID: "aria-current-assessment-id",

  // Completed steps tracking
  COMPLETED_STEPS: "aria-completed-steps",
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Save data to a specific section
 */
export function saveSection(key: StorageKey, data: any): boolean {
  try {
    const payload = {
      data,
      savedAt: new Date().toISOString(),
      version: "1.0",
    }
    localStorage.setItem(key, JSON.stringify(payload))
    console.log(`[ARIA Storage] Saved ${key}`)

    // Also update the complete assessment
    updateCompleteAssessment()

    return true
  } catch (error) {
    console.error(`[ARIA Storage] Error saving ${key}:`, error)
    return false
  }
}

/**
 * Load data from a specific section
 */
export function loadSection<T = any>(key: StorageKey): T | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    // Handle both wrapped and unwrapped data
    return parsed.data !== undefined ? parsed.data : parsed
  } catch (error) {
    console.error(`[ARIA Storage] Error loading ${key}:`, error)
    return null
  }
}

/**
 * Get the saved timestamp for a section
 */
export function getSectionSavedAt(key: StorageKey): Date | null {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    return parsed.savedAt ? new Date(parsed.savedAt) : null
  } catch {
    return null
  }
}

/**
 * Updates the complete assessment document with all sections
 * This is what the final report generator will read
 */
export function updateCompleteAssessment(): void {
  try {
    const completeAssessment = {
      clientInfo: loadSection(STORAGE_KEYS.CLIENT_INFO),
      backgroundHistory: loadSection(STORAGE_KEYS.BACKGROUND_HISTORY),
      assessmentData: loadSection(STORAGE_KEYS.ASSESSMENT_DATA),
      abcObservations: loadSection(STORAGE_KEYS.ABC_OBSERVATIONS),
      riskAssessment: loadSection(STORAGE_KEYS.RISK_ASSESSMENT),
      goals: loadSection(STORAGE_KEYS.GOALS),
      goalsTracker: loadSection(STORAGE_KEYS.GOALS_TRACKER),
      interventions: loadSection(STORAGE_KEYS.INTERVENTIONS),
      selectedInterventions: loadSection(STORAGE_KEYS.SELECTED_INTERVENTIONS),
      teachingProtocols: loadSection(STORAGE_KEYS.TEACHING_PROTOCOLS),
      parentTraining: loadSection(STORAGE_KEYS.PARENT_TRAINING),
      serviceSchedule: loadSection(STORAGE_KEYS.SERVICE_SCHEDULE),
      medicalNecessity: loadSection(STORAGE_KEYS.MEDICAL_NECESSITY),
      consentForm: loadSection(STORAGE_KEYS.CONSENT_FORM),

      // Metadata
      lastUpdated: new Date().toISOString(),
      completedSections: getCompletedSections(),
    }

    localStorage.setItem(STORAGE_KEYS.COMPLETE_ASSESSMENT, JSON.stringify(completeAssessment))
    console.log("[ARIA Storage] Complete assessment updated")
  } catch (error) {
    console.error("[ARIA Storage] Error updating complete assessment:", error)
  }
}

/**
 * Get list of completed sections (sections that have data)
 */
export function getCompletedSections(): string[] {
  const sections: string[] = []

  const sectionMap = [
    { key: STORAGE_KEYS.CLIENT_INFO, name: "Client Information" },
    { key: STORAGE_KEYS.BACKGROUND_HISTORY, name: "Background History" },
    { key: STORAGE_KEYS.ASSESSMENT_DATA, name: "Assessment Data" },
    { key: STORAGE_KEYS.ABC_OBSERVATIONS, name: "ABC Observations" },
    { key: STORAGE_KEYS.RISK_ASSESSMENT, name: "Risk Assessment" },
    { key: STORAGE_KEYS.GOALS, name: "Goals" },
    { key: STORAGE_KEYS.INTERVENTIONS, name: "Interventions" },
    { key: STORAGE_KEYS.TEACHING_PROTOCOLS, name: "Teaching Protocols" },
    { key: STORAGE_KEYS.PARENT_TRAINING, name: "Parent Training" },
    { key: STORAGE_KEYS.SERVICE_SCHEDULE, name: "Service Schedule" },
  ]

  for (const section of sectionMap) {
    const data = loadSection(section.key)
    if (data && Object.keys(data).length > 0) {
      sections.push(section.name)
    }
  }

  return sections
}

/**
 * Get the complete assessment document for the report generator
 */
export function getCompleteAssessment(): any {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETE_ASSESSMENT)
    if (stored) {
      return JSON.parse(stored)
    }

    // If no complete assessment exists, build it
    updateCompleteAssessment()
    const newStored = localStorage.getItem(STORAGE_KEYS.COMPLETE_ASSESSMENT)
    return newStored ? JSON.parse(newStored) : null
  } catch (error) {
    console.error("[ARIA Storage] Error loading complete assessment:", error)
    return null
  }
}

/**
 * Get storage status for all sections - useful for debugging and UI
 */
export function getStorageStatus(): {
  section: string
  key: string
  hasData: boolean
  savedAt: Date | null
  dataSize: string
}[] {
  const sections = [
    { name: "Client Information", key: STORAGE_KEYS.CLIENT_INFO },
    { name: "Background History", key: STORAGE_KEYS.BACKGROUND_HISTORY },
    { name: "Assessment Data", key: STORAGE_KEYS.ASSESSMENT_DATA },
    { name: "ABC Observations", key: STORAGE_KEYS.ABC_OBSERVATIONS },
    { name: "Risk Assessment", key: STORAGE_KEYS.RISK_ASSESSMENT },
    { name: "Goals", key: STORAGE_KEYS.GOALS },
    { name: "Goals Tracker", key: STORAGE_KEYS.GOALS_TRACKER },
    { name: "Interventions", key: STORAGE_KEYS.INTERVENTIONS },
    { name: "Teaching Protocols", key: STORAGE_KEYS.TEACHING_PROTOCOLS },
    { name: "Parent Training", key: STORAGE_KEYS.PARENT_TRAINING },
    { name: "Service Schedule", key: STORAGE_KEYS.SERVICE_SCHEDULE },
    { name: "Medical Necessity", key: STORAGE_KEYS.MEDICAL_NECESSITY },
    { name: "Complete Assessment", key: STORAGE_KEYS.COMPLETE_ASSESSMENT },
  ]

  return sections.map((section) => {
    const raw = localStorage.getItem(section.key)
    const hasData = raw !== null && raw !== "{}" && raw !== "null"
    const savedAt = getSectionSavedAt(section.key as StorageKey)
    const dataSize = raw ? `${(raw.length / 1024).toFixed(2)} KB` : "0 KB"

    return {
      section: section.name,
      key: section.key,
      hasData,
      savedAt,
      dataSize,
    }
  })
}

/**
 * Clear all assessment data (for starting fresh)
 */
export function clearAllAssessmentData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
  console.log("[ARIA Storage] All assessment data cleared")
}

/**
 * Clear ALL assessment-related localStorage data
 * Call this when:
 * - Starting a new assessment
 * - Deleting an assessment
 * - Logging out
 */
export function clearAssessmentCache(): void {
  const keysToRemove: string[] = []

  // Find all aria-related keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith("aria-") || key.startsWith("aria_") || key.includes("assessment"))) {
      keysToRemove.push(key)
    }
  }

  // Remove all found keys
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  console.log("[ARIA] Cleared assessment cache:", keysToRemove.length, "keys removed")
}

/**
 * Clear cache for a specific assessment ID
 */
export function clearAssessmentById(assessmentId: string): void {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.includes(assessmentId)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
  })

  console.log(`[ARIA] Cleared cache for assessment ${assessmentId}:`, keysToRemove.length, "keys removed")
}

/**
 * Get or create an assessment ID for the current session
 * This no longer creates DB records - only manages localStorage ID
 */
export function getOrCreateAssessmentId(type: "initial" | "reassessment", mode?: "new" | "existing"): string {
  const storageKey = `aria-${type}-assessment-id`

  if (typeof window === "undefined") {
    return ""
  }

  const urlParams = new URLSearchParams(window.location.search)
  const urlId = urlParams.get("id")

  // If mode is "new", always create a new ID and clear old cache
  if (mode === "new" && !urlId) {
    clearAssessmentCache()
    const newId = crypto.randomUUID()
    localStorage.setItem(storageKey, newId)
    console.log(`[v0] Created NEW local ${type} assessment ID (no DB record yet):`, newId)

    // Update URL with new ID
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("id", newId)
    window.history.replaceState({}, "", newUrl.toString())

    return newId
  }

  if (urlId) {
    // Store the URL ID in localStorage for future use
    localStorage.setItem(storageKey, urlId)
    console.log(`[v0] Using assessment ID from URL:`, urlId)
    return urlId
  }

  // Check localStorage for existing assessment
  let assessmentId = localStorage.getItem(storageKey)

  if (!assessmentId) {
    assessmentId = crypto.randomUUID()
    localStorage.setItem(storageKey, assessmentId)
    console.log(`[v0] Created new local ${type} assessment ID (no DB record yet):`, assessmentId)

    const newUrl = new URL(window.location.href)
    newUrl.searchParams.set("id", assessmentId)
    window.history.replaceState({}, "", newUrl.toString())
  }

  return assessmentId
}

/**
 * Export all data as JSON (for backup)
 */
export function exportAssessmentAsJSON(): string {
  const data = getCompleteAssessment()
  return JSON.stringify(data, null, 2)
}

import { createBrowserClient } from "@/lib/supabase/client"

/**
 * Update function to extract client name from assessment data
 */
export function getClientNameFromData(data: any): string | null {
  // Try multiple paths where client name might be stored
  if (data?.client_info?.firstName && data?.client_info?.lastName) {
    return `${data.client_info.firstName} ${data.client_info.lastName}`
  }
  if (data?.client_info?.firstName) {
    return data.client_info.firstName
  }
  if (data?.clientInformation?.firstName && data?.clientInformation?.lastName) {
    return `${data.clientInformation.firstName} ${data.clientInformation.lastName}`
  }
  if (data?.clientInformation?.firstName) {
    return data.clientInformation.firstName
  }
  return null
}

/**
 * Save assessment data to Supabase
 * Now this is the ONLY place that should create/update DB records
 * This should ONLY be called when user explicitly clicks Save
 */
export async function saveAssessmentToSupabase(
  assessmentId: string,
  assessmentType: "initial" | "reassessment" = "initial",
): Promise<{ success: boolean; error?: string; isNew?: boolean }> {
  try {
    console.log("[v0] saveAssessmentToSupabase called for ID:", assessmentId)
    console.log("[v0] This should ONLY happen when user clicks Save button")

    const supabase = createBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Collect all data from localStorage
    const allData: Record<string, any> = {}

    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      try {
        const value = localStorage.getItem(storageKey)
        if (value && value !== "null" && value !== "{}") {
          allData[key.toLowerCase()] = JSON.parse(value)
        }
      } catch (error) {
        console.error(`[v0] Error loading ${storageKey}:`, error)
      }
    })

    const progressResult = {
      percentage: 0,
    }

    console.log("[v0] Calculated progress:", progressResult)

    // Extract client name for better display
    let clientName = "Unnamed Client"
    const clientInfoRaw = allData.client_info || {}
    // Handle nested data structure: { data: { firstName: ... } } or direct { firstName: ... }
    const clientInfoData = clientInfoRaw.data || clientInfoRaw

    const firstName = clientInfoData.firstName || clientInfoData.first_name || clientInfoData.client_first_name || ""
    const lastName = clientInfoData.lastName || clientInfoData.last_name || clientInfoData.client_last_name || ""

    if (firstName || lastName) {
      clientName = `${firstName} ${lastName}`.trim()
    }

    console.log("[v0] Extracted client name:", clientName, "from data:", clientInfoData)

    let status = "draft"
    if (progressResult.percentage === 100) {
      status = "complete"
    } else if (progressResult.percentage > 0) {
      status = "in_progress"
    }

    const { data: existingAssessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("id", assessmentId)
      .maybeSingle()

    const assessmentPayload = {
      user_id: user.id,
      evaluation_type: assessmentType,
      data: {
        ...allData,
        progress: progressResult.percentage, // Store progress INSIDE the data jsonb
      },
      title: `${clientName} - ${assessmentType === "initial" ? "Initial Assessment" : "Reassessment"}`,
      status,
      updated_at: new Date().toISOString(),
    }

    if (existingAssessment) {
      // UPDATE existing assessment
      console.log("[v0] Updating existing assessment")
      const { error } = await supabase.from("assessments").update(assessmentPayload).eq("id", assessmentId)

      if (error) {
        console.error("[v0] Error updating assessment:", error)
        return { success: false, error: error.message }
      }
      return { success: true, isNew: false }
    } else {
      // INSERT new assessment - this should ONLY happen on first explicit save
      console.log("[v0] Creating NEW assessment in database (first save)")
      const { error } = await supabase.from("assessments").insert({
        id: assessmentId,
        ...assessmentPayload,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("[v0] Error creating assessment:", error)
        return { success: false, error: error.message }
      }

      // Update URL to include the ID so future saves update instead of insert
      const newUrl = new URL(window.location.href)
      if (!newUrl.searchParams.has("id")) {
        newUrl.searchParams.set("id", assessmentId)
        window.history.replaceState({}, "", newUrl.toString())
      }

      return { success: true, isNew: true }
    }
  } catch (error: any) {
    console.error("[v0] Error in saveAssessmentToSupabase:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Load assessment data from Supabase
 */
export async function loadAssessmentFromSupabase(
  assessmentId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("[v0] Supabase load error:", error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: "Assessment not found" }
    }

    if (!data.data) {
      return { success: false, error: "No data in assessment" }
    }

    const assessmentData = data.data as any

    if (assessmentData.client_info) {
      saveSection(STORAGE_KEYS.CLIENT_INFO, assessmentData.client_info)
    }
    if (assessmentData.background_history) {
      saveSection(STORAGE_KEYS.BACKGROUND_HISTORY, assessmentData.background_history)
    }
    if (assessmentData.reason_for_referral) {
      localStorage.setItem("aria-reason-for-referral", JSON.stringify(assessmentData.reason_for_referral))
    }
    if (assessmentData.standardized_assessments) {
      localStorage.setItem("aria-standardized-assessments", JSON.stringify(assessmentData.standardized_assessments))
    }
    if (assessmentData.abc_observations) {
      saveSection(STORAGE_KEYS.ABC_OBSERVATIONS, assessmentData.abc_observations)
    }
    if (assessmentData.risk_assessment) {
      saveSection(STORAGE_KEYS.RISK_ASSESSMENT, assessmentData.risk_assessment)
    }
    if (assessmentData.goals) {
      saveSection(STORAGE_KEYS.GOALS, assessmentData.goals)
    }
    if (assessmentData.goals_tracker) {
      saveSection(STORAGE_KEYS.GOALS_TRACKER, assessmentData.goals_tracker)
    }
    if (assessmentData.interventions) {
      saveSection(STORAGE_KEYS.INTERVENTIONS, assessmentData.interventions)
    }
    if (assessmentData.selected_interventions) {
      saveSection(STORAGE_KEYS.SELECTED_INTERVENTIONS, assessmentData.selected_interventions)
    }
    if (assessmentData.teaching_protocols) {
      saveSection(STORAGE_KEYS.TEACHING_PROTOCOLS, assessmentData.teaching_protocols)
    }
    if (assessmentData.parent_training) {
      saveSection(STORAGE_KEYS.PARENT_TRAINING, assessmentData.parent_training)
    }
    if (assessmentData.service_schedule) {
      saveSection(STORAGE_KEYS.SERVICE_SCHEDULE, assessmentData.service_schedule)
    }
    if (assessmentData.medical_necessity) {
      saveSection(STORAGE_KEYS.MEDICAL_NECESSITY, assessmentData.medical_necessity)
    }
    if (assessmentData.consent_form) {
      saveSection(STORAGE_KEYS.CONSENT_FORM, assessmentData.consent_form)
    }
    if (assessmentData.cpt_authorization) {
      localStorage.setItem("aria-cpt-authorization", JSON.stringify(assessmentData.cpt_authorization))
    }
    if (assessmentData.fade_plan) {
      localStorage.setItem("aria-fade-plan", JSON.stringify(assessmentData.fade_plan))
    }
    if (assessmentData.barriers_generalization) {
      localStorage.setItem("aria-barriers-generalization", JSON.stringify(assessmentData.barriers_generalization))
    }

    updateCompleteAssessment()

    console.log("[v0] Assessment data loaded from Supabase and restored to localStorage")
    return { success: true, data: assessmentData }
  } catch (error) {
    console.error("[v0] Error loading from Supabase:", error)
    return { success: false, error: String(error) }
  }
}
