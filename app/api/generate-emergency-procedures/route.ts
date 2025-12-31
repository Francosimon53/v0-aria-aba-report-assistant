import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { clientName, age, diagnosis, selectedRiskFactors, otherRisk } = await request.json()

    const riskFactorsList =
      selectedRiskFactors?.length > 0 ? selectedRiskFactors.join(", ") : "No specific risk factors identified"

    const otherRiskText = otherRisk ? `\nAdditional concerns: ${otherRisk}` : ""

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are an experienced ABA clinician writing emergency procedures for a crisis plan.

CLIENT INFORMATION:
- Name: ${clientName}
- Age: ${age}
- Diagnosis: ${diagnosis}
- Risk Factors: ${riskFactorsList}${otherRiskText}

Write comprehensive yet concise emergency procedures that include:

1. DE-ESCALATION STRATEGIES (3-4 specific steps)
   - Evidence-based calming techniques
   - Environmental modifications
   - Communication strategies

2. WHEN TO CALL 911
   - Clear criteria for emergency services
   - Specific dangerous behaviors that require immediate help

3. SAFE PLACES/SPACES
   - Designated calm-down areas
   - Environmental safety considerations

4. POST-CRISIS PROTOCOL
   - Documentation requirements
   - Follow-up steps
   - Team notification procedures

Write in clear, professional clinical language. Keep it under 250 words. Use bullet points for readability. Be specific and actionable.`,
        },
      ],
    })

    const procedures = message.content[0].type === "text" ? message.content[0].text : ""

    return NextResponse.json({ procedures })
  } catch (error) {
    console.error("Error generating emergency procedures:", error)
    return NextResponse.json({ error: "Failed to generate emergency procedures" }, { status: 500 })
  }
}
