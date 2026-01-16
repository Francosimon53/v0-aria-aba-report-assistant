import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { clientInfo, abcObservations, goals, interventions } = await request.json()

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a BCBA writing medical necessity documentation for insurance approval.

Given this assessment data, create optimized content for each field:

CLIENT INFO:
${JSON.stringify(clientInfo, null, 2)}

ABC OBSERVATIONS:
${JSON.stringify(abcObservations, null, 2)}

GOALS:
${JSON.stringify(goals, null, 2)}

INTERVENTIONS:
${JSON.stringify(interventions, null, 2)}

Return a JSON object with these fields optimized for insurance approval:
{
  "diagnosis": "Full diagnosis with severity level",
  "targetBehaviors": "List of target behaviors with operational definitions",
  "severityFrequency": "Detailed frequency/severity data showing medical necessity",
  "functionalImpact": "Impact on daily living, education, safety, family",
  "previousTreatment": "Prior interventions attempted and their outcomes",
  "environmentalFactors": "Environmental factors affecting treatment needs"
}

Use insurance-friendly language: "medically necessary", "significant impairment", "evidence-based treatment", "skilled intervention required".

Return ONLY valid JSON without markdown formatting.`,
        },
      ],
    })

    const content = message.content[0].type === "text" ? message.content[0].text : "{}"

    // Remove markdown code blocks if present
    const cleanedContent = content.replace(/```json\n?|\n?```/g, "").trim()

    try {
      const data = JSON.parse(cleanedContent)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedContent)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }
  } catch (error) {
    console.error("Smart fill error:", error)
    return NextResponse.json({ error: "Failed to generate smart fill" }, { status: 500 })
  }
}
