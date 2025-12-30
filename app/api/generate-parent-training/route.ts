import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { moduleName, interventions, clientContext } = await request.json()

    if (!moduleName) {
      return NextResponse.json({ error: "No module specified" }, { status: 400 })
    }

    const interventionsList = interventions?.map((i: any) => i.name || i.title).join(", ") || "General ABA procedures"

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA creating parent training content.

MODULE: ${moduleName}
INTERVENTIONS: ${interventionsList}

Create CONCISE parent training content. Keep each section brief.

Return ONLY valid JSON with this EXACT structure (no markdown, no extra text):

{
  "moduleTitle": "${moduleName}",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "keyConceptsSection": {
    "title": "Key Concepts",
    "concepts": [
      {"term": "Term", "definition": "Definition", "example": "Example"}
    ]
  },
  "procedureSteps": [
    {"step": 1, "title": "Title", "description": "Description", "tips": ["Tip"], "commonMistakes": ["Mistake"]}
  ],
  "practiceScenarios": [
    {"scenario": "Scenario", "correctResponse": "Correct", "incorrectResponse": "Incorrect", "rationale": "Why"}
  ],
  "homeActivities": [
    {"activity": "Activity", "description": "How to do it", "frequency": "Daily", "materials": ["Item"]}
  ],
  "fidelityChecklist": ["Check item 1", "Check item 2", "Check item 3"],
  "quizQuestions": [
    {"question": "Question?", "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], "correctAnswer": "A", "explanation": "Explanation"}
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown code blocks. No explanation. Just pure JSON.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json(
        { error: "API call failed: " + (errorData.error?.message || "Unknown error") },
        { status: 500 },
      )
    }

    const data = await response.json()
    let content = data.content[0].text

    // Clean up the response - remove markdown code blocks if present
    content = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Try to find JSON object in the response
    const jsonStart = content.indexOf("{")
    const jsonEnd = content.lastIndexOf("}")

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("No JSON found in response:", content.substring(0, 500))
      return NextResponse.json({ error: "No valid JSON in AI response" }, { status: 500 })
    }

    const jsonString = content.substring(jsonStart, jsonEnd + 1)

    try {
      const result = JSON.parse(jsonString)
      return NextResponse.json(result)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Attempted to parse:", jsonString.substring(0, 1000))

      return NextResponse.json({
        moduleTitle: moduleName,
        learningObjectives: ["Content generation encountered an issue. Please try again."],
        keyConceptsSection: { title: "Key Concepts", concepts: [] },
        procedureSteps: [],
        practiceScenarios: [],
        homeActivities: [],
        fidelityChecklist: ["Try regenerating this module"],
        quizQuestions: [],
        _error: "Partial generation - please try again",
      })
    }
  } catch (error) {
    console.error("Error generating parent training:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate content",
      },
      { status: 500 },
    )
  }
}
