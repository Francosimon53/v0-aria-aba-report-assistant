import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { field, existingData } = await request.json()

    if (!field || !["antecedent", "behavior", "consequence"].includes(field)) {
      return NextResponse.json({ error: "Invalid field specified" }, { status: 400 })
    }

    const prompts = {
      antecedent: `You are an expert BCBA writing ABC observation data.

Generate a realistic, clinically appropriate ANTECEDENT description for a behavioral observation.

${existingData?.behavior ? `The behavior being observed is: ${existingData.behavior}` : ""}
${existingData?.consequence ? `The consequence that followed was: ${existingData.consequence}` : ""}

The antecedent should describe what happened IMMEDIATELY BEFORE the behavior occurred. Include:
- Setting/environment details
- Who was present
- What activity was occurring
- What demand, transition, or trigger happened

Write 1-2 sentences that are specific, objective, and observable. Do NOT include interpretations.

Return ONLY the antecedent description text, no quotes or extra formatting.`,

      behavior: `You are an expert BCBA writing ABC observation data.

Generate a realistic, clinically appropriate BEHAVIOR description for a behavioral observation.

${existingData?.antecedent ? `The antecedent was: ${existingData.antecedent}` : ""}
${existingData?.consequence ? `The consequence that followed was: ${existingData.consequence}` : ""}

The behavior description should be:
- Specific and observable (what you could see/hear)
- Measurable (could count or time it)
- Objective (no interpretations like "was angry")
- Written in past tense

Write 1-2 sentences describing the EXACT behavior. Include topography (what it looked like).

Return ONLY the behavior description text, no quotes or extra formatting.`,

      consequence: `You are an expert BCBA writing ABC observation data.

Generate a realistic, clinically appropriate CONSEQUENCE description for a behavioral observation.

${existingData?.antecedent ? `The antecedent was: ${existingData.antecedent}` : ""}
${existingData?.behavior ? `The behavior was: ${existingData.behavior}` : ""}

The consequence should describe what happened IMMEDIATELY AFTER the behavior. Include:
- How others responded (or didn't respond)
- What the person gained or avoided
- Environmental changes that occurred

Write 1-2 sentences that clearly show the outcome. This should hint at the function (attention gained, demand removed, item obtained, or sensory feedback).

Return ONLY the consequence description text, no quotes or extra formatting.`,
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: prompts[field as keyof typeof prompts],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const generatedText = data.content[0].text.trim()

    return NextResponse.json({ text: generatedText })
  } catch (error) {
    console.error("Error generating ABC field:", error)
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 })
  }
}
