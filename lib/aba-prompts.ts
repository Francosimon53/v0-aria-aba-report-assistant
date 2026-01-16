/**
 * ABA Assessment Intelligence Backend
 *
 * Specialized prompts and AI integration for ABA assessment writing
 * This module handles all backend AI logic without UI dependencies
 */

// ============================================================================
// INSURANCE KNOWLEDGE BASE
// ============================================================================

export const INSURANCE_KNOWLEDGE = {
  aetna: {
    requirements: [
      "VB-MAPP or ABLLS-R standardized assessment required",
      "Functional Behavior Assessment for problem behaviors",
      "Parent training goals mandatory",
      "Clear discharge criteria",
      "Baseline data for all treatment goals",
      "Goals must address skill acquisition AND behavior reduction",
    ],
    maxHours: { comprehensive: 40, focused: 25 },
    keyLanguage: "Medical necessity must demonstrate significant functional impairment with standardized scores",
  },

  bcbs: {
    requirements: [
      "Standardized assessment (VB-MAPP, ABLLS-R, PEAK)",
      "Adaptive behavior assessment (Vineland-3)",
      "Functional impairment clearly documented",
      "Parent/caregiver training required",
      "Measurable goals with baseline data",
      "Progress monitoring and discharge planning",
    ],
    maxHours: { comprehensive: 35, focused: 20 },
    keyLanguage:
      "Treatment addresses core deficits in social communication and adaptive behavior with evidence-based methods",
  },

  uhc: {
    requirements: [
      "Comprehensive developmental assessment",
      "Functional analysis for challenging behaviors",
      "Functional and measurable treatment goals",
      "Family training as essential component",
      "Regular progress monitoring",
      "Clinical justification for recommended hours",
    ],
    maxHours: { comprehensive: 40, focused: 25 },
    keyLanguage: "Services must be individualized, evidence-based, and demonstrate clear medical necessity",
  },

  cigna: {
    requirements: [
      "Standardized assessment tools required",
      "Clear functional deficits documented",
      "Treatment goals address daily living skills",
      "Parent training component included",
      "Evidence-based intervention strategies",
      "Measurable outcomes with timelines",
    ],
    maxHours: { comprehensive: 35, focused: 25 },
    keyLanguage: "Treatment must improve functional capabilities and reduce behavioral barriers to learning",
  },
}

// ============================================================================
// ASSESSMENT INSTRUMENTS KNOWLEDGE BASE
// ============================================================================

