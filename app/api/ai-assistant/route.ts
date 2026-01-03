import type { NextRequest } from "next/server"
import { ASSESSMENT_INSTRUMENTS_KNOWLEDGE } from "@/lib/aba-prompts"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

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

ASSESSMENT INSTRUMENTS KNOWLEDGE:
You have access to detailed information about major ABA assessment tools:
- VB-MAPP: 170 milestones across 16 domains, levels 1-3 (0-48 months)
- ABLLS-R: 544 skills across 15 domains, scored 0-4
- AFLS: 6 protocols for functional living skills
- Vineland-3: Norm-referenced adaptive behavior (Communication, Daily Living, Socialization, Motor)
- PEAK: 184 programs across 4 modules (Direct Training, Generalization, Equivalence, Transformation)
- ADOS-2: Gold standard diagnostic tool with 5 modules
- Essentials for Living: 2700 skills for moderate-to-severe disabilities

When writing "Assessment Instruments" or "Assessment Results" sections, include:
- Full instrument names and authors
- Domains assessed and scoring methodology
- Clinical interpretation of scores
- Insurance-relevant reporting guidelines

SECTION-SPECIFIC GUIDELINES:
- For "Reason for Referral": Include referral source, presenting concerns, and family priorities
- For "Client Information": Include demographics and relevant identifying information
- For "Diagnosis": Reference DSM-5 criteria, onset, and severity specifiers
- For "Medical History": Include relevant medical conditions, medications, and developmental history
- For "Assessment Instruments": List tools used with validity, standardization notes, and proper citations
- For "Assessment Results": Include scores, percentiles, clinical interpretations, and functional implications
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

async function getRAGContext(query: string): Promise<string> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      console.log("[v0] OpenAI API key not configured, skipping RAG")
      return ""
    }

    // Use AI SDK for embeddings via the gateway
    const { generateText: generateEmbedding } = await import("ai")

    // For now, skip RAG if we can't create embeddings easily
    // The main generation will still work
    const supabase = await createClient()

    // Try a simple text search instead of embeddings
    const { data: matches, error } = await supabase
      .from("rag_embeddings")
      .select("content")
      .textSearch("content", query.split(" ").slice(0, 3).join(" & "))
      .limit(3)

    if (error || !matches || matches.length === 0) {
      return ""
    }

    console.log(`[v0] Found ${matches.length} RAG matches`)
    return matches.map((m: any) => m.content).join("\n\n---\n\n")
  } catch (error) {
    console.error("[v0] RAG query error:", error)
    return ""
  }
}

export async function POST(req: NextRequest) {
  try {
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

    let ragContext = ""
    if (isReportSection && sectionType) {
      console.log(`[v0] Fetching RAG context for section: ${sectionType}`)
      ragContext = await getRAGContext(`${sectionType} ABA assessment report insurance documentation`)
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

    if (
      sectionType === "assessments" ||
      sectionType === "assessment-results" ||
      userMessage.toLowerCase().includes("assessment")
    ) {
      contextInfo += "\n[Assessment Instruments Available]\n"
      contextInfo += Object.entries(ASSESSMENT_INSTRUMENTS_KNOWLEDGE)
        .map(([key, value]) => `${key}: ${value.fullName} by ${value.author || "standard"}`)
        .join("\n")
      contextInfo += "\n"
    }

    // Determine max tokens based on section type
    const maxTokens = isReportSection ? 1500 : 500

    const systemPromptWithRAG = ragContext
      ? `${REPORT_SECTION_PROMPT}\n\n--- KNOWLEDGE BASE CONTEXT ---\n${ragContext}\n--- END CONTEXT ---`
      : REPORT_SECTION_PROMPT

    const { text: responseText } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      maxTokens: maxTokens,
      system: systemPromptWithRAG,
      prompt: `${contextInfo ? `[Context]\n${contextInfo}\n\n` : ""}${userMessage}`,
    })

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
