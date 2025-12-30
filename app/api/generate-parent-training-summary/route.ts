import { type NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { trainingData } = await req.json()

    if (!trainingData) {
      return NextResponse.json({ error: "Training data is required" }, { status: 400 })
    }

    const prompt = `You are a Board Certified Behavior Analyst (BCBA) writing a professional report section about parent training progress.

Given the following parent training data:
${JSON.stringify(trainingData, null, 2)}

Write a comprehensive narrative summary (3-4 paragraphs) that describes:
1. Overall parent training engagement and progress
2. Specific modules completed and competencies demonstrated
3. Fidelity scores and quality of implementation
4. Skills the caregiver has mastered
5. Areas still in progress or requiring additional support
6. Recommendations for continued training

Use professional, clinical language appropriate for insurance authorization and assessment reports. Be specific about dates, scores, and observable behaviors. Focus on the caregiver's ability to implement interventions with fidelity and generalize skills across settings.

Write ONLY the narrative text without any markdown formatting, headers, or extra commentary.`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    const summary = content.type === "text" ? content.text : ""

    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error("[v0] Error generating parent training summary:", error)
    return NextResponse.json({ error: error.message || "Failed to generate summary" }, { status: 500 })
  }
}
