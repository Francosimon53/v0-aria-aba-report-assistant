import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { goalTitle, goalDescription, measurementType, criteria, ageRange } = await request.json()

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
            content: `You are an expert BCBA generating realistic baseline data for an ABA therapy goal. Return ONLY valid JSON, no other text.

Goal: ${goalTitle}
Description: ${goalDescription}
Measurement Type: ${measurementType}
Mastery Criteria: ${criteria}
Age Range: ${ageRange}

Generate realistic BASELINE data (BEFORE intervention). Return JSON with these fields based on measurement type:

For Frequency: { "currentRate": number, "rateUnit": "hour"|"day"|"session"|"week", "promptLevel": "independent"|"gesture"|"verbal"|"model"|"partial_physical"|"full_physical", "setting": "home"|"clinic"|"school"|"community"|"multiple", "dataSource": "direct_observation"|"parent_report"|"teacher_report"|"assessment"|"probe", "collectionPeriod": number }

For Accuracy/Discrete Trial/Opportunity: { "percentCorrect": number (10-30), "totalTrials": number, "promptLevel": ..., "setting": ..., "dataSource": ..., "collectionPeriod": number }

For Duration: { "averageDuration": number, "durationUnit": "seconds"|"minutes"|"hours", "promptLevel": ..., "setting": ..., "dataSource": ..., "collectionPeriod": number }

For Task Analysis: { "stepsCompleted": number, "totalSteps": number, "promptLevel": ..., "setting": ..., "dataSource": ..., "collectionPeriod": number }

For Interval: { "percentIntervals": number, "observationDuration": number, "promptLevel": ..., "setting": ..., "dataSource": ..., "collectionPeriod": number }

The baseline should be significantly below mastery criteria. Return ONLY the JSON object.`,
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error("Anthropic API error:", data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const content = data.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
    }

    const baselineData = JSON.parse(jsonMatch[0])
    return NextResponse.json(baselineData)
  } catch (error) {
    console.error("Error generating baseline:", error)
    return NextResponse.json({ error: "Failed to generate baseline" }, { status: 500 })
  }
}
