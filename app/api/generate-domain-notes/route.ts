import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { assessmentType, domainName, score, maxScore } = await request.json()

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA writing clinical assessment notes for an ABA therapy report.

ASSESSMENT: ${assessmentType}
DOMAIN: ${domainName}
CURRENT SCORE: ${score}% (out of ${maxScore}%)

Write 2-3 concise sentences of clinical notes describing the client's performance in this domain. Your notes should:

1. Describe the client's current skill level objectively
2. Mention specific skills demonstrated or lacking within this domain
3. Include clinical implications for treatment planning
4. Use professional ABA terminology

Be specific, objective, and clinically relevant. Avoid vague statements.

Return ONLY the clinical notes text with no additional formatting, introductions, or explanations.`,
          },
        ],
      }),
    })

    const data = await response.json()
    const notes = data.content[0].text.trim()

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error generating domain notes:", error)
    return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 })
  }
}
