import { streamText, tool } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

export const maxDuration = 60

const SECTION_IDS = [
  "header",
  "service_recommendations",
  "referral",
  "background",
  "assessments",
  "standardized_assessments",
  "abc_observations",
  "preference_assessment",
  "maladaptive_behaviors",
  "hypothesis_interventions",
  "intervention_descriptions",
  "teaching_procedures",
  "skill_acquisition_goals",
  "behavior_reduction_goals",
  "caregiver_goals",
  "parent_training_progress",
  "medical_necessity",
  "fade_plan",
  "barriers_treatment",
  "generalization_maintenance",
  "crisis_plan",
] as const

/**
 * Sanitize incoming UIMessages to text-only content.
 * Strips file parts, image parts, and collapses tool invocation parts
 * into short text summaries to prevent "too much media" errors.
 */
function sanitizeMessages(
  rawMessages: Array<{ role: string; parts?: Array<{ type: string; text?: string; [k: string]: unknown }> ; content?: string }>
) {
  const sanitized: Array<{ role: "user" | "assistant"; content: string }> = []

  for (const msg of rawMessages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue

    let text = ""

    if (msg.parts && Array.isArray(msg.parts)) {
      // AI SDK v5 UIMessage format — extract only text parts
      for (const part of msg.parts) {
        if (part.type === "text" && typeof part.text === "string") {
          text += part.text
        } else if (part.type === "dynamic-tool" || part.type?.startsWith("tool-")) {
          // Summarize tool calls as short text instead of sending full payloads
          const input = part.input as Record<string, string> | undefined
          const sectionId = input?.section_id || "unknown"
          const state = part.state as string
          if (state === "output-available" || state === "output-error") {
            text += `\n[Tool: updated section "${sectionId}"]\n`
          }
        }
        // Skip file, image, reasoning, source, step-start parts entirely
      }
    } else if (typeof msg.content === "string") {
      // Fallback: plain string content
      text = msg.content
    }

    const trimmed = text.trim()
    if (trimmed) {
      sanitized.push({ role: msg.role as "user" | "assistant", content: trimmed })
    }
  }

  // Keep only the last 20 messages to prevent unbounded growth
  return sanitized.slice(-20)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { messages: rawMessages, assessmentContext } = body

  const {
    clientName = "the client",
    clientAge = "unknown",
    diagnosis = "ASD",
    assessmentType = "initial",
    completedSections = [] as string[],
    pendingSections = [] as string[],
  } = assessmentContext || {}

  // Sanitize messages to text-only — no images, files, or large tool payloads
  const messages = sanitizeMessages(rawMessages || [])

  const systemPrompt = `You are ARIA, an expert BCBA-level clinical writer for ABA assessment reports. You help Board Certified Behavior Analysts write, revise, and improve report sections.

CLIENT CONTEXT (structured data only — no images or screenshots):
- Name: ${clientName}
- Age: ${clientAge}
- Diagnosis: ${diagnosis}
- Assessment type: ${assessmentType}
- Completed sections: ${completedSections.length > 0 ? completedSections.join(", ") : "none yet"}
- Pending sections: ${pendingSections.length > 0 ? pendingSections.join(", ") : "none"}

WRITING GUIDELINES:
- Write in professional clinical language suitable for insurance submissions
- Use proper ABA terminology (contingency, reinforcement, prompting, fading, etc.)
- Include quantifiable measures (percentages, frequencies, durations) when appropriate
- Write complete paragraphs — no markdown headers or bullet formatting unless the section requires a table
- Be specific with clinical observations, not generic templates
- Do NOT use placeholders like [Date], [Name] — use the actual client data provided
- For service recommendation tables, use markdown table format

INSTRUCTIONS:
- When asked to write or update a section, ALWAYS use the update_report_section tool to deliver content
- When asked to revise, improve, or make changes to a section, use the tool with the updated content
- You can update multiple sections in a single response if asked
- After calling the tool, briefly confirm what you did (1-2 sentences)`

  const result = streamText({
    // @ts-expect-error - anthropic provider returns LanguageModelV3, ai expects LanguageModelV2
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages,
    maxTokens: 2000,
    tools: {
      update_report_section: tool({
        description:
          "Update a specific section of the ABA assessment report with new content. Use this whenever writing or revising report sections.",
        inputSchema: z.object({
          section_id: z.enum(SECTION_IDS),
          content: z.string().min(1).describe("The full content for this report section"),
          action: z
            .enum(["replace", "append"])
            .default("replace")
            .describe("Whether to replace the section content entirely or append to existing content"),
        }),
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
