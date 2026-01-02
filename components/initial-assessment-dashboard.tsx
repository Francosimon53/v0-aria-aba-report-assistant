"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  UserIcon,
  FileTextIcon,
  TargetIcon,
  ClipboardListIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarIcon,
  ShieldIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  SaveIcon,
  ClockIcon,
} from "@/components/icons"

// Import all the form components
import { ClientForm } from "@/components/client-form"
import { BackgroundHistory } from "@/components/background-history"
import { AssessmentForm } from "@/components/assessment-form"
import { ABCObservation } from "@/components/abc-observation"
import { RiskAssessment } from "@/components/risk-assessment"
import { GoalBankBrowser } from "@/components/goal-bank-browser"
import { GoalsTracker } from "@/components/goals-tracker"
import { InterventionsLibrary } from "@/components/interventions-library"
import { TeachingProtocolBuilder } from "@/components/teaching-protocol-builder"
import { ParentTrainingTracker } from "@/components/parent-training-tracker"
import { ServiceSchedule } from "@/components/service-schedule"
import { MedicalNecessityGenerator } from "@/components/medical-necessity-generator"
import { CPTAuthorizationRequest } from "@/components/cpt-authorization-request"
import { ConsentFormsManager } from "@/components/consent-forms-manager"
import { AIReportGenerator } from "@/components/ai-report-generator"

type ActiveView =
  | "client"
  | "background"
  | "assessment"
  | "abc"
  | "risk"
  | "goalbank"
  | "goals"
  | "interventions"
  | "protocols"
  | "parent"
  | "schedule"
  | "medical"
  | "cptauth"
  | "consent"
  | "report"

