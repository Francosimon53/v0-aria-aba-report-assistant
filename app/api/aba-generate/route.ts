export const runtime = "edge"

import { generateABAContent } from "@/lib/aba-prompts"

// Simple rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimits.get(ip)

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 })
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
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (!checkRateLimit(ip)) {
      return Response.json({ error: "Rate limit exceeded. Max 10 requests per minute." }, { status: 429 })
    }

    // Parse request
    const body = await request.json()
    const { type, data } = body

    // Validate request
    if (!type || !data) {
      return Response.json({ error: "Missing required fields: type and data" }, { status: 400 })
    }

    // Validate type
    const validTypes = ["medicalNecessity", "smartGoal", "hoursJustification", "chat"]
    if (!validTypes.includes(type)) {
      return Response.json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 })
    }

    // Generate content using AI
    const content = await generateABAContent(type, data)

    // Return success response
    return Response.json({
      success: true,
      content,
      type,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[ABA API] Generation error:", error)

    return Response.json(
      {
        error: "Content generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
