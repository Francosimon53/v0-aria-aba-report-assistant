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
  ChevronRightIcon,
  SaveIcon,
  ClockIcon,
  Loader2Icon,
  TrendingDownIcon,
  AlertTriangleIcon,
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
import { ReasonForReferral } from "@/components/reason-for-referral"
import { StandardizedAssessments } from "@/components/standardized-assessments"
import { FadePlan } from "@/components/fade-plan"
import { BarriersGeneralization } from "@/components/barriers-generalization"
import { Card, CardContent } from "@/components/ui/card"

type ActiveView =
  | "client"
  | "background"
  | "referral"
  | "standardized"
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
  | "fadeplan"
  | "barriers"
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
      {
        id: "referral" as ActiveView,
        label: "Reason for Referral",
        icon: FileTextIcon,
        description: "Presenting concerns & goals",
      },
    ],
  },
  {
    title: "Assessment",
    items: [
      {
        id: "standardized" as ActiveView,
        label: "Standardized Assessments",
        icon: ClipboardListIcon,
        description: "ABLLS-R, Vineland, SRS-2, MAS",
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
      {
        id: "fadeplan" as ActiveView,
        label: "Fade Plan",
        icon: TrendingDownIcon,
        description: "Service reduction criteria",
      },
      {
        id: "barriers" as ActiveView,
        label: "Barriers & Generalization",
        icon: AlertTriangleIcon,
        description: "Treatment barriers & strategies",
      },
      { id: "consent" as ActiveView, label: "Consent Forms", icon: FileTextIcon, description: "Required consents" },
      { id: "report" as ActiveView, label: "Generate Report", icon: FileTextIcon, description: "Create final report" },
    ],
  },
]

interface StepNavigationBarProps {
  currentStep: ActiveView
  allSteps: ActiveView[]
  onPrevious: () => void
  onNext: () => void
  onSave: () => Promise<void>
  completedSteps: Set<ActiveView>
  themeColor?: "teal" | "orange"
}

function StepNavigationBar({
  currentStep,
  allSteps,
  onPrevious,
  onNext,
  onSave,
  completedSteps,
  themeColor = "teal",
}: StepNavigationBarProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const currentIndex = allSteps.indexOf(currentStep)
  const totalSteps = allSteps.length
  const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100)

  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < totalSteps - 1
  const isLastStep = currentIndex === totalSteps - 1

  const prevStepId = hasPrevious ? allSteps[currentIndex - 1] : null
  const nextStepId = hasNext ? allSteps[currentIndex + 1] : null

  const getStepLabel = (stepId: ActiveView | null) => {
    if (!stepId) return ""
    const allItems = phases.flatMap((p) => p.items)
    return allItems.find((item) => item.id === stepId)?.label || stepId
  }

  const handleSaveAndContinue = async () => {
    setIsSaving(true)
    setSaveStatus("saving")
    try {
      await onSave()
      setSaveStatus("saved")
      setTimeout(() => {
        if (hasNext) {
          onNext()
        }
        setSaveStatus("idle")
      }, 500)
    } catch (error) {
      console.error("Save error:", error)
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  const colors =
    themeColor === "teal"
      ? {
          border: "border-t-teal-500",
          progress: "from-teal-500 to-cyan-500",
          text: "text-teal-600",
          button: "from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700",
        }
      : {
          border: "border-t-orange-500",
          progress: "from-orange-500 to-amber-500",
          text: "text-orange-600",
          button: "from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600",
        }

  return (
    <Card className={`mt-8 border-t-4 ${colors.border} shadow-lg`}>
      <CardContent className="p-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assessment Progress</span>
            <span className={`text-sm font-bold ${colors.text}`}>{progressPercent}% Complete</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors.progress} transition-all duration-500 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              Step {currentIndex + 1} of {totalSteps}
            </span>
            <span>{getStepLabel(currentStep)}</span>
          </div>
        </div>

        {/* Save status indicator */}
        {saveStatus !== "idle" && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              saveStatus === "saving" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
            }`}
          >
            {saveStatus === "saving" && (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Saving your progress...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                <span>All changes saved successfully!</span>
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <div className="flex-1">
            {hasPrevious && prevStepId && (
              <Button variant="outline" onClick={onPrevious} className="bg-transparent">
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                Back to {getStepLabel(prevStepId)}
              </Button>
            )}
          </div>

          {/* Next/Continue button */}
          <div className="flex-1 flex justify-end">
            {hasNext && nextStepId && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className={`bg-gradient-to-r ${colors.button} text-white shadow-lg`}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save & Continue to {getStepLabel(nextStepId)}
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            {isLastStep && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Complete Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help text */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          Your progress is automatically saved. Click "Save & Continue" to proceed to the next step.
        </p>
      </CardContent>
    </Card>
  )
}

export function InitialAssessmentDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("client")
  const [completedSteps, setCompletedSteps] = useState<Set<ActiveView>>(new Set())
  const [clientData, setClientData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { toast } = useToast()

  const allSteps: ActiveView[] = phases.flatMap((p) => p.items.map((i) => i.id))

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

  const handlePrevious = () => {
    const currentIndex = allSteps.indexOf(activeView)
    if (currentIndex > 0) {
      setActiveView(allSteps[currentIndex - 1])
    }
  }

  const handleNext = () => {
    const currentIndex = allSteps.indexOf(activeView)
    if (currentIndex < allSteps.length - 1) {
      setActiveView(allSteps[currentIndex + 1])
    }
  }

  const handleSave = async () => {
    // Trigger save event for current component
    window.dispatchEvent(new CustomEvent("aria-save-all"))
    await new Promise((resolve) => setTimeout(resolve, 300))
    markStepComplete(activeView)
  }

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
      case "referral":
        return <ReasonForReferral onSave={() => markStepComplete("referral")} />
      case "standardized":
        return <StandardizedAssessments onSave={() => markStepComplete("standardized")} />
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
      case "fadeplan":
        return <FadePlan onSave={() => markStepComplete("fadeplan")} />
      case "barriers":
        return <BarriersGeneralization onSave={() => markStepComplete("barriers")} />
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
        <div className="p-6">
          {renderContent()}

          <StepNavigationBar
            currentStep={activeView}
            allSteps={allSteps}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSave={handleSave}
            completedSteps={completedSteps}
            themeColor="teal"
          />
        </div>
      </main>
    </div>
  )
}
