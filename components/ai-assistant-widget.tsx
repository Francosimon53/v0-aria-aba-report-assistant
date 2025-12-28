"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { XIcon, SendIcon, SparklesIcon, MinusIcon, MaximizeIcon, UserIcon, Loader2Icon } from "@/components/icons"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIAssistantWidgetProps {
  clientData?: any
  assessmentData?: any
  selectedGoals?: any[]
  currentStep?: string
  onNavigate?: (step: string) => void
}

const getQuickActions = (step?: string) => {
  const stepActions: Record<string, Array<{ label: string; action: string }>> = {
    "client-info": [
      { label: "What fields are required?", action: "ask" },
      { label: "Skip to Assessment", action: "navigate:assessment" },
    ],
    "background-history": [
      { label: "Example developmental history", action: "ask" },
      { label: "Skip to Goals", action: "navigate:goals" },
    ],
    assessment: [
      { label: "Which tool should I use?", action: "ask" },
      { label: "Help interpreting scores", action: "ask" },
    ],
    goals: [
      { label: "Write a behavior goal", action: "ask" },
      { label: "Browse Goal Bank", action: "navigate:goal-bank" },
    ],
    "medical-necessity": [
      { label: "Key insurance phrases", action: "ask" },
      { label: "Generate statement", action: "ask" },
    ],
    report: [
      { label: "Check for errors", action: "ask" },
      { label: "Export options", action: "ask" },
    ],
  }

  return step && stepActions[step]
    ? stepActions[step]
    : [
        { label: "Help me get started", action: "ask" },
        { label: "What should I do next?", action: "ask" },
      ]
}

export function AIAssistantWidget({
  clientData,
  assessmentData,
  selectedGoals,
  currentStep,
  onNavigate,
}: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm ARIA. Ask me anything about your assessment, or use the quick actions below.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showNotification, setShowNotification] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized])

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          clientData,
          currentStep,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()

      let responseContent = data.message || data.content || "Got it! Check the form on the left."

      // Handle array format from AI SDK
      if (Array.isArray(responseContent)) {
        responseContent = responseContent
          .filter((item: any) => item.type === "text")
          .map((item: any) => item.text)
          .join(" ")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Connection issue. Try again or check the form directly.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string, label: string) => {
    if (action.startsWith("navigate:") && onNavigate) {
      const target = action.replace("navigate:", "")
      onNavigate(target)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Navigating to ${target}...`,
          timestamp: new Date(),
        },
      ])
    } else {
      handleSend(label)
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    setShowNotification(false)
    setIsMinimized(false)
  }

  // Minimized bar
  if (isOpen && isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-[9999]">
        <div
          className="w-64 bg-gradient-to-r from-[#0D9488] to-[#0F766E] rounded-full shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-white" />
              <span className="text-white font-medium text-sm">ARIA</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full text-white/80 hover:text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed top-20 right-6 z-[9999] flex flex-col items-end gap-2">
          {showNotification && (
            <div className="bg-white rounded-xl shadow-lg px-3 py-2 max-w-[180px] border animate-in slide-in-from-right-5 fade-in-0 duration-300">
              <button
                onClick={() => setShowNotification(false)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <XIcon className="h-3 w-3 text-gray-500" />
              </button>
              <p className="text-xs text-gray-600">Need help?</p>
            </div>
          )}

          <button
            onClick={toggleOpen}
            className="group h-12 w-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <SparklesIcon className="h-5 w-5 text-white" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <>
          <div className="fixed inset-0 bg-black/10 z-[9998] md:hidden" onClick={toggleOpen} />

          <div
            className={`fixed z-[9999] bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in-0
              ${
                isExpanded
                  ? "inset-4 md:inset-8 rounded-2xl"
                  : "top-20 right-6 w-[340px] h-[420px] max-h-[calc(100vh-180px)] rounded-2xl"
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center">
                  <SparklesIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">ARIA</h3>
                  <p className="text-[10px] text-white/70">ABA Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(true)}
                >
                  <MinusIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white/80 hover:text-white hover:bg-white/20 hidden md:flex"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <MaximizeIcon className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                  onClick={toggleOpen}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant" ? "bg-gradient-to-br from-[#0D9488] to-[#0F766E]" : "bg-gray-200"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <SparklesIcon className="h-3 w-3 text-white" />
                    ) : (
                      <UserIcon className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 ${
                      message.role === "assistant"
                        ? "bg-white text-gray-700 shadow-sm border"
                        : "bg-[#0D9488] text-white"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-white rounded-xl px-3 py-2 shadow-sm border">
                    <div className="flex gap-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#0D9488] animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#0D9488] animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#0D9488] animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions - Always visible at bottom */}
            <div className="px-3 py-2 border-t bg-white">
              <div className="flex flex-wrap gap-1.5">
                {getQuickActions(currentStep).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(item.action, item.label)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-[#0D9488]/10 hover:text-[#0D9488] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-2.5 border-t bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a question..."
                  className="flex-1 h-9 px-3 rounded-full border bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 focus:border-[#0D9488]"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="h-9 w-9 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white disabled:opacity-50"
                >
                  {isTyping ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
