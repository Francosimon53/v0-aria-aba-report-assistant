"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Headphones } from "@/components/icons"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_ACTIONS = [
  "I need help with my account",
  "I have a billing question",
  "Report a technical issue",
  "Contact human support",
]

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! How can we help you today? Describe your issue and our team will assist you.",
}

export function AriaHelpChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "F1") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    // Reset messages to fresh welcome message
    setMessages([WELCOME_MESSAGE])
    setInput("")
  }

  const checkForHumanSupport = (text: string): boolean => {
    const humanKeywords = [
      "human",
      "agent",
      "person",
      "real person",
      "talk to someone",
      "contact human support",
      "speak to someone",
    ]
    return humanKeywords.some((keyword) => text.toLowerCase().includes(keyword))
  }

  const handleSend = async (question?: string) => {
    const text = question || input.trim()
    if (!text || isLoading) return

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: text }])
    setInput("")

    if (checkForHumanSupport(text)) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I understand you'd like to speak with a human. For immediate assistance:\n\n📧 Email: support@ariaba.app\n📞 Schedule a call: calendly.com/ariaba-support\n\nOur team typically responds within 24 hours. Is there anything else I can help you with in the meantime?",
        },
      ])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          category: "user_manual",
          topK: 3,
        }),
      })

      const data = await response.json()

      const aiResponse = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          context: data.chunks?.map((c: any) => c.content).join("\n\n") || "",
        }),
      })

      const aiData = await aiResponse.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            aiData.answer ||
            "I couldn't find specific information about that. Please email support@ariaba.app for further assistance.",
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or email support@ariaba.app",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all ${
          isOpen ? "bg-gray-500 hover:bg-gray-600" : "bg-teal-500 hover:bg-teal-600"
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[500px] shadow-2xl z-50 flex flex-col border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-4 px-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Customer Support</h3>
                <p className="text-xs text-teal-100">We're here to help</p>
              </div>
            </div>
            {/* X button to close and clear conversation */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close and clear conversation"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden bg-gray-50">
            <ScrollArea className="h-full p-4">
              <div ref={scrollRef} className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-teal-500 text-white rounded-br-md"
                          : "bg-white shadow-sm border rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-sm border rounded-2xl rounded-bl-md px-4 py-3">
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

                {messages.length <= 2 && !isLoading && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          className="text-xs bg-white border hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {/* Input */}
          <div className="p-3 bg-white border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe your issue..."
                disabled={isLoading}
                className="rounded-full bg-gray-50 border-gray-200"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full bg-teal-500 hover:bg-teal-600 h-10 w-10 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Press F1 or Cmd+/ for help</p>
          </div>
        </Card>
      )}
    </>
  )
}
