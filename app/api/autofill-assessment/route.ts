import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { assessmentType, domains } = await req.json()

    const prompt = `You are an expert ABA clinician creating realistic assessment data for a ${assessmentType} assessment.

Generate realistic scores and clinical notes for each of the following domains:
${domains.map((d: string, i: number) => `${i + 1}. ${d}`).join("\n")}

For each domain, provide:
- A realistic score (0-100)
- 2-3 sentences of clinical notes describing the client's performance

Also generate:
- 3-4 key strengths
- 3-4 areas of deficit requiring intervention
- 2-3 learning barriers

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "results": [
    {
      "domain": "Domain Name",
      "score": 75,
      "notes": "Clinical observation notes here."
    }
  ],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "deficits": ["Deficit 1", "Deficit 2", "Deficit 3"],
  "barriers": ["Barrier 1", "Barrier 2"]
}

Make scores varied (some high, some low) and clinically realistic. Use objective behavioral language.`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === "text" ? message.content[0].text : ""

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const data = JSON.parse(jsonMatch[0])

    return Response.json(data)
  } catch (error) {
    console.error("Error generating assessment data:", error)
    return Response.json({ error: "Failed to generate assessment data" }, { status: 500 })
  }
}
