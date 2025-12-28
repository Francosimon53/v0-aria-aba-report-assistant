import type { NextRequest } from "next/server"

export const maxDuration = 60

const REPORT_SECTION_PROMPT = `You are ARIA, an expert ABA (Applied Behavior Analysis) clinical writer specializing in comprehensive assessment reports for insurance submissions.

CRITICAL FORMATTING RULES:
- Write in plain text paragraphs only - NO markdown formatting
- NO headers with ##, no bold with **, no bullet points with -, no italics
- NO placeholders like [Date], [Name], [Level] - write complete, realistic clinical text
- Use professional clinical language appropriate for insurance and medical review
- Be specific and detailed with clinical observations
- Write 3-6 complete sentences per section
- Include quantifiable measures when appropriate (percentages, frequencies, durations)
- Use proper ABA terminology (contingency, reinforcement, prompting, fading, shaping, etc.)
- Reference DSM-5 criteria and evidence-based practices when relevant

SECTION-SPECIFIC GUIDELINES:
- For "Reason for Referral": Include referral source, presenting concerns, and family priorities
- For "Client Information": Include demographics and relevant identifying information
- For "Diagnosis": Reference DSM-5 criteria, onset, and severity specifiers
- For "Medical History": Include relevant medical conditions, medications, and developmental history
- For "Assessment Instruments": List tools used with validity and standardization notes
- For "Assessment Results": Include scores, percentiles, and clinical interpretations
- For "Behavioral Observations": Describe observed behaviors during assessment sessions
- For "Skill Assessments": Detail current skill levels across domains (communication, social, adaptive, etc.)
- For "Barriers to Treatment": Identify factors that may impact treatment progress
- For "Recommendations": Provide evidence-based treatment recommendations with hours justification
- For "Goals": Write SMART goals with baseline, target, and measurement criteria
- For "Treatment Plan": Detail intervention strategies and service delivery model
- For "Caregiver Training": Describe parent/caregiver involvement and training components
- For "Crisis Plan": Include safety protocols and emergency procedures if applicable
- For "Transition Plan": Address discharge criteria and transition planning
- For "Medical Necessity": Justify medical necessity using insurance criteria language

Remember: Write as if this is a final report ready for insurance submission. Use complete, professional clinical language.`

export async function POST(req: NextRequest) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return Response.json({ error: "AI service not configured", content: "" }, { status: 503 })
    }

    const body = await req.json()

    const {
      messages,
      clientDiagnosis,
      isReportSection,
      sectionType,
      clientData,
    }: {
      messages?: Array<{ role: string; content: string }>
      clientDiagnosis?: string
      isReportSection?: boolean
      sectionType?: string
      clientData?: any
    } = body

    // Build the user message from messages array or direct content
    let userMessage = ""
    if (messages && Array.isArray(messages) && messages.length > 0) {
      userMessage = messages[messages.length - 1]?.content || ""
    } else if (body.content) {
      userMessage = body.content
    } else if (body.prompt) {
      userMessage = body.prompt
    }

    if (!userMessage) {
      return Response.json({ error: "No message content provided" }, { status: 400 })
    }

    // Build context for the AI
    let contextInfo = ""
    if (clientDiagnosis) {
      contextInfo += `Client Diagnosis: ${clientDiagnosis}\n`
    }
    if (clientData?.firstName) {
      contextInfo += `Client Name: ${clientData.firstName} ${clientData.lastName || ""}\n`
    }
    if (clientData?.dateOfBirth) {
      contextInfo += `DOB: ${clientData.dateOfBirth}\n`
    }
    if (sectionType) {
      contextInfo += `Section Type: ${sectionType}\n`
    }

    // Determine max tokens based on section type
    const maxTokens = isReportSection ? 1500 : 500

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: REPORT_SECTION_PROMPT,
        messages: [
          {
            role: "user",
            content: `${contextInfo ? `[Context]\n${contextInfo}\n\n` : ""}${userMessage}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] AI Assistant API error:", errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    // Extract text from response
    let responseText = ""
    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      responseText = result.content[0]?.text || ""
    } else if (result.content && typeof result.content === "string") {
      responseText = result.content
    }

    if (!responseText) {
      throw new Error("No content received from AI")
    }

    // Clean up any markdown formatting that might have slipped through
    const cleanedText = responseText
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/\[([^\]]+)\]/g, "$1")
      .trim()

    return Response.json({
      content: cleanedText,
      success: true,
      sectionType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] AI Assistant error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        content: "",
        success: false,
      },
      { status: 500 },
    )
  }
}
