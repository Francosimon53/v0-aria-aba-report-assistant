import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { behaviorName, fieldName, behaviorFunction, existingData } = await request.json()

    if (!behaviorName || !fieldName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fieldPrompts: Record<string, string> = {
      operationalDefinition: `Write a professional operational definition for the behavior "${behaviorName}" that is observable, measurable, and includes clear examples of what qualifies as an instance. Use objective language. 2-3 sentences maximum.`,

      dataCollectionMethod: `Suggest the most appropriate data collection method for tracking "${behaviorName}" (choose from: frequency recording, duration recording, ABC data, interval recording, latency recording, scatterplot). Provide just the method name with a brief one-sentence rationale.`,

      frequency: `Estimate a typical baseline frequency for "${behaviorName}" in a child receiving ABA therapy. Use realistic ranges like "8-12 times per day", "3-5 times per hour", or "2-3 times per session". Provide ONLY the frequency estimate, no explanation.`,

      duration: `Estimate the typical duration for individual episodes of "${behaviorName}". Use realistic time ranges like "30 seconds to 2 minutes", "5-10 minutes", or "1-3 minutes per episode". Provide ONLY the duration estimate.`,

      intensity: `Rate the typical intensity level for "${behaviorName}" and provide a brief clinical description. Use format: "Moderate - briefly describe impact" or "High - describe severity and risk". One sentence maximum.`,

      consequences: `List 2-3 common maintaining consequences for "${behaviorName}" with the function "${behaviorFunction}". These should be specific environmental events that occur AFTER the behavior and likely reinforce it. Return each consequence on a new line with NO numbering, bullets, or dashes. Just plain text, one consequence per line.`,

      antecedents: `List 2-3 common antecedents (triggers) that precede "${behaviorName}". These should be specific environmental events, demands, or contexts that occur BEFORE the behavior. Return each antecedent on a new line with NO numbering, bullets, or dashes. Just plain text, one antecedent per line.`,

      interventionStrategies: `List 2-3 evidence-based intervention strategies for "${behaviorName}" with function "${behaviorFunction}". Include specific ABA techniques like DRA, FCT, antecedent modifications, etc. Return each strategy on a new line with NO numbering, bullets, or dashes. Just plain text, one strategy per line.`,

      replacementBehavior: `Suggest an appropriate, functionally equivalent replacement behavior for "${behaviorName}" with function "${behaviorFunction}". The replacement must serve the same function but be socially appropriate. Provide a 1-2 sentence description of the replacement behavior.`,

      baselineData: `Generate a realistic baseline data statement for "${behaviorName}". Include frequency estimate, duration if applicable, and intensity level. Use clinical terminology. Example format: "Currently occurs 10-15 times per day with average duration of 2-5 minutes per episode at moderate intensity levels." One statement only.`,

      targetCriteria: `Write a measurable treatment goal for reducing "${behaviorName}". Include specific reduction percentage or frequency target and timeframe. Examples: "Reduce to 2 or fewer occurrences per day for 4 consecutive weeks" or "80% reduction from baseline frequency maintained for 3 consecutive data collection periods". One sentence only.`,

      safetyConsiderations: `List key safety considerations and crisis response protocols for "${behaviorName}" if the behavior poses safety risks. Include when to implement safety procedures, who to contact, and any environmental modifications needed. If minimal safety risk, state that. 2-3 sentences maximum.`,
    }

    const prompt =
      fieldPrompts[fieldName] ||
      `Generate appropriate clinical content for the "${fieldName}" field related to the behavior "${behaviorName}".`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are an expert Board Certified Behavior Analyst (BCBA). ${prompt}\n\nBehavior Function: ${behaviorFunction}\n\nReturn ONLY the requested content with no additional formatting, explanations, or preamble. Be concise and clinically appropriate.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const value = data.content?.[0]?.text?.trim()

    if (!value) {
      throw new Error("No content generated")
    }

    return NextResponse.json({ value })
  } catch (error) {
    console.error("Error generating behavior field:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}