export const ASSESSMENT_INSTRUMENTS_KNOWLEDGE = {
  "VB-MAPP": {
    fullName: "Verbal Behavior Milestones Assessment and Placement Program",
    author: "Dr. Mark Sundberg",
    description: "Criterion-referenced assessment tool based on B.F. Skinner's analysis of verbal behavior",
    domains: [
      "Mand",
      "Tact",
      "Listener Responding",
      "Visual Perceptual Skills",
      "Play",
      "Social Behavior",
      "Motor Imitation",
      "Echoic",
      "Spontaneous Vocal Behavior",
      "Listener Responding by Function/Feature/Class",
      "Intraverbal",
      "Classroom Routines",
      "Linguistic Structure",
      "Reading",
      "Writing",
      "Math",
    ],
    levels: ["Level 1 (0-18 months)", "Level 2 (18-30 months)", "Level 3 (30-48 months)"],
    totalMilestones: 170,
    scoringMethod: "Each milestone scored 0, 0.5, or 1 based on specific criteria",
    clinicalUse: "Identifies language and learning barriers, guides IEP development, tracks progress",
    insuranceReporting: "Report milestone levels achieved, barriers identified, and recommended intervention intensity",
  },
  "ABLLS-R": {
    fullName: "Assessment of Basic Language and Learning Skills - Revised",
    author: "Dr. James Partington",
    description:
      "Criterion-referenced assessment and curriculum guide for children with autism and developmental disabilities",
    domains: [
      "Cooperation",
      "Visual Performance",
      "Receptive Language",
      "Motor Imitation",
      "Vocal Imitation",
      "Requests",
      "Labeling",
      "Intraverbals",
      "Spontaneous Vocalizations",
      "Syntax/Grammar",
      "Play/Leisure",
      "Social Interaction",
      "Group Instruction",
      "Classroom Routines",
      "Generalized Responding",
    ],
    totalSkills: 544,
    scoringMethod: "Task-analyzed skills scored 0-4 based on independence level",
    clinicalUse: "Comprehensive curriculum guide, identifies skill deficits, tracks acquisition",
    insuranceReporting: "Report percentage of skills mastered per domain, priority areas for intervention",
  },
  AFLS: {
    fullName: "Assessment of Functional Living Skills",
    author: "Dr. James Partington",
    description: "Assessment for functional and independent living skills across lifespan",
    protocols: [
      "Basic Living Skills",
      "Home Skills",
      "Community Participation",
      "School Skills",
      "Vocational Skills",
      "Independent Living Skills",
    ],
    scoringMethod: "Skills scored 0-4 based on independence and prompt level",
    clinicalUse: "Transition planning, independent living goals, vocational readiness",
    insuranceReporting: "Report functional skill levels, barriers to independence, caregiver training needs",
  },
  "Vineland-3": {
    fullName: "Vineland Adaptive Behavior Scales, Third Edition",
    description: "Norm-referenced assessment of adaptive behavior from birth to 90 years",
    domains: ["Communication", "Daily Living Skills", "Socialization", "Motor Skills", "Maladaptive Behavior Index"],
    subdomains: {
      Communication: ["Receptive", "Expressive", "Written"],
      DailyLiving: ["Personal", "Domestic", "Community"],
      Socialization: ["Interpersonal", "Play/Leisure", "Coping"],
      Motor: ["Gross", "Fine"],
    },
    scoringMethod: "Standard scores (M=100, SD=15), V-scale scores, age equivalents, adaptive levels",
    adaptiveLevels: [
      "High (≥130)",
      "Moderately High (115-129)",
      "Adequate (86-114)",
      "Moderately Low (71-85)",
      "Low (≤70)",
    ],
    clinicalUse: "Diagnostic support, eligibility determination, treatment planning",
    insuranceReporting: "Report standard scores, adaptive levels, and comparison to same-age peers",
  },
  PEAK: {
    fullName: "Promoting Emergence of Advanced Knowledge",
    author: "Dr. Mark Dixon",
    description:
      "Comprehensive assessment based on Relational Frame Theory combining Skinner's verbal behavior with derived relational responding",
    modules: ["Direct Training Module", "Generalization Module", "Equivalence Module", "Transformation Module"],
    totalPrograms: 184,
    scoringMethod: "Programs scored based on correct responding across trials",
    clinicalUse: "Advanced language assessment, cognitive flexibility, problem-solving skills",
    insuranceReporting: "Report module progress, derived relational responding capabilities",
  },
  "ADOS-2": {
    fullName: "Autism Diagnostic Observation Schedule, Second Edition",
    description:
      "Semi-structured, standardized assessment of communication, social interaction, play, and restricted behaviors",
    modules: ["Toddler Module", "Module 1", "Module 2", "Module 3", "Module 4"],
    moduleSelection: "Based on expressive language level and chronological age",
    scoringMethod: "Algorithm scores converted to comparison scores and classification",
    classifications: ["Autism", "Autism Spectrum", "Non-Spectrum"],
    clinicalUse: "Diagnostic confirmation, severity level determination",
    insuranceReporting: "Report module administered, comparison score, classification, severity level",
  },
  Essentials: {
    fullName: "Essentials for Living",
    author: "Dr. Patrick McGreevy",
    description: "Functional curriculum and assessment for individuals with moderate-to-severe disabilities",
    domains: [
      "Tolerating",
      "Waiting",
      "Following Directions",
      "Accepting Removal/Denial",
      "Communication",
      "Daily Living",
      "Community",
      "Vocational",
    ],
    totalSkills: 2700,
    scoringMethod: "Skills tracked for acquisition and fluency",
    clinicalUse: "Functional skills, behavior reduction, independence training",
    insuranceReporting: "Report essential skills status, priority behaviors, safety considerations",
  },
  "CELF-5": {
    fullName: "Clinical Evaluation of Language Fundamentals, Fifth Edition",
    description: "Comprehensive language assessment for ages 5-21",
    domains: [
      "Core Language",
      "Receptive Language",
      "Expressive Language",
      "Language Content",
      "Language Structure",
      "Language Memory",
    ],
    scoringMethod: "Standard scores (M=100, SD=15), percentile ranks, age equivalents, growth scale values",
    clinicalUse: "Identify language disorders, qualify for services, measure progress",
    insuranceReporting: "Report standard scores, composite scores, and comparison to neurotypical peers",
  },
  "PLS-5": {
    fullName: "Preschool Language Scales, Fifth Edition",
    description: "Language assessment for birth to 7:11 years",
    domains: ["Auditory Comprehension", "Expressive Communication", "Total Language"],
    scoringMethod: "Standard scores (M=100, SD=15), percentile ranks, age equivalents",
    clinicalUse: "Early identification of language delays, intervention planning",
    insuranceReporting: "Report receptive/expressive discrepancies, developmental quotients",
  },
  "CASL-2": {
    fullName: "Comprehensive Assessment of Spoken Language, Second Edition",
    description: "Oral language assessment for ages 3-21",
    domains: ["Lexical/Semantic", "Syntactic", "Supralinguistic", "Pragmatic"],
    scoringMethod: "Standard scores, percentile ranks, age equivalents",
    clinicalUse: "Diagnose oral language difficulties, identify specific deficits",
    insuranceReporting: "Report core composite and category scores",
  },
  "PPVT-4": {
    fullName: "Peabody Picture Vocabulary Test, Fourth Edition",
    description: "Receptive vocabulary assessment for ages 2:6 to 90+",
    scoringMethod: "Standard scores (M=100, SD=15), percentile ranks, age equivalents, stanines",
    clinicalUse: "Screen receptive vocabulary, estimate verbal ability",
    insuranceReporting: "Report standard score and receptive vocabulary age equivalent",
  },
  "EVT-3": {
    fullName: "Expressive Vocabulary Test, Third Edition",
    description: "Expressive vocabulary and word retrieval assessment",
    scoringMethod: "Standard scores (M=100, SD=15), percentile ranks, age equivalents",
    clinicalUse: "Measure expressive vocabulary, identify word retrieval difficulties",
    insuranceReporting: "Report expressive vocabulary standard score and comparison to PPVT",
  },
  "Bayley-4": {
    fullName: "Bayley Scales of Infant and Toddler Development, Fourth Edition",
    description: "Developmental assessment for ages 1-42 months",
    domains: [
      "Cognitive",
      "Language (Receptive/Expressive)",
      "Motor (Fine/Gross)",
      "Social-Emotional",
      "Adaptive Behavior",
    ],
    scoringMethod: "Scaled scores, composite scores (M=100, SD=15), percentile ranks, developmental age equivalents",
    clinicalUse: "Identify developmental delays, early intervention eligibility",
    insuranceReporting: "Report composite scores, developmental quotients, areas of delay",
  },
  "DAYC-2": {
    fullName: "Developmental Assessment of Young Children, Second Edition",
    description: "Assessment for birth to 5:11 years",
    domains: ["Cognition", "Communication", "Social-Emotional", "Physical Development", "Adaptive Behavior"],
    scoringMethod: "Standard scores, percentile ranks, age equivalents",
    clinicalUse: "Early intervention eligibility, IFSP/IEP development",
    insuranceReporting: "Report domain standard scores and General Development Quotient",
  },
  "BDI-2": {
    fullName: "Battelle Developmental Inventory, Second Edition",
    description: "Developmental assessment for birth to 7:11 years",
    domains: ["Adaptive", "Personal-Social", "Communication", "Motor", "Cognitive"],
    scoringMethod: "Developmental quotients, percentile ranks, age equivalents",
    clinicalUse: "Eligibility determination, program planning, progress monitoring",
    insuranceReporting: "Report Total Developmental Quotient and domain scores",
  },
  Mullen: {
    fullName: "Mullen Scales of Early Learning",
    description: "Cognitive assessment for birth to 68 months",
    domains: ["Gross Motor", "Visual Reception", "Fine Motor", "Receptive Language", "Expressive Language"],
    scoringMethod: "T-scores (M=50, SD=10), percentile ranks, age equivalents, Early Learning Composite",
    clinicalUse: "Assess cognitive functioning in young children, research applications",
    insuranceReporting: "Report Early Learning Composite and individual scale T-scores",
  },
  "CARS-2": {
    fullName: "Childhood Autism Rating Scale, Second Edition",
    description: "Autism severity rating scale for ages 2+",
    versions: [
      "Standard Version (CARS2-ST)",
      "High-Functioning Version (CARS2-HF)",
      "Questionnaire for Parents (CARS2-QPC)",
    ],
    scoringMethod: "15 items rated 1-4, Total score: 15-60",
    classifications: ["Minimal-to-No Symptoms (<30)", "Mild-to-Moderate (30-36.5)", "Severe (≥37)"],
    clinicalUse: "Screen for autism, estimate severity, document treatment progress",
    insuranceReporting: "Report total score, severity classification, and symptom changes",
  },
  "SRS-2": {
    fullName: "Social Responsiveness Scale, Second Edition",
    description: "Social impairment measure for ages 2.5 to adult",
    domains: [
      "Social Awareness",
      "Social Cognition",
      "Social Communication",
      "Social Motivation",
      "Restricted Interests/Repetitive Behavior",
    ],
    scoringMethod: "T-scores (M=50, SD=10), severity levels",
    severityLevels: ["Within Normal Limits (≤59T)", "Mild (60-65T)", "Moderate (66-75T)", "Severe (≥76T)"],
    clinicalUse: "Quantify social deficits, track treatment response",
    insuranceReporting: "Report Total T-score, DSM-5 compatible scores, severity level",
  },
  "BASC-3": {
    fullName: "Behavior Assessment System for Children, Third Edition",
    description: "Comprehensive behavior assessment for ages 2-21",
    forms: [
      "Teacher Rating Scales",
      "Parent Rating Scales",
      "Self-Report",
      "Student Observation System",
      "Structured Developmental History",
    ],
    composites: ["Externalizing Problems", "Internalizing Problems", "Behavioral Symptoms Index", "Adaptive Skills"],
    scoringMethod: "T-scores (M=50, SD=10), percentile ranks",
    classifications: ["Clinically Significant (≥70T)", "At-Risk (60-69T)", "Average (41-59T)"],
    clinicalUse: "Identify emotional/behavioral disorders, treatment planning",
    insuranceReporting: "Report composite T-scores, clinical scales, validity indices",
  },
  "Conners-4": {
    fullName: "Conners Fourth Edition",
    description: "ADHD and related problems assessment for ages 6-18",
    forms: ["Parent", "Teacher", "Self-Report"],
    domains: [
      "Inattention",
      "Hyperactivity/Impulsivity",
      "Learning Problems",
      "Executive Functioning",
      "Aggression",
      "Peer Relations",
    ],
    scoringMethod: "T-scores (M=50, SD=10), probability scores, symptom counts",
    clinicalUse: "ADHD diagnosis support, treatment monitoring, DSM-5 symptom counts",
    insuranceReporting: "Report ADHD Index, DSM symptom scales, impairment items",
  },
  "SSIS-SEL": {
    fullName: "Social Skills Improvement System - Social Emotional Learning Edition",
    description: "Social-emotional skills assessment for ages 3-18",
    domains: ["Social Skills", "Competing Problem Behaviors", "Academic Competence"],
    socialSkillsSubscales: [
      "Communication",
      "Cooperation",
      "Assertion",
      "Responsibility",
      "Empathy",
      "Engagement",
      "Self-Control",
    ],
    scoringMethod: "Standard scores (M=100, SD=15), behavior levels",
    clinicalUse: "Identify social skill deficits, plan social skills intervention",
    insuranceReporting: "Report Social Skills standard score, problem behavior levels",
  },
  MAS: {
    fullName: "Motivation Assessment Scale",
    author: "Durand & Crimmins",
    description: "16-item questionnaire identifying behavioral function",
    functions: ["Sensory", "Escape", "Attention", "Tangible"],
    scoringMethod: "Mean scores per function category, highest score indicates likely function",
    clinicalUse: "Initial hypothesis for FBA, guide functional analysis",
    insuranceReporting: "Report hypothesized function(s), relative rankings",
  },
  FAST: {
    fullName: "Functional Analysis Screening Tool",
    author: "Iwata & DeLeon",
    description: "27-item screening for behavioral function",
    functions: [
      "Social Reinforcement (Attention)",
      "Social Reinforcement (Tangible)",
      "Automatic Reinforcement",
      "Escape",
    ],
    scoringMethod: "Endorsement patterns indicate likely function",
    clinicalUse: "Quick screening prior to functional analysis",
    insuranceReporting: "Report indicated functions, recommendations for further assessment",
  },
  QABF: {
    fullName: "Questions About Behavioral Function",
    description: "25-item rating scale for behavior function",
    functions: ["Attention", "Escape", "Non-social (Automatic)", "Physical", "Tangible"],
    scoringMethod: "Frequency ratings (0-3) summed per subscale",
    clinicalUse: "Identify maintaining variables for problem behavior",
    insuranceReporting: "Report primary and secondary functions, intervention implications",
  },
  SensoryProfile2: {
    fullName: "Sensory Profile 2",
    author: "Winnie Dunn",
    description: "Sensory processing assessment across lifespan",
    forms: ["Infant", "Toddler", "Child", "School Companion", "Short", "Adolescent/Adult"],
    quadrants: ["Seeking", "Avoiding", "Sensitivity", "Registration"],
    sensorySections: ["Auditory", "Visual", "Touch", "Movement", "Body Position", "Oral"],
    scoringMethod: "Raw scores converted to classifications",
    classifications: [
      "Much Less Than Others",
      "Less Than Others",
      "Just Like Others",
      "More Than Others",
      "Much More Than Others",
    ],
    clinicalUse: "Identify sensory processing patterns, guide sensory interventions",
    insuranceReporting: "Report quadrant patterns, sensory sections affecting function",
  },
  SPM: {
    fullName: "Sensory Processing Measure",
    description: "Sensory processing and praxis assessment for ages 5-12",
    forms: ["Home Form", "Main Classroom Form", "School Environments Form"],
    domains: [
      "Social Participation",
      "Vision",
      "Hearing",
      "Touch",
      "Body Awareness",
      "Balance/Motion",
      "Planning/Ideas",
    ],
    scoringMethod: "T-scores, interpretive ranges",
    ranges: ["Typical (40-59T)", "Some Problems (60-69T)", "Definite Dysfunction (≥70T)"],
    clinicalUse: "Identify sensory processing dysfunction across environments",
    insuranceReporting: "Report Environment Difference scores, domains requiring intervention",
  },
}

