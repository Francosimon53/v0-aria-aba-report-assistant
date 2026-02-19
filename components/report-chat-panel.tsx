"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { MessageSquare, Send, Sparkles, X, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ReportSection {
  id: string
  title: string
  status: "pending" | "generating" | "complete" | "error"
  content: string
}

interface ReportChatPanelProps {
  assessmentData: Record<string, any>
  sections: ReportSection[]
  onSectionUpdate: (sectionId: string, content: string, action: "replace" | "append") => void
  onHighlightSection: (sectionId: string) => void
}

const SECTION_LABELS: Record<string, string> = {
  header: "Header & Client Information",
  service_recommendations: "Service Recommendations Table",
  referral: "Reason for Referral",
  background: "Background Information",
  assessments: "Assessments Conducted",
  standardized_assessments: "Standardized Assessment Results",
  abc_observations: "ABC Observations",
  preference_assessment: "Preference Assessment",
  maladaptive_behaviors: "Maladaptive Behaviors",
  hypothesis_interventions: "Hypothesis-Based Interventions",
  intervention_descriptions: "Description of Interventions",
  teaching_procedures: "Teaching Procedures",
  skill_acquisition_goals: "Skill Acquisition Goals",
  behavior_reduction_goals: "Behavior Reduction Goals",
  caregiver_goals: "Caregiver Training Goals",
  parent_training_progress: "Parent Training Progress",
  medical_necessity: "Medical Necessity Statement",
  fade_plan: "Fade Plan & Discharge Criteria",
  barriers_treatment: "Barriers to Treatment",
  generalization_maintenance: "Generalization & Maintenance",
  crisis_plan: "Crisis Plan & Coordination of Care",
}

const QUICK_SUGGESTIONS = [
  "Write the medical necessity section",
  "Generate the background information",
  "Write the reason for referral",
  "Create skill acquisition goals",
]

