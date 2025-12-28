import type { NextRequest } from "next/server"

export const maxDuration = 60

const PROMPTS = {
  default: `You are ARIA, a brief ABA assistant. 
CRITICAL RULES:
1. Maximum 2 sentences per response
2. Be direct and actionable
3. Never ask follow-up questions unless absolutely necessary
4. If user asks for help, give ONE specific tip immediately
5. End conversations naturally - don't keep asking "what else?"`,

  support: `You are ARIA Support Assistant, helping users with ARIA ABA Report software.

KNOWLEDGE BASE:
- ARIA helps BCBAs create ABA assessment reports, progress notes, and medical necessity documentation
- Plans: Starter ($49/mo, 5 reports), Professional ($99/mo, 25 reports), Enterprise ($249/mo, unlimited)
- Features: AI-powered report generation, insurance-compliant templates, goal banks, data visualization
- HIPAA compliant with encrypted data storage
- Supports Medicaid, TRICARE, and major private insurers
- Team collaboration available on Professional (5 users) and Enterprise (unlimited)
- Cancel anytime from Account Settings
- Reports can be exported as PDF, Word, or copied to clipboard
- Email support responds within 24 hours

RESPONSE RULES:
1. Maximum 2-3 sentences per response
2. Be helpful, friendly, and specific
3. If you don't know something, suggest contacting support@aria-aba.com
4. For billing issues, direct to Account Settings or support email
5. Answer questions directly without being repetitive`,

  compliance: `You are ARIA Compliance Assistant, expert in ABA therapy regulations.
CRITICAL RULES:
1. Maximum 2-3 sentences per response
2. Cite specific regulations when relevant (HIPAA, BACB guidelines)
3. Be precise but accessible
4. For complex questions, provide a brief answer then offer to elaborate`,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    let messages: Array<{ role: string; content: string }> = []
    const context = body.context || "default"

    // Handle single message format (from support chat)
    if (body.message && typeof body.message === "string") {
      messages = [{ role: "user", content: body.message }]
    } else if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages
    } else {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { clientData, currentStep } = body

    let contextInfo = ""
    if (clientData?.firstName) {
      contextInfo += `Client: ${clientData.firstName}`
    }
    if (currentStep) {
      contextInfo += `, Current step: ${currentStep}`
    }

    const systemPrompt = PROMPTS[context as keyof typeof PROMPTS] || PROMPTS.default

    const formattedMessages = messages.map((msg, idx) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: idx === messages.length - 1 && contextInfo ? `[${contextInfo}] ${msg.content}` : msg.content,
    }))

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: systemPrompt,
        messages: formattedMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const responseText = result.content?.[0]?.text || "I'm here to help! Could you tell me more about what you need?"

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
