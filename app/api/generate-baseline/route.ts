import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { goalTitle, goalDescription, measurementType, criteria, ageRange } = body

    const prompt = `Generate realistic baseline data for the following ABA goal:

Goal: ${goalTitle}
Description: ${goalDescription}
Measurement Type: ${measurementType}
Criteria: ${criteria}
Age Range: ${ageRange}

Based on the measurement type (${measurementType}), generate appropriate baseline data. Return ONLY a valid JSON object with these fields (include only relevant fields for the measurement type):

{
  "currentRate": "number as string (for Frequency)",
  "ratePer": "hour|day|session|week (for Frequency)",
  "percentCorrect": "number 0-100 as string (for Accuracy/Discrete Trial/Opportunity)",
  "totalTrials": "number as string (for Accuracy/Discrete Trial/Opportunity)",
  "averageDuration": "number as string (for Duration)",
  "durationUnit": "seconds|minutes (for Duration)",
  "minDuration": "number as string (for Duration, optional)",
  "maxDuration": "number as string (for Duration, optional)",
  "stepsCompleted": "number as string (for Task Analysis)",
  "totalSteps": "number as string (for Task Analysis)",
  "percentOfIntervals": "number 0-100 as string (for Interval)",
  "observationDuration": "number as string (for Interval)",
  "promptLevel": "Independent|Gestural|Verbal|Model|Partial Physical|Full Physical",
  "setting": "Home|Clinic|School|Community|Multiple",
  "dataSource": "Direct Observation|Parent Report|Teacher Report|Formal Assessment|Probe Data",
  "collectionPeriod": "number as string (days, typically 3-7)",
  "notes": "brief clinical note about baseline context"
}

Generate realistic, clinically appropriate values that reflect a child who needs intervention in this area.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const baselineData = JSON.parse(jsonMatch[0])

    return NextResponse.json(baselineData)
  } catch (error) {
    console.error("Error generating baseline:", error)
    return NextResponse.json({ error: "Failed to generate baseline data" }, { status: 500 })
  }
}
