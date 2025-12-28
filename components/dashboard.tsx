"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WizardSidebar, getNextStep, getPreviousStep } from "./wizard-sidebar"
import { WizardNavigation } from "./wizard-navigation"
import { AIAssistantWidget } from "./ai-assistant-widget"
import { ClientForm } from "./client-form"
import { GoalBankBrowser } from "./goal-bank-browser"
import { ReportPreviewTool } from "./report-preview-tool"
import { CPTAuthorizationRequest } from "./cpt-authorization-request"
import { DomainsAndFunctionalImpact } from "./domains-functional-impact"
import type { ClientData, AssessmentData, SelectedGoal, ReassessmentData, AgencyData } from "@/lib/types"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"
import { premiumToast } from "@/components/ui/premium-toast"
import { TimeSavedTracker } from "./time-saved-tracker"
import { ABCObservation } from "./abc-observation"
import { RiskAssessment } from "./risk-assessment"
import { GoalsTracker } from "./goals-tracker"
import { ServiceSchedule } from "./service-schedule"
import { ConsentForm } from "./consent-form"
import { BackgroundHistory } from "./background-history"
import { MedicalNecessityGenerator } from "./medical-necessity-generator"
import { ProgressDashboard } from "./progress-dashboard"
import { AssessmentForm } from "./assessment-form"
import { ReassessmentForm } from "./reassessment-form"
import { DataIntegration } from "./data-integration"
import { ComplianceSupport } from "./compliance-support"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

type ActiveView =
  | "client"
  | "background"
  | "assessment"
  | "domains"
  | "abc"
  | "risk"
  | "reassessment"
  | "progressdashboard"
  | "integration"
  | "goals"
  | "goalstracker"
  | "schedule"
  | "cptauth"
  | "consent"
  | "medicalnecessity"
  | "report"
  | "timesaved"
  | "support"

