import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sectionTitle, sectionDescription, dateFrom, dateTo, reportType, goalsData, clientData } =
      await request.json()

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    // Build context from goals data
    const goalsContext =
      goalsData && goalsData.length > 0
        ? goalsData
            .map((goal: any, index: number) => {
              const progress = goal.currentData
                ? `${goal.currentData} (from baseline: ${goal.baselineData || "Not recorded"})`
                : "No current data"
              return `Goal ${index + 1}: ${goal.title}
- Domain: ${goal.domain}
- Baseline: ${goal.baselineData || "Not recorded"}
- Current: ${goal.currentData || "No data"}
- Progress: ${progress}
- Status: ${goal.status || "In Progress"}`
            })
            .join("\n\n")
        : "No goals data available"

    const prompt = `You are a Board Certified Behavior Analyst (BCBA) writing a progress report section for insurance re-authorization.

**Section:** ${sectionTitle}
**Purpose:** ${sectionDescription}
**Report Type:** ${reportType}
**Reporting Period:** ${dateFrom} to ${dateTo}

**Client Information:**
- Name: ${clientData?.firstName || ""} ${clientData?.lastName || ""}
- Date of Birth: ${clientData?.dateOfBirth || "Not provided"}
- Diagnosis: ${clientData?.diagnosis || "Not provided"}

**Goals Data:**
${goalsContext}

Write a professional, clinically appropriate section for this progress report. The content should:
1. Use evidence-based language appropriate for insurance reviewers
2. Include specific data points where available (percentages, rates, measurements)
3. Compare baseline to current performance when applicable
4. Be concise but comprehensive (${sectionDescription.match(/\d+-\d+/)?.[0] || "150-200"} words)
5. Follow BACB ethical guidelines
6. Use clinical terminology appropriate for ABA services
7. Focus on measurable outcomes and functional improvements

Write ONLY the section content, no headers or additional commentary.`

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
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Anthropic API error:", errorText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ""

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error generating progress section:", error)
    return NextResponse.json({ error: "Failed to generate section", details: String(error) }, { status: 500 })
  }
}