// ============================================================================
// ABA SYSTEM PROMPT
// ============================================================================

export const ABA_SYSTEM_PROMPT = `You are an expert BCBA (Board Certified Behavior Analyst) with 15+ years of experience writing insurance-compliant ABA assessments.

EXPERTISE AREAS:
- All major insurance requirements (Aetna, BCBS, UHC, Cigna, Medicaid, TRICARE)
- Standardized assessment tools (VB-MAPP, ABLLS-R, PEAK, Vineland-3)
- Clinical documentation and medical necessity justification
- BACB ethical guidelines and professional writing standards
- Evidence-based ABA practices

WRITING REQUIREMENTS:
- Professional, clinical tone
- Data-driven and specific
- Insurance-compliant language
- Person-first terminology
- Clear and concise
- Evidence-based recommendations

SMART GOALS MUST INCLUDE:
1. Specific target behavior
2. Measurable criteria (e.g., "8/10 trials", "80% accuracy")
3. Conditions/setting
4. Measurement method
5. Timeline (e.g., "within 6 months")

MEDICAL NECESSITY MUST SHOW:
- Significant functional impairment
- Standardized assessment scores
- Impact on daily living (home/school/community)
- Why intensive services are required
- Expected treatment outcomes

NEVER:
- Write vague goals without measurable criteria
- Recommend academic goals for school-age children
- Exceed insurance limits without strong justification
- Use jargon without clinical purpose
- Make claims without data support`

