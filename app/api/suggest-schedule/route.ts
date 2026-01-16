import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { authorizedHours, clientAge, schoolSchedule, preferences } = await request.json()

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an ABA scheduling expert. Create an optimal weekly therapy schedule.

AUTHORIZED HOURS:
- RBT (97153): ${authorizedHours.rbt || 20} hours/week
- BCBA (97155): ${authorizedHours.bcba || 4} hours/week  
- Family Training (97156): ${authorizedHours.familyTraining || 2} hours/week

CLIENT INFO:
- Age: ${clientAge} years old
- School schedule: ${schoolSchedule}
- Special preferences: ${preferences || "None"}

GUIDELINES:
- Sessions should be 2-3 hours for young children, up to 4 hours for older
- BCBA supervision should overlap with RBT sessions
- Family training typically after work hours (5-7pm)
- Avoid scheduling right after school (allow transition time)
- Spread sessions across week (not all consecutive days)
- Ensure total hours match authorized hours

Return a JSON object with this exact structure:
{
  "suggestedSchedule": {
    "Monday": { "97153": "9:00 AM - 12:00 PM", "97155": "", "97156": "" },
    "Tuesday": { "97153": "9:00 AM - 12:00 PM", "97155": "10:00 AM - 11:00 AM", "97156": "" },
    "Wednesday": { "97153": "9:00 AM - 12:00 PM", "97155": "", "97156": "" },
    "Thursday": { "97153": "9:00 AM - 12:00 PM", "97155": "10:00 AM - 11:00 AM", "97156": "5:00 PM - 6:00 PM" },
    "Friday": { "97153": "9:00 AM - 11:00 AM", "97155": "", "97156": "" },
    "Saturday": { "97153": "", "97155": "", "97156": "" },
    "Sunday": { "97153": "", "97155": "", "97156": "" }
  },
  "summary": {
    "totalRBT": 14,
    "totalBCBA": 2,
    "totalFamily": 1
  },
  "notes": "Schedule optimized for morning availability. BCBA overlaps on Tuesday/Thursday for direct observation. Family training scheduled Thursday evening."
}

Return ONLY valid JSON, no markdown or extra text.`,
        },
      ],
    })

    const content = message.content[0].type === "text" ? message.content[0].text : "{}"

    try {
      const schedule = JSON.parse(content)
      return NextResponse.json(schedule)
    } catch (parseError) {
      console.error("[v0] Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to parse schedule from AI" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error in suggest-schedule API:", error)
    return NextResponse.json({ error: "Failed to generate schedule" }, { status: 500 })
  }
}
