export const runtime = "edge"

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }

  if (limit.count >= 10) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return Response.json({ error: "Rate limit exceeded. Please try again in a minute." }, { status: 429 })
    }

    const { type, data } = await request.json()

    // Validate request
    if (!type || !data) {
      return Response.json({ error: "Missing required fields: type and data" }, { status: 400 })
    }

    const validTypes = [
      "medicalNecessity",
      "smartGoal",
      "hoursJustification",
      "parentTrainingGoals",
      "functionalBehaviorAssessment",
      // New types for Standardized Assessments
      "abllsNarrative",
      "vinelandInterpretation",
      "srs2Summary",
      // New types for Fade Plan and Barriers
      "fadePlanNarrative",
      "barriersSection",
      "generalizationPlan",
      "reasonForReferral",
      "familyGoals",
    ]

    if (!validTypes.includes(type)) {
      return Response.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 })
    }

    // Import the AI prompts module dynamically
    const { generateABAContent } = await import("@/lib/ai-prompts")

    // Generate content
    const content = await generateABAContent(type, data)

    // Return successful response
    return Response.json({
      success: true,
      content,
      type,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Content generation error:", error)

    return Response.json(
      {
        error: "Failed to generate content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