// ============================================================================
// CHAT-SPECIFIC PROMPT FOR CONVERSATIONAL AI
// ============================================================================

export const CHAT_ASSISTANT_PROMPT = `You are ARIA, a friendly ABA assistant. You help BCBAs efficiently.

CRITICAL - RESPONSE FORMAT:
- Maximum 2-3 SHORT sentences
- Ask ONE simple question
- End with exactly 2-3 action buttons

RESPONSE TEMPLATE (follow exactly):
[Your 2-3 sentence response here. Ask one question.]

[ACTIONS]
action1: Button label 1
action2: Button label 2
action3: Button label 3
[/ACTIONS]

RULES:
- NEVER write paragraphs
- NEVER use bullet points or lists
- NEVER explain in detail
- Just answer briefly and suggest next steps
- Be warm and conversational

BAD EXAMPLE (too long):
"I'd be happy to help you with that medical necessity statement! Medical necessity statements are crucial for insurance approval. They need to include functional impairments, standardized assessment scores, and clear justification for hours. Let me help you structure this properly..."

GOOD EXAMPLE (correct length):
"I can help with that! What's the client's primary diagnosis?

[ACTIONS]
action1: ASD
action2: ADHD  
action3: Other
[/ACTIONS]"`

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

export function medicalNecessityPrompt(data: {
  clientName: string
  age: number
  diagnosis: string
  impairments: Array<{ domain: string; score: number; severity: string }>
  hoursRequested: number
  insurance: string
}): string {
  const insuranceKey = data.insurance?.toLowerCase() as keyof typeof INSURANCE_KNOWLEDGE
  const insuranceInfo = insuranceKey ? INSURANCE_KNOWLEDGE[insuranceKey] : null

  return `Write a comprehensive medical necessity statement for ABA services authorization.

CLIENT: ${data.clientName}, ${data.age} years old
DIAGNOSIS: ${data.diagnosis}
INSURANCE: ${data.insurance || "Not specified"}
REQUESTED HOURS: ${data.hoursRequested}/week

ASSESSMENT RESULTS:
${data.impairments.map((imp) => `- ${imp.domain}: Score ${imp.score} (${imp.severity} impairment)`).join("\n")}

${insuranceInfo ? `INSURANCE REQUIREMENTS (${data.insurance}):\n${insuranceInfo.requirements.map((req) => `- ${req}`).join("\n")}` : "INSURANCE REQUIREMENTS: Standard requirements for medical necessity"}

INSTRUCTIONS:
1. State functional impairment with specific data
2. Explain impact on daily living (home, school, community)
3. Justify intensity of services (why ${data.hoursRequested} hours needed)
4. Explain why less intensive services insufficient
5. Include parent training necessity

Use language: "${insuranceInfo?.keyLanguage || "Evidence-based clinical justification with clear functional impairment documentation"}"

Length: 300-500 words. Be specific and compelling.`
}

