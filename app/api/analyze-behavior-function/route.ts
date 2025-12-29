import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { antecedent, behavior, consequence } = await request.json()

    // Validate input
    if (!antecedent || !behavior || !consequence) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `You are an expert BCBA conducting a functional behavior assessment using ABC data.

ABC OBSERVATION:
- Antecedent (what happened before): ${antecedent}
- Behavior (what the person did): ${behavior}  
- Consequence (what happened after): ${consequence}

Analyze this ABC data and determine the most likely function of the behavior.

The four functions of behavior are:
1. ESCAPE - Behavior to avoid or escape demands, tasks, people, or situations
2. ATTENTION - Behavior to gain attention from others (positive or negative)
3. TANGIBLE - Behavior to access items, activities, or preferred things
4. AUTOMATIC - Behavior that is self-stimulating or provides sensory reinforcement

Return a JSON object with:
{
  "function": "Escape|Attention|Tangible|Automatic",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation (1-2 sentences) of why this function is most likely based on the ABC data"
}

Return ONLY the JSON object, no other text.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error("Failed to parse response:", content)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    // Validate the result has required fields
    if (!result.function || !result.reasoning) {
      return NextResponse.json({ error: "Invalid response format" }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing behavior function:", error)
    return NextResponse.json({ error: "Failed to analyze behavior function" }, { status: 500 })
  }
}
