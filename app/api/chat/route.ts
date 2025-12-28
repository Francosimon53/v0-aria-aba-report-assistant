import type { NextRequest } from "next/server"

export const maxDuration = 60

const CONCISE_CHAT_PROMPT = `You are ARIA, a brief ABA assistant. 

CRITICAL RULES:
1. Maximum 2 sentences per response
2. Be direct and actionable
3. Never ask follow-up questions unless absolutely necessary
4. If user asks for help, give ONE specific tip immediately
5. End conversations naturally - don't keep asking "what else?"

Examples:
- User: "Help with goals" → "For behavior reduction, use measurable terms like 'reduce aggression from 10 to 3 incidents per week.' Click a goal template below to start."
- User: "What info do I need?" → "Start with client name, DOB, diagnosis, and insurance. The required fields are marked with red asterisks."
- User: "Thanks" → "You're welcome! The form auto-saves as you go."

If the user seems done or says thanks/ok/got it, just acknowledge briefly and stop.`

const ABA_WRITING_PROMPT = `You are ARIA, an expert ABA (Applied Behavior Analysis) clinical writer specializing in assessment reports.

CRITICAL FORMATTING RULES:
- Write in plain text paragraphs only - NO markdown formatting
- NO headers with ##, no bold with **, no bullet points with -, no italics
- NO placeholders like [Date], [Name], [Level], [specific level] - write complete realistic text
- Use professional clinical language appropriate for insurance submissions
- Be specific and detailed with actual examples, not generic templates
- Write 2-4 complete sentences with proper clinical observations
- Include quantifiable measures when appropriate (percentages, frequencies, durations)
- Use proper ABA terminology (contingency, reinforcement, prompting, fading, etc.)

EXAMPLES OF GOOD OUTPUT:
"The client demonstrates emerging receptive language skills with consistent responses to one-step directions in 75% of opportunities across three consecutive sessions. Comprehension of basic nouns and action verbs is solidly established, while understanding of prepositions and temporal concepts requires visual supports and verbal prompting."

"During structured play activities, the client exhibited joint attention behaviors including coordinated eye gaze and shared enjoyment approximately 40% of the time. These social communication skills showed improvement from baseline levels of 15%, suggesting positive response to peer-mediated intervention strategies."

EXAMPLES OF BAD OUTPUT (NEVER DO THIS):
"## Receptive Language Skills
**Current Level:** [Emerging/Mastered]
- One-step directions: [percentage]%"

"The client shows [specific level] of joint attention during [activity type]."

Remember: Write as if this is a final report ready for submission. Use complete, professional sentences with real data.`

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      clientData,
      currentStep,
      isTextGeneration,
    }: {
      messages: Array<{ role: string; content: string }>
      clientData?: any
      currentStep?: string
      isTextGeneration?: boolean
    } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let contextInfo = ""
    if (clientData?.firstName) {
      contextInfo += `Client: ${clientData.firstName}`
    }
    if (currentStep) {
      contextInfo += `, Current step: ${currentStep}`
    }

    const userMessage = messages[messages.length - 1]?.content || ""

    const systemPrompt = isTextGeneration ? ABA_WRITING_PROMPT : CONCISE_CHAT_PROMPT

    const maxTokens = isTextGeneration ? 1000 : 100

    console.log("[v0] API request:", { isTextGeneration, maxTokens, userMessage })

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `${contextInfo ? `[${contextInfo}] ` : ""}${userMessage}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Claude API error:", errorText)
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    console.log("[v0] Raw API result:", JSON.stringify(result, null, 2))

    let responseText = "Got it! Check the form fields on the left."

    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      responseText = result.content[0]?.text || responseText
    } else if (result.content && typeof result.content === "string") {
      responseText = result.content
    } else {
      console.error("[v0] Unexpected content format:", result.content)
    }

    console.log("[v0] API response:", { responseText: responseText.substring(0, 100) + "..." })

    const cleanedText = (typeof responseText === "string" ? responseText : String(responseText))
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/\[([^\]]+)\]/g, "$1")
      .trim()

    return Response.json({
      message: cleanedText,
    })
  } catch (error) {
    console.error("[v0] API error details:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