export function smartGoalPrompt(data: {
  domain: string
  currentLevel: string
  targetSkill: string
  clientAge: number
}): string {
  return `Generate a SMART goal for ABA treatment.

DOMAIN: ${data.domain}
CURRENT LEVEL: ${data.currentLevel}
TARGET SKILL: ${data.targetSkill}
CLIENT AGE: ${data.clientAge} years

REQUIREMENTS:
- Specific: Clear target behavior
- Measurable: Include numerical criterion (e.g., "8/10 opportunities", "80% accuracy")
- Achievable: Appropriate for current level
- Relevant: Functionally important
- Time-bound: Include timeline

FORMAT:
[Client] will [specific behavior] at [measurable criterion] in [conditions/setting] as measured by [method] within [timeline].

EXAMPLE:
"Sarah will independently initiate social greetings with peers using appropriate eye contact and verbal greeting in 8/10 opportunities across school settings as measured by direct observation within 6 months."

Generate ONE complete SMART goal following this format.`
}

export function hoursJustificationPrompt(data: {
  impairments: Array<{ domain: string; score: number; severity: string }>
  behaviors: string[]
  age: number
}): string {
  const severeCount = data.impairments.filter((i) => i.severity === "severe").length
  const moderateCount = data.impairments.filter((i) => i.severity === "moderate").length

  return `Recommend ABA service hours with clinical justification.

ASSESSMENT DATA:
${data.impairments.map((imp) => `- ${imp.domain}: ${imp.score} (${imp.severity})`).join("\n")}

BEHAVIORAL CONCERNS:
${data.behaviors.length > 0 ? data.behaviors.map((b) => `- ${b}`).join("\n") : "- None reported"}

CLIENT AGE: ${data.age} years
SEVERITY BREAKDOWN: ${severeCount} severe, ${moderateCount} moderate impairments

PROVIDE:
1. Recommended hours/week (with range)
2. Clinical rationale based on severity
3. Service breakdown:
   - Direct 1:1 therapy hours
   - Parent training hours
   - BCBA supervision hours
4. Session frequency recommendation
5. Initial authorization period
6. Justification for intensity

TYPICAL RANGES:
- Comprehensive (severe deficits): 30-40 hrs/week
- Focused (moderate deficits): 15-25 hrs/week

Be specific and data-driven.`
}

