import { STORAGE_KEYS } from "./assessment-storage"

export interface ProgressSection {
  id: string
  name: string
  key: string
  required: boolean
  isComplete: boolean
}

export interface ProgressResult {
  sections: ProgressSection[]
  totalSections: number
  completedCount: number
  percentage: number
  requiredTotal: number
  requiredCompleted: number
  allRequiredComplete: boolean
}

/**
 * Centralized function to calculate assessment progress
 * This ensures consistent progress reporting across all views
 */
export function calculateAssessmentProgress(assessmentData?: any): ProgressResult {
  console.log("[v0] Calculating progress from data:", assessmentData)

  const sections: ProgressSection[] = [
    {
      id: "client-info",
      name: "Client Information",
      key: STORAGE_KEYS.CLIENT_INFO,
      required: true,
      isComplete: !!(
        assessmentData?.client_first_name &&
        assessmentData?.client_last_name &&
        assessmentData?.date_of_birth
      ),
    },
    {
      id: "background",
      name: "Background & History",
      key: STORAGE_KEYS.BACKGROUND_HISTORY,
      required: true,
      isComplete: !!(assessmentData?.background_history && Object.keys(assessmentData.background_history).length > 0),
    },
    {
      id: "referral",
      name: "Reason for Referral",
      key: STORAGE_KEYS.REASON_FOR_REFERRAL,
      required: true,
      isComplete: !!assessmentData?.reason_for_referral,
    },
    {
      id: "standardized",
      name: "Standardized Assessments",
      key: STORAGE_KEYS.ASSESSMENT_DATA,
      required: true,
      isComplete: !!(assessmentData?.standardized_assessments?.length > 0),
    },
    {
      id: "abc-observations",
      name: "ABC Observations",
      key: STORAGE_KEYS.ABC_OBSERVATIONS,
      required: false,
      isComplete: !!(assessmentData?.abc_observations?.length > 0),
    },
    {
      id: "risk-assessment",
      name: "Risk Assessment",
      key: STORAGE_KEYS.RISK_ASSESSMENT,
      required: true,
      isComplete: !!(assessmentData?.risk_assessment && Object.keys(assessmentData.risk_assessment).length > 0),
    },
    {
      id: "goals",
      name: "Goals",
      key: STORAGE_KEYS.GOALS,
      required: true,
      isComplete: !!(assessmentData?.goals?.length > 0),
    },
    {
      id: "interventions",
      name: "Interventions",
      key: STORAGE_KEYS.INTERVENTIONS,
      required: false,
      isComplete: !!(assessmentData?.interventions?.length > 0),
    },
    {
      id: "service-schedule",
      name: "Service Schedule",
      key: STORAGE_KEYS.SERVICE_SCHEDULE,
      required: true,
      isComplete: !!(assessmentData?.service_schedule && assessmentData.service_schedule.total_hours > 0),
    },
    {
      id: "medical-necessity",
      name: "Medical Necessity",
      key: STORAGE_KEYS.MEDICAL_NECESSITY,
      required: false,
      isComplete: !!assessmentData?.medical_necessity,
    },
    {
      id: "cpt-auth",
      name: "CPT Authorization",
      key: STORAGE_KEYS.CPT_AUTHORIZATION,
      required: false,
      isComplete: !!assessmentData?.cpt_authorization,
    },
    {
      id: "barriers-generalization",
      name: "Barriers & Generalization",
      key: STORAGE_KEYS.BARRIERS_GENERALIZATION,
      required: false,
      isComplete: !!assessmentData?.barriers_generalization,
    },
    {
      id: "generate-report",
      name: "Generate Report",
      key: "report_generated",
      required: false,
      isComplete: !!assessmentData?.report_generated,
    },
  ]

  const completedSections = sections.filter((s) => s.isComplete)
  const requiredSections = sections.filter((s) => s.required)
  const completedRequired = requiredSections.filter((s) => s.isComplete)

  const result: ProgressResult = {
    sections,
    totalSections: sections.length,
    completedCount: completedSections.length,
    percentage: Math.round((completedSections.length / sections.length) * 100),
    requiredTotal: requiredSections.length,
    requiredCompleted: completedRequired.length,
    allRequiredComplete: completedRequired.length === requiredSections.length,
  }

  console.log("[v0] Progress result:", result)
  return result
}

/**
 * Load assessment data from localStorage for progress calculation
 */
export function getAssessmentDataFromStorage(): any {
  if (typeof window === "undefined") return {}

  const data: any = {}

  // Load all relevant data from localStorage
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    try {
      const value = localStorage.getItem(storageKey)
      if (value) {
        data[key.toLowerCase()] = JSON.parse(value)
      }
    } catch (error) {
      console.error(`[v0] Error loading ${storageKey}:`, error)
    }
  })

  return data
}
