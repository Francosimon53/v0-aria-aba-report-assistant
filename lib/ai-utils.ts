import * as Sentry from "@sentry/nextjs"

export interface AIRequestOptions {
  maxRetries?: number
  timeoutMs?: number
  fallbackResponse?: string
}

export interface AIResult {
  success: boolean
  content: string
  error?: string
  usedFallback?: boolean
}

export async function safeAIRequest(endpoint: string, body: object, options: AIRequestOptions = {}): Promise<AIResult> {
  const { maxRetries = 3, timeoutMs = 45000, fallbackResponse } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000
        console.warn(`Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`AI request failed (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      const content = data.content || data.text || data.result || ""

      return { success: true, content }
    } catch (error: any) {
      console.error(`AI attempt ${attempt}/${maxRetries} failed:`, error.message)

      Sentry.captureException(error, {
        tags: {
          type: "ai_generation",
          attempt: attempt,
          endpoint: endpoint,
        },
        extra: {
          body: JSON.stringify(body).substring(0, 500),
          maxRetries,
          timeoutMs,
        },
      })

      // Don't retry on abort (timeout)
      if (error.name === "AbortError") {
        console.error("Request timed out after", timeoutMs, "ms")

        if (fallbackResponse) {
          return {
            success: false,
            content: fallbackResponse,
            error: "Request timed out. Using fallback response.",
            usedFallback: true,
          }
        }
        return {
          success: false,
          content: "",
          error: "Request timed out. Please try again.",
        }
      }

      // Last attempt failed
      if (attempt === maxRetries) {
        // Log error for monitoring
        await logErrorToServer("ai_generation_failed", {
          endpoint,
          error: error.message,
          attempts: maxRetries,
        })

        if (fallbackResponse) {
          return {
            success: false,
            content: fallbackResponse,
            error: error.message,
            usedFallback: true,
          }
        }
        return {
          success: false,
          content: "",
          error: error.message || "AI generation failed after multiple attempts",
        }
      }

      // Wait before retry with exponential backoff
      const waitTime = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  return { success: false, content: "", error: "Max retries exceeded" }
}

async function logErrorToServer(type: string, details: object) {
  try {
    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        details,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (e) {
    // Silently fail - don't break the app if logging fails
    console.error("Failed to log error:", e)
  }
}

// Helper for generate-content API specifically
export async function generateContent(type: string, data: object, options: AIRequestOptions = {}): Promise<AIResult> {
  return safeAIRequest(
    "/api/generate-content",
    { type, data },
    {
      maxRetries: 3,
      timeoutMs: 45000,
      ...options,
    },
  )
}

// Helper for ai-assistant API specifically
export async function generateWithAssistant(prompt: string, options: AIRequestOptions = {}): Promise<AIResult> {
  return safeAIRequest(
    "/api/ai-assistant",
    { prompt },
    {
      maxRetries: 3,
      timeoutMs: 60000, // Longer timeout for report sections
      ...options,
    },
  )
}