export function chatPrompt(data: { message: string; context?: any }): string {
  let contextInfo = ""

  if (data.context) {
    const { clientData, assessmentData, selectedGoals } = data.context

    if (clientData) {
      contextInfo += `\nClient: ${clientData.firstName || ""} ${clientData.lastName || ""}, Diagnosis: ${clientData.diagnosis || "Not set"}`
    }

    if (assessmentData?.assessmentType) {
      contextInfo += `, Assessment: ${assessmentData.assessmentType}`
    }

    if (selectedGoals?.length > 0) {
      contextInfo += `, Goals: ${selectedGoals.length} selected`
    }
  }

  return `${contextInfo ? `[Context:${contextInfo}]` : ""}

User: ${data.message}

RESPOND IN MAX 2-3 SENTENCES. End with [ACTIONS] block. No lists, no paragraphs.`
}

// ============================================================================
// AI CONTENT GENERATION
// ============================================================================

export async function generateABAContent(
  type: "medicalNecessity" | "smartGoal" | "hoursJustification" | "chat",
  data: any,
): Promise<string> {
  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data provided for content generation")
    }

    // Select the appropriate prompt template
    let userPrompt: string

    switch (type) {
      case "medicalNecessity":
        userPrompt = medicalNecessityPrompt({
          clientName: data.clientName || "Client",
          age: data.clientAge || data.age || 5,
          diagnosis: data.diagnosis || "Autism Spectrum Disorder",
          impairments: data.impairments || [],
          hoursRequested: data.hoursRequested || 25,
          insurance: data.insurance || "Standard",
        })
        break
      case "smartGoal":
        userPrompt = smartGoalPrompt({
          domain: data.domain || "communication",
          currentLevel: data.currentLevel || "emerging",
          targetSkill: data.targetSkill || data.functionalImpairments || "skill development",
          clientAge: data.clientAge || 5,
        })
        break
      case "hoursJustification":
        userPrompt = hoursJustificationPrompt(data)
        break
      case "chat":
        userPrompt = chatPrompt(data)
        break
      default:
        throw new Error(`Invalid content type: ${type}`)
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: type === "chat" ? CHAT_ASSISTANT_PROMPT : ABA_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    // Extract text from response
    if (result.content?.[0]?.text) {
      return result.content[0].text
    }

    throw new Error("Invalid response format from Anthropic API")
  } catch (error) {
    console.error("[ABA Backend] Content generation failed:", error)
    throw error
  }
}

