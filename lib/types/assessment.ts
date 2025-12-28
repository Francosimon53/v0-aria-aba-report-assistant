import type { EvaluationType } from "../evaluation-type"

export interface Assessment {
  id: string
  user_id: string
  evaluation_type: EvaluationType
  status: "draft" | "submitted" | "completed" | "archived"
  title?: string
  client_name?: string
  data?: AssessmentData
  created_at: string
  updated_at: string
}

export interface AssessmentData {
  // Step 1: Client Info
  clientInfo?: any

  // Step 2: Background & History
  backgroundHistory?: any

  // Step 3: Progress Dashboard (reassessment only)
  progressDashboard?: any

  // Step 4: Context & Tools
  evaluation?: any

  // Step 5: Domains & Functional Impact
  domains?: any

  // Step 6: ABC Observation
  abcObservation?: any

  // Step 7: Risk Assessment
  riskAssessment?: any

  // Step 8: Goals
  goals?: any

  // Step 9: Service Plan
  servicePlan?: any

  // Step 10: CPT Authorization
  cptAuthorization?: any

  // Step 11: Medical Necessity
  medicalNecessity?: any

  // Metadata
  currentStep?: string
  completedSteps?: string[]
  lastEditedAt?: string
}

export type AssessmentStepKey = keyof Omit<AssessmentData, "currentStep" | "completedSteps" | "lastEditedAt">
