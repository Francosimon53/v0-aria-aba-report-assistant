"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, BotIcon, UserIcon } from "@/components/icons"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"

interface ChatInterfaceProps {
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  selectedGoals: SelectedGoal[]
}

const QUICK_PROMPTS = [
  "Help me write a medical necessity statement",
  "Suggest goals for communication deficits",
  "How do I justify 30 hours per week?",
  "Write a parent training section",
  "Explain VB-MAPP assessment results",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function MarkdownRenderer({ content }: { content: string }) {
  if (!content || content.trim() === "") {
    return <p className="text-sm text-muted-foreground italic">No response received</p>
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let currentNumberedList: string[] = []
  let key = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="space-y-2.5 my-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-[#0D9488] dark:text-teal-400 font-bold text-lg leading-none mt-0.5 shrink-0">
                •
              </span>
              <span className="text-[15px] leading-7 text-gray-800 dark:text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ul>,
      )
      currentList = []
    }
  }

  const flushNumberedList = () => {
    if (currentNumberedList.length > 0) {
      elements.push(
        <ol key={key++} className="space-y-2.5 my-4 ml-1">
          {currentNumberedList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-[#0D9488] dark:text-teal-400 font-semibold text-[15px] leading-7 shrink-0 min-w-[24px]">
                {idx + 1}.
              </span>
              <span className="text-[15px] leading-7 text-gray-800 dark:text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ol>,
      )
      currentNumberedList = []
    }
  }

  const parseInline = (text: string): React.ReactNode => {
    const segments: React.ReactNode[] = []
    let remaining = text
    let segmentKey = 0

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before bold
        if (boldMatch.index > 0) {
          segments.push(remaining.slice(0, boldMatch.index))
        }
        // Add bold text
        segments.push(
          <strong key={`bold-${segmentKey++}`} className="font-semibold text-gray-900 dark:text-white">
            {boldMatch[1]}
          </strong>,
        )
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
        continue
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/)
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          segments.push(remaining.slice(0, italicMatch.index))
        }
        segments.push(
          <em key={`italic-${segmentKey++}`} className="italic">
            {italicMatch[1]}
          </em>,
        )
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
        continue
      }

      // Inline code: `text`
      const codeMatch = remaining.match(/`(.+?)`/)
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          segments.push(remaining.slice(0, codeMatch.index))
        }
        segments.push(
          <code
            key={`code-${segmentKey++}`}
            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-[#0D9488] dark:text-teal-400"
          >
            {codeMatch[1]}
          </code>,
        )
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
        continue
      }

      // No more special formatting found
      segments.push(remaining)
      break
    }

    return segments
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Empty line
    if (!line) {
      flushList()
      flushNumberedList()
      continue
    }

    // Headers (##, ###, ####)
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headerMatch) {
      flushList()
      flushNumberedList()
      const level = headerMatch[1].length
      const headerText = headerMatch[2]

      elements.push(
        <h3
          key={key++}
          className={`font-semibold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0 ${
            level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base"
          }`}
        >
          {parseInline(headerText)}
        </h3>,
      )
      continue
    }

    // Bullet lists (-, *, •)
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/)
    if (bulletMatch) {
      flushNumberedList()
      currentList.push(bulletMatch[1])
      continue
    }

    // Numbered lists
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      flushList()
      currentNumberedList.push(numberedMatch[1])
      continue
    }

    // Regular paragraph
    flushList()
    flushNumberedList()
    elements.push(
      <p key={key++} className="text-[15px] leading-7 text-gray-800 dark:text-gray-200 my-3 first:mt-0">
        {parseInline(line)}
      </p>,
    )
  }

  flushList()
  flushNumberedList()

  return <div className="space-y-0">{elements}</div>
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-3">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
    </div>
  )
}

// Helper functions to detect request type and extract data
function detectRequestType(userInput: string): string {
  const input = userInput.toLowerCase()

  // Medical necessity patterns
  if (
    input.includes("medical necessity") ||
    input.includes("justify medical") ||
    input.includes("insurance approval") ||
    input.includes("authorization") ||
    input.includes("why treatment is needed")
  ) {
    return "medicalNecessity"
  }

  // SMART goal patterns
  if (
    input.includes("smart goal") ||
    input.includes("treatment goal") ||
    input.includes("write a goal") ||
    input.includes("create a goal") ||
    input.includes("goal for")
  ) {
    return "smartGoal"
  }

  // Hours justification patterns
  if (
    input.includes("hours") ||
    input.includes("how many hours") ||
    input.includes("justify hours") ||
    input.includes("30 hours") ||
    input.includes("20 hours") ||
    input.includes("service time")
  ) {
    return "hoursJustification"
  }

  // Default to chat for general questions
  return "chat"
}

