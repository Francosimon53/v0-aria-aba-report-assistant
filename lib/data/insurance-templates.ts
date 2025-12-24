export interface InsuranceTemplate {
  id: string
  name: string
  code: string
  requiredSections: string[]
  documentationRequirements: string[]
  authorizationCriteria: string[]
}

export const insuranceTemplates: InsuranceTemplate[] = [
  {
    id: "ins-001",
    name: "Blue Cross Blue Shield",
    code: "BCBS",
    requiredSections: [
      "Client Demographics",
      "Diagnosis & Medical Necessity",
      "Assessment Results (VB-MAPP, ABLLS, etc.)",
      "Treatment Goals (measurable, time-limited)",
      "Recommended Service Hours",
      "Parent/Caregiver Training Plan",
      "Discharge Criteria",
    ],
    documentationRequirements: [
      "Standardized assessment scores",
      "Baseline data for all target behaviors",
      "Previous treatment history if applicable",
      "Functional Behavior Assessment if problem behaviors present",
      "Caregiver involvement documentation",
    ],
    authorizationCriteria: [
      "ASD diagnosis from qualified professional",
      "Medical necessity demonstrated",
      "Goals aligned with assessment findings",
      "Reasonable hour recommendations based on severity",
    ],
  },
  {
    id: "ins-002",
    name: "Aetna",
    code: "AETNA",
    requiredSections: [
      "Comprehensive Diagnostic Summary",
      "Developmental History",
      "Behavioral Assessment Results",
      "Individualized Treatment Plan",
      "Service Delivery Model",
      "Progress Monitoring Plan",
      "Family Training Component",
    ],
    documentationRequirements: [
      "Autism diagnostic report",
      "Standardized skill assessments",
      "Functional analysis data if applicable",
      "Prior authorization documentation",
      "Treatment team credentials",
    ],
    authorizationCriteria: [
      "DSM-5 ASD diagnosis",
      "Treatment provided by qualified BCBA",
      "RBT supervision plan included",
      "Clear medical necessity statement",
    ],
  },
  {
    id: "ins-003",
    name: "United Healthcare",
    code: "UHC",
    requiredSections: [
      "Member Information",
      "Clinical Summary",
      "Assessment Instruments Used",
      "Behavioral Objectives",
      "Treatment Methodology",
      "Hours and Frequency Justification",
      "Outcome Measures",
    ],
    documentationRequirements: [
      "Current psychological evaluation",
      "VB-MAPP or equivalent assessment",
      "Behavior data collection samples",
      "Previous treatment records",
      "School IEP if applicable",
    ],
    authorizationCriteria: [
      "Diagnosis confirmation",
      "Age-appropriate interventions",
      "Parent participation requirements met",
      "Evidence-based treatment methods",
    ],
  },
  {
    id: "ins-004",
    name: "Cigna",
    code: "CIGNA",
    requiredSections: [
      "Patient Identification",
      "Presenting Concerns",
      "Comprehensive Assessment Summary",
      "Treatment Recommendations",
      "Goal Hierarchy",
      "Supervision Structure",
      "Re-evaluation Timeline",
    ],
    documentationRequirements: [
      "Diagnostic evaluation within 12 months",
      "Curriculum-based assessment",
      "Adaptive behavior assessment",
      "Treatment fidelity measures",
      "Generalization programming",
    ],
    authorizationCriteria: [
      "ASD or related diagnosis",
      "Skill deficits documented",
      "Treatment intensity justified",
      "Qualified provider oversight",
    ],
  },
  {
    id: "ins-005",
    name: "Medicaid (General)",
    code: "MEDICAID",
    requiredSections: [
      "Recipient Information",
      "Diagnostic Information",
      "Level of Care Determination",
      "Comprehensive Treatment Plan",
      "Service Authorization Request",
      "Provider Qualifications",
      "Transition Planning",
    ],
    documentationRequirements: [
      "State-specific diagnostic requirements",
      "Comprehensive evaluation",
      "Prior authorization forms",
      "Treatment plan updates",
      "Progress reports per state timeline",
    ],
    authorizationCriteria: [
      "State-specific eligibility",
      "Medical necessity per state definition",
      "EPSDT requirements for children",
      "Qualified Medicaid provider",
    ],
  },
]
