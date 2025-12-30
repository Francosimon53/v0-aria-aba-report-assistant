"use client"

import { useMemo, useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react"
import type React from "react"
import {
  FileText,
  Check,
  Copy,
  Download,
  Printer,
  Mail,
  Eye,
  AlertCircle,
  User,
  ClipboardList,
  BookOpen,
  Target,
  Brain,
  Heart,
  Shield,
  Users,
  Calendar,
  FileCheck,
  Sparkles,
  Trophy,
  Share2,
  Plus,
  LayoutDashboard,
  RefreshCw,
  ChevronDown,
  Edit3,
  FileDown,
  TrendingUp,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { sampleAssessmentData } from "@/lib/sample-data/sample-data"
import { safeGetItem } from "@/lib/safe-storage"

// Remove the duplicate React import
// import type React from "react"

// Types
interface ReportSection {
  id: string
  title: string
  status: "pending" | "generating" | "complete" | "error"
  content: string
  isEditing: boolean
  icon: React.ReactNode
  estimatedWords: string
  optional?: boolean
  generated?: boolean
}

interface AssessmentData {
  clientInfo?: {
    firstName?: string
    lastName?: string
    dob?: string
    age?: number | string
    gender?: string
    diagnosis?: string
    icd10Code?: string
    clientId?: string
    address?: string
    caregiver?: string
    phone?: string
  }
  providerInfo?: {
    name?: string
    bcbaName?: string
    bcbaLicense?: string
    bcbaPhone?: string
    bcbaEmail?: string
    npi?: string
    agencyLogo?: string // Added agencyLogo field
  }
  insurance?: {
    provider?: string
    policyNumber?: string
    authNumber?: string
  }
  background?: {
    developmental?: string
    medical?: string
    educational?: string
    family?: string
    previousTreatments?: string
    strengths?: string
    weaknesses?: string
    dailySchedule?: string
  }
  assessmentTools?: string[]
  assessmentDates?: string
  observationSettings?: string
  domains?: {
    communication?: { level: string; findings: string }
    social?: { level: string; findings: string }
    adaptive?: { level: string; findings: string }
    behavior?: { level: string; findings: string }
    play?: { level: string; findings: string }
    motor?: { level: string; findings: string }
  }
  abcObservations?: Array<{
    antecedent: string
    behavior: string
    consequence: string
    function?: string
  }>
  behaviors?: Array<{
    name: string
    definition: string
    baseline: string
    frequency: string
    intensity: string
    function: string
  }>
  preferenceAssessment?: {
    method: string
    results: string
    topReinforces: string[]
  }
  goals?: Array<{
    domain: string
    shortTerm: string
    longTerm: string
    baseline?: string
    target?: string
  }>
  behaviorGoals?: Array<{
    behavior: string
    baseline: string
    target: string
    stos?: string[]
  }>
  caregiverGoals?: Array<{
    area: string
    baseline: string
    target: string
  }>
  recommendations?: {
    weeklyHours?: number
    rbtHours?: number
    bcbaHours?: number
    parentTrainingHours?: string
    duration?: string
    rationale?: string
    setting?: string
  }
  servicePlan?: {
    cptCodes?: Array<{
      code: string
      description: string
      units: number
      hoursPerWeek: number
      location: string
    }>
  }
  riskAssessment?: {
    extinctionBurst: string
    safetyProtocols: string
    emergencyContacts: string
  }
  dischargeCriteria?: string
  crisisPlan?: string
  medicalNecessity?: string
}

const loadGoalsTrackerData = () => {
  try {
    const data = localStorage.getItem("aria-goals-tracker")
    if (data) {
      return JSON.parse(data) as Array<{
        id: string
        type: "behavior-reduction" | "skill-acquisition" | "parent-training"
        description: string
        startDate: string
        targetDate: string
        status: string
        progress: number
        stos: Array<{
          id: string
          description: string
          baseline: string
          current: string
          masteryCriteria: string
          status: string
          progress: number
        }>
      }>
    }
  } catch (error) {
    console.error("[v0] Error loading goals tracker data:", error)
  }
  return []
}

const REPORT_SECTIONS = [
  {
    id: "header",
    title: "Header & Client Information",
    order: 1,
    icon: <User className="h-4 w-4" />,
    estimatedWords: "150-200",
  },
  {
    id: "service_recommendations",
    title: "Service Recommendations Table",
    order: 2,
    icon: <Calendar className="h-4 w-4" />,
    estimatedWords: "100-150",
  },
  {
    id: "referral",
    title: "Reason for Referral",
    order: 3,
    icon: <ClipboardList className="h-4 w-4" />,
    estimatedWords: "150-200",
  },
  {
    id: "background",
    title: "Background Information",
    order: 4,
    icon: <BookOpen className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "assessments",
    title: "Assessments Conducted",
    order: 5,
    icon: <FileCheck className="h-4 w-4" />,
    estimatedWords: "200-300",
  },
  {
    id: "abc_observations",
    title: "ABC Observations",
    order: 6,
    icon: <Eye className="h-4 w-4" />,
    estimatedWords: "400-600",
  },
  {
    id: "preference_assessment",
    title: "Preference Assessment",
    order: 7,
    icon: <Heart className="h-4 w-4" />,
    estimatedWords: "150-200",
  },
  {
    id: "maladaptive_behaviors",
    title: "Maladaptive Behaviors",
    order: 8,
    icon: <AlertCircle className="h-4 w-4" />,
    estimatedWords: "600-1000",
  },
  {
    id: "hypothesis_interventions",
    title: "Hypothesis-Based Interventions",
    order: 9,
    icon: <Brain className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "intervention_descriptions",
    title: "Description of Interventions",
    order: 10,
    icon: <Target className="h-4 w-4" />,
    estimatedWords: "600-800",
  },
  {
    id: "teaching_procedures",
    title: "Teaching Procedures",
    order: 11,
    icon: <BookOpen className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "skill_acquisition_goals",
    title: "Skill Acquisition Goals",
    order: 12,
    icon: <Target className="h-4 w-4" />,
    estimatedWords: "600-1000",
  },
  {
    id: "behavior_reduction_goals",
    title: "Behavior Reduction Goals",
    order: 13,
    icon: <Shield className="h-4 w-4" />,
    estimatedWords: "400-600",
  },
  {
    id: "caregiver_goals",
    title: "Caregiver Training Goals",
    order: 14,
    icon: <Users className="h-4 w-4" />,
    estimatedWords: "300-400",
  },
  {
    id: "parent_training_progress",
    title: "Parent Training Progress",
    order: 15,
    icon: <Users className="h-4 w-4" />,
    estimatedWords: "400-600",
  },
  {
    id: "medical_necessity",
    title: "Medical Necessity Statement",
    order: 16,
    icon: <FileText className="h-4 w-4" />,
    estimatedWords: "250-350",
  },
  {
    id: "additional_sections",
    title: "Additional Required Sections",
    order: 17,
    icon: <FileCheck className="h-4 w-4" />,
    estimatedWords: "600-800",
  },
  {
    id: "progress_notes", // Added section for Progress Notes
    title: "Progress Notes",
    order: 18,
    icon: <TrendingUp className="h-4 w-4" />,
    estimatedWords: "500-800",
  },
] as const

// Helper function to get initial sections state
const getInitialSections = () =>
  REPORT_SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    status: "pending",
    content: "",
    isEditing: false,
    icon: s.icon,
    estimatedWords: s.estimatedWords,
    optional: s.optional,
    generated: false,
  }))

interface AIReportGeneratorProps {
  assessmentData?: AssessmentData
  onExport?: (format: "pdf" | "docx" | "print" | "email") => void
}

export interface AIReportGeneratorHandle {
  exportReport: (format: "pdf" | "docx" | "print" | "email") => void
}

const motivationalMessages = [
  "This report is going to be awesome 💪",
  "Saving time like a pro ⚡",
  "The AI is working for you 🤖",
  "One step closer to the perfect report 🎯",
  "This would have taken hours manually 🕐",
]

const completionMessages = [
  "Report complete. You're unstoppable 🔥",
  "Ready to impress 💼",
  "Another successful report in your history 🏆",
]

const getMotivationalMessage = () => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
const getCompletionMessage = () => completionMessages[Math.floor(Math.random() * completionMessages.length)]

// CHANGE: Adding styled markdown components constant to reuse in both Preview and Edit modes
const markdownComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-gray-800 mt-3 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-gray-700">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-gray-900">{children}</strong>,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-gray-100">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b bg-gray-100">{children}</th>
  ),
  td: ({ children }: any) => <td className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100">{children}</td>,
}

