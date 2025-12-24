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