export function Dashboard() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<ActiveView>("client")
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [reassessmentData, setReassessmentData] = useState<ReassessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [agencyData, setAgencyData] = useState<AgencyData[]>([])
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [completedSteps, setCompletedSteps] = useState<ActiveView[]>([])
  const [evaluationType, setEvaluationType] = useState<"Initial Assessment" | "Reassessment">("Initial Assessment")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const setupConfig = safeGetJSON("aria_setup_config", null)
    if (setupConfig && setupConfig.evaluationType) {
      setEvaluationType(setupConfig.evaluationType)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const parsed = safeGetJSON("aria_completed_steps", [])
    if (Array.isArray(parsed)) {
      setCompletedSteps(parsed)
    }
  }, [])

  useEffect(() => {
    safeSetJSON("aria_completed_steps", completedSteps)
  }, [completedSteps])

  const markStepComplete = (step: ActiveView) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
      premiumToast.success("Step completed", `${step} has been saved`)
    }
  }

  const handlePrevious = () => {
    const prevStep = getPreviousStep(activeView, evaluationType)
    if (prevStep) {
      setActiveView(prevStep as ActiveView)
    }
  }

  const handleNext = () => {
    markStepComplete(activeView)
    const nextStep = getNextStep(activeView, evaluationType)
    if (nextStep) {
      setActiveView(nextStep as ActiveView)
    }
  }

  const handleStepClick = (view: ActiveView) => {
    const stepRoutes: Record<string, string> = {
      client: "/assessment/client-info",
      background: "/assessment/background-history",
      assessment: "/assessment/evaluation",
      domains: "/assessment/domains",
      abc: "/assessment/abc-observation",
      risk: "/assessment/risk-assessment",
      goals: "/assessment/goals",
      schedule: "/assessment/service-plan",
      cptauth: "/assessment/cpt-authorization",
      consent: "/assessment/signatures",
      medicalnecessity: "/assessment/medical-necessity",
      report: "/assessment/generate-report",
    }

    if (stepRoutes[view]) {
      router.push(stepRoutes[view])
    } else {
      setActiveView(view)
    }
  }

  const hasPrevious = getPreviousStep(activeView, evaluationType) !== null
  const hasNext = getNextStep(activeView, evaluationType) !== null
  const isLastStep = activeView === "report"

  const nonWizardViews: ActiveView[] = ["timesaved", "support"]
  const hasNavigation = !nonWizardViews.includes(activeView)

  const renderActiveView = () => {
    switch (activeView) {
      case "client":
        return (
          <ClientForm
            onSave={(data) => {
              setClientData(data)
              markStepComplete("client")
            }}
            initialData={clientData}
          />
        )
      case "background":
        return <BackgroundHistory clientData={clientData} onSave={() => markStepComplete("background")} />
      case "assessment":
        return (
          <AssessmentForm
            clientData={clientData}
            onSave={(data) => {
              setAssessmentData(data)
              markStepComplete("assessment")
            }}
          />
        )
      case "domains":
        return <DomainsAndFunctionalImpact onSave={() => markStepComplete("domains")} />
      case "abc":
        return <ABCObservation onSave={() => markStepComplete("abc")} />
      case "risk":
        return <RiskAssessment clientData={clientData} onSave={() => markStepComplete("risk")} />
      case "reassessment":
        return (
          <ReassessmentForm
            clientData={clientData}
            previousAssessment={assessmentData}
            onSave={(data) => {
              setReassessmentData(data)
              markStepComplete("reassessment")
            }}
          />
        )
      case "progressdashboard":
        return <ProgressDashboard clientData={clientData} assessmentData={assessmentData} />
      case "integration":
        return <DataIntegration onDataImported={(data) => setAgencyData(data)} />
      case "goals":
        return (
          <GoalBankBrowser
            selectedGoals={selectedGoals}
            onGoalSelect={(goalId) => {
              const existingIndex = selectedGoals.findIndex((g) => g.goalId === goalId)
              if (existingIndex >= 0) {
                setSelectedGoals(selectedGoals.filter((g) => g.goalId !== goalId))
              } else {
                setSelectedGoals([
                  ...selectedGoals,
                  {
                    goalId,
                    priority: "medium",
                    targetDate: "",
                    baselineData: "",
                    customizations: "",
                  },
                ])
              }
              markStepComplete("goals")
            }}
            onUpdateGoal={(goalId, updates) => {
              setSelectedGoals(selectedGoals.map((g) => (g.goalId === goalId ? { ...g, ...updates } : g)))
            }}
            onNext={handleNext}
            onBack={handlePrevious}
          />
        )
      case "goalstracker":
        return <GoalsTracker clientData={clientData} onSave={() => markStepComplete("goalstracker")} />
      case "schedule":
        return <ServiceSchedule onSave={() => markStepComplete("schedule")} />
      case "cptauth":
        return <CPTAuthorizationRequest clientData={clientData} onSave={() => markStepComplete("cptauth")} />
      case "consent":
        return <ConsentForm clientData={clientData} onSave={() => markStepComplete("consent")} />
      case "medicalnecessity":
        return (
          <MedicalNecessityGenerator
            clientData={clientData}
            assessmentData={assessmentData}
            onSave={() => markStepComplete("medicalnecessity")}
          />
        )
      case "report":
        return (
          <ReportPreviewTool clientData={clientData} assessmentData={assessmentData} selectedGoals={selectedGoals} />
        )
      case "timesaved":
        return <TimeSavedTracker />
      case "support":
        return <ComplianceSupport />
      default:
        return <ClientForm onSave={(data) => setClientData(data)} initialData={clientData} />
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0D9488] border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <WizardSidebar
        activeView={activeView}
        onViewChange={handleStepClick}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        clientData={clientData}
        assessmentData={assessmentData}
        selectedGoalsCount={(selectedGoals ?? []).length}
        completedSteps={completedSteps ?? []}
        evaluationType={evaluationType}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{renderActiveView()}</div>

        {hasNavigation && (
          <WizardNavigation
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            isLastStep={isLastStep}
            canProceed={true}
            currentStep={activeView}
          />
        )}
      </main>

      {lastSaved && (
        <div className="fixed top-20 right-6 z-40 text-xs text-muted-foreground bg-card/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border border-border animate-in fade-in-0 slide-in-from-right-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        </div>
      )}

      <AIAssistantWidget
        clientData={clientData}
        assessmentData={assessmentData}
        selectedGoals={selectedGoals}
        currentStep={activeView}
      />

      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  )
}
