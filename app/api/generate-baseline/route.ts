import { NextResponse } from "next/server"
import { anthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

const baselineSchema = z.object({
  currentRate: z.number().optional(),
  rateUnit: z.enum(["hour", "day", "session", "week"]).optional(),
  percentCorrect: z.number().optional(),
  totalTrials: z.number().optional(),
  averageDuration: z.number().optional(),
  durationUnit: z.enum(["seconds", "minutes", "hours"]).optional(),
  stepsCompleted: z.number().optional(),
  totalSteps: z.number().optional(),
  percentIntervals: z.number().optional(),
  observationDuration: z.number().optional(),
  promptLevel: z.enum(["independent", "gesture", "verbal", "model", "partial_physical", "full_physical"]),
  setting: z.enum(["home", "clinic", "school", "community", "multiple"]),
  dataSource: z.enum(["direct_observation", "parent_report", "teacher_report", "assessment", "probe"]),
  collectionPeriod: z.number(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!anthropicKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
  }

  try {
    const { goalTitle, goalDescription, measurementType, criteria, ageRange } = await request.json()

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-20250514"),
      schema: baselineSchema,
      prompt: `You are an expert BCBA generating realistic baseline data for an ABA therapy goal.

Goal: ${goalTitle}
Description: ${goalDescription}
Measurement Type: ${measurementType}
Mastery Criteria: ${criteria}
Age Range: ${ageRange}

Generate realistic BASELINE data that represents a client BEFORE intervention begins. The baseline should:
1. Be significantly below the mastery criteria (this is PRE-intervention)
2. Use appropriate values for the measurement type
3. Reflect typical starting points for clients working on this skill
4. Be clinically realistic

For ${measurementType} measurement:
${measurementType === "Frequency" ? "- Provide currentRate (low number) and rateUnit" : ""}
${measurementType === "Accuracy" || measurementType === "Discrete Trial" || measurementType === "Opportunity" ? "- Provide percentCorrect (low, like 10-30%) and totalTrials" : ""}
${measurementType === "Duration" ? "- Provide averageDuration and durationUnit" : ""}
${measurementType === "Task Analysis" ? "- Provide stepsCompleted (low) and totalSteps" : ""}
${measurementType === "Interval" ? "- Provide percentIntervals (high for problem behavior, low for desired behavior) and observationDuration" : ""}

Always include: promptLevel, setting, dataSource, and collectionPeriod (typically 3-5 days).`,
    })

    return NextResponse.json(object)
  } catch (error) {
    console.error("Error generating baseline:", error)
    return NextResponse.json({ error: "Failed to generate baseline" }, { status: 500 })
  }
}
