export interface AssessmentType {
  id: string
  name: string
  abbreviation: string
  description: string
  ageRange: string
  domains: string[]
  scoringType: string
}

export const assessmentTypes: AssessmentType[] = [
  {
    id: "vbmapp",
    name: "Verbal Behavior Milestones Assessment and Placement Program",
    abbreviation: "VB-MAPP",
    description:
      "Criterion-referenced assessment for children with autism that evaluates language, learning, and social skills based on B.F. Skinner's analysis of verbal behavior.",
    ageRange: "0-48 months developmental",
    domains: [
      "Mand",
      "Tact",
      "Listener Responding",
      "Visual Perceptual",
      "Play",
      "Social",
      "Imitation",
      "Echoic",
      "Spontaneous Vocal",
      "Listener Responding by Function/Feature/Class",
      "Intraverbal",
      "Classroom Routines",
      "Linguistic Structure",
      "Math",
      "Reading",
      "Writing",
    ],
    scoringType: "Milestone levels (0-5 points per skill)",
  },
  {
    id: "ablls-r",
    name: "Assessment of Basic Language and Learning Skills - Revised",
    abbreviation: "ABLLS-R",
    description:
      "Curriculum guide and skills tracking system for children with language delays that provides comprehensive assessment across multiple developmental domains.",
    ageRange: "1-12 years",
    domains: [
      "Cooperation",
      "Visual Performance",
      "Receptive Language",
      "Imitation",
      "Vocal Imitation",
      "Requests",
      "Labeling",
      "Intraverbals",
      "Spontaneous Vocalizations",
      "Syntax",
      "Play",
      "Social Interaction",
      "Group Instruction",
      "Classroom Routines",
      "Generalized Responding",
    ],
    scoringType: "Task analysis checklist",
  },
  {
    id: "peak",
    name: "Promoting Emergence of Advanced Knowledge",
    abbreviation: "PEAK",
    description:
      "Comprehensive assessment and curriculum for teaching language and cognition based on contemporary behavior analysis and relational frame theory.",
    ageRange: "All ages",
    domains: ["Direct Training", "Generalization", "Equivalence", "Transformation"],
    scoringType: "Mastery criteria per module",
  },
  {
    id: "esdm",
    name: "Early Start Denver Model Curriculum Checklist",
    abbreviation: "ESDM",
    description:
      "Developmental assessment for young children with autism that combines ABA principles with developmental and relationship-based approaches.",
    ageRange: "12-48 months",
    domains: [
      "Receptive Communication",
      "Expressive Communication",
      "Joint Attention",
      "Social Skills",
      "Imitation",
      "Cognition",
      "Play",
      "Fine Motor",
      "Gross Motor",
      "Personal Independence",
    ],
    scoringType: "Developmental levels",
  },
  {
    id: "afls",
    name: "Assessment of Functional Living Skills",
    abbreviation: "AFLS",
    description:
      "Assessment tool focused on essential skills for independent living across home, school, community, and vocational settings.",
    ageRange: "School-age through adult",
    domains: [
      "Basic Living Skills",
      "Home Skills",
      "Community Participation",
      "School Skills",
      "Vocational Skills",
      "Independent Living Skills",
    ],
    scoringType: "Task analysis with independence levels",
  },
  {
    id: "fas",
    name: "Functional Assessment Screening Tool",
    abbreviation: "FAST",
    description: "Screening tool to identify potential functions of problem behavior through informant interview.",
    ageRange: "All ages",
    domains: ["Social Attention", "Tangible", "Escape", "Automatic/Sensory"],
    scoringType: "Function endorsement rating",
  },
  {
    id: "vineland",
    name: "Vineland Adaptive Behavior Scales",
    abbreviation: "Vineland-3",
    description:
      "Standardized assessment measuring adaptive behavior across communication, daily living, socialization, and motor skills.",
    ageRange: "Birth-90 years",
    domains: ["Communication", "Daily Living Skills", "Socialization", "Motor Skills", "Maladaptive Behavior Index"],
    scoringType: "Standard scores, percentiles, age equivalents",
  },
]