export const AIReportGenerator = forwardRef<AIReportGeneratorHandle, AIReportGeneratorProps>(function AIReportGenerator(
  { assessmentData: initialData, onExport },
  ref,
) {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(initialData || {})
  const [sections, setSections] = useState<ReportSection[]>(getInitialSections())
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  // Helper function to safely parse JSON from localStorage
  const safeParseJSON = (key: string): any => {
    return safeGetItem(key)
  }

  useEffect(() => {
    if (!initialData) {
      const userData: AssessmentData = {
        clientInfo: safeParseJSON("aria-client-info") || {},
        background: safeParseJSON("aria-background-history") || {},
        assessmentTools: (safeParseJSON("aria-assessment-data") || {}).tools || [],
        domains: safeParseJSON("aria-domains") || {},
        abcObservations: safeParseJSON("aria-abc-observation") || [],
        behaviors: safeParseJSON("aria-behavior-library-data") || [],
        goals: safeParseJSON("aria-goals") || [],
        servicePlan: safeParseJSON("aria-service-plan") || {},
        medicalNecessity: safeParseJSON("aria_medical_necessity") || {},
        riskAssessment: safeParseJSON("aria-risk-assessment") || {},
      }

      console.log("[v0] Loaded user data:", userData)

      // Always use user data if available
      const hasClientInfo = userData.clientInfo && Object.keys(userData.clientInfo).length > 0
      const hasDomains = userData.domains && Object.keys(userData.domains).length > 0
      const hasGoals = userData.goals && userData.goals.length > 0

      if (hasClientInfo || hasDomains || hasGoals) {
        console.log("[v0] Using real user assessment data")
        setAssessmentData(userData)
        setSampleDataLoaded(false)
      } else {
        console.log("[v0] No user data found, using sample data")
        loadSampleData()
      }
    }
  }, [initialData])

  const loadSampleData = () => {
    // This preserves the sample data for reference without overwriting user data

    const formattedData: AssessmentData = {
      clientInfo: sampleAssessmentData.clientInfo,
      providerInfo: sampleAssessmentData.providerInfo,
      insurance: sampleAssessmentData.insurance,
      background: sampleAssessmentData.background,
      assessmentTools: sampleAssessmentData.assessmentTools,
      assessmentDates: sampleAssessmentData.assessmentDates,
      observationSettings: sampleAssessmentData.observationSettings,
      domains: sampleAssessmentData.domains,
      abcObservations: sampleAssessmentData.abcObservations,
      behaviors: sampleAssessmentData.behaviors,
      goals: sampleAssessmentData.goals,
      servicePlan: sampleAssessmentData.servicePlan,
      medicalNecessity: sampleAssessmentData.medicalNecessity,
      riskAssessment: sampleAssessmentData.riskAssessment,
    }

    setAssessmentData(formattedData)
    setSampleDataLoaded(true)

    // Instead, initialize sections as empty and ready to be generated with real data
    // This prevents overwriting user data with template content
    setSections(getInitialSections())
    setShowPreview(false)
    setError(null)
  }

  const buildPromptForSection = (sectionId: string, data: AssessmentData): string => {
    const clientName =
      `${data.clientInfo?.firstName || "[First Name]"} ${data.clientInfo?.lastName || "[Last Name]"}`.trim()
    const diagnosis = data.clientInfo?.diagnosis || "Autism Spectrum Disorder"
    const icd10 = data.clientInfo?.icd10Code || "F84.0" // Corrected from icd10 to icd10Code
    const age = data.clientInfo?.age || "[Age]"
    const dob = data.clientInfo?.dob || "[DOB]"

    const behaviors = data.behaviors || []
    const goals = data.goals || []
    const behaviorGoals = data.behaviorGoals || []
    const abcObs = data.abcObservations || []
    const weeklyHours = data.recommendations?.weeklyHours || 25
    const rbtHours = data.recommendations?.rbtHours || 20
    const bcbaHours = data.recommendations?.bcbaHours || 4
    const parentHours = data.recommendations?.parentTrainingHours || "2 hours/week"

    const prompts: Record<string, string> = {
      header: `Write the HEADER & CLIENT INFORMATION section for a professional ABA assessment report.

CLIENT INFORMATION:
- Name: ${clientName}
- Date of Birth: ${dob}
- Age: ${age}
- Client ID: ${data.clientInfo?.clientId || "[Client ID]"}
- Address: ${data.clientInfo?.address || "[Address]"}
- Primary Caregiver: ${data.clientInfo?.caregiver || "[Caregiver Name]"}
- Phone: ${data.clientInfo?.phone || "[Phone]"}
- Diagnosis: ${diagnosis} (${icd10})

PROVIDER INFORMATION:
- Agency: ${data.providerInfo?.name || "[Agency Name]"}
- BCBA: ${data.providerInfo?.bcbaName || "[BCBA Name]"}
- BCBA License: ${data.providerInfo?.bcbaLicense || "[License #]"}
- Contact: ${data.providerInfo?.bcbaPhone || "[Phone]"} / ${data.providerInfo?.bcbaEmail || "[Email]"}
- NPI: ${data.providerInfo?.npi || "[NPI #]"}

INSURANCE:
- Provider: ${data.insurance?.provider || "[Insurance Provider]"}
- Policy #: ${data.insurance?.policyNumber || "[Policy #]"}
- Authorization #: ${data.insurance?.authNumber || "[Auth #]"}

Assessment Type: Initial Assessment
Assessment Dates: ${data.assessmentDates || "[Assessment Dates]"}
Report Date: ${new Date().toLocaleDateString()}

Format this as a professional header with clearly organized recipient info, provider info, and assessment details. Use proper formatting with labels and values.`,

      service_recommendations: `Write the SERVICE RECOMMENDATIONS TABLE section for a professional ABA assessment report.

Create a detailed service recommendation table with the following CPT codes:

| CPT Code | Description | Units/Week | Hours/Week | Location |
|----------|-------------|------------|------------|----------|
| 97153 | Adaptive Behavior Treatment by Technician (RBT) | ${rbtHours * 4} units | ${rbtHours} hrs | ${data.recommendations?.setting || "Home/Community"} |
| 97155 | Adaptive Behavior Treatment Protocol Modification (BCBA) | ${bcbaHours * 4} units | ${bcbaHours} hrs | ${data.recommendations?.setting || "Home/Community"} |
| 97156 | Family Adaptive Behavior Treatment Guidance (Parent Training) | ${Number.parseFloat(parentHours) * 4} units | ${parentHours} | ${data.recommendations?.setting || "Home"} |
| 97151 TS | Behavior Identification Assessment | 18 units | N/A | N/A |

Total Weekly Direct Hours: ${weeklyHours} hours
Recommended Duration: ${data.recommendations?.duration || "12 months"}

Include a brief paragraph explaining the service model and rationale for the recommended hours. Reference evidence-based practices supporting intensive ABA therapy.`,

      referral: `Write the REASON FOR REFERRAL section (150-200 words) for a professional ABA assessment report.

Client: ${clientName}, Age: ${age}
Diagnosis: ${diagnosis} (${icd10})
Diagnosing Provider: [Diagnosing Provider Name]
Date of Diagnosis: [Diagnosis Date]

Main concerns reported:
${data.background?.weaknesses || "- Deficits in communication and social skills\n- Presence of maladaptive behaviors\n- Delays in adaptive functioning"}

Purpose: Initial comprehensive ABA assessment to determine medical necessity for Applied Behavior Analysis services.

Write a professional narrative paragraph that:
1. States who referred the client and their relationship
2. Includes the diagnosis with ICD-10 code and diagnosing provider
3. Lists 3-4 primary concerns that prompted the referral
4. Clearly states the purpose of this assessment
5. Mentions any relevant previous interventions or services`,

      background: `Write a COMPREHENSIVE BACKGROUND INFORMATION section (800-1200 words) for a professional ABA assessment report.

Client: ${clientName}, Age: ${age}
Diagnosis: ${diagnosis}

DEVELOPMENTAL HISTORY:
${data.background?.developmental || "Information gathered through caregiver interview regarding pregnancy, birth, and early developmental milestones."}

DAILY SCHEDULE:
${data.background?.dailySchedule || "Typical daily routine includes morning routine, school/therapy, afternoon activities, dinner, and bedtime routine."}

EDUCATIONAL HISTORY:
${data.background?.educational || "Currently enrolled in educational program. IEP status and services to be detailed."}

MEDICAL HISTORY:
${data.background?.medical || "Medical history reviewed including any hospitalizations, surgeries, or ongoing conditions."}
Current Medications: [List any current medications]

FAMILY HISTORY:
${data.background?.family || "Family composition and relevant family history information."}

PREVIOUS TREATMENTS:
${data.background?.previousTreatments || "History of therapeutic interventions including speech therapy, occupational therapy, and previous ABA services."}

STRENGTHS:
${data.background?.strengths || "Areas of relative strength identified through assessment and caregiver report."}

AREAS OF CONCERN:
${data.background?.weaknesses || "Primary areas of concern including behavioral, communication, social, and adaptive domains."}

Write this section with detailed subsections covering:
1. Developmental History (pregnancy complications, birth, milestones achieved/delayed)
2. Daily Schedule (include a formatted daily schedule table)
3. Educational Status (school placement, grade, IEP services)
4. Medical History (diagnoses, hospitalizations, current medications)
5. Family History (composition, relevant diagnoses in family)
6. Previous Treatment History (all therapies, ABA history)
7. Current Strengths (minimum 5 specific strengths)
8. Current Areas of Concern (minimum 5 specific concerns)

Each subsection should be thorough and clinical in tone.`,

      assessments: `Write the ASSESSMENTS CONDUCTED section for a professional ABA assessment report.

Assessment Dates: ${data.assessmentDates || "[Assessment Dates]"}
Observation Settings: ${data.observationSettings || "Home, community settings"}
Total Assessment Hours: 18 units (97151 TS)

Assessment Tools Used:
${
  data.assessmentTools?.map((tool) => `- ${tool}`).join("\n") ||
  `- Functional Behavior Assessment (FBA)
- Motivation Assessment Scale (MAS)
- Functional Analysis Screening Tool (FAST)
- Vineland Adaptive Behavior Scales-3 (Vineland-3)
- VB-MAPP (Verbal Behavior Milestones Assessment and Placement Program)
- ABLLS-R (Assessment of Basic Language and Learning Skills-Revised)
- AFLS (Assessment of Functional Living Skills)
- Direct Observation
- Caregiver Interview
- Record Review`
}

Documents Reviewed:
- Previous evaluations and assessments
- Educational records (IEP if applicable)
- Medical records
- Previous treatment notes (if applicable)

Write a comprehensive section that:
1. Lists all standardized assessments conducted with full names
2. Describes the observation methodology (dates, settings, duration)
3. Lists all documents and records reviewed
4. Explains the purpose of each assessment tool used
5. Notes any limitations or considerations in the assessment process`,

      abc_observations: `Write the ABC OBSERVATIONS section for a professional ABA assessment report.

Observation Period: ${data.assessmentDates || "[Dates]"}
Settings: ${data.observationSettings || "Home and community"}
Total Observation Hours: [X] hours across [X] sessions

ABC DATA COLLECTED:
${
  abcObs.length > 0
    ? abcObs
        .map(
          (obs, i) => `
Observation ${i + 1}:
- Antecedent: ${obs.antecedent}
- Behavior: ${obs.behavior}
- Consequence: ${obs.consequence}
- Hypothesized Function: ${obs.function || "To be determined"}`,
        )
        .join("\n")
    : `
Generate 6 realistic ABC observation examples covering different functions:
1. Attention-maintained behavior example
2. Escape-maintained behavior example
3. Tangible-maintained behavior example
4. Automatic reinforcement example
5. Multiple function example
6. Skill deficit example`
}

Create a professional section that includes:
1. Introduction paragraph about observation methodology
2. Formatted ABC observation table with 6 detailed examples
3. Analysis paragraph discussing:
   - Patterns observed across observations
   - Environmental variables identified
   - Function impressions based on data
   - Setting events and establishing operations noted
4. Summary of behavioral functions identified`,

      preference_assessment: `Write the PREFERENCE ASSESSMENT section for a professional ABA assessment report.

Assessment Method: ${data.preferenceAssessment?.method || "Multiple Stimulus Without Replacement (MSWO), Paired Choice, and Free Operant observations"}

Results: ${data.preferenceAssessment?.results || "Preference hierarchy established through systematic assessment"}

Top Reinforcers Identified:
${
  data.preferenceAssessment?.topReinforces?.map((r) => `- ${r}`).join("\n") ||
  `TANGIBLES:
- [Item 1] - High preference
- [Item 2] - High preference
- [Item 3] - Moderate preference

EDIBLES:
- [Food 1] - High preference
- [Food 2] - Moderate preference

SOCIAL:
- Verbal praise - Moderate preference
- Physical interaction (tickles, high-fives) - High preference

ACTIVITIES:
- [Activity 1] - High preference
- [Activity 2] - Moderate preference`
}

Write a comprehensive preference assessment section that includes:
1. Description of assessment methodology (MSWO, paired choice, free operant)
2. Assessment conditions and environment
3. Results presented in clear categories:
   - Tangible items (ranked)
   - Edible items (ranked)
   - Social reinforcers
   - Activity reinforcers
4. Summary of how these reinforcers will be used in treatment
5. Notes on any restricted interests or sensory preferences observed`,

      maladaptive_behaviors: `Write the MALADAPTIVE BEHAVIORS section for a professional ABA assessment report.

Target Behaviors Identified:
${
  behaviors.length > 0
    ? behaviors
        .map(
          (b) => `
**${b.name}**
- Definition: ${b.definition}
- Baseline: ${b.baseline}
- Frequency: ${b.frequency}
- Intensity: ${b.intensity}
- Function: ${b.function}`,
        )
        .join("\n")
    : `
Generate 3-4 common maladaptive behaviors for a client with ${diagnosis}:
1. Aggression
2. Self-Injurious Behavior
3. Elopement/Running Away
4. Property Destruction
5. Tantrum Behavior`
}

For EACH behavior, write a detailed subsection (150-200 words each) including:

**[BEHAVIOR NAME]**

Operational Definition:
[Complete operational definition with specific topography, inclusions and exclusions - must be observable and measurable]

Baseline Data:
- Frequency: [X] incidents per [time period]
- Data collection period: [dates]
- Data collection method: [frequency/duration/interval]

Severity Scale:
1 - Mild: [Description of mild presentation]
2 - Moderate: [Description of moderate presentation]
3 - Severe: [Description of crisis-level presentation]
4 - Crisis: [Description of crisis-level presentation]

Antecedents/Setting Events:
- [List 3-4 common antecedents]
- [List relevant setting events]

Hypothesized Function: [Primary function with supporting evidence]

Impact on Daily Functioning:
[2-3 sentences describing how this behavior impacts the client's daily life, learning, and family]`,

      hypothesis_interventions: `Write the HYPOTHESIS-BASED INTERVENTIONS section (800-1200 words) for a professional ABA assessment report.

Based on functional assessment, organize interventions by maintaining function:

**ATTENTION-MAINTAINED BEHAVIORS**
Behaviors: [List behaviors maintained by attention]

Preventive Strategies (Antecedent-Based):
1. Noncontingent attention delivery (schedule)
2. Functional communication training for attention
3. Environmental enrichment
4. Visual schedules and predictability
5. [Additional strategy]
6. [Additional strategy]

Replacement Skills:
1. Appropriate attention-seeking (tapping shoulder, saying "excuse me")
2. Independent engagement skills
3. [Additional skill]

Consequence Strategies:
- Differential reinforcement of alternative behavior (DRA)
- Planned ignoring (extinction) with safety considerations
- Prompt hierarchy for replacement skill

---

**ESCAPE-MAINTAINED BEHAVIORS**
Behaviors: [List behaviors maintained by escape]

Preventive Strategies:
1. Demand fading and gradual exposure
2. Choice-making opportunities
3. Premack Principle (first-then)
4. Task modification
5. [Additional strategy]
6. [Additional strategy]

Replacement Skills:
1. Requesting break appropriately
2. Requesting help
3. Accepting "no" or "wait"

Consequence Strategies:
- Escape extinction with guided compliance
- DRA for task completion
- Break delivery for appropriate requests

---

**TANGIBLE-MAINTAINED BEHAVIORS**
Behaviors: [List behaviors maintained by tangible access]

Preventive Strategies:
1. Scheduled access to preferred items
2. Token economy system
3. Visual timers for wait time
4. [Additional strategies]

Replacement Skills:
1. Appropriate requesting (verbal, PECS, device)
2. Accepting "no" or "later"
3. Waiting skills

---

**AUTOMATICALLY-MAINTAINED BEHAVIORS**
Behaviors: [List behaviors maintained by automatic reinforcement]

Preventive Strategies:
1. Environmental enrichment
2. Sensory diet/regulation activities
3. Matched stimulation (alternative sensory input)
4. Antecedent exercise

Replacement Skills:
1. Appropriate self-regulation strategies
2. Requesting sensory breaks
3. Alternative sensory activities`,

      intervention_descriptions: `Write the DESCRIPTION OF INTERVENTIONS section (600-800 words) for a professional ABA assessment report.

Provide detailed descriptions of each evidence-based intervention to be used:

**DIFFERENTIAL REINFORCEMENT PROCEDURES**

DRA (Differential Reinforcement of Alternative Behavior):
[150-word description of DRA including definition, examples, and implementation guidelines]

DRI (Differential Reinforcement of Incompatible Behavior):
[100-word description]

DRO (Differential Reinforcement of Other Behavior):
[100-word description including interval schedule]

DRL (Differential Reinforcement of Low Rates):
[100-word description]

**FUNCTIONAL COMMUNICATION TRAINING (FCT)**
[200-word description of FCT implementation including communication modality, prompt hierarchy, and generalization plan]

**ANTECEDENT INTERVENTIONS**

NCR/NCE (Noncontingent Reinforcement/Escape):
[100-word description]

Environmental Modifications:
[100-word description]

Visual Supports:
[100-word description]

**CONSEQUENCE-BASED PROCEDURES**

Planned Ignoring:
[100-word description with safety considerations]

Escape Extinction:
[100-word description with ethical considerations]

Response Blocking:
[100-word description]

Redirection:
[100-word description]

**TEACHING PROCEDURES**

Discrete Trial Training (DTT):
[100-word description]

Natural Environment Training (NET):
[100-word description]

Prompting Hierarchy:
- Most-to-least prompting: [description]
- Least-to-most prompting: [description]
- Time delay: [description]

Errorless Teaching:
[100-word description]

Shaping:
[100-word description]

Chaining:
- Forward chaining
- Backward chaining
- Total task presentation`,

      teaching_procedures: `Write the TEACHING PROCEDURES section (800-1200 words) for a professional ABA assessment report.

Create detailed step-by-step teaching procedures for each target skill:

**PROCEDURE 1: REQUESTING A BREAK**
Target: Client will independently request a break using [communication method] when feeling overwhelmed.

Materials: Break card/visual, timer, reinforcers

Teaching Steps:
1. Present demand/non-preferred activity
2. Watch for signs of escalation (list specific signs)
3. Prompt hierarchy: [Full physical → Partial physical → Gestural → Independent]
4. When client uses break request:
   - Immediately provide break (30-60 seconds initially)
   - Provide specific praise
5. Gradually fade prompt level
6. Increase demand duration between break opportunities
7. Thin reinforcement schedule

Mastery Criteria: 80% independent across 3 consecutive sessions
Data Collection: Trial-by-trial data on prompt level

---

**PROCEDURE 2: FOLLOWING DIRECTIONS**
[Similar detailed format with 8-12 steps]

---

**PROCEDURE 3: ACCEPTING "NO"**
[Similar detailed format with 8-12 steps]

---

**PROCEDURE 4: WAITING**
[Similar detailed format with 8-12 steps]

---

**PROCEDURE 5: FUNCTIONAL COMMUNICATION**
[Similar detailed format with 8-12 steps]

---

**PROCEDURE 6: TASK COMPLETION**
[Similar detailed format with 8-12 steps]

---

**PROCEDURE 7: SAFETY SKILLS**
[Similar detailed format with 8-12 steps including specific safety targets]

Include prompt levels, fading criteria, generalization plans, and maintenance procedures for each.`,

      skill_acquisition_goals: `Write the SKILL ACQUISITION GOALS section (600-1000 words) for a professional ABA assessment report.

Client: ${clientName}
Assessment Date: ${data.assessmentDates || new Date().toLocaleDateString()}

${(() => {
  const goalsTrackerData = loadGoalsTrackerData()
  const skillAcquisitionGoals = goalsTrackerData.filter((g) => g.type === "skill-acquisition")

  if (skillAcquisitionGoals.length > 0) {
    return `GOALS DATA FROM TRACKER (${skillAcquisitionGoals.length} goals):
${JSON.stringify(skillAcquisitionGoals, null, 2)}

For each goal above, create a comprehensive narrative that includes:
1. Goal title and domain (extract from description)
2. Baseline performance with date: ${skillAcquisitionGoals.map((g) => g.startDate).join(", ")}
3. Current performance: ${skillAcquisitionGoals.map((g) => `${g.progress}% progress`).join(", ")}
4. Mastery criteria (90% accuracy target unless specified)
5. Overall progress percentage: ${skillAcquisitionGoals.map((g) => g.progress).join(", ")}%
6. Short-term objectives with individual progress:
${skillAcquisitionGoals
  .map(
    (g, i) =>
      `   Goal ${i + 1} STOs:\n${g.stos
        .map(
          (sto, j) =>
            `   - STO ${j + 1}: ${sto.description}
     Baseline: ${sto.baseline}
     Current: ${sto.current}
     Mastery: ${sto.masteryCriteria}
     Progress: ${sto.progress}%
     Status: ${sto.status}`,
        )
        .join("\n")}`,
  )
  .join("\n\n")}

7. Clinical interpretation of progress for each goal
8. Specific recommendations for continued treatment

Format as professional ABA documentation suitable for insurance review.`
  }

  return `Create 4-6 comprehensive skill acquisition goals with the following format:

**GOAL 1: COMMUNICATION - Functional Requesting**

Long-Term Objective (LTO):
${clientName} will independently request desired items, activities, and assistance using [verbal/PECS/AAC device] with 90% accuracy across 3 settings for 8 consecutive weeks.

Baseline: [X]% accuracy (established [Month/Year])
Current Level: Working on STO #[X]

Short-Term Objectives:
- STO 1 (Weeks 1-4): Client will request with full physical prompt with 80% accuracy
- STO 2 (Weeks 5-8): Client will request with partial physical prompt with 80% accuracy
- STO 3 (Weeks 9-12): Client will request with gestural prompt with 80% accuracy
- STO 4 (Weeks 13-16): Client will request with verbal prompt with 80% accuracy
- STO 5 (Weeks 17-20): Client will request independently with 70% accuracy
- STO 6 (Weeks 21-24): Client will request independently with 80% accuracy
- STO 7 (Weeks 25-28): Client will request independently with 90% accuracy

---

**GOAL 2: SOCIAL SKILLS - Peer Interaction**
[Same detailed format]

---

**GOAL 3: ADAPTIVE SKILLS - Daily Living**
[Same detailed format]

---

**GOAL 4: PLAY/LEISURE - Appropriate Play**
[Same detailed format]

---

**GOAL 5: ACADEMIC READINESS - Pre-Academic Skills**
[Same detailed format]

Each goal must include:
1. Measurable LTO with accuracy criterion and duration
2. Baseline data with date established
3. 7 progressive STOs with specific criteria
4. Target timeline for each STO (typically 4 weeks each)
5. Data collection method`
})()}`,

      behavior_reduction_goals: `Write the BEHAVIOR REDUCTION GOALS section (400-600 words) for a professional ABA assessment report.

${(() => {
  const goalsTrackerData = loadGoalsTrackerData()
  const behaviorReductionGoals = goalsTrackerData.filter((g) => g.type === "behavior-reduction")

  if (behaviorReductionGoals.length > 0) {
    return `GOALS DATA FROM TRACKER (${behaviorReductionGoals.length} goals):
${JSON.stringify(behaviorReductionGoals, null, 2)}

For each behavior reduction goal above, create a comprehensive narrative that includes:

1. Target behavior definition (extract from description)
2. Baseline rate/frequency/duration with date: ${behaviorReductionGoals.map((g) => g.startDate).join(", ")}
3. Current rate/frequency/duration (calculate from progress)
4. Target reduction criterion (typically 80-90% reduction or specific rate)
5. Percentage reduction achieved: ${behaviorReductionGoals.map((g) => `${g.progress}%`).join(", ")}
6. Short-term objectives progress:
${behaviorReductionGoals
  .map(
    (g, i) =>
      `   Behavior ${i + 1} STOs:\n${g.stos
        .map(
          (sto, j) =>
            `   - STO ${j + 1}: ${sto.description}
     Baseline: ${sto.baseline}
     Current: ${sto.current}
     Target: ${sto.masteryCriteria}
     Reduction: ${sto.progress}%
     Status: ${sto.status}`,
        )
        .join("\n")}`,
  )
  .join("\n\n")}

7. Function of behavior (if identified in description or STOs)
8. Intervention effectiveness analysis comparing baseline to current
9. Clinical recommendations for continued treatment

Format as professional ABA documentation suitable for insurance review. Emphasize data-driven progress and clinical significance of reductions.`
  }

  return `Create behavior reduction goals for each target behavior:

${
  behaviorGoals.length > 0
    ? behaviorGoals
        .map(
          (bg) => `
**${bg.behavior}**
Baseline: ${bg.baseline}
Target: ${bg.target}`,
        )
        .join("\n")
    : behaviors
        .map(
          (b) => `
**${b.name.toUpperCase()} REDUCTION**
Baseline: ${b.baseline}
Target: ${b.baseline} (80% reduction)`,
        )
        .join("\n")
}

Each behavior goal must include:
1. Operational definition
2. Baseline data with measurement
3. Current performance level
4. Target reduction criterion
5. Progress toward goal
6. Function of behavior
7. Intervention strategies used
8. Data collection methods`
})()}`,

      caregiver_goals: `Write the CAREGIVER TRAINING GOALS section (300-400 words) for a professional ABA assessment report.

Caregiver(s): ${data.clientInfo?.caregiver || "[Primary Caregiver Name]"}

Create 4 comprehensive caregiver training goals:

**CAREGIVER GOAL 1: DATA COLLECTION**

Long-Term Objective:
Caregiver will independently and accurately collect data on target behaviors and skill acquisition programs with 90% accuracy for 8 consecutive weeks.

Baseline: 0% accuracy (no prior training)
Short-Term Objectives:
- STO 1: Caregiver will identify target behaviors with 80% accuracy
- STO 2: Caregiver will use frequency count data collection with 70% accuracy
- STO 3: Caregiver will use ABC data collection with 70% accuracy
- STO 4: Caregiver will collect data across all targets with 80% accuracy
- STO 5: Caregiver will collect data independently with 90% accuracy

---

**CAREGIVER GOAL 2: INTERVENTION IMPLEMENTATION**

Long-Term Objective:
Caregiver will correctly implement behavior intervention strategies with 90% procedural fidelity for 8 consecutive weeks.

[Same STO format progressing from 0% to 90%]

---

**CAREGIVER GOAL 3: SKILL ACQUISITION PROGRAM IMPLEMENTATION**

Long-Term Objective:
Caregiver will correctly implement skill acquisition programs (DTT, NET) with 90% procedural fidelity.

[Same STO format]

---

**CAREGIVER GOAL 4: REINFORCEMENT DELIVERY**

Long-Term Objective:
Caregiver will correctly identify and deliver reinforcement contingent on appropriate behavior with 90% accuracy.

[Same STO format]

Training will occur during 97156 Family Guidance sessions (${parentHours} hours/week).`,

      parent_training_progress: (() => {
        // Load parent training data from localStorage
        const trainingDataStr = localStorage.getItem("aria-parent-training-data")
        if (!trainingDataStr) {
          return `## Parent Training Progress\n\nNo parent training data found. Please complete parent training modules first.`
        }

        const trainingData = JSON.parse(trainingDataStr)

        // Calculate statistics
        const completedModules = trainingData.modules.filter((m: any) => m.completed).length
        const totalModules = trainingData.modules.length
        const progressPercentage = Math.round((completedModules / totalModules) * 100)

        const totalHours = trainingData.modules.reduce((sum: number, m: any) => {
          return sum + (m.fidelityScores?.reduce((s: number, score: any) => s + (score.duration || 0), 0) || 0)
        }, 0)

        const avgFidelity = trainingData.modules
          .filter((m: any) => m.fidelityScores && m.fidelityScores.length > 0)
          .reduce((sum: number, m: any, idx: number, arr: any[]) => {
            const moduleAvg =
              m.fidelityScores.reduce((s: number, score: any) => s + score.score, 0) / m.fidelityScores.length
            return sum + moduleAvg / arr.length
          }, 0)

        // Build the report content
        let content = `## Parent Training Progress\n\n`
        content += `### Training Summary\n\n`
        content += `- **Overall Progress:** ${completedModules} of ${totalModules} modules completed (${progressPercentage}%)\n`
        content += `- **Total Training Hours:** ${(totalHours / 60).toFixed(1)} hours\n`
        content += `- **Average Fidelity Score:** ${avgFidelity.toFixed(1)}%\n\n`

        // Completed modules
        const completed = trainingData.modules.filter((m: any) => m.completed)
        if (completed.length > 0) {
          content += `### Modules Completed\n\n`
          completed.forEach((module: any) => {
            const latestScore = module.fidelityScores?.[module.fidelityScores.length - 1]
            content += `**${module.name}**\n`
            content += `- Completion Date: ${module.completionDate || "Not recorded"}\n`
            if (latestScore) {
              content += `- Final Fidelity Score: ${latestScore.score}%\n`
            }
            content += `- Competency Status: ${module.competencyPassed ? "Passed" : "In Progress"}\n\n`
          })
        }

        // In-progress modules
        const inProgress = trainingData.modules.filter((m: any) => !m.completed && m.sessionsCompleted > 0)
        if (inProgress.length > 0) {
          content += `### Modules In Progress\n\n`
          inProgress.forEach((module: any) => {
            content += `**${module.name}**\n`
            content += `- Progress: ${module.progress || 0}%\n`
            content += `- Sessions Completed: ${module.sessionsCompleted}\n\n`
          })
        }

        // Skills demonstrated
        const allCheckedSkills = trainingData.modules
          .flatMap((m: any) => m.fidelityChecklist || [])
          .filter((item: any) => item.checked)

        if (allCheckedSkills.length > 0) {
          content += `### Skills Demonstrated\n\n`
          const uniqueSkills = [...new Set(allCheckedSkills.map((s: any) => s.skill))]
          uniqueSkills.forEach((skill: string) => {
            content += `- ${skill}\n`
          })
        }

        return content
      })(),

      medical_necessity: `Write a MEDICAL NECESSITY STATEMENT (250-350 words, 4 paragraphs, NO BULLETS) for a professional ABA assessment report.

Client: ${clientName}
Age: ${age}
Diagnosis: ${diagnosis} (${icd10})

Behavioral Concerns:
${behaviors.map((b) => `- ${b.name}: ${b.baseline || b.frequency}`).join("\n") || "- Maladaptive behaviors interfering with learning and daily functioning"}

Skill Deficits:
${
  Object.entries(data.domains || {})
    .map(([domain, info]) => `- ${domain}: ${(info as any)?.level || "Moderate"} deficits`)
    .join("\n") || "- Communication, social, adaptive, and behavioral deficits"
}

Recommended Hours: ${weeklyHours} hours/week
- RBT Services (97153): ${rbtHours} hours/week
- BCBA Supervision (97155): ${bcbaHours} hours/week
- Parent Training (97156): ${parentHours} hours/week

CRITICAL FORMATTING: Write 4 flowing paragraphs with NO headers, NO bullet points, NO numbered lists.

Paragraph 1: Diagnosis and Impact
- Present the diagnosis with ICD-10 code
- Describe how autism impacts daily functioning
- Mention age of diagnosis and current presentation

Paragraph 2: Behavioral Presentation
- List specific behaviors with frequencies (write as prose, not bullets)
- Describe impact on learning, safety, and family
- Note severity and urgency

Paragraph 3: Skill Deficits
- Describe deficits across all domains as flowing text
- Explain developmental delays
- Connect deficits to diagnosis

Paragraph 4: Treatment Justification
- Justify the specific hours recommended
- Reference research supporting intensive ABA
- Explain why this level of service is medically necessary
- State expected outcomes with treatment`,

      additional_sections: `Write the ADDITIONAL REQUIRED SECTIONS for a professional ABA assessment report.

Include all of the following sections:

---

**GENERALIZATION & MAINTENANCE PLAN**

Generalization Strategies:
1. Train across multiple settings (home, community, school)
2. Train across multiple people (RBTs, caregivers, teachers)
3. Train with varied materials and stimuli
4. Program for natural contingencies
5. Teach self-monitoring skills

Maintenance Procedures:
1. Thin reinforcement schedules systematically
2. Conduct periodic maintenance probes
3. Provide booster sessions as needed
4. Train caregivers for long-term maintenance

---

**RISK ASSESSMENT**

Extinction Burst Considerations:
${data.riskAssessment?.extinctionBurst || "- Potential for temporary increase in frequency/intensity of target behaviors\n- Safety protocols in place for escalation\n- Crisis intervention procedures established"}

Safety Protocols:
${data.riskAssessment?.safetyProtocols || "- Environmental safety measures\n- Response blocking procedures\n- Crisis de-escalation techniques\n- When to contact emergency services"}

---

**DISCHARGE CRITERIA**

Phase 1 (Intensive - Current):
- ${weeklyHours} hours/week
- Duration: 6-12 months
- Criteria: 70% of goals met

Phase 2 (Moderate):
- ${Math.round(weeklyHours * 0.7)} hours/week
- Duration: 6 months
- Criteria: 85% of goals met

Phase 3 (Maintenance):
- ${Math.round(weeklyHours * 0.4)} hours/week
- Duration: 3-6 months
- Criteria: 95% of goals met, caregiver independence

Phase 4 (Discharge):
- Consultation only
- All goals met and maintained
- Caregiver demonstrates 90% fidelity independently

---

**CRISIS PLAN**

De-escalation Techniques:
1. Reduce demands immediately
2. Provide space and reduce stimulation
3. Offer calming activities/items
4. Use calm, neutral tone
5. Avoid prolonged eye contact

Emergency Contacts:
${data.riskAssessment?.emergencyContacts || "- Primary Caregiver: [Phone]\n- BCBA: [Phone]\n- Emergency Services: 911\n- Crisis Line: [Number]"}

When to Seek Emergency Help:
- Risk of serious injury to self or others
- Medical emergency
- Client is missing/eloped

---

**COORDINATION OF CARE**

This treatment plan will be coordinated with:
- Primary Care Physician: [Name]
- School/Educational Team: [Contact]
- Speech-Language Pathologist: [Name] (if applicable)
- Occupational Therapist: [Name] (if applicable)
- Other providers: [List]

Communication will occur via [written reports, team meetings, phone consultations] at minimum [monthly/quarterly].

---

**CONSENT TO TREATMENT**

By signing below, the caregiver acknowledges:
1. Review of this assessment and treatment plan
2. Understanding of proposed ABA services
3. Consent to treatment as described
4. Understanding of rights toחסר or discontinue services
5. Agreement to participate in parent training

_________________________________    ______________
Caregiver Signature                 Date

_________________________________    ______________
${data.providerInfo?.bcbaName || "BCBA Name"}, ${data.providerInfo?.bcbaLicense || "BCBA License #"}    Date
Board Certified Behavior Analyst`,

      progress_notes: `Write the PROGRESS NOTES section for a professional ABA assessment report.

Client: ${clientName}
Dates of Service: ${data.assessmentDates || "[Dates]"}

Create progress notes for the past 4 weeks, detailing client progress, challenges, and adjustments to the treatment plan. Each note should include:

- Date of Service
- Session Duration
- Target Behaviors Addressed
- Skills Targeted
- Interventions Implemented
- Client Response/Progress
- Challenges Encountered
- Recommendations/Plan for Next Session

Format each weekly summary as follows:

**Week of [Date]**

**[Day of Week], [Date] - [Session Duration, e.g., 2 hours]**
- Target Behaviors: [List behaviors]
- Skills Targeted: [List skills]
- Interventions: [Describe interventions]
- Client Response: [Describe progress, e.g., "Client independently requested a break 3 times today with 80% accuracy."]
- Challenges: [Describe challenges, e.g., "Client displayed increased aggression when demands were presented."]
- Plan: [Describe next steps, e.g., "Continue FCT for break requests. Implement DRA for appropriate requests."]

**Week of [Date]**
... and so on for 4 weeks.

Ensure notes reflect data-driven decision-making and client-centered care. Use clinical language and maintain a professional tone.`,
    }

    return prompts[sectionId] || `Write the "${sectionId}" section for an ABA assessment report.`
  }

  const generateSection = async (sectionId: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "generating", generated: true } : s)))
    setCurrentGenerating(sectionId) // Set current generating section
    setError(null) // Clear previous errors

    try {
      const prompt = buildPromptForSection(sectionId, assessmentData)

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          currentStep: 11,
          clientDiagnosis: assessmentData.clientInfo?.diagnosis || "Autism Spectrum Disorder",
          isReportSection: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.content || ""

      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "complete", content } : s)))
    } catch (error: any) {
      console.error("Generation error:", error)
      setError(error.message || "An unexpected error occurred.")
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "error" } : s)))
    } finally {
      setCurrentGenerating(null) // Clear current generating section
    }
  }

  const generateAllSections = async () => {
    setIsGeneratingAll(true)
    setError(null) // Clear previous errors

    for (const section of REPORT_SECTIONS) {
      // Only generate if not already complete and not currently generating
      const currentSectionStatus = sections.find((s) => s.id === section.id)?.status
      if (currentSectionStatus !== "complete" && currentSectionStatus !== "generating") {
        await generateSection(section.id)
        // Small delay between API calls to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    setIsGeneratingAll(false)
  }

  const updateSectionContent = (sectionId: string, content: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, content } : s)))
  }

  // const toggleEditing = (sectionId: string) => {
  //   setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, isEditing: !s.isEditing } : s)))
  // }

  const copySection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (section?.content) {
      await navigator.clipboard.writeText(section.content)
      setCopied(sectionId)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const copyFullReport = async () => {
    const fullReport = sections
      .filter((s) => s.content)
      .map((s) => `${"=".repeat(60)}\n${s.title.toUpperCase()}\n${"=".repeat(60)}\n\n${s.content}`)
      .join("\n\n")

    await navigator.clipboard.writeText(fullReport)
    setCopied("full")
    setTimeout(() => setCopied(null), 2000)
  }

  const completedCount = sections.filter((s) => s.status === "complete").length
  const progress = Math.round((completedCount / sections.length) * 100)
  const totalWords = sections.reduce((acc, s) => acc + (s.content?.split(/\s+/).filter(Boolean).length || 0), 0)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState("")
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null) // Replaced with section.status === "generating"

  const saveEdit = (sectionId: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, content: editBuffer } : s)))
    setEditingSection(null)
    setEditBuffer("")
  }

  // Define exportReport inside the component and memoize it
  const exportReport = useMemo(
    () => async (format: "pdf" | "docx" | "print" | "email") => {
      const completedSections = sections.filter((s) => s.content && s.status === "complete")

      if (completedSections.length === 0) {
        alert("Please generate at least one section before exporting.")
        return
      }

      // Helper function to parse markdown tables
      const parseMarkdownTable = (text: string): { headers: string[]; rows: string[][] } | null => {
        const lines = text.trim().split("\n")
        if (lines.length < 3) return null

        const headerLine = lines[0]
        if (!headerLine.includes("|")) return null

        const headers = headerLine
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h)
        const rows: string[][] = []

        for (let i = 2; i < lines.length; i++) {
          if (lines[i].includes("|")) {
            const cells = lines[i]
              .split("|")
              .map((c) => c.trim())
              .filter((c) => c)
            if (cells.length > 0) rows.push(cells)
          }
        }

        return headers.length > 0 ? { headers, rows } : null
      }

      // Helper to clean markdown
      const cleanMarkdown = (text: string): string => {
        return text
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/^###\s*/gm, "")
          .replace(/^##\s*/gm, "")
          .replace(/^#\s*/gm, "")
          .replace(/^-\s+/gm, "• ")
          .replace(/^\d+\.\s+/gm, (match, offset, string) => {
            const lineStart = string.lastIndexOf("\n", offset - 1)
            const num = match.match(/\d+/)?.[0] || "1"
            return `${num}. `
          })
      }

      if (format === "print") {
        const formatContentForPrint = (content: string): string => {
          let html = ""
          const lines = content.split("\n")
          let inTable = false
          let tableLines: string[] = []

          for (const line of lines) {
            const trimmed = line.trim()

            // Check if line is part of a table
            if (trimmed.includes("|") && trimmed.startsWith("|")) {
              if (!inTable) {
                inTable = true
                tableLines = []
              }
              tableLines.push(trimmed)
            } else {
              // End of table, render it
              if (inTable && tableLines.length > 0) {
                const tableData = parseMarkdownTable(tableLines.join("\n"))
                if (tableData) {
                  html += '<table class="data-table"><thead><tr>'
                  tableData.headers.forEach((h) => {
                    html += `<th>${cleanMarkdown(h)}</th>`
                  })
                  html += "</tr></thead><tbody>"
                  tableData.rows.forEach((row) => {
                    html += "<tr>"
                    row.forEach((cell) => {
                      html += `<td>${cleanMarkdown(cell)}</td>`
                    })
                    html += "</tr>"
                  })
                  html += "</tbody></table>"
                }
                inTable = false
                tableLines = []
              }

              // Process regular content
              if (trimmed) {
                if (trimmed.startsWith("###")) {
                  html += `<h4 style="margin: 15px 0 8px 0; color: #334155; font-size: 12pt;">${cleanMarkdown(trimmed)}</h4>`
                } else if (trimmed.startsWith("##")) {
                  html += `<h3 style="margin: 18px 0 10px 0; color: #1e293b; font-size: 13pt;">${cleanMarkdown(trimmed)}</h3>`
                } else if (trimmed.startsWith("#")) {
                  html += `<h2 style="margin: 20px 0 12px 0; color: #0f172a; font-size: 14pt;">${cleanMarkdown(trimmed)}</h2>`
                } else if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                  html += `<p style="margin: 4px 0 4px 20px;">• ${cleanMarkdown(trimmed.replace(/^[•-]\s*/, ""))}</p>`
                } else if (/^\d+\./.test(trimmed)) {
                  html += `<p style="margin: 4px 0 4px 20px;">${cleanMarkdown(trimmed)}</p>`
                } else {
                  html += `<p style="margin: 8px 0; text-align: justify; line-height: 1.6;">${cleanMarkdown(trimmed)}</p>`
                }
              }
            }
          }

          // Handle any remaining table
          if (inTable && tableLines.length > 0) {
            const tableData = parseMarkdownTable(tableLines.join("\n"))
            if (tableData) {
              html += '<table class="data-table"><thead><tr>'
              tableData.headers.forEach((h) => {
                html += `<th>${cleanMarkdown(h)}</th>`
              })
              html += "</tr></thead><tbody>"
              tableData.rows.forEach((row) => {
                html += "<tr>"
                row.forEach((cell) => {
                  html += `<td>${cleanMarkdown(cell)}</td>`
                })
                html += "</tr>"
              })
              html += "</tbody></table>"
            }
          }

          return html
        }

        const printContent = completedSections
          .map(
            (s) => `
            <div class="section">
              <div class="section-header">${s.title.toUpperCase()}</div>
              <div class="section-content">${formatContentForPrint(s.content || "")}</div>
            </div>
          `,
          )
          .join("")

        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>ABA Assessment Report - ${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}</title>
              <style>
                @page {
                  size: letter;
                  margin: 0.75in;
                }
                @media print {
                  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                * { box-sizing: border-box; }
                body {
                  font-family: 'Georgia', 'Times New Roman', serif;
                  font-size: 11pt;
                  line-height: 1.5;
                  color: #1e293b;
                  margin: 0;
                  padding: 20px;
                }
                .report-header {
                  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                  color: white;
                  padding: 25px 30px;
                  text-align: center;
                  margin: -20px -20px 25px -20px;
                  border-radius: 0 0 8px 8px;
                }
                .report-header h1 {
                  margin: 0 0 8px 0;
                  font-size: 22pt;
                  font-weight: bold;
                  letter-spacing: 1px;
                }
                .report-header .subtitle {
                  font-size: 11pt;
                  opacity: 0.9;
                  font-style: italic;
                }
                .client-info-box {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  padding: 20px;
                  margin-bottom: 25px;
                }
                .client-info-box h3 {
                  margin: 0 0 10px 0;
                  font-size: 10pt;
                  color: #475569;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  border-bottom: 2px solid #0d9488;
                  padding-bottom: 5px;
                }
                .client-info-box p {
                  margin: 5px 0;
                  font-size: 10pt;
                }
                .client-info-box .label {
                  font-weight: bold;
                  color: #475569;
                  display: inline-block;
                  width: 80px;
                }
                .section {
                  margin-bottom: 25px;
                  page-break-inside: avoid;
                }
                .section-header {
                  font-size: 13pt;
                  font-weight: bold;
                  color: #0d9488;
                  padding: 10px 0;
                  border-bottom: 3px solid #0d9488;
                  margin-bottom: 12px;
                  letter-spacing: 0.5px;
                }
                .section-content {
                  font-size: 10.5pt;
                  color: #334155;
                }
                .data-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                  font-size: 9.5pt;
                }
                .data-table th {
                  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                  color: white;
                  padding: 10px 12px;
                  text-align: left;
                  font-weight: bold;
                  border: 1px solid #475569;
                }
                .data-table td {
                  padding: 8px 12px;
                  border: 1px solid #cbd5e1;
                  vertical-align: top;
                }
                .data-table tr:nth-child(even) {
                  background: #f8fafc;
                }
                .data-table tr:hover {
                  background: #f1f5f9;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 15px;
                  border-top: 2px solid #e2e8f0;
                  font-size: 9pt;
                  color: #64748b;
                  text-align: center;
                }
                .footer strong { color: #475569; }
              </style>
            </head>
            <body>
              <div class="report-header">
                ${
                  assessmentData.providerInfo?.agencyLogo
                    ? `<img src="${assessmentData.providerInfo.agencyLogo}" alt="Agency Logo" style="max-height: 60px; max-width: 150px; object-fit: contain; margin-bottom: 10px;" />`
                    : ""
                }
                <h1>ABA COMPREHENSIVE ASSESSMENT REPORT</h1>
                <div class="subtitle">Applied Behavior Analysis Initial Assessment</div>
              </div>

              <div class="client-info-box">
                <div>
                  <h3>Client Information</h3>
                  <p><span class="label">Name:</span> ${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}</p>
                  <p><span class="label">DOB:</span> ${assessmentData.clientInfo?.dob || "N/A"}</p>
                  <p><span class="label">Age:</span> ${assessmentData.clientInfo?.age || "N/A"} years</p>
                  <p><span class="label">Diagnosis:</span> ${assessmentData.clientInfo?.diagnosis || "N/A"}</p>
                </div>
                <div>
                  <h3>Provider Information</h3>
                  <p><span class="label">Agency:</span> ${assessmentData.providerInfo?.name || "N/A"}</p>
                  <p><span class="label">BCBA:</span> ${assessmentData.providerInfo?.bcbaName || "N/A"}</p>
                  <p><span class="label">NPI:</span> ${assessmentData.providerInfo?.npi || "N/A"}</p>
                  <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
                </div>
              </div>

              ${printContent}

              <div class="footer">
                <p><strong>CONFIDENTIALITY NOTICE:</strong> This report contains Protected Health Information (PHI) and is intended only for authorized recipients.</p>
                <p>Generated on ${new Date().toLocaleString()} | HIPAA Compliant Document</p>
              </div>
            </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      } else if (format === "email") {
        const clientName =
          `${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}`.trim() ||
          "Client"
        const subject = encodeURIComponent(`ABA Assessment Report - ${clientName}`)
        const body = encodeURIComponent(
          `ABA Assessment Report for ${clientName}\n\nDate: ${new Date().toLocaleDateString()}\nSections Completed: ${completedCount}\n\nSections:\n${completedSections.map((s) => `- ${s.title}`).join("\n")}\n\n---\nPlease see the attached full report or contact us for more details.`,
        )
        window.location.href = `mailto:?subject=${subject}&body=${body}`
      } else if (format === "pdf") {
        try {
          const { default: jsPDF } = await import("jspdf")
          const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "letter",
          })

          const pageWidth = doc.internal.pageSize.getWidth()
          const pageHeight = doc.internal.pageSize.getHeight()
          const margin = 50
          const maxWidth = pageWidth - margin * 2
          let yPosition = margin

          const checkPageBreak = (neededHeight: number): boolean => {
            if (yPosition + neededHeight > pageHeight - 60) {
              doc.addPage()
              yPosition = margin
              return true
            }
            return false
          }

          // Header with gradient effect
          doc.setFillColor(13, 148, 136)
          doc.rect(0, 0, pageWidth, 85, "F")
          doc.setFillColor(15, 118, 110)
          doc.rect(0, 65, pageWidth, 20, "F")

          if (assessmentData.providerInfo?.agencyLogo) {
            try {
              const logoImg = assessmentData.providerInfo.agencyLogo
              // Add logo to the left side of header
              doc.addImage(logoImg, "PNG", margin, 15, 50, 50)
            } catch (logoError) {
              console.log("[v0] Could not add logo to PDF:", logoError)
            }
          }

          doc.setTextColor(255, 255, 255)
          doc.setFontSize(22)
          doc.setFont("helvetica", "bold")
          doc.text("ABA COMPREHENSIVE ASSESSMENT REPORT", pageWidth / 2, 35, { align: "center" })
          doc.setFontSize(10)
          doc.setFont("helvetica", "normal")
          doc.text("Applied Behavior Analysis Initial Assessment", pageWidth / 2, 55, { align: "center" })

          yPosition = 105

          // Client info box
          doc.setFillColor(248, 250, 252)
          doc.setDrawColor(226, 232, 240)
          doc.roundedRect(margin, yPosition, maxWidth, 80, 4, 4, "FD")

          const infoY = yPosition + 15
          const col1 = margin + 12
          const col2 = pageWidth / 2 + 10

          doc.setFontSize(8)
          doc.setTextColor(71, 85, 105)
          doc.setFont("helvetica", "bold")
          doc.text("CLIENT INFORMATION", col1, infoY)
          doc.text("PROVIDER INFORMATION", col2, infoY)

          doc.setFont("helvetica", "normal")
          doc.setFontSize(9)
          doc.setTextColor(30, 41, 59)

          doc.text(
            `Name: ${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}`,
            col1,
            infoY + 14,
          )
          doc.text(`DOB: ${assessmentData.clientInfo?.dob || "N/A"}`, col1, infoY + 26)
          doc.text(`Age: ${assessmentData.clientInfo?.age || "N/A"} years`, col1, infoY + 38)
          doc.text(`Diagnosis: ${(assessmentData.clientInfo?.diagnosis || "N/A").substring(0, 40)}`, col1, infoY + 50)

          doc.text(`Agency: ${assessmentData.providerInfo?.name || "N/A"}`, col2, infoY + 14)
          doc.text(`BCBA: ${assessmentData.providerInfo?.bcbaName || "N/A"}`, col2, infoY + 26)
          doc.text(`NPI: ${assessmentData.providerInfo?.npi || "N/A"}`, col2, infoY + 38)
          doc.text(`Report Date: ${new Date().toLocaleDateString()}`, col2, infoY + 50)

          yPosition = infoY + 75

          // Process each section
          for (let secIdx = 0; secIdx < completedSections.length; secIdx++) {
            const section = completedSections[secIdx]

            checkPageBreak(50)

            // Section header with teal bar
            doc.setFillColor(13, 148, 136)
            doc.rect(margin, yPosition, maxWidth, 3, "F")
            yPosition += 15

            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(13, 148, 136)
            doc.text(section.title.toUpperCase(), margin, yPosition)
            yPosition += 18

            // Process content
            const content = section.content || ""
            const lines = content.split("\n")
            let inTable = false
            let tableLines: string[] = []

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue

              // Check for table
              if (trimmed.startsWith("|") && trimmed.includes("|")) {
                if (!inTable) {
                  inTable = true
                  tableLines = []
                }
                tableLines.push(trimmed)
                continue
              }

              // Render table if we just exited one
              if (inTable && tableLines.length > 0) {
                const tableData = parseMarkdownTable(tableLines.join("\n"))
                if (tableData && tableData.headers.length > 0) {
                  checkPageBreak(100)

                  const colCount = tableData.headers.length
                  const colWidth = maxWidth / colCount
                  const rowHeight = 20
                  const headerHeight = 22

                  // Table header
                  doc.setFillColor(30, 41, 59)
                  doc.rect(margin, yPosition, maxWidth, headerHeight, "F")
                  doc.setTextColor(255, 255, 255)
                  doc.setFontSize(8)
                  doc.setFont("helvetica", "bold")

                  tableData.headers.forEach((header, i) => {
                    doc.text(cleanMarkdown(header).substring(0, 20), margin + i * colWidth + 5, yPosition + 14)
                  })
                  yPosition += headerHeight

                  // Table rows
                  doc.setTextColor(51, 65, 85)
                  doc.setFont("helvetica", "normal")

                  tableData.rows.forEach((row, rowIdx) => {
                    checkPageBreak(rowHeight)

                    if (rowIdx % 2 === 0) {
                      doc.setFillColor(248, 250, 252)
                      doc.rect(margin, yPosition, maxWidth, rowHeight, "F")
                    }

                    doc.setDrawColor(203, 213, 225)
                    doc.rect(margin, yPosition, maxWidth, rowHeight, "S")

                    row.forEach((cell, i) => {
                      doc.text(cleanMarkdown(cell).substring(0, 25), margin + i * colWidth + 5, yPosition + 13)
                    })
                    yPosition += rowHeight
                  })

                  yPosition += 10
                }
                inTable = false
                tableLines = []
              }

              // Regular content
              const cleanLine = cleanMarkdown(trimmed)

              if (trimmed.startsWith("###")) {
                checkPageBreak(25)
                yPosition += 8
                doc.setFontSize(10)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(51, 65, 85)
                doc.text(cleanLine, margin, yPosition)
                yPosition += 14
              } else if (trimmed.startsWith("##")) {
                checkPageBreak(28)
                yPosition += 10
                doc.setFontSize(11)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(30, 41, 59)
                doc.text(cleanLine, margin, yPosition)
                yPosition += 16
              } else if (trimmed.startsWith("#")) {
                checkPageBreak(30)
                yPosition += 12
                doc.setFontSize(12)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(15, 23, 42)
                doc.text(cleanLine, margin, yPosition)
                yPosition += 18
              } else if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                checkPageBreak(16)
                doc.setFontSize(9)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(51, 65, 85)
                const bulletText = `• ${cleanLine.replace(/^[•-]\s*/, "")}`
                const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 15)
                bulletLines.forEach((bl: string, idx: number) => {
                  checkPageBreak(12)
                  doc.text(idx === 0 ? bl : `  ${bl}`, margin + 10, yPosition)
                  yPosition += 12
                })
              } else if (/^\d+\./.test(trimmed)) {
                checkPageBreak(16)
                doc.setFontSize(9)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(51, 65, 85)
                const numLines = doc.splitTextToSize(cleanLine, maxWidth - 15)
                numLines.forEach((nl: string, idx: number) => {
                  checkPageBreak(12)
                  doc.text(idx === 0 ? nl : `   ${nl}`, margin + 10, yPosition)
                  yPosition += 12
                })
              } else {
                checkPageBreak(14)
                doc.setFontSize(9)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(51, 65, 85)
                const textLines = doc.splitTextToSize(cleanLine, maxWidth)
                textLines.forEach((tl: string) => {
                  checkPageBreak(12)
                  doc.text(tl, margin, yPosition)
                  yPosition += 12
                })
              }
            }

            // Handle remaining table
            if (inTable && tableLines.length > 0) {
              const tableData = parseMarkdownTable(tableLines.join("\n"))
              if (tableData && tableData.headers.length > 0) {
                checkPageBreak(100)
                const colCount = tableData.headers.length
                const colWidth = maxWidth / colCount
                const rowHeight = 20
                const headerHeight = 22

                doc.setFillColor(30, 41, 59)
                doc.rect(margin, yPosition, maxWidth, headerHeight, "F")
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(8)
                doc.setFont("helvetica", "bold")

                tableData.headers.forEach((header, i) => {
                  doc.text(cleanMarkdown(header).substring(0, 20), margin + i * colWidth + 5, yPosition + 14)
                })
                yPosition += headerHeight

                doc.setTextColor(51, 65, 85)
                doc.setFont("helvetica", "normal")

                tableData.rows.forEach((row, rowIdx) => {
                  checkPageBreak(rowHeight)
                  if (rowIdx % 2 === 0) {
                    doc.setFillColor(248, 250, 252)
                    doc.rect(margin, yPosition, maxWidth, rowHeight, "F")
                  }
                  doc.setDrawColor(203, 213, 225)
                  doc.rect(margin, yPosition, maxWidth, rowHeight, "S")
                  row.forEach((cell, i) => {
                    doc.text(cleanMarkdown(cell).substring(0, 25), margin + i * colWidth + 5, yPosition + 13)
                  })
                  yPosition += rowHeight
                })
                yPosition += 10
              }
            }

            yPosition += 15
          }

          // Footer on all pages
          const totalPages = doc.getNumberOfPages()

          for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(100, 116, 139)
            doc.text(
              `Page ${i} of ${totalPages} | Confidential - Protected Health Information`,
              pageWidth / 2,
              pageHeight - 25,
              { align: "center" },
            )
            doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: "center" })
          }

          const clientName = `${assessmentData.clientInfo?.firstName || "Client"}_${assessmentData.clientInfo?.lastName || ""}`
          const fileName = `ABA_Assessment_Report_${clientName}_${new Date().toISOString().split("T")[0]}.pdf`
          doc.save(fileName)
        } catch (error) {
          console.error("Error generating PDF:", error)
          alert("Error generating PDF. Please check the console for details.")
        }
      } else if (format === "docx") {
        try {
          const {
            Document,
            Packer,
            Paragraph,
            TextRun,
            HeadingLevel,
            BorderStyle,
            AlignmentType,
            Table,
            TableRow,
            TableCell,
            WidthType,
            ShadingType,
          } = await import("docx")

          const children: (typeof Paragraph.prototype | typeof Table.prototype)[] = []

          // Header with logo
          const headerChildren: (typeof TextRun.prototype | any)[] = []
          if (assessmentData.providerInfo?.agencyLogo) {
            headerChildren.push(
              new TextRun({
                children: [
                  {
                    type: "Drawing",
                    children: [
                      {
                        type: "Image",
                        options: {
                          data: assessmentData.providerInfo.agencyLogo,
                          width: 100,
                          height: 50,
                          extension: "png",
                          // You might need to adjust the following based on the actual image format
                          // and how the logo URL is provided. If it's a data URL,
                          // you might need to extract the MIME type and actual data.
                          // For simplicity, assuming it's a valid PNG data URL.
                          // To properly handle this, you might need a function to
                          // extract MIME type and data from the URL.
                          // For now, we'll skip complex image handling here as it
                          // goes beyond simple text. If you need image support,
                          // a more robust solution would be required.
                        },
                      },
                    ],
                  },
                ],
              }),
            )
          }
          headerChildren.push(
            new TextRun({
              text: "ABA COMPREHENSIVE ASSESSMENT REPORT",
              bold: true,
              size: 40,
              color: "0D9488",
            }),
          )
          headerChildren.push(
            new TextRun({
              text: "Applied Behavior Analysis Initial Assessment",
              size: 22,
              color: "64748B",
              italics: true,
            }),
          )

          children.push(
            new Paragraph({
              children: headerChildren,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
          )

          // Client info table
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "CLIENT INFORMATION", bold: true, size: 20, color: "0D9488" }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Name: ${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}`,
                              size: 20,
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `DOB: ${assessmentData.clientInfo?.dob || "N/A"}`, size: 20 }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `Age: ${assessmentData.clientInfo?.age || "N/A"} years`, size: 20 }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Diagnosis: ${assessmentData.clientInfo?.diagnosis || "N/A"}`,
                              size: 20,
                            }),
                          ],
                        }),
                      ],
                      shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: "PROVIDER INFORMATION", bold: true, size: 20, color: "0D9488" }),
                          ],
                          spacing: { after: 100 },
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `Agency: ${assessmentData.providerInfo?.name || "N/A"}`, size: 20 }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `BCBA: ${assessmentData.providerInfo?.bcbaName || "N/A"}`, size: 20 }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `NPI: ${assessmentData.providerInfo?.npi || "N/A"}`, size: 20 }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ text: `Report Date: ${new Date().toLocaleDateString()}`, size: 20 }),
                          ],
                        }),
                      ],
                      shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
                      margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    }),
                  ],
                }),
              ],
            }),
          )

          children.push(new Paragraph({ text: "", spacing: { after: 300 } }))

          // Process sections
          for (const section of completedSections) {
            // Section header
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.title.toUpperCase(),
                    bold: true,
                    size: 26,
                    color: "0D9488",
                  }),
                ],
                spacing: { before: 300, after: 150 },
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 18, color: "0D9488" },
                },
              }),
            )

            // Process content
            const content = section.content || ""
            const lines = content.split("\n")
            let inTable = false
            let tableLines: string[] = []

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed) continue

              // Check for table
              if (trimmed.startsWith("|") && trimmed.includes("|")) {
                if (!inTable) {
                  inTable = true
                  tableLines = []
                }
                tableLines.push(trimmed)
                continue
              }

              // Render table if we just exited one
              if (inTable && tableLines.length > 0) {
                const tableData = parseMarkdownTable(tableLines.join("\n"))
                if (tableData && tableData.headers.length > 0) {
                  const tableRows = [
                    new TableRow({
                      children: tableData.headers.map(
                        (h) =>
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: cleanMarkdown(h), bold: true, size: 18, color: "FFFFFF" }),
                                ],
                              }),
                            ],
                            shading: { fill: "1E293B", type: ShadingType.CLEAR },
                            margins: { top: 50, bottom: 50, left: 75, right: 75 },
                          }),
                      ),
                    }),
                    ...tableData.rows.map(
                      (row, idx) =>
                        new TableRow({
                          children: row.map(
                            (cell) =>
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [new TextRun({ text: cleanMarkdown(cell), size: 18 })],
                                  }),
                                ],
                                shading: { fill: idx % 2 === 0 ? "F8FAFC" : "FFFFFF", type: ShadingType.CLEAR },
                                margins: { top: 50, bottom: 50, left: 75, right: 75 },
                              }),
                          ),
                        }),
                    ),
                  ]

                  children.push(
                    new Table({
                      width: { size: 100, type: WidthType.PERCENTAGE },
                      rows: tableRows,
                    }),
                  )
                  children.push(new Paragraph({ text: "", spacing: { after: 150 } }))
                }
                inTable = false
                tableLines = []
              }

              // Regular content
              const cleanLine = cleanMarkdown(trimmed)

              if (trimmed.startsWith("###")) {
                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: cleanLine, bold: true, size: 22, color: "334155" })],
                    spacing: { before: 150, after: 75 },
                  }),
                )
              } else if (trimmed.startsWith("##")) {
                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: cleanLine, bold: true, size: 24, color: "1E293B" })],
                    spacing: { before: 200, after: 100 },
                  }),
                )
              } else if (trimmed.startsWith("#")) {
                children.push(
                  new Paragraph({
                    text: cleanLine,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 250, after: 125 },
                  }),
                )
              } else if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: `• ${cleanLine.replace(/^[•-]\s*/, "")}`, size: 20 })],
                    spacing: { after: 50 },
                    indent: { left: 360 },
                  }),
                )
              } else if (/^\d+\./.test(trimmed)) {
                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: cleanLine, size: 20 })],
                    spacing: { after: 50 },
                    indent: { left: 360 },
                  }),
                )
              } else {
                children.push(
                  new Paragraph({
                    children: [new TextRun({ text: cleanLine, size: 20 })],
                    spacing: { after: 100 },
                  }),
                )
              }
            }

            // Handle remaining table
            if (inTable && tableLines.length > 0) {
              const tableData = parseMarkdownTable(tableLines.join("\n"))
              if (tableData && tableData.headers.length > 0) {
                const tableRows = [
                  new TableRow({
                    children: tableData.headers.map(
                      (h) =>
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({ text: cleanMarkdown(h), bold: true, size: 18, color: "FFFFFF" }),
                              ],
                            }),
                          ],
                          shading: { fill: "1E293B", type: ShadingType.CLEAR },
                          margins: { top: 50, bottom: 50, left: 75, right: 75 },
                        }),
                    ),
                  }),
                  ...tableData.rows.map(
                    (row, idx) =>
                      new TableRow({
                        children: row.map(
                          (cell) =>
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [new TextRun({ text: cleanMarkdown(cell), size: 18 })],
                                }),
                              ],
                              shading: { fill: idx % 2 === 0 ? "F8FAFC" : "FFFFFF", type: ShadingType.CLEAR },
                              margins: { top: 50, bottom: 50, left: 75, right: 75 },
                            }),
                        ),
                      }),
                  ),
                ]

                children.push(
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: tableRows,
                  }),
                )
              }
            }
          }

          // Footer
          children.push(new Paragraph({ text: "", spacing: { before: 400 } }))
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "CONFIDENTIALITY NOTICE: This report contains Protected Health Information (PHI) and is intended only for the authorized recipient(s).",
                  size: 18,
                  color: "64748B",
                  italics: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 6, color: "E2E8F0" },
              },
              spacing: { before: 200 },
            }),
          )

          const doc = new Document({
            sections: [{ children }],
          })

          const blob = await Packer.toBlob(doc)
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `ABA_Assessment_Report_${assessmentData.clientInfo?.firstName || "Client"}_${new Date().toISOString().split("T")[0]}.docx`
          a.click()
          URL.revokeObjectURL(url)
        } catch (error) {
          console.error("Error generating Word document:", error)
          alert("Error generating Word document. Please try again.")
        }
      }
    },
    [assessmentData, sections, completedCount], // Dependencies for useMemo
  )

  const handleExport = async (format: "pdf" | "docx" | "print" | "email") => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    await exportReport(format)

    clearInterval(interval)
    setExportProgress(100)

    setTimeout(() => {
      setIsExporting(false)
      setShowExportModal(false)
      setExportProgress(0)
    }, 500)
  }

  const resetReport = () => {
    setSections(getInitialSections())
    setAssessmentData({})
    setSampleDataLoaded(false)
    setExpandedSection(null)
    setEditingSection(null)
    setCopied(null)
    setError(null)
    setIsGeneratingAll(false)
    setShowPreview(false)
    setShowExportModal(false)
    setExportProgress(0)
    setIsExporting(false)
    setCurrentGenerating(null)
  }

  useImperativeHandle(
    ref,
    () => ({
      exportReport,
    }),
    [exportReport],
  )

  return (
    <div className="space-y-6">
      {/* Sample Data Banner */}
      {sampleDataLoaded && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Sample data loaded in 1 click</p>
              <p className="text-sm text-blue-700">
                Client: Marcus Johnson | Diagnosis: ASD Level 2 | 16 sections ready to generate
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-0">Demo Mode</Badge>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Gradient header strip */}
        <div
          className="h-1.5 bg-gradient-to-r from-[#0D9488] via-cyan-500 to-blue-500"
          style={{ width: `${progress}%`, transition: "width 0.5s ease-out" }}
        />

        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Progress visualization */}
            <div className="flex items-center gap-5">
              {/* Animated Circular Progress */}
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90 drop-shadow-sm">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="currentColor"
                    strokeWidth="7"
                    fill="none"
                    className="text-gray-100"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="url(#progressGradient)"
                    strokeWidth="7"
                    fill="none"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * progress) / 100}
                    className="transition-all duration-700 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0D9488" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">
                  {progress}%
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {completedCount === sections.length
                    ? getCompletionMessage()
                    : completedCount === 0
                      ? "Ready to create your report"
                      : `${completedCount} of ${sections.length} sections complete`}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    {totalWords.toLocaleString()} words
                  </span>
                  {completedCount > 0 && completedCount < sections.length && (
                    <span className="text-[#0D9488] font-medium animate-pulse">{getMotivationalMessage()}</span>
                  )}
                </div>
                {totalWords > 0 && (
                  <p className="text-xs text-gray-400">
                    Time saved: ~{Math.ceil(totalWords / 40)} min of manual writing
                  </p>
                )}
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {!sampleDataLoaded && (
                <button
                  onClick={loadSampleData}
                  className="px-4 py-2.5 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  View demo with sample data
                </button>
              )}

              {isGeneratingAll ? (
                <button
                  onClick={() => setIsGeneratingAll(false)}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2 shadow-md"
                >
                  <AlertCircle className="h-4 w-4" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={generateAllSections}
                  disabled={completedCount === sections.length}
                  className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-cyan-600 text-white rounded-xl font-semibold hover:from-[#0B7C7C] hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Brain className="h-5 w-5" />
                  {completedCount === 0
                    ? "Generate Full Report"
                    : completedCount === sections.length
                      ? "Report Complete"
                      : "Continue Generating"}
                </button>
              )}

              {completedCount > 0 && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "preview" ? "bg-white shadow-sm text-[#0D9488]" : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Preview"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={copyFullReport}
                    className="p-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white transition-all"
                    title="Copy full report"
                  >
                    {copied === "full" ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Report Sections</p>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => {
                const hasGoalsTrackerData =
                  (section.id === "skill_acquisition_goals" || section.id === "behavior_reduction_goals") &&
                  loadGoalsTrackerData().filter((g) =>
                    section.id === "skill_acquisition_goals"
                      ? g.type === "skill-acquisition"
                      : g.type === "behavior-reduction",
                  ).length > 0
                const isGenerating = section.status === "generating"

                return (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all transform hover:scale-[1.02] ${
                      section.status === "complete"
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 hover:shadow-md"
                        : isGenerating
                          ? "bg-gradient-to-r from-[#0D9488]/10 to-cyan-100/50 text-[#0D9488] border border-[#0D9488]/30"
                          : section.status === "error"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {section.status === "complete" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isGenerating ? (
                      <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : section.status === "error" ? (
                      <AlertCircle className="h-3.5 w-3.5" />
                    ) : (
                      <span className="h-3.5 w-3.5 flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-200 rounded-full">
                        {index + 1}
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">{section.title}</span>
                    {hasGoalsTrackerData && section.status === "complete" && (
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <Check className="h-3 w-3" />
                        Goals Data
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {completedCount === sections.length && sections.length > 0 && (
        <div className="bg-gradient-to-r from-[#0D9488] to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Report successfully completed</h3>
                <p className="text-white/80 text-sm">
                  {totalWords.toLocaleString()} words in {sections.length} sections | You saved ~
                  {Math.ceil(totalWords / 40)} minutes of manual work
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportReport("pdf")}
                className="px-5 py-2.5 bg-white text-[#0D9488] rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <FileDown className="h-5 w-5" />
                Download PDF
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <Share2 className="h-5 w-5" />
                More options
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "preview" ? (
        // Report Preview Mode
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">ABA Assessment Report</h1>
            <p className="text-gray-300">
              {assessmentData.clientInfo?.firstName} {assessmentData.clientInfo?.lastName}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Report Content */}
          <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
            {sections
              .filter((s) => s.content && s.status === "complete")
              .map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200 flex-1">
                      {section.title}
                    </h2>
                    <button
                      onClick={() => copySection(section.id)}
                      className="ml-3 p-2 text-gray-400 hover:text-[#0D9488] hover:bg-[#0D9488]/10 rounded-lg transition-all"
                      title="Copy section"
                    >
                      {copied === section.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {section.content || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

            {sections.filter((s) => s.content).length === 0 && (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-2xl inline-block mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">Your report will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Click "Generate Report" to begin</p>
                <p className="text-xs text-gray-400 mt-3">Estimated time: ~2 minutes for a full report</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode - Feed style section cards */
        <div className="space-y-3">
          {completedCount === 0 && !isGeneratingAll && (
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="p-4 bg-white rounded-2xl inline-block mb-4 shadow-sm">
                <Brain className="h-10 w-10 text-[#0D9488]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to create your professional report</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                ARIA will generate 16 complete sections based on assessment data. You can generate everything at once or
                section by section.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={generateAllSections}
                  className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-cyan-600 text-white rounded-xl font-semibold hover:from-[#0B7C7C] hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate full report
                </button>
                <span className="text-gray-400">or</span>
                <button
                  onClick={() => setExpandedSection(sections[0]?.id || null)}
                  className="px-5 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Generate by sections
                </button>
              </div>
            </div>
          )}

          {/* Section cards */}
          {sections.map((section, index) => {
            const isExpanded = expandedSection === section.id
            const isEditing = editingSection === section.id
            const isGenerating = section.status === "generating"
            const wordCount = section.content?.split(/\s+/).filter(Boolean).length || 0

            return (
              <div
                key={section.id}
                className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "border-[#0D9488] shadow-lg ring-1 ring-[#0D9488]/20"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {/* Section Header - clickable card style */}
                <div
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all ${
                    isExpanded ? "bg-gradient-to-r from-[#0D9488]/5 to-cyan-50/50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                >
                  {/* Status badge with number */}
                  <div
                    className={`relative p-2.5 rounded-xl transition-all ${
                      section.status === "complete"
                        ? "bg-gradient-to-br from-green-100 to-emerald-100"
                        : isGenerating
                          ? "bg-gradient-to-br from-[#0D9488]/10 to-cyan-100"
                          : section.status === "error"
                            ? "bg-red-100"
                            : "bg-gray-100"
                    }`}
                  >
                    {section.status === "complete" ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : isGenerating ? (
                      <div className="h-5 w-5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                    ) : section.status === "error" ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-500">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Title & meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{section.title}</h3>
                      {section.status === "complete" && (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs">Complete</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {section.status === "complete" && (
                        <span className="text-xs text-gray-500">{wordCount} words</span>
                      )}
                      {section.status === "pending" && (
                        <span className="text-xs text-gray-400">Est. {section.estimatedWords} words</span>
                      )}
                      {isGenerating && (
                        <span className="text-xs text-[#0D9488] font-medium animate-pulse">Generating...</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {section.status === "complete" && (
                      <button
                        onClick={() => copySection(section.id)}
                        className={`p-2 rounded-lg transition-all ${
                          copied === section.id
                            ? "bg-green-100 text-green-600"
                            : "text-gray-400 hover:text-[#0D9488] hover:bg-[#0D9488]/10"
                        }`}
                        title="Copy section"
                      >
                        {copied === section.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}

                    {section.status !== "complete" && !isGenerating && (
                      <button
                        onClick={() => generateSection(section.id)}
                        className="px-3.5 py-2 text-sm text-[#0D9488] bg-[#0D9488]/10 hover:bg-[#0D9488]/20 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                      >
                        <Brain className="h-4 w-4" />
                        Generate
                      </button>
                    )}

                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {section.content ? (
                      <div className="p-5">
                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                setSections((prev) =>
                                  prev.map((s) => (s.id === section.id ? { ...s, content: e.target.value } : s)),
                                )
                              }
                              className="w-full h-64 p-4 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-4 py-2 text-sm bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C7C] transition-all"
                              >
                                Save changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="prose prose-sm max-w-none text-gray-700 bg-white rounded-xl p-5 border border-gray-200">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {section.content}
                              </ReactMarkdown>
                            </div>

                            {/* Action bar */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingSection(section.id)}
                                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => generateSection(section.id)}
                                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-1.5"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Regenerate
                                </button>
                              </div>
                              <button
                                onClick={() => copySection(section.id)}
                                className={`px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-2 ${
                                  copied === section.id
                                    ? "bg-green-100 text-green-700"
                                    : "bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20"
                                }`}
                              >
                                {copied === section.id ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    Copy section
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">This section has no content yet</p>
                        <p className="text-sm text-gray-400 mt-1 mb-4">Generate professional content with one click</p>
                        <button
                          onClick={() => generateSection(section.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#0D9488] to-cyan-600 text-white rounded-xl font-medium hover:from-[#0B7C7C] hover:to-cyan-700 transition-all flex items-center gap-2 mx-auto shadow-md"
                        >
                          <Sparkles className="h-4 w-4" />
                          Generate this section
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {completedCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Export and share</h3>
              <p className="text-sm text-gray-500">Your report is ready to download or share</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-0">{completedCount} sections complete</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => exportReport("pdf")}
              className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-all group"
            >
              <FileDown className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-red-700">PDF</span>
            </button>
            <button
              onClick={() => exportReport("docx")}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
            >
              <FileText className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-700">Word</span>
            </button>
            <button
              onClick={() => exportReport("print")}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
            >
              <Printer className="h-6 w-6 text-gray-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Print</span>
            </button>
            <button
              onClick={copyFullReport}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all group ${
                copied === "full" ? "bg-green-100" : "bg-purple-50 hover:bg-purple-100"
              }`}
            >
              {copied === "full" ? (
                <>
                  <Check className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-700">Copy all</span>
                </>
              )}
            </button>
            <button
              onClick={() => exportReport("email")}
              className="flex flex-col items-center gap-2 p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all group"
            >
              <Mail className="h-6 w-6 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-teal-700">Email</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500 mb-4">What would you like to do next?</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/assessment/new"
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={resetReport}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Start over
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Export Report</h3>
              <button
                onClick={() => !isExporting && setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isExporting}
              >
                <AlertCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {isExporting ? (
                <div className="text-center py-6">
                  <div className="h-12 w-12 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-medium text-gray-900 mb-2">Preparing your report...</p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-[#0D9488] transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{exportProgress}% complete</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    Your report has {totalWords.toLocaleString()} words in {completedCount} sections. Choose your
                    preferred format:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleExport("docx")}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="h-14 w-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Download className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Word Document</p>
                        <p className="text-xs text-gray-500">.docx format</p>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                    >
                      <div className="h-14 w-14 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <FileText className="h-7 w-7 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">PDF Document</p>
                        <p className="text-xs text-gray-500">.pdf format</p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setShowExportModal(false)
                        exportReport("print")
                      }}
                      className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => {
                        setShowExportModal(false)
                        exportReport("email")
                      }}
                      className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => {
                        setShowExportModal(false)
                        copyFullReport()
                      }}
                      className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
