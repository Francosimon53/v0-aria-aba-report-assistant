import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { recommendedHours, strengths, deficits, barriers, domainScores } = await request.json()

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
            content: `You are an expert BCBA writing medical necessity justification for ABA therapy hours.

RECOMMENDED HOURS: ${recommendedHours} hours per week

CLIENT PROFILE:
- Strengths: ${JSON.stringify(strengths)}
- Deficits: ${JSON.stringify(deficits)}
- Learning Barriers: ${JSON.stringify(barriers)}
- Domain Scores: ${JSON.stringify(domainScores)}

Write a clinical justification (3-4 paragraphs) for why this client requires ${recommendedHours} hours per week of ABA therapy. Include:

1. Summary of assessment findings and skill deficits across developmental domains
2. Specific treatment needs based on identified deficits and barriers
3. Clinical rationale for the recommended intensity level (hours per week)
4. Expected therapeutic outcomes with the recommended service hours

Use professional clinical language appropriate for insurance authorization requests. Be specific about the relationship between the client's needs and the recommended intensity.

Return ONLY the justification text, no additional formatting or commentary.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error("Anthropic API request failed")
    }

    const data = await response.json()
    const justification = data.content[0].text

    return NextResponse.json({ justification })
  } catch (error) {
    console.error("Error generating hours justification:", error)
    return NextResponse.json({ error: "Failed to generate hours justification" }, { status: 500 })
  }
}
