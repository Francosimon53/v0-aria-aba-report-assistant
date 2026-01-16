import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { question, context } = await request.json()

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: `You are ARIA's friendly help assistant. Answer questions about how to use the ARIA ABA Assessment platform.

RULES:
- Be concise and helpful
- Use the provided context to answer accurately
- If you don't know, say so and suggest contacting support
- Use bullet points or numbered steps when explaining processes
- Be encouraging and friendly
- Keep responses under 150 words unless more detail is needed`,
      messages: [
        {
          role: "user",
          content: `Context from ARIA documentation:
${context}

User question: ${question}

Provide a helpful, concise answer based on the context.`,
        },
      ],
    })

    const answer = message.content[0].type === "text" ? message.content[0].text : ""
    return NextResponse.json({ answer })
  } catch (error) {
    console.error("[v0] Help chat error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
