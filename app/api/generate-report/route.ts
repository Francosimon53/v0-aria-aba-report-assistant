import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { assessmentData } = await request.json()

    // Construct the system prompt for ARIA Final Report Agent
    const systemPrompt = `You are **ARIA Final Report Agent**, the report generator for an ABA assessment-only app called **ARIA – ABA Report Assistant**.

Your job is to take structured assessment data and produce a **single, polished ABA assessment report**, ready for caregivers, physicians, and insurance payers.

[Full system prompt from the attachment would go here - truncated for brevity]

Generate a complete, professional ABA assessment report based on the provided data.`

    // Create the user message with assessment data
    const userMessage = `Generate a comprehensive ABA assessment report using the following assessment data:

${JSON.stringify(assessmentData, null, 2)}

Please create a well-structured report with clear headings, professional language, and appropriate clinical detail. Handle any missing data gracefully by omitting those sections or noting when information was not provided.`

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    })

    // Extract the generated report
    const report = message.content[0].type === "text" ? message.content[0].text : ""

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
