"use client"

import type React from "react"
import { AutoSaveProvider } from "@/contexts/auto-save-context"
import { AutoSaveStatus } from "@/components/auto-save-status"

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AutoSaveProvider>
      <div className="min-h-screen bg-background">
        {/* Global auto-save status header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-lg font-semibold">ARIA ABA Assessment</h1>
          <AutoSaveStatus />
        </header>
        {children}
      </div>
    </AutoSaveProvider>
  )
}
