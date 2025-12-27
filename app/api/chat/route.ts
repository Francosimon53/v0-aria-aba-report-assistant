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

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      clientData,
      currentStep,
      isTextGeneration, // Added isTextGeneration flag
    }: {
      messages: Array<{ role: string; content: string }>
      clientData?: any
      currentStep?: string
      isTextGeneration?: boolean // Added type
    } = await req.json()

    if (!messages || !Array.isArray(messages)) {
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

    const systemPrompt = isTextGeneration
      ? `You are ARIA, an expert ABA (Applied Behavior Analysis) clinical writer. Generate professional, detailed, and clinically appropriate content for ABA assessment reports. Use proper clinical terminology, be thorough but concise, and follow BACB ethical guidelines.`
      : CONCISE_CHAT_PROMPT

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
        max_tokens: maxTokens, // Use dynamic token limit
        system: systemPrompt, // Use appropriate system prompt
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
    const responseText = result.content?.[0]?.text || "Got it! Check the form fields on the left."

    console.log("[v0] API response:", { responseText: responseText.substring(0, 100) + "..." })

    return Response.json({
      message: responseText,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
