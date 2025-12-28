import type { ComponentType } from "react"
import {
  UserIcon,
  ClipboardListIcon,
  TargetIcon,
  FileTextIcon,
  AlertTriangleIcon,
  CalendarIcon,
  FileIcon,
  BarChart3Icon,
  ActivityIcon,
  FileCheckIcon,
  PenIcon,
} from "@/components/icons"

type ActiveView =
  | "client"
  | "background"
  | "assessment"
  | "domains"
  | "abc"
  | "risk"
  | "reassessment"
  | "progressdashboard"
  | "integration"
  | "goals"
  | "goalstracker"
  | "schedule"
  | "cptauth"
  | "consent"
  | "medicalnecessity"
  | "report"
  | "timesaved"
  | "support"

export interface WizardStep {
  id: ActiveView
  label: string
  icon: ComponentType<{ className?: string }>
  description: string
  phase: number
  phaseLabel: string
  route?: string
}

// Initial Assessment Flow (11 steps - ASSESSMENT ONLY)
export const INITIAL_ASSESSMENT_STEPS: WizardStep[] = [
  // SECTION 1: Client Information (Steps 1-2)
  {
    id: "client",
    label: "Client Info",
    icon: UserIcon,
    description: "Demographics & insurance",
    phase: 1,
    phaseLabel: "Client Information",
    route: "/assessment/client-info",
  },
  {
    id: "background",
    label: "Background & History",
    icon: FileIcon,
    description: "Developmental & clinical history",
    phase: 1,
    phaseLabel: "Client Information",
    route: "/assessment/background-history",
  },

  // SECTION 2: Assessment (Steps 3-6)
  {
    id: "assessment",
    label: "Context & Tools",
    icon: ClipboardListIcon,
    description: "Settings, dates, instruments",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/evaluation",
  },
  {
    id: "domains",
    label: "Domains & Functional Impact",
    icon: ActivityIcon,
    description: "Communication, social, adaptive, behavior",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/domains",
  },
  {
    id: "abc",
    label: "ABC Observation",
    icon: FileCheckIcon,
    description: "Key behavioral episodes",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/abc-observation",
  },
  {
    id: "risk",
    label: "Risk Assessment",
    icon: AlertTriangleIcon,
    description: "Safety & supervision needs",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/risk-assessment",
  },

  // SECTION 3: Goals & Plan (Steps 7-9)
  {
    id: "goals",
    label: "Initial Goals",
    icon: TargetIcon,
    description: "High-level treatment targets",
    phase: 3,
    phaseLabel: "Goals & Plan",
    route: "/assessment/goals",
  },
  {
    id: "schedule",
    label: "Service Plan & Weekly Schedule",
    icon: CalendarIcon,
    description: "Recommended CPT hours/week",
    phase: 3,
    phaseLabel: "Goals & Plan",
    route: "/assessment/service-plan",
  },

  // SECTION 4: Authorization & Report (Steps 10-12)
  {
    id: "cptauth",
    label: "CPT Auth Request",
    icon: FileTextIcon,
    description: "Insurance-facing summary",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/cpt-authorization",
  },
  {
    id: "medicalnecessity",
    label: "Medical Necessity",
    icon: FileTextIcon,
    description: "Clinical justification writer",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/medical-necessity",
  },
  {
    id: "signatures",
    label: "Signatures & Consent",
    icon: PenIcon,
    description: "Collect required signatures",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/signatures",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileTextIcon,
    description: "Preview & export",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/generate-report",
  },
]

// Reassessment Flow (12 steps - includes progress tracking)
export const REASSESSMENT_STEPS: WizardStep[] = [
  // SECTION 1: Client Information (Steps 1-2)
  {
    id: "client",
    label: "Client Info",
    icon: UserIcon,
    description: "Update demographics & insurance",
    phase: 1,
    phaseLabel: "Client Information",
    route: "/assessment/client-info",
  },
  {
    id: "background",
    label: "Background & History",
    icon: FileIcon,
    description: "Updates since last report",
    phase: 1,
    phaseLabel: "Client Information",
    route: "/assessment/background-history",
  },

  // SECTION 2: Assessment (Steps 3-7, includes Progress Dashboard)
  {
    id: "progressdashboard",
    label: "Progress Dashboard",
    icon: BarChart3Icon,
    description: "Visual progress review",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/progress-dashboard",
  },
  {
    id: "assessment",
    label: "Context & Tools",
    icon: ClipboardListIcon,
    description: "Current assessment context",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/evaluation",
  },
  {
    id: "domains",
    label: "Domains & Functional Impact",
    icon: ActivityIcon,
    description: "Current skill levels",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/domains",
  },
  {
    id: "abc",
    label: "ABC Observation",
    icon: FileCheckIcon,
    description: "Current behavior sample",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/abc-observation",
  },
  {
    id: "risk",
    label: "Risk Assessment",
    icon: AlertTriangleIcon,
    description: "Updated safety evaluation",
    phase: 2,
    phaseLabel: "Assessment",
    route: "/assessment/risk-assessment",
  },

  // SECTION 3: Goals & Plan (Steps 8-9)
  {
    id: "goals",
    label: "Updated Goals",
    icon: TargetIcon,
    description: "Review & update goal domains",
    phase: 3,
    phaseLabel: "Goals & Plan",
    route: "/assessment/goals",
  },
  {
    id: "schedule",
    label: "Service Plan & Schedule",
    icon: CalendarIcon,
    description: "Updated service planning",
    phase: 3,
    phaseLabel: "Goals & Plan",
    route: "/assessment/service-plan",
  },

  // SECTION 4: Authorization & Report (Steps 10-13)
  {
    id: "cptauth",
    label: "CPT Auth Request",
    icon: FileTextIcon,
    description: "Reauthorization request",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/cpt-authorization",
  },
  {
    id: "medicalnecessity",
    label: "Medical Necessity",
    icon: FileTextIcon,
    description: "Reauthorization justification",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/medical-necessity",
  },
  {
    id: "signatures",
    label: "Signatures & Consent",
    icon: PenIcon,
    description: "Collect required signatures",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/signatures",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileTextIcon,
    description: "Export reassessment report",
    phase: 4,
    phaseLabel: "Authorization & Report",
    route: "/assessment/generate-report",
  },
]

// Get steps based on evaluation type
export function getStepsByEvaluationType(evaluationType: "Initial Assessment" | "Reassessment"): WizardStep[] {
  return evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
}

// Navigation utilities
export function getNextStepInArray(current: ActiveView, stepsArray: WizardStep[]): ActiveView | null {
  const index = stepsArray.findIndex((s) => s.id === current)
  if (index >= 0 && index < stepsArray.length - 1) {
    return stepsArray[index + 1].id
  }
  return null
}

export function getPreviousStepInArray(current: ActiveView, stepsArray: WizardStep[]): ActiveView | null {
  const index = stepsArray.findIndex((s) => s.id === current)
  if (index > 0) {
    return stepsArray[index - 1].id
  }
  return null
}

export function getCurrentStepIndex(current: ActiveView, stepsArray: WizardStep[]): number {
  return stepsArray.findIndex((s) => s.id === current)
}
