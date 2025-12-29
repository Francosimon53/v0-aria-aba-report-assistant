import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { observations } = await request.json()

    if (!observations || observations.length < 2) {
      return NextResponse.json(
        {
          error: "At least 2 observations are required for pattern analysis",
        },
        { status: 400 },
      )
    }

    // Format observations for the prompt
    const observationsText = observations
      .map(
        (obs: any, i: number) => `
Observation ${i + 1}:
- Antecedent: ${obs.antecedent || "Not provided"}
- Behavior: ${obs.behavior || "Not provided"}
- Consequence: ${obs.consequence || "Not provided"}
- Function: ${obs.function || "Not identified"}`,
      )
      .join("\n")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA analyzing ABC observation data to identify behavioral patterns.

OBSERVATIONS COLLECTED:
${observationsText}

Total observations: ${observations.length}

Analyze these ABC observations and provide a comprehensive pattern analysis. Return a JSON object with:

{
  "functionBreakdown": {
    "Escape": { "count": 0, "percentage": 0 },
    "Attention": { "count": 0, "percentage": 0 },
    "Tangible": { "count": 0, "percentage": 0 },
    "Automatic": { "count": 0, "percentage": 0 }
  },
  "primaryFunction": "The most common function",
  "secondaryFunction": "Second most common (or null if none)",
  "commonAntecedents": ["List of 2-3 common antecedent patterns identified"],
  "commonConsequences": ["List of 2-3 common consequence patterns identified"],
  "summary": "A 2-3 sentence clinical summary of the behavioral pattern suitable for an assessment report. Written in professional ABA language.",
  "recommendations": ["2-3 brief intervention recommendations based on the identified function(s)"],
  "confidence": "high|medium|low",
  "minimumObservationsMet": true/false (true if 4+ observations)
}

Return ONLY the JSON object, no markdown or extra text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0].text

    // Try to extract JSON from the response
    let result
    try {
      // First try direct parse
      result = JSON.parse(content)
    } catch {
      // Try to find JSON in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
      }
      result = JSON.parse(jsonMatch[0])
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing pattern:", error)
    return NextResponse.json({ error: "Failed to analyze pattern" }, { status: 500 })
  }
}
