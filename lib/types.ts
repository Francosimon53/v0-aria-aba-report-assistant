export interface ClientData {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  diagnosis: string
  insuranceProvider: string
  insuranceId: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  referralSource: string
  referralDate: string
  assessmentDate: string
  assessor: string
  supervisingBCBA: string
}

export interface AssessmentData {
  clientId: string
  assessmentType: string
  assessmentDate: string
  domains: DomainScore[]
  strengths: string[]
  deficits: string[]
  barriers: string[]
  recommendations: string[]
  hoursRecommended: number
  hoursJustification: string
}

export interface DomainScore {
  domain: string
  score: number
  maxScore: number
  percentile?: number
  ageEquivalent?: string
  notes: string
}

export interface SelectedGoal {
  goalId: string
  priority: "high" | "medium" | "low"
  targetDate: string
  baselineData: string
  customizations: string
}

export interface Report {
  id: string
  clientData: ClientData
  assessmentData: AssessmentData
  selectedGoals: SelectedGoal[]
  narrativeSections: NarrativeSection[]
  generatedAt: string
  status: "draft" | "review" | "final"
}

export interface NarrativeSection {
  title: string
  content: string
  order: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ReassessmentData {
  id: string
  clientId: string
  reassessmentDate: string
  reassessmentType: string
  previousAssessmentId: string
  domains: DomainScore[]
  progressSummary: string
  goalsMetCount: number
  goalsContinuedCount: number
  newGoalsCount: number
  revisedHoursRecommended: number
  hoursJustification: string
  recommendationChanges: string[]
}

export interface AgencyData {
  id: string
  clientId: string
  dataType: "session" | "behavior" | "progress" | "billing"
  sourceSystem: string
  importDate: string
  data: SessionData[] | BehaviorData[] | ProgressData[]
}

export interface SessionData {
  date: string
  duration: number
  therapist: string
  location: string
  goalsTargeted: string[]
  notes: string
  attendance: "present" | "absent" | "cancelled"
}

export interface BehaviorData {
  date: string
  behavior: string
  frequency: number
  duration?: number
  intensity?: number
  antecedent: string
  consequence: string
  intervention: string
}

export interface ProgressData {
  goalId: string
  goalName: string
  dataPoints: DataPoint[]
  currentLevel: number
  targetLevel: number
  progressPercentage: number
}

export interface DataPoint {
  date: string
  value: number
  trial: number
  correct: boolean
  prompt?: string
  notes?: string
}

export interface APIIntegration {
  id: string
  name: string
  type: "central-reach" | "rethink" | "catalyst" | "custom"
  apiKey: string
  baseUrl: string
  status: "connected" | "disconnected" | "error"
  lastSync: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
}

export interface BehaviorReduction {
  id: string
  behaviorName: string
  operationalDefinition: string
  function: "attention" | "escape" | "tangible" | "sensory" | "multiple" | "unknown"
  severity: "mild" | "moderate" | "severe"
  frequency: string
  duration: string
  intensity: string
  antecedents: string[]
  consequences: string[]
  replacementBehavior: string
  interventionStrategies: string[]
  dataCollectionMethod: string
  measurementType: "frequency" | "duration" | "interval" | "latency" | "intensity"
  baselineData: string
  targetCriteria: string
  safetyConsiderations: string
  notes: string
}

export type StoLevel = 20 | 40 | 60 | 80 | 90
export type StoStatus = "Not Started" | "In Progress" | "Completed"
export type PlanStatus = "Not Started" | "In Progress" | "Mastered"
export type InterventionCategory =
  | "Communication"
  | "Reinforcement"
  | "Differential Reinforcement"
  | "Teaching Techniques"
  | "Behavior Reduction"
  | "Programs & ADLs"

export type TrainingSession = {
  id: string
  dateISO: string
  fidelityScore: number // 0-100
  notes?: string
}

export type PlanProtocolState = {
  stepsChecked: Record<string, boolean> // key by step string or generated id
  checklist: string[] // editable list
}

export type InterventionPlanItem = {
  id: string
  interventionId: string
  name: string
  category: InterventionCategory
  targetFidelity: number
  masterySessions: number
  currentFidelity: number
  status: PlanStatus
  sto: { level: StoLevel; status: StoStatus }[]
  protocolState: PlanProtocolState
  sessions: TrainingSession[]
}

export interface Intervention {
  id: string
  name: string
  description: string
  selected: boolean
  category?: InterventionCategory
  steps?: string[]
  implementationNotes?: string
}
