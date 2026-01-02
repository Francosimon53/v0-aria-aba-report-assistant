"use client"

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
  TrendingUpIcon,
  ClockIcon,
  RefreshCwIcon,
  BarChartIcon,
  Loader2Icon,
} from "@/components/icons"

// Import all the form components
import { ClientForm } from "@/components/client-form"
import { BackgroundHistory } from "@/components/background-history"
import { AssessmentForm } from "@/components/assessment-form"
import { ABCObservation } from "@/components/abc-observation"
import { RiskAssessment } from "@/components/risk-assessment"
import { GoalBankBrowser } from "@/components/goal-bank-browser"
import { InterventionsLibrary } from "@/components/interventions-library"
import { TeachingProtocolBuilder } from "@/components/teaching-protocol-builder"
import { ParentTrainingTracker } from "@/components/parent-training-tracker"
import { ServiceSchedule } from "@/components/service-schedule"
import { MedicalNecessityGenerator } from "@/components/medical-necessity-generator"
import { CPTAuthorizationRequest } from "@/components/cpt-authorization-request"
import { ConsentFormsManager } from "@/components/consent-forms-manager"
import { AIReportGenerator } from "@/components/ai-report-generator"
import { ServiceDeliverySummary } from "@/components/service-delivery-summary"
import { PreviousGoalsProgress } from "@/components/previous-goals-progress"
import { GoalsReview } from "@/components/goals-review"
import { Card, CardContent } from "@/components/ui/card"

type ActiveView =
  | "client"
  | "background"
  | "service-delivery"
  | "previous-goals"
  | "assessment"
  | "abc"
  | "risk"
  | "goals-review"
  | "new-goals"
  | "interventions"
  | "protocols"
  | "parent"
  | "schedule"
  | "medical"
  | "cptauth"
  | "consent"
  | "report"

const phases = [
  {
    title: "Client Information",
    items: [
      { id: "client" as ActiveView, label: "Client Info", icon: UserIcon, description: "Review & update demographics" },
      {
        id: "background" as ActiveView,
        label: "Background & History",
        icon: BookOpenIcon,
        description: "Update if changed",
      },
    ],
  },
  {
    title: "Previous Period Review",
    color: "orange",
    items: [
      {
        id: "service-delivery" as ActiveView,
        label: "Service Delivery Summary",
        icon: BarChartIcon,
        description: "Hours authorized vs delivered",
      },
      {
        id: "previous-goals" as ActiveView,
        label: "Previous Goals Progress",
        icon: TrendingUpIcon,
        description: "Progress data for each goal",
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
        description: "Compare to baseline",
      },
      { id: "abc" as ActiveView, label: "ABC Observations", icon: FileTextIcon, description: "Current observations" },
      { id: "risk" as ActiveView, label: "Risk Assessment", icon: ShieldIcon, description: "Updated risk evaluation" },
    ],
  },
  {
    title: "Goals & Treatment",
    items: [
      {
        id: "goals-review" as ActiveView,
        label: "Goals Review",
        icon: RefreshCwIcon,
        description: "Continue/Modify/Discontinue",
      },
      { id: "new-goals" as ActiveView, label: "New Goals", icon: TargetIcon, description: "Add new treatment goals" },
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
        description: "Continued necessity",
      },
      {
        id: "cptauth" as ActiveView,
        label: "CPT Authorization",
        icon: ClipboardListIcon,
        description: "Authorization renewal",
      },
      { id: "consent" as ActiveView, label: "Consent Forms", icon: FileTextIcon, description: "Required consents" },
      {
        id: "report" as ActiveView,
        label: "Generate Report",
        icon: FileTextIcon,
        description: "Create reassessment report",
      },
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
  themeColor = "orange",
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

export function ReassessmentDashboard() {
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
        const savedClient = localStorage.getItem("aria-reassessment-client-info")
        if (savedClient) {
          setClientData(JSON.parse(savedClient))
        }
        const savedSteps = localStorage.getItem("aria-reassessment-completed-steps")
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
        localStorage.setItem("aria-reassessment-completed-steps", JSON.stringify([...newSet]))
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
        return <ClientForm onSave={() => markStepComplete("client")} assessmentType="reassessment" />
      case "background":
        return <BackgroundHistory onSave={() => markStepComplete("background")} />
      case "service-delivery":
        return <ServiceDeliverySummary onSave={() => markStepComplete("service-delivery")} />
      case "previous-goals":
        return <PreviousGoalsProgress onSave={() => markStepComplete("previous-goals")} />
      case "assessment":
        return <AssessmentForm onSave={() => markStepComplete("assessment")} />
      case "abc":
        return <ABCObservation onSave={() => markStepComplete("abc")} />
      case "risk":
        return <RiskAssessment onSave={() => markStepComplete("risk")} />
      case "goals-review":
        return <GoalsReview onSave={() => markStepComplete("goals-review")} />
      case "new-goals":
        return <GoalBankBrowser onSave={() => markStepComplete("new-goals")} />
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
        return <ClientForm onSave={() => markStepComplete("client")} assessmentType="reassessment" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - ORANGE THEME */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <RefreshCwIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Reassessment</h1>
              <p className="text-xs text-orange-100">6-Month Review</p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="p-3 border-b border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-gray-600 hover:text-orange-700 hover:border-orange-300 bg-transparent"
            onClick={() => (window.location.href = "/dashboard")}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Progress - ORANGE */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-orange-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-orange-100 [&>div]:bg-orange-500" />
          <p className="text-xs text-gray-500 mt-1">
            {completedSteps.size} of {allItems.length} sections complete
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <Accordion type="multiple" defaultValue={phases.map((_, i) => `phase-${i}`)} className="space-y-1">
            {phases.map((phase, phaseIndex) => (
              <AccordionItem key={phaseIndex} value={`phase-${phaseIndex}`} className="border-none">
                <AccordionTrigger
                  className={`py-2 px-3 text-sm font-semibold hover:no-underline hover:bg-gray-50 rounded-lg ${
                    phase.title === "Previous Period Review" ? "text-orange-700 bg-orange-50" : "text-gray-700"
                  }`}
                >
                  {phase.title}
                  {phase.title === "Previous Period Review" && (
                    <span className="ml-2 px-1.5 py-0.5 bg-orange-200 text-orange-700 rounded text-xs">NEW</span>
                  )}
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-0">
                  <div className="space-y-0.5 ml-2">
                    {phase.items.map((item) => {
                      const isActive = activeView === item.id
                      const isComplete = completedSteps.has(item.id)
                      const Icon = item.icon
                      const isPreviousReview = phase.title === "Previous Period Review"

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            isActive
                              ? isPreviousReview
                                ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                                : "bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center ${
                              isComplete
                                ? "bg-orange-500"
                                : isActive
                                  ? "bg-orange-200"
                                  : isPreviousReview
                                    ? "bg-orange-100"
                                    : "bg-gray-200"
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircleIcon className="h-3 w-3 text-white" />
                            ) : (
                              <Icon
                                className={`h-3 w-3 ${
                                  isActive ? "text-orange-700" : isPreviousReview ? "text-orange-500" : "text-gray-500"
                                }`}
                              />
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

        {/* Save All Button - ORANGE */}
        <div className="p-3 border-t border-gray-200">
          <Button onClick={handleSaveAll} disabled={isSaving} className="w-full bg-orange-500 hover:bg-orange-600">
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
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              Reassessment
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
            themeColor="orange"
          />
        </div>
      </main>
    </div>
  )
}