export function ReportChatPanel({
  assessmentData,
  sections,
  onSectionUpdate,
  onHighlightSection,
}: ReportChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Open panel on mount if there are pending sections (avoids hydration mismatch)
  useEffect(() => {
    if (sections.some((s) => s.status === "pending")) {
      setIsOpen(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const assessmentContext = useMemo(() => {
    const clientInfo = assessmentData?.clientInfo
    const completedSections = sections.filter((s) => s.status === "complete").map((s) => s.title)
    const pendingSections = sections.filter((s) => s.status === "pending").map((s) => s.title)

    return {
      clientName: [clientInfo?.firstName, clientInfo?.lastName].filter(Boolean).join(" ") || "the client",
      clientAge: clientInfo?.age ?? "unknown",
      diagnosis: clientInfo?.diagnosis || "ASD",
      assessmentType: clientInfo?.assessmentType || "initial",
      completedSections,
      pendingSections,
    }
  }, [assessmentData, sections])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/report-chat",
        body: () => ({ assessmentContext }),
      }),
    [assessmentContext],
  )

  const onToolCallRef = useRef<ReportChatPanelProps["onSectionUpdate"]>(onSectionUpdate)
  const onHighlightRef = useRef<ReportChatPanelProps["onHighlightSection"]>(onHighlightSection)
  useEffect(() => {
    onToolCallRef.current = onSectionUpdate
    onHighlightRef.current = onHighlightSection
  }, [onSectionUpdate, onHighlightSection])

  const handleToolCall = useCallback(
    async ({ toolCall }: { toolCall: { toolCallId: string; toolName: string; input: unknown } }) => {
      if (toolCall.toolName === "update_report_section") {
        const args = toolCall.input as {
          section_id: string
          content: string
          action?: "replace" | "append"
        }

        onToolCallRef.current(args.section_id, args.content, args.action || "replace")
        onHighlightRef.current(args.section_id)
      }
    },
    [],
  )

  const { messages, sendMessage, status, addToolOutput } = useChat({
    transport,
    onToolCall: handleToolCall,
  })

  const isStreaming = status === "submitted" || status === "streaming"

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isStreaming])

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = text || input.trim()
      if (!messageText || isStreaming) return
      setInput("")
      sendMessage({ text: messageText })
    },
    [input, isStreaming, sendMessage],
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Toggle button when panel is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-b from-[#0D9488] to-cyan-600 text-white px-2 py-6 rounded-l-xl shadow-lg hover:px-3 transition-all group"
        >
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs font-medium [writing-mode:vertical-lr] rotate-180">ARIA Chat</span>
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0D9488] to-cyan-600 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">ARIA Report Assistant</h3>
              <p className="text-xs text-teal-100">Ask me to write or improve any section</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 overflow-hidden">
            <div ref={scrollRef} className="p-4 space-y-4">
              {/* Welcome message when empty */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-700">
                      Hi! I can help you write and improve your assessment report sections. Tell me which section
                      you&apos;d like me to work on, or try one of the suggestions below.
                    </p>
                  </div>

                  {/* Quick suggestions */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium px-1">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSend(suggestion)}
                          className="text-xs bg-[#0D9488]/5 border border-[#0D9488]/20 hover:bg-[#0D9488]/10 text-[#0D9488] px-3 py-1.5 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {messages.map((message) => {
                if (message.role === "user") {
                  const userText = message.parts
                    .filter((p): p is { type: "text"; text: string } => p.type === "text")
                    .map((p) => p.text)
                    .join("")

                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] bg-[#0D9488] text-white rounded-2xl rounded-br-md px-4 py-2.5">
                        <p className="text-sm whitespace-pre-wrap">{userText}</p>
                      </div>
                    </div>
                  )
                }

                if (message.role === "assistant") {
                  const textParts = message.parts.filter(
                    (p): p is { type: "text"; text: string } => p.type === "text",
                  )
                  const toolParts = message.parts.filter(
                    (p) => p.type.startsWith("tool-") || p.type === "dynamic-tool",
                  )
                  const hasText = textParts.some((p) => p.text.trim())

                  return (
                    <div key={message.id} className="space-y-2">
                      {/* Tool result cards */}
                      {toolParts.map((part, i) => {
                        const toolPart = part as {
                          type: string
                          toolCallId: string
                          toolName?: string
                          state: string
                          input?: Record<string, unknown>
                        }
                        const sectionId = (toolPart.input as Record<string, string>)?.section_id
                        const label = SECTION_LABELS[sectionId] || sectionId
                        const isDone =
                          toolPart.state === "output-available" || toolPart.state === "output-error"

                        return (
                          <div
                            key={i}
                            className="bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
                          >
                            <div className="h-7 w-7 rounded-lg bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                              {isDone ? (
                                <Check className="h-3.5 w-3.5 text-[#0D9488]" />
                              ) : (
                                <div className="h-3.5 w-3.5 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#0D9488] truncate">
                                {isDone ? "Updated" : "Updating"}: {label}
                              </p>
                            </div>
                            {isDone && sectionId && (
                              <button
                                onClick={() => onHighlightSection(sectionId)}
                                className="text-xs text-[#0D9488] hover:underline flex-shrink-0"
                              >
                                View
                              </button>
                            )}
                          </div>
                        )
                      })}

                      {/* Text content */}
                      {hasText && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {textParts
                                  .map((p) => p.text)
                                  .join("")
                                  .trim()}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                return null
              })}

              {/* Typing indicator */}
              {isStreaming && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Section status summary */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {sections.filter((s) => s.status === "complete").length} done
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {sections.filter((s) => s.status === "pending").length} pending
              </span>
            </div>
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ARIA to write or improve a section..."
                disabled={isStreaming}
                rows={1}
                className={cn(
                  "flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488]",
                  "disabled:opacity-50 placeholder:text-gray-400",
                )}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                  input.trim() && !isStreaming
                    ? "bg-[#0D9488] text-white hover:bg-[#0B7C7C]"
                    : "bg-gray-100 text-gray-400",
                )}
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
