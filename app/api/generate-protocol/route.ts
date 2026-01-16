import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { intervention, clientContext } = await request.json()

    if (!intervention) {
      return NextResponse.json({ error: "No intervention provided" }, { status: 400 })
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
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA creating a detailed teaching protocol for ABA therapy.

INTERVENTION TO CREATE PROTOCOL FOR:
- Name: ${intervention.name || intervention.title}
- Description: ${intervention.description || "Not provided"}
- Category: ${intervention.category || "Not provided"}
- Function: ${intervention.function || "Not provided"}
${clientContext ? `- Client Context: ${clientContext}` : ""}

Create a comprehensive teaching protocol. Return a JSON object with:

{
  "protocolName": "Clear protocol name based on the intervention",
  "operationalDefinition": "Clear, observable, measurable definition of the target behavior (2-3 sentences)",
  "barriers": "Bulleted list of 3-5 potential barriers that may impede learning (use \\n• for bullets)",
  "measurementProcedures": "Description of how to collect data (2-3 sentences including data type and procedure)",
  "steps": [
    {
      "description": "Detailed first teaching step",
      "whatNotToDo": "Common mistake to avoid in this step"
    },
    {
      "description": "Detailed second teaching step",
      "whatNotToDo": "Common mistake to avoid in this step"
    },
    {
      "description": "Detailed third teaching step",
      "whatNotToDo": "Common mistake to avoid in this step"
    },
    {
      "description": "Detailed fourth teaching step",
      "whatNotToDo": "Common mistake to avoid in this step"
    }
  ],
  "promptingHierarchy": "Most-to-Least or Least-to-Most (choose most appropriate)",
  "reinforcementSchedule": "Detailed reinforcement schedule with thinning plan (2-3 sentences)",
  "masteryCriteria": "Specific mastery criteria (e.g., 80% accuracy across 3 sessions)",
  "proceduralModifications": "Bulleted list of 2-3 modifications for different scenarios (use \\n• for bullets)",
  "teachingExamples": "2-3 concrete examples showing how to implement the protocol (use \\n\\n between examples)"
}

Make the protocol practical, evidence-based, and suitable for direct implementation by RBTs and BCBAs. Return ONLY the JSON object.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "Protocol generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0].text

    // Try to extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      // Try to find JSON in markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (codeBlockMatch) {
        jsonMatch = [codeBlockMatch[1]]
      }
    }

    if (!jsonMatch) {
      console.error("Could not extract JSON from response:", content)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating protocol:", error)
    return NextResponse.json({ error: "Failed to generate protocol" }, { status: 500 })
  }
}
