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
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA creating parent training content for ABA therapy.

MODULE TO CREATE: ${moduleName}

CLIENT'S SELECTED INTERVENTIONS: ${interventionsList}
${clientContext ? `ADDITIONAL CONTEXT: ${clientContext}` : ""}

Create comprehensive parent training content for this module. The content should be practical, easy to understand for parents without ABA background, and include real-world examples.

Return a JSON object with:

{
  "moduleTitle": "${moduleName}",
  "learningObjectives": [
    "By the end of this module, parent will be able to...",
    "Parent will demonstrate...",
    "Parent will identify..."
  ],
  "keyConceptsSection": {
    "title": "Key Concepts",
    "concepts": [
      {
        "term": "Term name",
        "definition": "Simple parent-friendly definition",
        "example": "Real-world example parents can relate to"
      }
    ]
  },
  "procedureSteps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed description of what parent should do",
      "tips": ["Helpful tip 1", "Helpful tip 2"],
      "commonMistakes": ["Mistake to avoid"]
    }
  ],
  "practiceScenarios": [
    {
      "scenario": "Description of a realistic situation",
      "correctResponse": "What the parent should do",
      "incorrectResponse": "What to avoid doing",
      "rationale": "Why this matters"
    }
  ],
  "homeActivities": [
    {
      "activity": "Name of activity",
      "description": "How to do it at home",
      "frequency": "How often to practice",
      "materials": ["Items needed"]
    }
  ],
  "fidelityChecklist": [
    "Did parent do X?",
    "Did parent avoid Y?",
    "Did parent provide Z?"
  ],
  "quizQuestions": [
    {
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}

Make the content specific to the interventions the client is using. For example:
- If "Task Modification" is selected, include examples about breaking tasks into smaller steps
- If "FCT" is selected, include examples about teaching communication
- If "Escape Extinction" is selected, include safety considerations

Return ONLY the JSON object, no markdown formatting.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "Content generation failed" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0].text

    // Try to extract JSON from the response
    let jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // If no JSON found, try without markdown code blocks
      jsonMatch = content.replace(/```json\n?|\n?```/g, "").match(/\{[\s\S]*\}/)
    }

    if (!jsonMatch) {
      console.error("Could not extract JSON from response:", content)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
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
