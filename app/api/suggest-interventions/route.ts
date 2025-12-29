import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { goals } = await request.json()

    if (!goals || goals.length === 0) {
      return NextResponse.json({ suggestions: [] })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA analyzing treatment goals to suggest appropriate evidence-based interventions.

TREATMENT GOALS:
${JSON.stringify(goals, null, 2)}

Analyze these goals and suggest 5-8 of the most appropriate interventions. For each goal domain or target behavior, recommend specific intervention strategies.

Return a JSON array with this exact structure:
[
  {
    "name": "Intervention name (be specific)",
    "function": "Attention|Escape|Tangible|Automatic",
    "category": "Preventive|Replacement|Management|Consequence",
    "reason": "Brief clinical explanation why this intervention matches the goal (1-2 sentences)",
    "goalId": "ID or title of the related goal"
  }
]

Guidelines:
- Match interventions to behavioral functions evident in the goals
- Prioritize evidence-based strategies (FCT, DRA, DRI, NCR, task analysis, etc.)
- Include a mix of preventive, replacement, and management strategies
- Consider the client's developmental level and skill deficits
- Focus on functionally equivalent replacement behaviors
- Ensure interventions address the maintaining variables

Return ONLY the JSON array, no additional text or formatting.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      console.error("No valid JSON found in response:", content)
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error suggesting interventions:", error)
    return NextResponse.json({ error: "Failed to suggest interventions" }, { status: 500 })
  }
}
