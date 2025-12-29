import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { goalTitle, goalDescription, domain, measurementType, targetPercentage, ageRange, baselineData } =
      await request.json()

    const today = new Date()

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
            content: `You are an expert BCBA estimating a realistic target date for an ABA therapy goal.

TODAY'S DATE: ${today.toISOString().split("T")[0]}

GOAL INFORMATION:
- Title: ${goalTitle}
- Description: ${goalDescription}
- Domain: ${domain}
- Measurement Type: ${measurementType}
- Target: ${targetPercentage}%
- Age Range: ${ageRange}
- Current Baseline: ${baselineData ? JSON.stringify(baselineData) : "Not provided"}

Based on typical ABA therapy progress rates and research:
- Skill acquisition goals: typically 3-6 months
- Behavior reduction goals: typically 4-8 months
- Complex skills (multi-step, abstract concepts): 6-12 months
- Simple skills (single-step, concrete): 1-3 months
- Communication goals (early learners): 4-6 months
- Social skills goals: 5-8 months
- Adaptive behavior goals: 4-7 months

Consider:
1. The complexity of the skill/behavior
2. The gap between baseline and target
3. Typical learning curves for this domain and age range
4. The measurement type and mastery criteria
5. Client age and developmental level

Return a JSON object with:
{
  "targetDate": "YYYY-MM-DD",
  "estimatedWeeks": number,
  "reasoning": "Brief explanation (1 sentence)"
}

Be realistic and evidence-based. Return ONLY the JSON object, no other text.`,
          },
        ],
      }),
    })

    const data = await response.json()
    const content = data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      // Default to 6 months if AI fails
      const defaultDate = new Date(today)
      defaultDate.setMonth(defaultDate.getMonth() + 6)
      return NextResponse.json({
        targetDate: defaultDate.toISOString().split("T")[0],
        reasoning: "Default estimate of 6 months based on typical ABA progress rates",
      })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error suggesting target date:", error)
    // Default fallback
    const defaultDate = new Date()
    defaultDate.setMonth(defaultDate.getMonth() + 6)
    return NextResponse.json({
      targetDate: defaultDate.toISOString().split("T")[0],
      reasoning: "Default estimate of 6 months based on typical ABA progress rates",
    })
  }
}
