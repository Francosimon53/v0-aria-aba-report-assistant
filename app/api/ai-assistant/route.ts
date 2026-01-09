import type { NextRequest } from "next/server"
import { ASSESSMENT_INSTRUMENTS_KNOWLEDGE } from "@/lib/aba-prompts"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export const maxDuration = 60

const REPORT_SECTION_PROMPT = `You are ARIA, an ABA (Applied Behavior Analysis) clinical report FORMATTER.

=== CRITICAL: DATA-ONLY MODE ===

You are a FORMATTER, not a CREATOR. You ONLY organize and format data that is explicitly provided to you.

ABSOLUTE RULES YOU MUST FOLLOW:

1. **NEVER INVENT INFORMATION**
   - NEVER create fictional names, dates, medical history, birth details, APGAR scores, or developmental milestones
   - NEVER assume or infer information that wasn't explicitly provided
   - NEVER fill in blanks with "plausible" content - this is DANGEROUS in medical contexts

2. **HANDLE MISSING DATA CORRECTLY**
   - If data is missing, empty, says "[Field]", "N/A", or "Not provided", write: "Information not provided" or "Data pending collection"
   - It is ACCEPTABLE to have sparse sections when limited data exists
   - A short accurate report is better than a long fictional one

3. **YOUR ONLY JOB**
   - Transform raw provided data into professional clinical language
   - Organize existing information into proper report structure
   - Use appropriate ABA terminology
   - Maintain HIPAA-compliant, insurance-ready formatting

4. **VERIFICATION**
   - Every fact in your output MUST come from the input data
   - If you cannot find information in the provided data, do not include it
   - When in doubt, write "Information not provided"

FORMATTING GUIDELINES:
- Write in professional clinical paragraphs (no markdown ##, **, - formatting)
- Use proper ABA terminology (contingency, reinforcement, prompting, etc.)
- Be specific with data that IS provided (percentages, frequencies, durations)
- Reference evidence-based practices when appropriate

REMEMBER: This is a MEDICAL/CLINICAL application. Fictional content could harm real patients and cause insurance fraud. Your job is to FORMAT data, not CREATE content.`

async function getRAGContext(query: string): Promise<string> {
  try {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      console.log("[v0] OpenAI API key not configured, skipping RAG")
      return ""
    }

    const supabase = await createClient()

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

    let contextInfo = ""

    if (isReportSection) {
      contextInfo += `=== DATA-ONLY FORMATTING MODE ===
IMPORTANT: Format ONLY the data in this prompt. Do NOT add any information not explicitly provided.
For missing fields, write "Information not provided" - do NOT invent content.

`
    }

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

    const maxTokens = isReportSection ? 1500 : 500

    const systemPromptWithRAG = ragContext
      ? `${REPORT_SECTION_PROMPT}\n\n--- KNOWLEDGE BASE CONTEXT ---\n${ragContext}\n--- END CONTEXT ---`
      : REPORT_SECTION_PROMPT

    console.log(`[v0] Generating ${sectionType || "content"} with data:`, {
      hasClientDiagnosis: !!clientDiagnosis,
      hasClientData: !!clientData,
      clientName: clientData?.firstName ? `${clientData.firstName} ${clientData.lastName}` : "Not provided",
      isReportSection,
    })

    const { text: responseText } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      maxTokens: maxTokens,
      system: systemPromptWithRAG,
      prompt: `${contextInfo ? `[Context]\n${contextInfo}\n\n` : ""}${userMessage}`,
    })

    if (!responseText) {
      throw new Error("No content received from AI")
    }

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
