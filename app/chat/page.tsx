"use client"

import { ChatInterface } from "@/components/chat-interface"
import { Navbar } from "@/components/navbar"

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