function extractDataFromInput(
  userInput: string,
  clientData: ClientData | null,
  assessmentData: AssessmentData | null,
): any {
  const requestType = detectRequestType(userInput)

  // Build context data based on what we have
  const baseContext = {
    clientData: clientData
      ? {
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          dateOfBirth: clientData.dateOfBirth,
          diagnosis: clientData.diagnosis,
          insurance: clientData.insuranceProvider,
        }
      : null,
    assessmentData: assessmentData
      ? {
          assessmentType: assessmentData.assessmentType,
          domainScores: assessmentData.domainScores,
          overallSeverity: assessmentData.overallSeverity,
        }
      : null,
  }

  if (requestType === "medicalNecessity") {
    return {
      clientName: clientData ? `${clientData.firstName} ${clientData.lastName}` : "Client",
      clientAge: clientData?.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(clientData.dateOfBirth).getTime()) / 31557600000)
        : 5,
      diagnosis: clientData?.diagnosis || "Autism Spectrum Disorder",
      insurance: clientData?.insuranceProvider || "Standard",
      impairments: assessmentData?.domainScores || [],
      hoursRequested: assessmentData?.hoursRecommended || 25,
    }
  }

  if (requestType === "smartGoal") {
    return {
      domain: extractDomain(userInput),
      currentLevel: "emerging",
      targetSkill: extractFromInput(userInput, ["goal", "target", "skill", "improve", "increase"]),
      clientAge: clientData?.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(clientData.dateOfBirth).getTime()) / 31557600000)
        : 5,
    }
  }

  if (requestType === "hoursJustification") {
    return {
      impairments: assessmentData?.domainScores || [],
      behaviors: assessmentData?.deficitAreas || [],
      age: clientData?.dateOfBirth
        ? Math.floor((new Date().getTime() - new Date(clientData.dateOfBirth).getTime()) / 31557600000)
        : 5,
    }
  }

  // For general chat, return properly formatted context
  return {
    message: userInput,
    context: baseContext,
  }
}

function extractDomain(input: string): string {
  const domains = ["communication", "social", "behavior", "adaptive", "academic"]
  for (const domain of domains) {
    if (input.toLowerCase().includes(domain)) return domain
  }
  return "communication"
}

function extractHours(input: string): number {
  const match = input.match(/(\d+)\s*hours?/)
  return match ? Number.parseInt(match[1]) : 25
}

function extractFromInput(input: string, keywords: string[]): string {
  const sentences = input.split(/[.!?]/)
  for (const sentence of sentences) {
    for (const keyword of keywords) {
      if (sentence.toLowerCase().includes(keyword)) {
        return sentence.trim()
      }
    }
  }
  return input
}

export function ChatInterface({ clientData, assessmentData, selectedGoals }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm ARIA, your ABA Report Assistant. I can help you with:

• Writing comprehensive assessment narratives
• Selecting appropriate treatment goals
• Justifying service hour recommendations
• Ensuring insurance compliance
• Writing medical necessity statements

${clientData ? `I see you're working on a report for ${clientData.firstName} ${clientData.lastName}.` : "Start by entering client information, or ask me about ABA report writing."}

How can I help you today?`,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading) {
      handleSend(prompt)
    }
  }

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return

    setHasStartedChat(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setError(null)

    try {
      const requestType = detectRequestType(text)
      console.log("[v0] Detected request type:", requestType)

      const requestData = extractDataFromInput(text, clientData, assessmentData)
      console.log("[v0] Extracted data:", requestData)

      const response = await fetch("/api/aba-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: requestType,
          data: requestData,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Received response from ABA backend")

      const assistantText = data.content || "I apologize, but I didn't receive a response. Please try again."

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantText,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("[v0] Chat error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSend(inputValue)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Error display */}
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
          <p className="text-sm text-destructive font-medium">⚠️ {error}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 sm:p-6 space-y-6 pb-20">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                    <BotIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl max-w-[85%] sm:max-w-[80%] transition-all duration-300 ease-out ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#0D9488] to-[#0891B2] text-white px-4 py-3 shadow-lg"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                  <BotIcon className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {!hasStartedChat && (
        <div className="px-4 sm:px-6 py-3 border-t border-border bg-background/95 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
          <p className="text-xs font-medium text-muted-foreground mb-2.5">💡 Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs h-8 bg-background hover:bg-[#0D9488]/5 dark:hover:bg-teal-950 hover:border-[#0D9488] dark:hover:border-teal-700 transition-all duration-300 ease-out"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="px-4 sm:px-6 py-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Ask ARIA anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-sm h-11 rounded-xl border-2 focus:border-[#0D9488] dark:focus:border-teal-400 transition-colors duration-300 ease-out"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] hover:from-[#0F766E] hover:to-[#0E7490] shadow-lg transition-all duration-300 ease-out disabled:opacity-50"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
