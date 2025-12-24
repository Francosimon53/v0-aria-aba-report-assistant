"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  SparklesIcon,
  SendIcon,
  BookOpenIcon,
  ShieldIcon,
  FileTextIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  ZapIcon,
  MenuIcon,
  XIcon,
  RefreshCwIcon, // Added RefreshCwIcon for clear chat button
} from "@/components/icons"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { title: string; type: string }[]
  timestamp: Date
}

interface ConversationThread {
  id: string
  title: string
  preview: string
  timestamp: Date
  messages: Message[]
}

const quickFollowUps = ["Tell me more", "Give me an example", "What documents do I need?", "How do I implement this?"]

export function ComplianceSupport() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<"all" | "hipaa" | "insurance" | "ethics">("all")
  const [showSidebar, setShowSidebar] = useState(true)
  const [conversations, setConversations] = useState<ConversationThread[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue
    if (!messageToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      sources: [],
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const messagesToSend = messages
        .filter((m) => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
        .concat([{ role: "user", content: userMessage.content }])

      const response = await fetch("/api/compliance-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response body")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                assistantMessage.content += parsed.delta.text
                setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
              }
            } catch {
              // Skip parse errors
            }
          }
        }
      }

      const lowerContent = assistantMessage.content.toLowerCase()
      const sources: Message["sources"] = []
      if (lowerContent.includes("hipaa") || lowerContent.includes("phi") || lowerContent.includes("privacy")) {
        sources.push({ title: "HIPAA Guidelines", type: "hipaa" })
      }
      if (
        lowerContent.includes("insurance") ||
        lowerContent.includes("authorization") ||
        lowerContent.includes("billing")
      ) {
        sources.push({ title: "Insurance Requirements", type: "insurance" })
      }
      if (lowerContent.includes("documentation") || lowerContent.includes("report")) {
        sources.push({ title: "Documentation Standards", type: "faq" })
      }

      assistantMessage.sources = sources
      setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...assistantMessage } : m)))
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: "An error occurred. Please try again." } : m)),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const startNewConversation = () => {
    console.log("[v0] startNewConversation called, messages count:", messages.length)
    if (messages.length > 0) {
      const newThread: ConversationThread = {
        id: Date.now().toString(),
        title: messages[0]?.content.slice(0, 40) + "..." || "New conversation",
        preview: messages[messages.length - 1]?.content.slice(0, 60) + "..." || "",
        timestamp: new Date(),
        messages: [...messages],
      }
      setConversations((prev) => [newThread, ...prev])
      console.log("[v0] Conversation saved to history")
    }
    setMessages([])
    setActiveConversation(null)
    console.log("[v0] Messages cleared, ready for new conversation")
  }

  const loadConversation = (thread: ConversationThread) => {
    setMessages(thread.messages)
    setActiveConversation(thread.id)
  }

  const suggestedPrompts = [
    {
      icon: <ShieldIcon className="h-4 w-4 text-emerald-600" />,
      title: "HIPAA Basics",
      prompt: "What do I need to know about HIPAA?",
      category: "hipaa",
    },
    {
      icon: <FileTextIcon className="h-4 w-4 text-blue-600" />,
      title: "Documentation",
      prompt: "What should I include in a session note?",
      category: "insurance",
    },
    {
      icon: <BookOpenIcon className="h-4 w-4 text-purple-600" />,
      title: "BACB Ethics",
      prompt: "What are the key ethical principles?",
      category: "ethics",
    },
    {
      icon: <ZapIcon className="h-4 w-4 text-amber-600" />,
      title: "Authorizations",
      prompt: "How do I justify medical necessity?",
      category: "insurance",
    },
  ]

  const knowledgeCategories = [
    { id: "all", label: "All", count: 24 },
    { id: "hipaa", label: "HIPAA", count: 8 },
    { id: "insurance", label: "Insurance", count: 10 },
    { id: "ethics", label: "Ethics", count: 6 },
  ]

  const filteredPrompts =
    activeCategory === "all" ? suggestedPrompts : suggestedPrompts.filter((p) => p.category === activeCategory)

  return (
    <Card className="flex-1 min-h-0 flex overflow-hidden border-0 shadow-none bg-background">
      {/* Sidebar */}
      <div
        className={`${showSidebar ? "w-64" : "w-0"} border-r border-border bg-muted/30 flex flex-col transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        <div className="p-3 border-b border-border flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log("[v0] New Query button clicked")
              startNewConversation()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer"
          >
            <PlusIcon className="h-4 w-4" />
            New Query
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">History</div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">No previous conversations</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => loadConversation(thread)}
                  className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                    activeConversation === thread.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  }`}
                >
                  <p className="font-medium truncate text-xs">{thread.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.preview}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm flex-shrink-0 sticky top-0 z-10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {showSidebar ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">ARIA Compliance</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Online
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={startNewConversation}
              className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">New Chat</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/25">
                  <SparklesIcon className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">How can I help you?</h2>
                <p className="text-muted-foreground text-sm">HIPAA, insurance, ABA ethics - ask me anything</p>
              </div>

              {/* Category Pills */}
              <div className="flex gap-2 mb-5">
                {knowledgeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {filteredPrompts.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(item.prompt)}
                    className="group flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-left"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
              {messages.map((message, index) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                      <SparklesIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {message.role === "assistant" && !message.content && isLoading ? (
                        <div className="flex items-center gap-1.5 py-1">
                          <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      )}
                    </div>

                    {/* Actions for assistant messages */}
                    {message.role === "assistant" && message.content && (
                      <div className="flex items-center gap-1 mt-1.5 ml-1">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors"
                          title="Copy"
                        >
                          {copiedId === message.id ? (
                            <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        {message.sources && message.sources.length > 0 && (
                          <div className="flex items-center gap-1 ml-1">
                            {message.sources.map((source, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {source.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick follow-ups after last assistant message */}
                    {message.role === "assistant" && message.content && !isLoading && index === messages.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {quickFollowUps.map((followUp, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(followUp)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all"
                          >
                            {followUp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium">You</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-border bg-muted/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm px-2 py-1.5 max-h-[120px] placeholder:text-muted-foreground"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              ARIA may make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
