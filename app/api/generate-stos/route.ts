import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { goalTitle, goalDescription, domain, currentBaseline, targetCriteria } = await request.json()

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return Response.json({ error: "AI service not configured" }, { status: 503 })
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA creating Short-Term Objectives (STOs) for an ABA treatment plan.

Goal Information:
- Title: ${goalTitle}
- Description: ${goalDescription}
- Domain: ${domain}
- Current Baseline: ${currentBaseline}
- Target Criteria: ${targetCriteria}

Generate 3-5 Short-Term Objectives that break down this long-term goal into measurable, achievable steps. Each STO should:
1. Be a progressive step toward the long-term goal
2. Have a clear, measurable criterion
3. Include baseline, mastery criteria, and expected progress
4. Follow a logical progression from easier to more difficult

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "stos": [
    {
      "description": "Brief description of the STO",
      "baseline": "Current performance (e.g., '0%', '2/10 trials', '0 occurrences')",
      "masteryCriteria": "Mastery criterion (e.g., '80% over 3 sessions', '8/10 trials over 2 sessions')",
      "progress": 0
    }
  ]
}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const result = await response.json()
    const textContent = result.content?.[0]?.text

    if (!textContent) {
      throw new Error("No content in AI response")
    }

    // Parse the JSON response
    const data = JSON.parse(textContent)

    // Add IDs and status to each STO
    const stos = data.stos.map((sto: any, index: number) => ({
      id: `sto-${Date.now()}-${index}`,
      description: sto.description,
      baseline: sto.baseline,
      current: sto.baseline, // Start at baseline
      masteryCriteria: sto.masteryCriteria,
      status: "not-started",
      progress: sto.progress || 0,
    }))

    return Response.json({ stos })
  } catch (error) {
    console.error("Error generating STOs:", error)
    return Response.json({ error: "Failed to generate STOs" }, { status: 500 })
  }
}
