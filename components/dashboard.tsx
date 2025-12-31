"use client"

import { useState, useEffect, useMemo } from "react"
import { WizardNavigation } from "./wizard-navigation"
import { ClientForm } from "./client-form"
import { GoalBankBrowser } from "./goal-bank-browser"
import { AIReportGenerator } from "./ai-report-generator"
import { CPTAuthorizationRequest } from "./cpt-authorization-request"
import type { ClientData, AssessmentData, SelectedGoal, ReassessmentData, AgencyData } from "@/lib/types"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useToast } from "@/hooks/use-toast"
import { TimeSavedTracker } from "./time-saved-tracker"
import { ABCObservation } from "./abc-observation"
import { InterventionsLibrary } from "./interventions-library"
import { TeachingProtocolBuilder } from "./teaching-protocol-builder"
import { RiskAssessment } from "./risk-assessment"
import { GoalsTracker } from "./goals-tracker"
import { ParentTrainingTracker } from "./parent-training-tracker"
import { ServiceSchedule } from "./service-schedule"
import { ConsentForm } from "./consent-form"
import { BackgroundHistory } from "./background-history"
import { MedicalNecessityGenerator } from "./medical-necessity-generator"
import { ProgressDashboard } from "./progress-dashboard"
import { AssessmentForm } from "./assessment-form"
import { ReassessmentForm } from "./reassessment-form"
import { DataIntegration } from "./data-integration"
import { ComplianceSupport } from "./compliance-support"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MenuIcon, PlusIcon, SparklesIcon, CheckCircleIcon, ArrowLeftIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { getNextStep, getPreviousStep } from "./wizard-sidebar"

type ActiveView =
  | "client"
  | "background"
  | "assessment"
  | "abc"
  | "risk"
  | "reassessment"
  | "progressdashboard"
  | "integration"
  | "goals"
  | "goalstracker"
  | "interventions"
  | "protocols"
  | "parenttraining"
  | "schedule"
  | "cptauth"
  | "consent"
  | "medicalnecessity"
  | "report"
  | "progressreport" // Added progressreport view type
  | "timesaved"
  | "support"

