import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { clientName, goals, dateRange } = await req.json()

    if (!clientName || !goals || !Array.isArray(goals)) {
      return NextResponse.json({ error: "Missing required fields: clientName, goals" }, { status: 400 })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: "AI service not configured", content: "" }, { status: 503 })
    }

    // Build comprehensive prompt with goals data
    const goalsContext = goals
      .map((goal: any, idx: number) => {
        const stos = goal.stos || []
        const stosText = stos
          .map((sto: any, stoIdx: number) => {
            return `   STO ${stoIdx + 1}: ${sto.text || sto.objective}
      - Baseline: ${sto.baseline || "Not specified"}
      - Current: ${sto.current || "In progress"}
      - Mastery: ${sto.mastery || "80% across 3 sessions"}
      - Status: ${sto.status || "in_progress"}`
          })
          .join("\n\n")

        return `Goal ${idx + 1}: ${goal.title || goal.goal}
Domain: ${goal.domain || "Not specified"}
Baseline: ${goal.baseline || "Not specified"}
Target: ${goal.target || "Not specified"}

Short-Term Objectives:
${stosText || "No STOs defined"}`
      })
      .join("\n\n---\n\n")

    const systemPrompt = `You are an expert BCBA writing a treatment progress narrative for an ABA therapy report. 

Based on the client's goals and their progress data, generate a comprehensive Progress Notes section that includes:

1. **Overview**: Brief summary of the reporting period and overall progress
2. **Domain-by-Domain Analysis**: For each skill domain (Communication, Social Skills, Adaptive Behavior, Behavior Reduction):
   - Summarize progress toward long-term goals
   - Highlight completed STOs and current performance levels
   - Note any challenges or barriers encountered
   - Describe intervention strategies used and their effectiveness
3. **Data-Driven Statements**: Reference specific baseline and current performance levels
4. **Clinical Observations**: Include qualitative observations about skill generalization, prompt fading, and behavior trends
5. **Parent/Caregiver Collaboration**: Note any home programming or caregiver training progress
6. **Recommendations**: Brief mention of next steps or adjustments to treatment plan

Use professional, data-driven language appropriate for insurance authorization. Emphasize measurable progress and clinical necessity for continued services.

Write in narrative paragraphs (not bullet points). Length: 500-800 words.`

    const userPrompt = `Client: ${clientName}
Reporting Period: ${dateRange?.from || "Start"} to ${dateRange?.to || "Present"}

Current Goals and Progress:

${goalsContext}

Generate a comprehensive Progress Notes section for this client's treatment report.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Anthropic API error:", errorData)
      return NextResponse.json({ error: "Failed to generate progress notes", content: "" }, { status: response.status })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error("Error generating progress notes:", error)
    return NextResponse.json({ error: error.message || "Internal server error", content: "" }, { status: 500 })
  }
}
