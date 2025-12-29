import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { deficits, domainScores, availableBehaviors } = await request.json()

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
            content: `You are an expert BCBA analyzing assessment data to identify likely problem behaviors.

CLIENT ASSESSMENT DATA:
- Deficits: ${JSON.stringify(deficits)}
- Domain Scores: ${JSON.stringify(domainScores)}

AVAILABLE BEHAVIOR TEMPLATES:
${availableBehaviors.join(", ")}

Based on the deficits and low domain scores, identify 3-5 problem behaviors that are MOST LIKELY to be present in this client. Consider:
1. Communication deficits often correlate with aggression, tantrums, and non-compliance
2. Social skill deficits often correlate with social withdrawal/avoidance and non-compliance
3. Low adaptive behavior skills often correlate with tantrum behaviors
4. Attention difficulties often correlate with elopement and non-compliance
5. Self-regulation deficits often correlate with self-injury and stereotypy

Return a JSON array with this structure:
[
  {
    "name": "Behavior name from the available templates (MUST match exactly)",
    "risk": "high|medium|low",
    "reason": "Brief clinical explanation of why this behavior is likely based on the assessment data (one sentence)",
    "function": "escape|attention|tangible|sensory"
  }
]

Rules:
- Only suggest behaviors from the available templates list
- Match the exact behavior name from the list
- Provide clinical reasoning based on the actual deficits and scores
- Prioritize high-risk behaviors if assessment data suggests them
- Return ONLY the JSON array, no other text`,
          },
        ],
      }),
    })

    const data = await response.json()
    const content = data.content[0].text

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      console.error("No JSON found in response:", content)
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error suggesting behaviors:", error)
    return NextResponse.json({ error: "Failed to suggest behaviors" }, { status: 500 })
  }
}