export function Dashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("client")
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [reassessmentData, setReassessmentData] = useState<ReassessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [agencyData, setAgencyData] = useState<AgencyData[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [completedSteps, setCompletedSteps] = useState<ActiveView[]>([])
  const [activeField, setActiveField] = useState<string | undefined>()
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem("aria_completed_steps")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompletedSteps(parsed)
      } catch (e) {
        console.error("Failed to parse completed steps", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("aria_completed_steps", JSON.stringify(completedSteps))
  }, [completedSteps])

  // Calculate progress
  const totalSteps = 20
  const completedCount = completedSteps.length
  const progressPercent = Math.round((completedCount / totalSteps) * 100)

  const markStepComplete = (step: ActiveView) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
      toast({
        title: "Success",
        description: `${step} has been saved`,
        variant: "default",
      })
    }
  }

  const handlePrevious = () => {
    const prevStep = getPreviousStep(activeView)
    if (prevStep) {
      setActiveView(prevStep as ActiveView)
    }
  }

  const handleNext = () => {
    markStepComplete(activeView)
    const nextStep = getNextStep(activeView)
    if (nextStep) {
      setActiveView(nextStep as ActiveView)
    }
  }

  const hasPrevious = getPreviousStep(activeView) !== null
  const hasNext = getNextStep(activeView) !== null
  const isLastStep = activeView === "report"

  const nonWizardViews: ActiveView[] = ["timesaved", "support"]
  const hasNavigation = !nonWizardViews.includes(activeView)

  useKeyboardShortcuts({
    onSave: () => {
      markStepComplete(activeView)
      setLastSaved(new Date())
    },
    onNext: handleNext,
    onPrevious: handlePrevious,
    onShowShortcuts: () => setShowShortcuts(true),
  })

  useAutoSave({
    data: { clientData, assessmentData, selectedGoals },
    onSave: () => setLastSaved(new Date()),
  })

  const safeClientData = useMemo(() => {
    if (!clientData) {
      return {
        id: "",
        name: "Unnamed Client",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        age: 0,
        gender: "Unknown",
        diagnosis: "",
        insuranceProvider: "",
        insuranceId: "",
        guardianName: "",
        guardianPhone: "",
        guardianEmail: "",
        referralSource: "",
        referralDate: "",
        assessmentDate: new Date().toISOString().split("T")[0],
        assessor: "",
        supervisingBCBA: "",
      } as ClientData
    }
    return clientData
  }, [clientData])

  const renderActiveView = () => {
    console.log("[v0] renderActiveView called with activeView:", activeView)

    switch (activeView) {
      case "client":
        return (
          <ClientForm
            clientData={clientData}
            onSave={(data) => {
              setClientData(data)
              markStepComplete("client")
            }}
            onNext={handleNext}
          />
        )
      case "background":
        console.log("[v0] Rendering BackgroundHistory for view:", activeView)
        return <BackgroundHistory clientData={safeClientData} onSave={() => markStepComplete("background")} />
      case "assessment":
        return (
          <AssessmentForm
            clientId={safeClientData.id}
            assessmentData={assessmentData}
            onSave={(data) => {
              setAssessmentData(data)
              markStepComplete("assessment")
            }}
            onNext={handleNext}
            onBack={handlePrevious}
          />
        )
      case "abc":
        return <ABCObservation onSave={() => markStepComplete("abc")} />
      case "risk":
        return <RiskAssessment clientData={safeClientData} onSave={() => markStepComplete("risk")} />
      case "reassessment":
        return (
          <ReassessmentForm
            clientData={safeClientData}
            previousAssessment={assessmentData}
            onSave={(data) => {
              setReassessmentData(data)
              markStepComplete("reassessment")
            }}
          />
        )
      case "progressdashboard":
        return <ProgressDashboard clientData={safeClientData} assessmentData={assessmentData} />
      case "integration":
        return (
          <DataIntegration
            clientData={safeClientData}
            onDataImport={(data) => setAgencyData(data)}
            onSkip={handleNext}
          />
        )
      case "goals":
        return (
          <GoalBankBrowser
            clientData={safeClientData}
            onGoalSelect={(goal) => setSelectedGoals((prev) => [...prev, goal])}
            selectedGoals={selectedGoals}
          />
        )
      case "goalstracker":
        return <GoalsTracker clientData={safeClientData} onSave={() => markStepComplete("goalstracker")} />
      case "interventions":
        return <InterventionsLibrary onSave={() => markStepComplete("interventions")} />
      case "protocols":
        return <TeachingProtocolBuilder onSave={() => markStepComplete("protocols")} />
      case "parenttraining":
        return <ParentTrainingTracker onSave={() => markStepComplete("parenttraining")} />
      case "schedule":
        return <ServiceSchedule onSave={() => markStepComplete("schedule")} />
      case "cptauth":
        return <CPTAuthorizationRequest clientData={safeClientData} onSave={() => markStepComplete("cptauth")} />
      case "consent":
        return <ConsentForm clientData={safeClientData} onSave={() => markStepComplete("consent")} />
      case "medicalnecessity":
        return (
          <MedicalNecessityGenerator
            clientData={safeClientData}
            assessmentData={assessmentData}
            onSave={() => markStepComplete("medicalnecessity")}
          />
        )
      case "report":
        return <AIReportGenerator />
      case "progressreport":
        const ProgressReportPage = require("@/app/assessment/progress-report/page").default
        return <ProgressReportPage />
      case "timesaved":
        return <TimeSavedTracker />
      case "support":
        return <ComplianceSupport />
      default:
        return <ClientForm clientData={clientData} onSave={(data) => setClientData(data)} onNext={handleNext} />
    }
  }

  const isStepCompleted = (step: ActiveView) => completedSteps.includes(step)

  const handleGenerateText = async (field: string, prompt: string): Promise<string> => {
    try {
      const newMessages = [...aiMessages, { role: "user", content: prompt }]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          clientData,
          currentStep: activeView,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate text")
      }

      const data = await response.json()
      const aiResponse = data.message || "I'm here to help! What would you like assistance with?"

      setAiMessages([...newMessages, { role: "assistant", content: aiResponse }])

      return aiResponse
    } catch (error) {
      console.error("[v0] Error generating text:", error)
      return "Sorry, I couldn't generate text at this time. Please try again."
    }
  }

  const handleInsertText = (text: string) => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement

    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      const start = activeElement.selectionStart || 0
      const end = activeElement.selectionEnd || 0
      const currentValue = activeElement.value || ""

      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
      activeElement.value = newValue

      // Trigger change event so form updates
      const event = new Event("input", { bubbles: true })
      activeElement.dispatchEvent(event)

      // Set cursor position after inserted text
      const newCursorPos = start + text.length
      activeElement.setSelectionRange(newCursorPos, newCursorPos)
      activeElement.focus()
    }
  }

  useEffect(() => {
    console.log("[v0] activeView changed to:", activeView)
  }, [activeView])

  const isReady = useMemo(() => {
    const requiredFields = [
      clientData?.name || clientData?.firstName,
      clientData?.dateOfBirth,
      clientData?.diagnosis,
      assessmentData?.domains?.length,
      selectedGoals?.length,
    ]
    return requiredFields.every((field) => Boolean(field))
  }, [clientData, assessmentData, selectedGoals])

  const handleSaveAll = async () => {
    try {
      setIsSaving(true)
      setSaveStatus("saving")

      // Save all data to localStorage
      const allData = {
        clientData,
        assessmentData,
        assessmentGoals: selectedGoals,
        reassessmentData,
        agencyData,
        completedSteps,
        lastSaved: new Date().toISOString(),
      }

      localStorage.setItem("aria-assessment-data", JSON.stringify(allData))

      setSaveStatus("saved")
      setLastSaved(new Date())

      toast({
        title: "Success",
        description: "All data saved successfully",
        variant: "default",
      })

      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (error) {
      console.error("[v0] Save error:", error)
      setSaveStatus("error")

      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
        variant: "destructive",
      })

      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Modern Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-y-auto",
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-[280px]",
        )}
      >
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">ARIA</h1>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-0"
              >
                AI-Powered
              </Badge>
            </div>
          </div>

          <Button
            onClick={() => setActiveView("client")}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>

        <div className="flex-1 px-2 py-4">
          <div className="mb-4 px-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Overall Progress</div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progressPercent}% Complete ({completedCount}/{totalSteps})
            </div>
          </div>

          <Accordion type="multiple" defaultValue={["client", "assessment", "goals", "reports"]} className="space-y-1">
            <AccordionItem value="client" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  {isStepCompleted("client") && <CheckCircleIcon className="w-4 h-4 text-teal-600" />}
                  <span>Client Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem
                    active={activeView === "client"}
                    label="Client Info"
                    completed={isStepCompleted("client")}
                    onClick={() => setActiveView("client")}
                  />
                  <NavItem
                    active={activeView === "background"}
                    label="Background & History"
                    completed={isStepCompleted("background")}
                    onClick={() => setActiveView("background")}
                  />
                  <NavItem
                    active={activeView === "integration"}
                    label="Data Integration"
                    completed={isStepCompleted("integration")}
                    onClick={() => setActiveView("integration")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="assessment" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  {isStepCompleted("assessment") && <CheckCircleIcon className="w-4 h-4 text-teal-600" />}
                  <span>Assessment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem
                    active={activeView === "assessment"}
                    label="Assessment Data"
                    completed={isStepCompleted("assessment")}
                    onClick={() => setActiveView("assessment")}
                  />
                  <NavItem
                    active={activeView === "abc"}
                    label="ABC Observations"
                    completed={isStepCompleted("abc")}
                    onClick={() => setActiveView("abc")}
                  />
                  <NavItem
                    active={activeView === "risk"}
                    label="Risk Assessment"
                    completed={isStepCompleted("risk")}
                    onClick={() => setActiveView("risk")}
                  />
                  <NavItem
                    active={activeView === "reassessment"}
                    label="Reassessment"
                    completed={isStepCompleted("reassessment")}
                    onClick={() => setActiveView("reassessment")}
                  />
                  <NavItem
                    active={activeView === "progressdashboard"}
                    label="Progress Dashboard"
                    completed={isStepCompleted("progressdashboard")}
                    onClick={() => setActiveView("progressdashboard")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="goals" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  {isStepCompleted("goals") && <CheckCircleIcon className="w-4 h-4 text-teal-600" />}
                  <span>Goals & Treatment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem
                    active={activeView === "goals"}
                    label="Goal Bank"
                    completed={isStepCompleted("goals")}
                    onClick={() => setActiveView("goals")}
                  />
                  <NavItem
                    active={activeView === "goalstracker"}
                    label="Goals Tracker"
                    completed={isStepCompleted("goalstracker")}
                    onClick={() => setActiveView("goalstracker")}
                  />
                  <NavItem
                    active={activeView === "interventions"}
                    label="Interventions"
                    completed={isStepCompleted("interventions")}
                    onClick={() => setActiveView("interventions")}
                  />
                  <NavItem
                    active={activeView === "protocols"}
                    label="Teaching Protocols"
                    completed={isStepCompleted("protocols")}
                    onClick={() => setActiveView("protocols")}
                  />
                  <NavItem
                    active={activeView === "parenttraining"}
                    label="Parent Training"
                    completed={isStepCompleted("parenttraining")}
                    onClick={() => setActiveView("parenttraining")}
                  />
                  <NavItem
                    active={activeView === "schedule"}
                    label="Service Schedule"
                    completed={isStepCompleted("schedule")}
                    onClick={() => setActiveView("schedule")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reports" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  {isStepCompleted("report") && <CheckCircleIcon className="w-4 h-4 text-teal-600" />}
                  <span>Reports & Documents</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem
                    active={activeView === "report"}
                    label="Generate Report"
                    completed={isStepCompleted("report")}
                    onClick={() => setActiveView("report")}
                  />
                  <NavItem
                    active={activeView === "progressreport"}
                    label="Progress Report"
                    completed={isStepCompleted("progressreport")}
                    onClick={() => setActiveView("progressreport")}
                  />
                  <NavItem
                    active={activeView === "medicalnecessity"}
                    label="Medical Necessity"
                    completed={isStepCompleted("medicalnecessity")}
                    onClick={() => setActiveView("medicalnecessity")}
                  />
                  <NavItem
                    active={activeView === "cptauth"}
                    label="CPT Authorization"
                    completed={isStepCompleted("cptauth")}
                    onClick={() => setActiveView("cptauth")}
                  />
                  <NavItem
                    active={activeView === "consent"}
                    label="Consent Forms"
                    completed={isStepCompleted("consent")}
                    onClick={() => setActiveView("consent")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="utilities" className="border-none">
              <AccordionTrigger className="px-2 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium">
                Utilities
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-1">
                <div className="space-y-0.5 ml-2 pl-3 border-l border-gray-200">
                  <NavItem
                    active={activeView === "timesaved"}
                    label="Time Saved"
                    onClick={() => setActiveView("timesaved")}
                  />
                  <NavItem
                    active={activeView === "support"}
                    label="Compliance Support"
                    onClick={() => setActiveView("support")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700 text-xs font-medium">
                U
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">User</div>
              <div className="text-xs text-gray-500 truncate">Professional Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/")}
              className="flex items-center gap-2 text-teal-600 hover:bg-teal-50"
              title="Back to Home"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </Button>

            <div className="text-sm text-gray-500">
              Assessment / <span className="text-gray-900 font-medium">{activeView}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveAll}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md"
              disabled={isSaving || saveStatus === "saved" || saveStatus === "error"}
            >
              {isSaving
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Error"
                    : "Save All"}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            {renderActiveView()}

            {hasNavigation && (
              <WizardNavigation
                onPrevious={hasPrevious ? handlePrevious : undefined}
                onNext={hasNext ? handleNext : undefined}
                isLastStep={isLastStep}
              />
            )}
          </div>
        </div>
      </div>

      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  )
}

// Helper component for navigation items
function NavItem({
  label,
  active = false,
  completed = false,
  onClick,
}: {
  label: string
  active?: boolean
  completed?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-2 py-1.5 text-sm rounded transition-colors flex items-center gap-2",
        active
          ? "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 font-medium"
          : "text-gray-600 hover:bg-gray-50",
      )}
    >
      {completed && <CheckCircleIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
      <span className="truncate">{label}</span>
    </button>
  )
}
