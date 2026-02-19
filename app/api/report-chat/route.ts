import Anthropic from "@anthropic-ai/sdk"
import { createUIMessageStream, createUIMessageStreamResponse } from "ai"

export const maxDuration = 60

const SECTION_IDS = [
  "header", "service_recommendations", "referral", "background", "assessments",
  "standardized_assessments", "abc_observations", "preference_assessment",
  "maladaptive_behaviors", "hypothesis_interventions", "intervention_descriptions",
  "teaching_procedures", "skill_acquisition_goals", "behavior_reduction_goals",
  "caregiver_goals", "parent_training_progress", "medical_necessity",
  "fade_plan", "barriers_treatment", "generalization_maintenance", "crisis_plan",
]

const TOOL_DEFINITION: Anthropic.Tool = {
  name: "update_report_section",
  description:
    "Update a specific section of the ABA assessment report with new content. Use this whenever writing or revising report sections.",
  input_schema: {
    type: "object" as const,
    properties: {
      section_id: {
        type: "string",
        enum: SECTION_IDS,
        description: "The ID of the section to update",
      },
      content: {
        type: "string",
        minLength: 1,
        description: "The full content for this report section",
      },
      action: {
        type: "string",
        enum: ["replace", "append"],
        default: "replace",
        description: "Whether to replace the section content entirely or append to existing content",
      },
    },
    required: ["section_id", "content"],
  },
}

/**
 * Sanitize incoming UIMessages to text-only Anthropic messages.
 * Strips file/image parts and collapses tool invocations to short summaries.
 */
function sanitizeMessages(
  rawMessages: Array<{ role: string; parts?: Array<{ type: string; text?: string; [k: string]: unknown }>; content?: string }>
): Anthropic.MessageParam[] {
  const sanitized: Anthropic.MessageParam[] = []

  for (const msg of rawMessages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue

    let text = ""

    if (msg.parts && Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        if (part.type === "text" && typeof part.text === "string") {
          text += part.text
        } else if (part.type === "dynamic-tool" || part.type?.startsWith("tool-")) {
          const input = part.input as Record<string, string> | undefined
          const sectionId = input?.section_id || "unknown"
          const state = part.state as string
          if (state === "output-available" || state === "output-error") {
            text += `\n[Tool: updated section "${sectionId}"]\n`
          }
        }
      }
    } else if (typeof msg.content === "string") {
      text = msg.content
    }

    const trimmed = text.trim()
    if (trimmed) {
      sanitized.push({ role: msg.role as "user" | "assistant", content: trimmed })
    }
  }

  // Keep last 20 messages
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

  const messages = sanitizeMessages(rawMessages || [])

  const systemPrompt = `You are ARIA, an expert BCBA-level clinical writer for ABA assessment reports. You help Board Certified Behavior Analysts write, revise, and improve report sections.

CLIENT CONTEXT (structured text only):
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

  const client = new Anthropic()

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt,
        messages,
        tools: [TOOL_DEFINITION],
        stream: true,
      })

      let currentTextId = ""
      let currentToolCallId = ""
      let textIdCounter = 0

      for await (const event of response) {
        switch (event.type) {
          case "content_block_start": {
            const block = event.content_block
            if (block.type === "text") {
              currentTextId = `text-${textIdCounter++}`
              writer.write({ type: "text-start", id: currentTextId })
            } else if (block.type === "tool_use") {
              currentToolCallId = block.id
              writer.write({
                type: "tool-input-start",
                toolCallId: block.id,
                toolName: block.name,
                dynamic: true,
              })
            }
            break
          }

          case "content_block_delta": {
            const delta = event.delta
            if (delta.type === "text_delta") {
              writer.write({ type: "text-delta", id: currentTextId, delta: delta.text })
            } else if (delta.type === "input_json_delta") {
              writer.write({
                type: "tool-input-delta",
                toolCallId: currentToolCallId,
                inputTextDelta: delta.partial_json,
              })
            }
            break
          }

          case "content_block_stop": {
            if (currentTextId) {
              writer.write({ type: "text-end", id: currentTextId })
              currentTextId = ""
            }
            currentToolCallId = ""
            break
          }

          case "message_start":
          case "message_delta":
          case "message_stop":
            break
        }
      }

      // After stream ends, emit finalized tool calls from the full message
      const finalMessage = await response.finalMessage()
      for (const block of finalMessage.content) {
        if (block.type === "tool_use") {
          writer.write({
            type: "tool-input-available",
            toolCallId: block.id,
            toolName: block.name,
            input: block.input,
            dynamic: true,
          })
        }
      }
    },
    onError: (error) => {
      console.error("[report-chat] Stream error:", error)
      return error instanceof Error ? error.message : "An error occurred"
    },
  })

  return createUIMessageStreamResponse({ stream })
}