interface NavItem {
  id: ActiveView
  label: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const phases = [
  {
    title: "Client Information",
    items: [
      { id: "client" as ActiveView, label: "Client Info", icon: UserIcon, description: "Demographics & insurance" },
      {
        id: "background" as ActiveView,
        label: "Background & History",
        icon: BookOpenIcon,
        description: "Medical & developmental history",
      },
    ],
  },
  {
    title: "Assessment",
    items: [
      {
        id: "assessment" as ActiveView,
        label: "Assessment Data",
        icon: ClipboardListIcon,
        description: "Skills & behavior evaluation",
      },
      {
        id: "abc" as ActiveView,
        label: "ABC Observations",
        icon: FileTextIcon,
        description: "Antecedent-Behavior-Consequence",
      },
      { id: "risk" as ActiveView, label: "Risk Assessment", icon: ShieldIcon, description: "Safety & risk evaluation" },
    ],
  },
  {
    title: "Goals & Treatment",
    items: [
      { id: "goalbank" as ActiveView, label: "Goal Bank", icon: TargetIcon, description: "Browse & select goals" },
      { id: "goals" as ActiveView, label: "Goals Tracker", icon: TargetIcon, description: "Track goal progress" },
      {
        id: "interventions" as ActiveView,
        label: "Interventions",
        icon: ClipboardListIcon,
        description: "Treatment interventions",
      },
      {
        id: "protocols" as ActiveView,
        label: "Teaching Protocols",
        icon: BookOpenIcon,
        description: "DTT & NET protocols",
      },
      { id: "parent" as ActiveView, label: "Parent Training", icon: UsersIcon, description: "Caregiver training" },
      {
        id: "schedule" as ActiveView,
        label: "Service Schedule",
        icon: CalendarIcon,
        description: "Weekly service hours",
      },
    ],
  },
  {
    title: "Reports & Documents",
    items: [
      {
        id: "medical" as ActiveView,
        label: "Medical Necessity",
        icon: FileTextIcon,
        description: "Medical necessity statement",
      },
      {
        id: "cptauth" as ActiveView,
        label: "CPT Authorization",
        icon: ClipboardListIcon,
        description: "CPT codes & authorization",
      },
      { id: "consent" as ActiveView, label: "Consent Forms", icon: FileTextIcon, description: "Required consents" },
      { id: "report" as ActiveView, label: "Generate Report", icon: FileTextIcon, description: "Create final report" },
    ],
  },
]

export function InitialAssessmentDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("client")
  const [completedSteps, setCompletedSteps] = useState<Set<ActiveView>>(new Set())
  const [clientData, setClientData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { toast } = useToast()

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedClient = localStorage.getItem("aria-initial-client-info")
        if (savedClient) {
          setClientData(JSON.parse(savedClient))
        }
        const savedSteps = localStorage.getItem("aria-initial-completed-steps")
        if (savedSteps) {
          setCompletedSteps(new Set(JSON.parse(savedSteps)))
        }
      } catch (e) {
        console.error("Error loading saved data:", e)
      }
    }
  }, [])

  // Calculate progress
  const allItems = phases.flatMap((p) => p.items)
  const progress = Math.round((completedSteps.size / allItems.length) * 100)

  const markStepComplete = useCallback((step: ActiveView) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev)
      newSet.add(step)
      if (typeof window !== "undefined") {
        localStorage.setItem("aria-initial-completed-steps", JSON.stringify([...newSet]))
      }
      return newSet
    })
  }, [])

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // Trigger save event for all components
      window.dispatchEvent(new CustomEvent("aria-save-all"))
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({
        title: "Progress Saved",
        description: "All your data has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your data.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderContent = () => {
    const safeClientData = clientData || {}

    switch (activeView) {
      case "client":
        return <ClientForm onSave={() => markStepComplete("client")} assessmentType="initial" />
      case "background":
        return <BackgroundHistory onSave={() => markStepComplete("background")} />
      case "assessment":
        return <AssessmentForm onSave={() => markStepComplete("assessment")} />
      case "abc":
        return <ABCObservation onSave={() => markStepComplete("abc")} />
      case "risk":
        return <RiskAssessment onSave={() => markStepComplete("risk")} />
      case "goalbank":
        return <GoalBankBrowser onSave={() => markStepComplete("goalbank")} />
      case "goals":
        return <GoalsTracker onSave={() => markStepComplete("goals")} />
      case "interventions":
        return <InterventionsLibrary onSave={() => markStepComplete("interventions")} />
      case "protocols":
        return <TeachingProtocolBuilder onSave={() => markStepComplete("protocols")} />
      case "parent":
        return <ParentTrainingTracker onSave={() => markStepComplete("parent")} />
      case "schedule":
        return <ServiceSchedule onSave={() => markStepComplete("schedule")} />
      case "medical":
        return <MedicalNecessityGenerator onSave={() => markStepComplete("medical")} />
      case "cptauth":
        return <CPTAuthorizationRequest clientData={safeClientData} onSave={() => markStepComplete("cptauth")} />
      case "consent":
        return <ConsentFormsManager clientData={safeClientData} onSave={() => markStepComplete("consent")} />
      case "report":
        return <AIReportGenerator />
      default:
        return <ClientForm onSave={() => markStepComplete("client")} assessmentType="initial" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Initial Assessment</h1>
              <p className="text-xs text-teal-100">New Client Evaluation</p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="p-3 border-b border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-gray-600 hover:text-teal-700 hover:border-teal-300 bg-transparent"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-teal-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-teal-100" />
          <p className="text-xs text-gray-500 mt-1">
            {completedSteps.size} of {allItems.length} sections complete
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <Accordion type="multiple" defaultValue={phases.map((_, i) => `phase-${i}`)} className="space-y-1">
            {phases.map((phase, phaseIndex) => (
              <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`} className="border-none">
                <AccordionTrigger className="py-2 px-3 text-sm font-semibold text-gray-700 hover:no-underline hover:bg-gray-50 rounded-lg">
                  {phase.title}
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-0">
                  <div className="space-y-0.5 ml-2">
                    {phase.items.map((item) => {
                      const isActive = activeView === item.id
                      const isComplete = completedSteps.has(item.id)
                      const Icon = item.icon

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            isActive
                              ? "bg-teal-50 text-teal-700 border-l-4 border-teal-500"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center ${
                              isComplete ? "bg-teal-500" : isActive ? "bg-teal-200" : "bg-gray-200"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircleIcon className="h-3 w-3 text-white" />
                            ) : (
                              <Icon className={`h-3 w-3 ${isActive ? "text-teal-700" : "text-gray-500"}`} />
                            )}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>

        {/* Save All Button */}
        <div className="p-3 border-t border-gray-200">
          <Button onClick={handleSaveAll} disabled={isSaving} className="w-full bg-teal-600 hover:bg-teal-700">
            {isSaving ? (
              <>
                <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save All Progress
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
              {sidebarOpen ? "←" : "→"}
            </Button>
            <div>
              <h2 className="font-semibold text-gray-800">
                {phases.flatMap((p) => p.items).find((i) => i.id === activeView)?.label}
              </h2>
              <p className="text-xs text-gray-500">
                {phases.flatMap((p) => p.items).find((i) => i.id === activeView)?.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
              Initial Assessment
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  )
}
