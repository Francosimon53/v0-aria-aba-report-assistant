import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { abcData, riskData } = await request.json()

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA selecting evidence-based interventions for a treatment plan.

CLIENT DATA:
- Primary Behavior Function: ${abcData?.primaryFunction || "Not identified"}
- Secondary Function: ${abcData?.secondaryFunction || "None"}
- ABC Pattern Recommendations: ${abcData?.recommendations?.join(", ") || "None provided"}
- Risk Level: ${riskData?.riskLevel || "Not assessed"}
- Risk Factors: ${riskData?.riskFactors?.join(", ") || "None identified"}
- Prevention Strategies from Crisis Plan: ${riskData?.preventionStrategies?.join(", ") || "None"}

Based on this data, recommend specific interventions from each category. Return a JSON object with:

{
  "primaryFunctionTab": "Attention|Escape|Tangible|Automatic",
  "reasoning": "Brief explanation of why these interventions were selected based on the function and risk factors",
  "recommendations": {
    "preventiveStrategies": [
      {
        "name": "Exact intervention name from the library",
        "priority": "high|medium",
        "rationale": "Why this specific intervention for this client"
      }
    ],
    "replacementStrategies": [
      {
        "name": "Exact intervention name",
        "priority": "high|medium",
        "rationale": "Why this intervention"
      }
    ],
    "managementStrategies": [
      {
        "name": "Exact intervention name",
        "priority": "high|medium",
        "rationale": "Why this intervention"
      }
    ],
    "maladaptiveBehaviorStrategies": [
      {
        "name": "Exact intervention name",
        "priority": "high|medium",
        "rationale": "Why this intervention"
      }
    ]
  },
  "implementationNotes": "2-3 sentences about key considerations when implementing these interventions for this specific client",
  "cautionNotes": "Any warnings or contraindications based on the risk factors (can be empty string if none)"
}

IMPORTANT: Use exact intervention names that exist in the library:

FOR ATTENTION FUNCTION:
- Preventive: "Attention Schedule"
- Replacement: "Functional Communication Training (FCT) - Attention"
- Management: "Planned Ignoring"
- Maladaptive: "Response Cost for Attention-Seeking"

FOR ESCAPE FUNCTION:
- Preventive: "Task Modification", "Scheduled Breaks"
- Replacement: "FCT - Escape/Break Request"
- Management: "Escape Extinction"
- Maladaptive: "Differential Reinforcement of Alternative Behavior (DRA)"

FOR TANGIBLE FUNCTION:
- Preventive: "Non-Contingent Access", "Choice-Making Opportunities"
- Replacement: "FCT - Item/Activity Request"
- Management: "Tangible Extinction"
- Maladaptive: "Response Blocking + Redirection"

FOR AUTOMATIC FUNCTION:
- Preventive: "Environmental Enrichment", "Matched Stimulation"
- Replacement: "Differential Reinforcement of Other Behavior (DRO)"
- Management: "Response Interruption/Redirection (RIRD)"
- Maladaptive: "Sensory Extinction"

Return ONLY the JSON object with no markdown formatting.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0].text

    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error("No valid JSON found in response:", content)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error suggesting interventions:", error)
    return NextResponse.json({ error: "Failed to suggest interventions" }, { status: 500 })
  }
}
