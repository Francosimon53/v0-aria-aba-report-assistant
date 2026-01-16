"use client"

import { useState, useEffect } from "react"
import { WizardSidebar, getNextStep, getPreviousStep } from "./wizard-sidebar"
import { WizardNavigation } from "./wizard-navigation"
import { AIAssistantWidget } from "./ai-assistant-widget"
import { ClientForm } from "./client-form"
import { GoalBankBrowser } from "./goal-bank-browser"
import { ReportPreviewTool } from "./report-preview-tool"
import { CPTAuthorizationRequest } from "./cpt-authorization-request"
import type { ClientData, AssessmentData, SelectedGoal, ReassessmentData, AgencyData } from "@/lib/types"
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useAutoSave } from "@/hooks/use-auto-save"
import { saveAssessment } from "@/lib/supabase/assessments"
import { premiumToast } from "@/components/ui/premium-toast"
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
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<ActiveView[]>([])

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

  const markStepComplete = (step: ActiveView) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step])
      premiumToast.success("Step completed", `${step} has been saved`)
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
    onSave: async (data) => {
      try {
        const result = await saveAssessment(data, assessmentId || undefined)
        if (result.id && !assessmentId) {
          setAssessmentId(result.id)
        }
        setLastSaved(new Date())
        console.log("Auto-saved to Supabase:", result.id)
      } catch (error) {
        console.error("Error saving to Supabase:", error)
      }
    },
  })

  const renderActiveView = () => {
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
        return <BackgroundHistory clientData={clientData} onSave={() => markStepComplete("background")} />
      case "assessment":
        return (
          <AssessmentForm
            clientId={clientData?.id ?? ""}
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
            onGoalSelect={(goal) => setSelectedGoals((prev) => [...prev, goal])}
            selectedGoals={selectedGoals}
          />
        )
      case "goalstracker":
        return <GoalsTracker clientData={clientData} onSave={() => markStepComplete("goalstracker")} />
      case "interventions":
        return <InterventionsLibrary onSave={() => markStepComplete("interventions")} />
      case "protocols":
        return <TeachingProtocolBuilder onSave={() => markStepComplete("protocols")} />
      case "parenttraining":
        return <ParentTrainingTracker onSave={() => markStepComplete("parenttraining")} />
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
        return <ClientForm clientData={clientData} onSave={(data) => setClientData(data)} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <WizardSidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as ActiveView)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        clientData={clientData}
        assessmentData={assessmentData}
        selectedGoalsCount={selectedGoals?.length ?? 0}
        completedSteps={completedSteps}
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
          />
        )}
      </main>

      {lastSaved && (
        <div className="fixed bottom-20 left-6 z-40 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full shadow-md border border-border animate-in fade-in-0 slide-in-from-bottom-2">
          Saved {new Date(lastSaved).toLocaleTimeString()}
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
