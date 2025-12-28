"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Lightbulb,
  AlertCircle,
  FileText,
  Target,
  DollarSign,
  Clock,
  Trash2,
} from "lucide-react"

// ============== TYPES ==============
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface FormattedContent {
  type: "text" | "heading" | "bullet" | "numbered" | "tip" | "warning" | "code" | "highlight" | "divider"
  content: string
  items?: string[]
}

// ============== SYSTEM PROMPT (Concise Responses) ==============
const SYSTEM_PROMPT = `You are ARIA, an expert AI assistant for BCBAs creating ABA assessment reports.

RESPONSE RULES - CRITICAL:
1. Be CONCISE - max 3-4 short paragraphs
2. Use bullet points for lists (max 4-5 items)
3. Bold **key terms** for emphasis
4. Start with a direct answer, then brief explanation
5. End with 1 actionable next step when relevant

FORMATTING:
- Use **bold** for key terms
- Use bullet points (•) for lists
- Use "💡 Tip:" for pro tips
- Use "⚠️ Note:" for warnings
- Keep paragraphs to 2-3 sentences max

EXPERTISE:
- Medical necessity statements
- Insurance requirements (Aetna, BCBS, Medicaid, UHC, Cigna)
- SMART goal writing
- CPT codes (97151-97158)
- FBA documentation
- Parent training requirements

Never mention being an AI. Respond as a knowledgeable colleague.
Never give long walls of text. Be punchy and actionable.`

// ============== QUICK ACTIONS ==============
const QUICK_ACTIONS = [
  { icon: FileText, label: "Medical necessity", prompt: "Give me a template for medical necessity" },
  { icon: Target, label: "Goal examples", prompt: "Show me SMART goal examples for communication" },
  { icon: DollarSign, label: "CPT codes", prompt: "Quick guide to ABA CPT codes" },
  { icon: Clock, label: "Hours justification", prompt: "How to justify 30+ hours per week" },
]

// ============== FORMATTERS ==============
function parseResponse(text: string): FormattedContent[] {
  const sections: FormattedContent[] = []
  const lines = text.split("\n")

  let currentList: string[] = []
  let listType: "bullet" | "numbered" | null = null

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      sections.push({ type: listType, content: "", items: [...currentList] })
      currentList = []
      listType = null
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      return
    }

    // Tip
    if (trimmed.startsWith("💡") || trimmed.toLowerCase().startsWith("tip:")) {
      flushList()
      sections.push({ type: "tip", content: trimmed.replace(/^💡\s*|^tip:\s*/i, "") })
    }
    // Warning
    else if (
      trimmed.startsWith("⚠️") ||
      trimmed.toLowerCase().startsWith("note:") ||
      trimmed.toLowerCase().startsWith("warning:")
    ) {
      flushList()
      sections.push({ type: "warning", content: trimmed.replace(/^⚠️\s*|^note:\s*|^warning:\s*/i, "") })
    }
    // Heading (## or bold line alone)
    else if (trimmed.startsWith("##") || (trimmed.startsWith("**") && trimmed.endsWith("**") && trimmed.length < 60)) {
      flushList()
      sections.push({ type: "heading", content: trimmed.replace(/^##\s*|\*\*/g, "") })
    }
    // Bullet
    else if (trimmed.match(/^[-•*]\s/)) {
      if (listType !== "bullet") flushList()
      listType = "bullet"
      currentList.push(trimmed.replace(/^[-•*]\s/, ""))
    }
    // Numbered
    else if (trimmed.match(/^\d+\.\s/)) {
      if (listType !== "numbered") flushList()
      listType = "numbered"
      currentList.push(trimmed.replace(/^\d+\.\s/, ""))
    }
    // Code
    else if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
      flushList()
      sections.push({ type: "code", content: trimmed.slice(1, -1) })
    }
    // Regular text
    else {
      flushList()
      sections.push({ type: "text", content: trimmed })
    }
  })

  flushList()
  return sections
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function RenderContent({ sections }: { sections: FormattedContent[] }) {
  return (
    <div className="space-y-2.5">
      {sections.map((section, i) => {
        switch (section.type) {
          case "heading":
            return (
              <p key={i} className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-1">
                {section.content}
              </p>
            )

          case "bullet":
            return (
              <ul key={i} className="space-y-1">
                {section.items?.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-[#0D9488] mt-1.5 text-xs">●</span>
                    <span className="flex-1">
                      <FormattedText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            )

          case "numbered":
            return (
              <ol key={i} className="space-y-1">
                {section.items?.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-[#0D9488] font-medium text-xs min-w-[18px]">{j + 1}.</span>
                    <span className="flex-1">
                      <FormattedText text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            )

          case "tip":
            return (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <FormattedText text={section.content} />
                </p>
              </div>
            )

          case "warning":
            return (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  <FormattedText text={section.content} />
                </p>
              </div>
            )

          case "code":
            return (
              <code
                key={i}
                className="block px-3 py-2 bg-gray-800 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto"
              >
                {section.content}
              </code>
            )

          default:
            return (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">
                <FormattedText text={section.content} />
              </p>
            )
        }
      })}
    </div>
  )
}

// ============== MAIN COMPONENT ==============
export function AIAssistant({
  currentStep,
  clientDiagnosis,
}: {
  currentStep?: number
  clientDiagnosis?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let contextInfo = ""
      if (currentStep) contextInfo += `[Step ${currentStep}/11] `
      if (clientDiagnosis) contextInfo += `[Dx: ${clientDiagnosis}] `

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: "user", content: content.trim() }]),
          currentStep,
          clientDiagnosis,
          systemPrompt: SYSTEM_PROMPT + (contextInfo ? `\n\nContext: ${contextInfo}` : ""),
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "I couldn't process that. Try rephrasing?",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Connection issue. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen ? "bg-gray-800 hover:bg-gray-700" : "bg-gradient-to-br from-[#0D9488] to-cyan-600 hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <Sparkles className="h-6 w-6 text-white" />
            {showPulse && <span className="absolute inset-0 rounded-full bg-[#0D9488] animate-ping opacity-30" />}
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white" />
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-0 duration-200">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0D9488] to-cyan-600">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-sm">ARIA Assistant</h3>
              <p className="text-xs text-white/70">ABA documentation expert</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0D9488]/20 to-cyan-500/20 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-[#0D9488]" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">How can I help?</h4>
                <p className="text-xs text-gray-500 mb-4">
                  Ask about medical necessity, goals, CPT codes, or insurance requirements
                </p>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors group"
                    >
                      <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                        <action.icon className="h-3.5 w-3.5 text-[#0D9488]" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="relative group max-w-[90%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 ${
                        message.role === "user" ? "bg-[#0D9488] text-white rounded-br-md" : "bg-gray-100 rounded-bl-md"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <RenderContent sections={parseResponse(message.content)} />
                      )}
                    </div>

                    {/* Copy button for assistant messages */}
                    {message.role === "assistant" && (
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="absolute -bottom-1 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white rounded shadow-sm transition-opacity"
                      >
                        {copied === message.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 bg-[#0D9488] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#0D9488] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#0D9488] rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="flex-1 py-2 bg-transparent text-sm focus:outline-none disabled:opacity-50 placeholder:text-gray-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center hover:bg-[#0B7C7C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
