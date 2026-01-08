import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { antecedent, behavior, consequence } = body

    if (!antecedent || !behavior || !consequence) {
      return NextResponse.json({ error: "Missing required fields: antecedent, behavior, consequence" }, { status: 400 })
    }

    const prompt = `Based on the following ABC (Antecedent-Behavior-Consequence) observation, determine the most likely function of the behavior.

Antecedent (what happened before): ${antecedent}

Behavior (what the person did): ${behavior}

Consequence (what happened after): ${consequence}

The four functions of behavior in ABA are:
1. Attention - To gain social attention or interaction from others
2. Escape - To avoid or escape demands, tasks, or situations
3. Tangible - To gain access to preferred items or activities
4. Automatic/Sensory - For internal sensory stimulation (not dependent on external factors)

Analyze this observation and respond with ONLY one of these exact values:
- "Attention - To gain social attention or interaction"
- "Escape - To avoid or escape demands/tasks"
- "Tangible - To gain access to items or activities"
- "Automatic/Sensory - For internal sensory stimulation"

Do not include any other text, just the function.`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const functionResult =
      message.content[0].type === "text"
        ? message.content[0].text.trim()
        : "Attention - To gain social attention or interaction"

    return NextResponse.json({ function: functionResult })
  } catch (error) {
    console.error("[v0] Error analyzing ABC function:", error)
    return NextResponse.json({ error: "Failed to analyze function" }, { status: 500 })
  }
}
