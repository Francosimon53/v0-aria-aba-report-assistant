/**
 * AI Prompts System for ABA Assessment Writing
 *
 * This module provides specialized prompts and utilities for generating
 * professional ABA assessment content that meets insurance requirements.
 */

// ============================================================================
// INSURANCE KNOWLEDGE BASE
// ============================================================================

export const INSURANCE_KNOWLEDGE_BASE = {
  aetna: {
    requirements: [
      "VB-MAPP or ABLLS-R assessment required",
      "Functional Behavior Assessment (FBA) for problem behaviors",
      "Parent training goals mandatory",
      "Discharge criteria must be clearly defined",
      "Baseline data required for all goals",
      "Goals must address skill acquisition and behavior reduction",
      "Treatment plan must be medically necessary",
    ],
    maxHours: {
      comprehensive: 40,
      focused: 25,
    },
    preferredLanguage:
      "Medical necessity must be clearly demonstrated with standardized assessment scores and functional impairment documentation.",
    assessmentTools: ["VB-MAPP", "ABLLS-R", "PEAK", "Vineland-3"],
  },

  bcbs: {
    requirements: [
      "Standardized assessment (VB-MAPP, ABLLS-R, or PEAK)",
      "Adaptive behavior assessment (Vineland-3)",
      "Clear functional impairment documentation",
      "Parent/caregiver training component required",
      "Measurable treatment goals with baseline data",
      "Discharge planning and criteria",
      "Progress monitoring plan",
    ],
    maxHours: {
      comprehensive: 35,
      focused: 20,
    },
    preferredLanguage:
      "Treatment must address core deficits in social communication, adaptive behavior, and functional skills with evidence-based interventions.",
    assessmentTools: ["VB-MAPP", "ABLLS-R", "PEAK", "Vineland-3", "AFLS"],
  },

  uhc: {
    requirements: [
      "Comprehensive developmental assessment required",
      "Functional analysis for challenging behaviors",
      "Treatment goals must be functional and measurable",
      "Family training is essential component",
      "Regular progress monitoring and reporting",
      "Evidence-based intervention strategies",
      "Clear clinical justification for recommended hours",
    ],
    maxHours: {
      comprehensive: 40,
      focused: 25,
    },
    preferredLanguage:
      "Services must be individualized, evidence-based, and demonstrate clear medical necessity based on functional impairments.",
    assessmentTools: ["VB-MAPP", "ABLLS-R", "PEAK", "Vineland-3"],
  },

  medicaid: {
    requirements: [
      "Comprehensive diagnostic and functional assessment",
      "Age-appropriate standardized measures",
      "Adaptive behavior and social skills assessment",
      "Behavioral assessment if applicable",
      "Goals must address daily living skills",
      "Parent/guardian participation required",
      "Cultural considerations documented",
    ],
    maxHours: {
      comprehensive: 30,
      focused: 20,
    },
    preferredLanguage:
      "Treatment must focus on functional skills that enable participation in home, school, and community settings.",
    assessmentTools: ["VB-MAPP", "ABLLS-R", "Vineland-3", "AFLS"],
  },

  tricare: {
    requirements: [
      "Medical necessity clearly documented",
      "Standardized assessment tools required",
      "Functional goals that support military family lifestyle",
      "Parent training component mandatory",
      "Coordination with other providers documented",
      "Clear discharge criteria",
      "Evidence-based treatment approaches only",
    ],
    maxHours: {
      comprehensive: 40,
      focused: 25,
    },
    preferredLanguage:
      "Treatment must be medically necessary, evidence-based, and designed to restore or improve functional capabilities.",
    assessmentTools: ["VB-MAPP", "ABLLS-R", "PEAK", "Vineland-3"],
  },
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

export const SYSTEM_PROMPT = `You are ARIA, an expert ABA Assessment Writing Assistant with deep expertise in:

KNOWLEDGE AREAS:
- Insurance requirements for all major payers (Aetna, BCBS, UHC, Medicaid, TRICARE)
- Standardized assessment tools (VB-MAPP, ABLLS-R, PEAK, Vineland-3, AFLS)
- ABA terminology and evidence-based practices
- Clinical documentation standards
- Medical necessity justification
- BACB ethical guidelines and professional standards

WRITING STYLE:
- Professional, clinical, and evidence-based
- Clear and concise language
- Specific and measurable statements
- Data-driven recommendations
- Compliant with insurance requirements
- Person-first language always

CRITICAL RULES YOU MUST FOLLOW:

1. SMART GOALS: Every goal must be:
   - Specific: Clear target behavior
   - Measurable: Numerical criteria (e.g., "8/10 trials", "80% accuracy")
   - Achievable: Appropriate for client's current level
   - Relevant: Functionally important skill
   - Time-bound: Clear timeline (e.g., "within 6 months", "by [date]")

2. BASELINE DATA: Always include:
   - Current performance level with specific data
   - Assessment tool scores where applicable
   - Frequency, duration, or accuracy of current behavior

3. HOURS JUSTIFICATION: Base recommendations on:
   - Severity of deficits (assessment scores)
   - Number of domains requiring intervention
   - Behavioral concerns and safety issues
   - Age and developmental stage
   - Family/caregiver availability

4. MEDICAL NECESSITY: Must demonstrate:
   - Significant functional impairment
   - Impact on daily living activities
   - Need for intensive behavioral intervention
   - Why less intensive services are insufficient

5. PARENT TRAINING: Always include:
   - Specific skills parents will learn
   - How parent training supports generalization
   - Frequency and format of training

WHAT TO NEVER DO:
- Never recommend academic goals for children 5+ years old (that's IEP territory)
- Never make unsubstantiated claims without data
- Never exceed insurance max hours without strong justification
- Never use jargon without clinical purpose
- Never write vague goals (e.g., "will improve communication")
- Never ignore safety concerns in behavior reduction plans
- Never forget discharge criteria
- Never recommend services beyond scope of ABA practice

FORMATTING PREFERENCES:
- Use bullet points for clarity
- Bold key terms and criteria
- Include specific percentages and numbers
- Separate sections clearly
- Keep paragraphs concise (3-4 sentences max)

Your responses should sound like they were written by a seasoned BCBA who knows insurance requirements inside and out.`

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

interface MedicalNecessityData {
  clientName: string
  age: number
  diagnosis: string
  impairmentScores: Array<{ domain: string; score: number; severity: string }>
  hoursRequested: number
  insurance: string
}

interface SmartGoalData {
  domain: string
  currentLevel: string
  targetSkill: string
  clientAge: number
}

interface HoursJustificationData {
  impairmentScores: Array<{ domain: string; score: number; severity: string }>
  behavioralConcerns: string[]
  clientAge: number
}

interface ParentTrainingData {
  clientAge: number
  primaryConcerns: string[]
  parentGoals: string[]
}

interface FBAData {
  behavior: string
  frequency: string
  antecedents: string[]
  consequences: string[]
  hypothesizedFunction: string
}

interface StandardizedAssessmentData {
  domains: Record<string, { score: string; notes: string }>
}

interface VinelandData {
  domains: Record<string, { standardScore: string; percentile: string }>
  maladaptive?: { internalizing: string; externalizing: string }
  formType: "parent" | "teacher"
}

interface FadePlanData {
  currentPhase: string
  phaseCriteria: Record<string, { hoursPerWeek: string; criteriaToAdvance: string }>
  dischargeCriteria: Array<{ tool: string; domain: string; targetScore: string; currentScore: string }>
}

interface BarriersData {
  barriers: string[]
  otherBarrier?: string
}

interface GeneralizationPlanData {
  strategies: string[]
  otherStrategy?: string
}

export const PROMPT_TEMPLATES = {
  /**
   * Generates a medical necessity statement for insurance authorization
   */
  medicalNecessity: (data: MedicalNecessityData): string => {
    const insuranceReqs =
      INSURANCE_KNOWLEDGE_BASE[data.insurance.toLowerCase() as keyof typeof INSURANCE_KNOWLEDGE_BASE]

    return `Write a comprehensive medical necessity statement for ABA services authorization.

CLIENT INFORMATION:
- Name: ${data.clientName}
- Age: ${data.age} years old
- Diagnosis: ${data.diagnosis}
- Insurance: ${data.insurance}

ASSESSMENT SCORES:
${data.impairmentScores.map((score) => `- ${score.domain}: ${score.score} (${score.severity})`).join("\n")}

REQUESTED HOURS: ${data.hoursRequested} hours per week

INSURANCE REQUIREMENTS FOR ${data.insurance.toUpperCase()}:
${insuranceReqs?.requirements.map((req) => `- ${req}`).join("\n") || "Standard ABA requirements"}

INSTRUCTIONS:
1. Start with a clear statement of functional impairment
2. Reference specific assessment scores and their clinical significance
3. Explain how the impairments impact daily living (home, school, community)
4. Justify the intensity of services (hours requested)
5. Explain why less intensive services would be insufficient
6. Include parent training necessity
7. End with clear treatment objectives

Use ${insuranceReqs?.preferredLanguage || "professional clinical language"} when describing medical necessity.

Keep the statement between 300-500 words. Be specific, data-driven, and compelling.`
  },

  /**
   * Generates a properly formatted SMART goal
   */
  smartGoal: (data: SmartGoalData): string => {
    return `Create a SMART goal for ABA treatment plan.

TARGET INFORMATION:
- Domain: ${data.domain}
- Current Level: ${data.currentLevel}
- Target Skill: ${data.targetSkill}
- Client Age: ${data.clientAge} years old

SMART GOAL REQUIREMENTS:
- Specific: Clearly define the target behavior
- Measurable: Include numerical criteria (e.g., "8/10 trials", "80% of opportunities")
- Achievable: Appropriate for current functioning level
- Relevant: Functionally important for daily living
- Time-bound: Include timeline (e.g., "within 6 months")

ADDITIONAL REQUIREMENTS:
- Include baseline data (current performance level)
- Specify measurement method (direct observation, probe, trial-based)
- Include setting/conditions (e.g., "in natural environment", "with minimal prompting")
- Use person-first language
- Make it functionally relevant

FORMAT:
[Client name] will [specific, measurable behavior] at [criterion] accuracy/frequency in [setting/conditions] as measured by [measurement method] by [timeline].

Example: "John will independently request preferred items using 2-3 word phrases in 8/10 opportunities across natural environments as measured by direct observation and data collection within 6 months."

Generate ONE well-crafted SMART goal following this format.`
  },

  /**
   * Recommends appropriate hours based on severity and needs
   */
  hoursJustification: (data: HoursJustificationData): string => {
    const severityCount = data.impairmentScores.filter(
      (s) => s.severity === "severe" || s.severity === "moderate",
    ).length
    const hasBehaviors = data.behavioralConcerns.length > 0

    return `Write a professional clinical justification for ABA service hours.

ASSESSMENT DATA:
${data.impairmentScores.map((score) => `- ${score.domain}: ${score.score} (${score.severity})`).join("\n")}

BEHAVIORAL CONCERNS:
${data.behavioralConcerns.length > 0 ? data.behavioralConcerns.map((concern) => `- ${concern}`).join("\n") : "- No significant behavioral concerns reported"}

CLIENT AGE: ${data.clientAge} years old

ANALYSIS FACTORS:
- Number of severe/moderate impairments: ${severityCount}
- Behavioral concerns present: ${hasBehaviors ? "Yes" : "No"}
- Age considerations: ${data.clientAge < 5 ? "Early intervention critical period" : "School-age considerations"}

CRITICAL FORMATTING RULES:
1. Write in PLAIN TEXT only - NO Markdown formatting
2. DO NOT use asterisks (*), pound signs (#), or any special characters
3. DO NOT use bullet points with dashes or asterisks
4. Write in flowing paragraphs with professional clinical language
5. Use natural sentence structure, not lists
6. Keep between 150-300 words
7. Write as if this is going directly on an insurance form

CONTENT TO INCLUDE:
- Clinical severity statement based on assessment data
- Impact on daily functioning in home, school, and community
- Why intensive ABA services are medically necessary
- Recommended hours per week with rationale
- Why less intensive services would be insufficient
- Brief mention of parent training component

Write a compelling, professional justification that reads like a formal clinical document. Use complete sentences and proper paragraph structure. Do not use any formatting characters.`
  },

  /**
   * Generates parent training goals
   */
  parentTrainingGoals: (data: ParentTrainingData): string => {
    return `Create comprehensive parent/caregiver training goals.

CLIENT AGE: ${data.clientAge} years old

PRIMARY CONCERNS:
${data.primaryConcerns.map((concern) => `- ${concern}`).join("\n")}

PARENT GOALS TO ADDRESS:
${data.parentGoals.map((goal) => `- ${goal}`).join("\n")}

GENERATE:
1. 3-5 SMART parent training goals that:
   - Target specific ABA strategies parents will learn
   - Are measurable (e.g., "implement with 80% fidelity")
   - Support generalization of child's skills
   - Are realistic for family implementation

2. For each goal include:
   - What parents will learn to do
   - How it supports the child's progress
   - Measurement criteria (fidelity checks)
   - Timeline for mastery

3. Training format recommendation:
   - Frequency (weekly, bi-weekly)
   - Duration (30 min, 1 hour)
   - Format (in-person, telehealth, or hybrid)

Parent training is MANDATORY for insurance authorization. Make goals specific and achievable.`
  },

  /**
   * Generates a functional behavior assessment
   */
  functionalBehaviorAssessment: (data: FBAData): string => {
    return `Write a comprehensive Functional Behavior Assessment (FBA) summary.

TARGET BEHAVIOR: ${data.behavior}
FREQUENCY: ${data.frequency}

ANTECEDENTS (triggers):
${data.antecedents.map((ant) => `- ${ant}`).join("\n")}

CONSEQUENCES:
${data.consequences.map((con) => `- ${con}`).join("\n")}

HYPOTHESIZED FUNCTION: ${data.hypothesizedFunction}

CREATE A PROFESSIONAL FBA SUMMARY INCLUDING:

1. OPERATIONAL DEFINITION:
   - Describe the behavior in observable, measurable terms
   - Include what it looks like, sounds like, intensity

2. BASELINE DATA:
   - Current frequency, duration, or intensity
   - When and where it occurs most/least

3. ABC ANALYSIS:
   - Antecedent patterns
   - Behavior description
   - Consequence patterns
   - Maintaining variables

4. FUNCTIONAL HYPOTHESIS:
   - Primary function of behavior
   - Secondary functions if applicable
   - Supporting evidence from ABC data

5. REPLACEMENT BEHAVIORS:
   - Functionally equivalent appropriate behaviors
   - How they serve the same function
   - Teaching plan overview

6. INTERVENTION STRATEGIES:
   - Antecedent modifications
   - Teaching replacement behaviors
   - Consequence strategies
   - Crisis/safety plan if needed

7. DATA COLLECTION METHOD:
   - How behavior will be measured
   - Who will collect data
   - How often

Keep it evidence-based and aligned with BACB guidelines.`
  },

  /**
   * Generates ABLLS-R assessment narrative
   */
  abllsNarrative: (data: StandardizedAssessmentData): string => {
    const domainScores = Object.entries(data.domains || {})
      .filter(([_, v]) => v.score)
      .map(([domain, values]) => `- ${domain}: ${values.score} points${values.notes ? ` (${values.notes})` : ""}`)
      .join("\n")

    return `Write a comprehensive clinical narrative summarizing ABLLS-R assessment results.

ABLLS-R DOMAIN SCORES:
${domainScores || "No scores provided"}

INSTRUCTIONS:
1. Summarize overall skill levels based on the scores provided
2. Identify areas of relative strength (higher percentages of mastery)
3. Identify areas of significant deficit requiring intervention
4. Prioritize treatment targets based on developmental importance
5. Connect findings to functional daily living skills

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks, pound signs, or bullet points
- Write in flowing professional paragraphs
- Keep between 200-350 words
- Use clinical ABA terminology appropriately

Generate a professional narrative suitable for an ABA assessment report.`
  },

  /**
   * Generates Vineland-3 interpretation
   */
  vinelandInterpretation: (data: VinelandData): string => {
    const domainScores = Object.entries(data.domains || {})
      .filter(([_, v]) => v.standardScore)
      .map(
        ([domain, values]) => `- ${domain}: Standard Score ${values.standardScore}, ${values.percentile}th percentile`,
      )
      .join("\n")

    return `Write a clinical interpretation of Vineland-3 ${data.formType === "teacher" ? "Teacher" : "Parent/Caregiver"} Form results.

DOMAIN SCORES:
${domainScores || "No scores provided"}

${
  data.maladaptive
    ? `MALADAPTIVE BEHAVIOR:
- Internalizing: ${data.maladaptive.internalizing || "Not reported"}
- Externalizing: ${data.maladaptive.externalizing || "Not reported"}`
    : ""
}

INSTRUCTIONS:
1. Interpret each domain score in relation to same-age peers
2. Use standard score ranges: <70 Low, 70-84 Below Average, 85-115 Average, 116-130 Above Average, >130 High
3. Identify adaptive behavior strengths and weaknesses
4. Discuss implications for treatment planning
5. Compare scores across domains to identify patterns

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks, pound signs, or bullet points
- Write in flowing professional paragraphs
- Keep between 200-350 words

Generate a professional clinical interpretation for an ABA assessment report.`
  },

  /**
   * Generates SRS-2 clinical summary
   */
  srs2Summary: (data: { subscales: Record<string, string> }): string => {
    const scores = Object.entries(data.subscales || {})
      .filter(([_, v]) => v)
      .map(([subscale, tScore]) => {
        const score = Number(tScore)
        let range = "Within Normal Limits"
        if (score >= 76) range = "Severe Range"
        else if (score >= 66) range = "Moderate Range"
        else if (score >= 60) range = "Mild Range"
        return `- ${subscale}: T-Score ${tScore} (${range})`
      })
      .join("\n")

    return `Write a clinical summary of SRS-2 (Social Responsiveness Scale, Second Edition) results.

SRS-2 T-SCORES:
${scores || "No scores provided"}

INTERPRETATION GUIDELINES:
- T-Score ≤59: Within Normal Limits
- T-Score 60-65: Mild Range (mild deficits in social responsiveness)
- T-Score 66-75: Moderate Range (moderate deficits, clinically significant)
- T-Score ≥76: Severe Range (severe deficits in social reciprocity)

INSTRUCTIONS:
1. Interpret the overall social responsiveness profile
2. Identify specific areas of social difficulty
3. Discuss implications for ABA treatment targets
4. Connect findings to social communication goals
5. Note any discrepancies between subscales

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks, pound signs, or bullet points
- Write in flowing professional paragraphs
- Keep between 150-250 words

Generate a professional clinical summary suitable for an ABA assessment report.`
  },

  /**
   * Generates Fade Plan narrative
   */
  fadePlanNarrative: (data: FadePlanData): string => {
    const phases = Object.entries(data.phaseCriteria || {})
      .map(
        ([phase, criteria]) =>
          `- ${phase}: ${criteria.hoursPerWeek || "N/A"} hours/week. Advance when: ${criteria.criteriaToAdvance || "Not specified"}`,
      )
      .join("\n")

    const discharge = (data.dischargeCriteria || [])
      .filter((c) => c.tool && c.domain)
      .map((c) => `- ${c.tool} ${c.domain}: Target ${c.targetScore}, Current ${c.currentScore || "Not measured"}`)
      .join("\n")

    return `Write a comprehensive fade plan narrative for ABA services.

CURRENT PHASE: ${data.currentPhase || "Not specified"}

PHASE STRUCTURE:
${phases || "No phases defined"}

DISCHARGE CRITERIA:
${discharge || "No criteria defined"}

INSTRUCTIONS:
1. Explain the rationale for the phased service reduction model
2. Describe criteria for transitioning between phases
3. Detail measurable discharge criteria
4. Explain how generalization and maintenance will be ensured
5. Discuss caregiver involvement in the fade process

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks (*), pound signs (#), or any special characters
- DO NOT use bullet points with dashes or asterisks
- Write in flowing professional paragraphs
- Keep between 200-300 words

Generate a professional fade plan narrative suitable for insurance authorization.`
  },

  /**
   * Generates Barriers to Treatment section
   */
  barriersSection: (data: BarriersData): string => {
    const allBarriers = [...(data.barriers || []), data.otherBarrier].filter(Boolean)

    return `Write a professional Barriers to Treatment section for an ABA assessment.

IDENTIFIED BARRIERS:
${allBarriers.map((b) => `- ${b}`).join("\n") || "No barriers identified"}

INSTRUCTIONS:
1. Describe each identified barrier clearly
2. Explain how each barrier may impact treatment delivery
3. Propose specific mitigation strategies for each barrier
4. Discuss how the treatment team will address these barriers
5. Include contingency plans if barriers persist

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks (*), pound signs (#), or any special characters
- DO NOT use bullet points with dashes or asterisks
- Write in flowing professional paragraphs
- Keep between 150-250 words

Generate a professional section suitable for an ABA assessment report.`
  },

  /**
   * Generates Generalization & Maintenance plan
   */
  generalizationPlan: (data: GeneralizationPlanData): string => {
    const allStrategies = [...(data.strategies || []), data.otherStrategy].filter(Boolean)

    return `Write a comprehensive Generalization and Maintenance plan for ABA treatment.

SELECTED STRATEGIES:
${allStrategies.map((s) => `- ${s}`).join("\n") || "No strategies selected"}

INSTRUCTIONS:
1. Explain how each strategy will be implemented
2. Describe specific procedures for stimulus and response generalization
3. Detail how skills will be maintained after mastery
4. Discuss caregiver training for generalization support
5. Include monitoring procedures to verify generalization

CRITICAL FORMATTING RULES:
- Write in PLAIN TEXT only - NO Markdown formatting
- DO NOT use asterisks (*), pound signs (#), or any special characters
- DO NOT use bullet points with dashes or asterisks
- Write in flowing professional paragraphs
- Keep between 200-300 words

Generate a professional generalization plan suitable for an ABA assessment report.`
  },
}

// ============================================================================
// CONTENT GENERATION FUNCTION
// ============================================================================

/**
 * Generates ABA assessment content using Claude AI
 *
 * @param promptType - The type of content to generate (key from PROMPT_TEMPLATES)
 * @param data - The data needed for the specific prompt template
 * @returns Generated content as a string
 */
export async function generateABAContent(promptType: string, data: any): Promise<string> {
  try {
    // Get the appropriate prompt template
    const promptTemplate = PROMPT_TEMPLATES[promptType as keyof typeof PROMPT_TEMPLATES]
    if (!promptTemplate) {
      throw new Error(`Invalid prompt type: ${promptType}`)
    }

    // Generate the specific prompt
    const userPrompt = promptTemplate(data)

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
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed with status ${response.status}: ${errorText}`)
    }

    const result = await response.json()

    // Extract content from Claude's response
    if (result.content && Array.isArray(result.content) && result.content[0]?.text) {
      return result.content[0].text
    }

    throw new Error("Invalid response format from API")
  } catch (error) {
    console.error("[v0] Error generating ABA content:", error)
    throw error
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

interface SMARTValidation {
  isValid: boolean
  issues: string[]
  score: number // 0-100
}

/**
 * Validates if a goal meets SMART criteria
 *
 * @param goal - The goal text to validate
 * @returns Validation result with issues if any
 */
export function validateSMARTGoal(goal: string): SMARTValidation {
  const issues: string[] = []
  let score = 0

  // Check for measurable criteria (numerical values)
  const hasMeasurableCriteria = /(\d+\/\d+|\d+%|80%|70%|90%|\d+ out of \d+)/i.test(goal)
  if (hasMeasurableCriteria) {
    score += 25
  } else {
    issues.push('Missing measurable criteria (e.g., "8/10 trials", "80% accuracy")')
  }

  // Check for timeline
  const hasTimeline = /(within \d+ (months?|weeks?)|by [A-Z][a-z]+ \d+|in \d+ months?)/i.test(goal)
  if (hasTimeline) {
    score += 20
  } else {
    issues.push('Missing timeline (e.g., "within 6 months", "by December 2024")')
  }

  // Check for setting/conditions
  const hasConditions = /(in|across|with|during|when|given)/i.test(goal)
  if (hasConditions) {
    score += 20
  } else {
    issues.push('Missing setting or conditions (e.g., "in natural environment", "with minimal prompting")')
  }

  // Check for measurement method
  const hasMeasurement = /(as measured by|measured through|assessed via|using|data collection)/i.test(goal)
  if (hasMeasurement) {
    score += 20
  } else {
    issues.push('Missing measurement method (e.g., "as measured by direct observation")')
  }

  // Check for specific behavior (action verbs)
  const hasActionVerb = /(will|independently|spontaneously|correctly|appropriately)/i.test(goal)
  if (hasActionVerb) {
    score += 15
  } else {
    issues.push("Missing specific behavior description with action verbs")
  }

  // Bonus points for person-first language
  if (goal.toLowerCase().includes("will")) {
    score += 5
  }

  // Check minimum length (good goals are detailed)
  if (goal.length < 50) {
    issues.push("Goal is too brief - SMART goals should be detailed and specific")
    score -= 10
  }

  const isValid = issues.length === 0 && score >= 80

  return {
    isValid,
    issues,
    score: Math.max(0, Math.min(100, score)),
  }
}

/**
 * Suggests improvements for a goal that doesn't meet SMART criteria
 */
export function suggestGoalImprovements(goal: string): string[] {
  const validation = validateSMARTGoal(goal)
  const suggestions: string[] = []

  if (!validation.isValid) {
    suggestions.push(`Current score: ${validation.score}/100`)
    suggestions.push(...validation.issues.map((issue) => `• ${issue}`))

    suggestions.push("\nExample of a well-formed SMART goal:")
    suggestions.push(
      '"John will independently request preferred items using 2-3 word phrases in 8/10 opportunities across natural environments as measured by direct observation and data collection within 6 months."',
    )
  }

  return suggestions
}