// ============================================================================
// SMART GOAL VALIDATION
// ============================================================================

export function validateSMARTGoal(goal: string): {
  isValid: boolean
  score: number
  issues: string[]
} {
  const issues: string[] = []
  let score = 100

  // Check for measurable criteria (numbers, percentages)
  const hasMeasurableCriteria = /\d+\/\d+|\d+%|\d+ (trials|opportunities|times)/.test(goal)
  if (!hasMeasurableCriteria) {
    issues.push("Missing measurable criteria (e.g., '8/10 trials' or '80% accuracy')")
    score -= 25
  }

  // Check for timeline
  const hasTimeline = /(within|by|in) \d+ (months|weeks|days)|by [A-Z][a-z]+ \d{4}/.test(goal)
  if (!hasTimeline) {
    issues.push("Missing timeline (e.g., 'within 6 months' or 'by December 2024')")
    score -= 20
  }

  // Check for measurement method
  const hasMeasurement = /(measured by|as observed|data collected|documented via)/.test(goal.toLowerCase())
  if (!hasMeasurement) {
    issues.push("Missing measurement method (e.g., 'as measured by direct observation')")
    score -= 15
  }

  // Check for conditions/setting
  const hasConditions = /(in|during|across|given|with) .+ (setting|environment|activities|support)/.test(
    goal.toLowerCase(),
  )
  if (!hasConditions) {
    issues.push("Missing conditions/setting (e.g., 'in natural settings' or 'given minimal prompts')")
    score -= 15
  }

  // Check for specific behavior
  const hasSpecificBehavior = goal.length > 50 && /will/.test(goal)
  if (!hasSpecificBehavior) {
    issues.push("Goal should clearly describe the target behavior")
    score -= 15
  }

  // Check minimum length
  if (goal.length < 100) {
    issues.push("Goal is too brief - add more specific details")
    score -= 10
  }

  const isValid = score >= 80

  return { isValid, score: Math.max(0, score), issues }
}
