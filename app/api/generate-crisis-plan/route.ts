import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { riskFactors, clientInfo } = await request.json()

    if (!riskFactors || riskFactors.length === 0) {
      return NextResponse.json({ error: "Please select at least one risk factor" }, { status: 400 })
    }

    const riskFactorsList = riskFactors.join(", ")

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA creating a comprehensive crisis plan for a client with identified risk factors.

IDENTIFIED RISK FACTORS:
${riskFactorsList}

${clientInfo ? `CLIENT CONTEXT: ${clientInfo}` : ""}

Based on these risk factors, generate a comprehensive crisis plan. Return a JSON object with:

{
  "riskProfile": {
    "level": "Low|Medium|High|Critical",
    "summary": "2-3 sentence clinical summary of the overall risk profile and primary concerns"
  },
  "warningSignsEscalation": [
    "List 4-5 specific observable warning signs that indicate escalation is beginning",
    "Be specific and behavioral (what you would see/hear)"
  ],
  "deEscalationStrategies": [
    {
      "step": 1,
      "action": "First de-escalation step",
      "details": "Specific instructions for implementing this step"
    },
    {
      "step": 2,
      "action": "Second de-escalation step",
      "details": "Specific instructions"
    },
    {
      "step": 3,
      "action": "Third de-escalation step",
      "details": "Specific instructions"
    },
    {
      "step": 4,
      "action": "Fourth de-escalation step",
      "details": "Specific instructions"
    }
  ],
  "emergencyProcedures": {
    "immediateActions": [
      "List 3-4 immediate actions to take during a crisis"
    ],
    "safetyMeasures": [
      "List 2-3 environmental safety measures"
    ],
    "restrictedItems": [
      "List items that should be secured or removed from environment"
    ]
  },
  "when911": {
    "criteria": [
      "List 3-4 specific criteria for when to call 911"
    ],
    "whatToSay": "Script for what to tell 911 dispatcher"
  },
  "postCrisisProtocol": [
    "Step 1 after crisis resolves",
    "Step 2 for documentation",
    "Step 3 for follow-up"
  ],
  "preventionStrategies": [
    "List 3-4 proactive strategies to prevent crisis situations"
  ]
}

Make all recommendations specific to the identified risk factors. Use professional ABA/clinical language.
Return ONLY the JSON object, no markdown or extra text.`,
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
    const content = data.content[0].text

    // Try to extract JSON from markdown code blocks or plain text
    let jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      jsonMatch = content.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        jsonMatch = [jsonMatch[1]]
      }
    }

    if (!jsonMatch) {
      console.error("Could not parse AI response:", content)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating crisis plan:", error)
    return NextResponse.json({ error: "Failed to generate crisis plan" }, { status: 500 })
  }
}
