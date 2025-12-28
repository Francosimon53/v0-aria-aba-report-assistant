import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const SYSTEM_PROMPT = `You are ARIA, an AI assistant specialized in helping BCBAs (Board Certified Behavior Analysts) create insurance-compliant ABA assessment reports.

Your expertise includes:
- Medical necessity statements for ABA therapy
- Insurance requirements for Aetna, BCBS, Medicaid, UnitedHealthcare, Cigna, Anthem
- SMART goal writing for behavior intervention plans
- CPT codes (97151, 97152, 97153, 97154, 97155, 97156, 97157, 97158)
- Functional Behavior Assessments (FBA)
- Treatment plan documentation
- Parent training documentation requirements

Guidelines:
- Be concise and professional
- Provide actionable advice
- Reference specific insurance requirements when relevant
- Help write compliant documentation language
- Suggest evidence-based interventions

Always maintain HIPAA awareness - remind users not to share actual client PHI in the chat.`

const MEDICAL_NECESSITY_SYSTEM_PROMPT = `You are an expert medical writer specializing in ABA therapy medical necessity statements for insurance authorization.

CRITICAL FORMATTING RULES:
1. Write in flowing professional prose - NO headers, NO bullet points, NO numbered lists
2. Write 3-4 substantial paragraphs (300-400 words total)
3. Each paragraph should flow naturally covering: diagnosis/impact, skill deficits, treatment rationale, intensity justification
4. Use clinical terminology appropriately
5. Be specific with examples but don't fabricate data
6. Reference evidence-based practices naturally in the text

STRUCTURE (as prose, not sections):
- Paragraph 1: Client presentation, diagnosis, and overall functional impact on daily life
- Paragraph 2: Specific skill deficits across communication, social, adaptive, and behavioral domains
- Paragraph 3: Why ABA therapy is medically necessary and the most appropriate treatment
- Paragraph 4: Justification for recommended treatment intensity and expected outcomes

NEVER use:
- Headers or section titles
- Bullet points or numbered lists
- Generic placeholder language like "[Client Name]"
- Excessive jargon without context`

const REPORT_SECTION_SYSTEM_PROMPT = `You are an expert BCBA and medical writer specializing in comprehensive ABA assessment reports for insurance authorization.

CRITICAL REQUIREMENTS:
1. Write SUBSTANTIAL, DETAILED content - this is a professional clinical document
2. Use proper clinical terminology and evidence-based language
3. Be specific and thorough - reports should be 30-65 pages total
4. Include all required components for each section
5. Write in professional third-person clinical style
6. Reference specific assessment data provided
7. Follow insurance documentation requirements

FORMATTING GUIDELINES:
- Use clear section headers and subheaders where appropriate
- Use tables for data presentation (service recommendations, ABC observations, etc.)
- Use numbered lists for procedures and step-by-step instructions
- Use bullet points for lists of items, behaviors, or goals
- Write goals in measurable, observable terms with specific criteria
- Include baseline data and target criteria for all goals
- Write operational definitions that are observable and measurable

CONTENT REQUIREMENTS:
- Each behavior must have a complete operational definition with inclusions/exclusions
- Each goal must have an LTO and 7-11 progressive STOs with specific criteria
- Interventions must be described in detail with implementation steps
- Teaching procedures must include complete prompt hierarchies and fading criteria
- All recommendations must be justified with clinical reasoning

Write content that would be accepted by major insurance companies (Aetna, BCBS, UnitedHealthcare, Cigna, Anthem, Medicaid).`

export async function POST(req: NextRequest) {
  try {
    const { messages, currentStep, clientDiagnosis, isReportSection } = await req.json()

    console.log("[v0] Generating medical necessity statement, step:", currentStep)
    console.log("[v0] Messages length:", messages?.length)

    const lastMessage = messages[messages.length - 1]?.content || ""
    const isMedicalNecessity =
      lastMessage.toLowerCase().includes("medical necessity") ||
      lastMessage.toLowerCase().includes("necessity statement") ||
      currentStep === 10

    let systemPrompt = SYSTEM_PROMPT
    let maxTokens = 1024

    if (isReportSection) {
      systemPrompt = REPORT_SECTION_SYSTEM_PROMPT
      maxTokens = 4096
    } else if (isMedicalNecessity) {
      systemPrompt = MEDICAL_NECESSITY_SYSTEM_PROMPT
      maxTokens = 2048
    }

    let contextInfo = ""
    if (currentStep) {
      contextInfo += `\n[User is currently on Step ${currentStep} of the assessment wizard]`
    }
    if (clientDiagnosis) {
      contextInfo += `\n[Client diagnosis: ${clientDiagnosis}]`
    }

    console.log("[v0] Calling AI Gateway with Claude Sonnet 4")
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4",
      maxTokens,
      system: systemPrompt + contextInfo,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    })

    console.log("[v0] Successfully generated content, length:", text.length)
    return NextResponse.json({ content: text })
  } catch (error) {
    console.error("[v0] AI Assistant API error:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        content: `I'm having trouble connecting right now. Error: ${errorMessage}. Please try again in a moment.`,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
