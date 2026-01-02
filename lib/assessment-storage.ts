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
 * Export all data as JSON (for backup)
 */
export function exportAssessmentAsJSON(): string {
  const data = getCompleteAssessment()
  return JSON.stringify(data, null, 2)
}
