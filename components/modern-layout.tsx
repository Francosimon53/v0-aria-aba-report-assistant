"use client"

import { useState, type ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MenuIcon, PlusIcon, SparklesIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

interface ModernLayoutProps {
  children: ReactNode
  activeSection?: string
  activeField?: string
  onGenerateText?: (field: string, prompt: string) => Promise<string>
  onInsertText?: (text: string) => void
}

export function ModernLayout({
  children,
  activeSection = "client",
  activeField,
  onGenerateText,
  onInsertText,
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiPanelOpen, setAiPanelOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-[280px]" : "w-0 overflow-hidden",
        )}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">ARIA</h1>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                AI-Powered
              </Badge>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <div className="mb-4 px-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Overall Progress</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 w-[45%] transition-all" />
            </div>
            <div className="text-xs text-gray-500 mt-1">45% Complete</div>
          </div>

          <Accordion type="multiple" defaultValue={["client", "assessment"]} className="space-y-1">
            <AccordionItem value="client" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                Client Information
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem active={activeSection === "client"} label="Basic Info" />
                  <NavItem label="Contact Details" />
                  <NavItem label="Demographics" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="assessment" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                Assessment
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem active={activeSection === "background"} label="Background & History" />
                  <NavItem active={activeSection === "assessment"} label="Assessment Data" />
                  <NavItem label="ABC Observations" />
                  <NavItem label="Risk Assessment" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="goals" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                Goals & Treatment
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem active={activeSection === "goals"} label="Goal Bank" />
                  <NavItem label="Service Schedule" />
                  <NavItem label="Teaching Protocols" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reports" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                Reports
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem active={activeSection === "report"} label="Generate Report" />
                  <NavItem label="Medical Necessity" />
                  <NavItem label="CPT Authorization" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 px-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Recent</div>
            <div className="space-y-1">
              <RecentItem name="John Doe - Initial" date="Today" />
              <RecentItem name="Jane Smith - Reassessment" date="Yesterday" />
            </div>
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">User</div>
              <div className="text-xs text-gray-500 truncate">user@example.com</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <MenuIcon className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <div className="text-xs text-gray-500">Assessment / {activeSection}</div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setAiPanelOpen(!aiPanelOpen)} className="gap-2">
            <SparklesIcon className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </main>

      {aiPanelOpen && (
        <AIWritingAssistant
          activeField={activeField}
          onGenerateText={onGenerateText}
          onInsertText={onInsertText}
          onClose={() => setAiPanelOpen(false)}
        />
      )}
    </div>
  )
}

// Helper components
function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        "w-full text-left px-2 py-1.5 text-sm rounded transition-colors",
        active ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-600 hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  )
}

function RecentItem({ name, date }: { name: string; date: string }) {
  return (
    <button className="w-full text-left px-2 py-2 rounded hover:bg-gray-50 transition-colors">
      <div className="text-sm text-gray-900 font-medium truncate">{name}</div>
      <div className="text-xs text-gray-500">{date}</div>
    </button>
  )
}

// Export AI Writing Assistant component
import { AIWritingAssistant } from "./ai-writing-assistant"
