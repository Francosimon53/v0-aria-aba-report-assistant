// Wizard metadata and configuration for ARIA ABA Report Assistant
export const wizardMeta = {
  name: "ARIA - ABA Report Assistant",
  short_name: "ARIA",
  description: "AI-powered assistant for creating comprehensive ABA assessment reports",
  version: "1.0.0",

  phases: [
    { id: 1, label: "Client Information", description: "Gather client demographics and history" },
    { id: 2, label: "Assessment", description: "Conduct clinical assessments and observations" },
    { id: 3, label: "Reassessment", description: "Track progress and update evaluations" },
    { id: 4, label: "Data & Goals", description: "Set treatment goals and interventions" },
    { id: 5, label: "Services & Training", description: "Plan services and caregiver training" },
    { id: 6, label: "Report & Finalize", description: "Generate and finalize clinical report" },
  ],

  steps: [
    // Phase 1: Client Information
    { id: "client", label: "Client Info", description: "Demographics & insurance", phase: 1, required: true },
    {
      id: "background",
      label: "Background & History",
      description: "Developmental & clinical history",
      phase: 1,
      required: true,
    },

    // Phase 2: Assessment
    { id: "assessment", label: "Assessment", description: "Enter assessment data", phase: 2, required: true },
    { id: "abc", label: "ABC Observation", description: "Record behavioral observations", phase: 2, required: false },
    { id: "risk", label: "Risk Assessment", description: "Safety evaluation & crisis plan", phase: 2, required: false },

    // Phase 3: Reassessment
    { id: "reassessment", label: "Reassessment", description: "Track progress & update", phase: 3, required: false },
    {
      id: "progressdashboard",
      label: "Progress Dashboard",
      description: "Visual outcomes & comparison",
      phase: 3,
      required: false,
    },

    // Phase 4: Data & Goals
    { id: "integration", label: "Data Integration", description: "Import & visualize data", phase: 4, required: false },
    { id: "goals", label: "Goal Bank", description: "Select treatment goals", phase: 4, required: true },
    {
      id: "goalstracker",
      label: "Goals Tracker",
      description: "Monitor progress & outcomes",
      phase: 4,
      required: false,
    },
    {
      id: "interventions",
      label: "Interventions",
      description: "Evidence-based strategies",
      phase: 4,
      required: false,
    },
    {
      id: "protocols",
      label: "Teaching Protocols",
      description: "Build step-by-step programs",
      phase: 4,
      required: false,
    },

    // Phase 5: Services & Training
    {
      id: "parenttraining",
      label: "Parent Training",
      description: "Track curriculum & fidelity",
      phase: 5,
      required: false,
    },
    { id: "schedule", label: "Service Schedule", description: "Weekly CPT code planning", phase: 5, required: false },
    {
      id: "cptauth",
      label: "CPT Auth Request",
      description: "Service request & justification",
      phase: 5,
      required: false,
    },
    {
      id: "consent",
      label: "Consent Forms",
      description: "Digital signatures & legal docs",
      phase: 5,
      required: false,
    },

    // Phase 6: Report & Finalize
    {
      id: "medicalnecessity",
      label: "Medical Necessity",
      description: "AI-powered justification writer",
      phase: 6,
      required: true,
    },
    { id: "report", label: "Generate Report", description: "Generate & export", phase: 6, required: true },
  ],

  // Report sections are dynamically generated based on assessment data
  // See components/report-preview-tool.tsx for section generation logic
  reportSections: [
    { id: "client-info", title: "Client Information", required: true },
    { id: "reason-referral", title: "Reason for Referral", required: true },
    { id: "assessment-instruments", title: "Assessment Instruments", required: true },
    { id: "results", title: "Assessment Results", required: true },
    { id: "goals", title: "Treatment Goals & Objectives", required: true },
    { id: "medical-necessity", title: "Medical Necessity Statement", required: true },
    { id: "hours-justification", title: "Service Hours Justification", required: true },
    { id: "parent-training", title: "Parent/Caregiver Training Plan", required: true },
    { id: "crisis-plan", title: "Crisis & Safety Plan", required: false },
    { id: "signatures", title: "Signatures & Consent", required: true },
  ],
} as const

export type WizardPhase = (typeof wizardMeta.phases)[number]
export type WizardStep = (typeof wizardMeta.steps)[number]
export type ReportSection = (typeof wizardMeta.reportSections)[number]

// Helper functions
export const getStepsByPhase = (phaseId: number) => {
  return wizardMeta.steps.filter((step) => step.phase === phaseId)
}

export const getRequiredSteps = () => {
  return wizardMeta.steps.filter((step) => step.required)
}

export const getTotalSteps = () => {
  return wizardMeta.steps.length
}

export const getPhaseLabel = (phaseId: number) => {
  return wizardMeta.phases.find((p) => p.id === phaseId)?.label ?? "Unknown Phase"
}
