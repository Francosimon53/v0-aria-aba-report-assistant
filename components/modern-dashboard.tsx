"use client"

import { useState, useEffect } from "react"
import { ModernSidebar } from "./modern-sidebar"
import { AIWritingPanel } from "./ai-writing-panel"
import { ClientForm } from "./client-form"
import { GoalBankBrowser } from "./goal-bank-browser"
import { ReportPreviewTool } from "./report-preview-tool"
import { CPTAuthorizationRequest } from "./cpt-authorization-request"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"
import { premiumToast } from "@/components/ui/premium-toast"
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

export function ModernDashboard() {
  const [activeView, setActiveView] = useState<ActiveView>("client")
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<ActiveView[]>([])
  const [currentField, setCurrentField] = useState<string | undefined>()

  useEffect(() => {
    const saved = localStorage.getItem("aria_completed_steps")
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved))
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

  const handleInsertText = (text: string) => {
    // This will be handled by the form components that listen to this event
    window.dispatchEvent(
      new CustomEvent("ai-insert-text", {
        detail: { text, field: currentField },
      }),
    )
  }

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
            onNext={() => setActiveView("background")}
            onFieldFocus={(fieldName) => setCurrentField(fieldName)}
          />
        )
      case "background":
        return (
          <BackgroundHistory
            clientData={clientData}
            onSave={() => markStepComplete("background")}
            onFieldFocus={(fieldName) => setCurrentField(fieldName)}
          />
        )
      case "assessment":
        return (
          <AssessmentForm
            clientId={clientData?.id ?? ""}
            assessmentData={assessmentData}
            onSave={(data) => {
              setAssessmentData(data)
              markStepComplete("assessment")
            }}
            onNext={() => setActiveView("abc")}
            onBack={() => setActiveView("background")}
            onFieldFocus={(fieldName) => setCurrentField(fieldName)}
          />
        )
      case "abc":
        return <ABCObservation onSave={() => markStepComplete("abc")} />
      case "risk":
        return <RiskAssessment clientData={clientData} onSave={() => markStepComplete("risk")} />
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
            onFieldFocus={(fieldName) => setCurrentField(fieldName)}
          />
        )
      case "report":
        return (
          <ReportPreviewTool clientData={clientData} assessmentData={assessmentData} selectedGoals={selectedGoals} />
        )
      case "progressdashboard":
        return <ProgressDashboard clientData={clientData} assessmentData={assessmentData} />
      default:
        return (
          <ClientForm
            clientData={clientData}
            onSave={(data) => setClientData(data)}
            onFieldFocus={(fieldName) => setCurrentField(fieldName)}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ModernSidebar
        activeView={activeView}
        onViewChange={(view) => setActiveView(view as ActiveView)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        completedSteps={completedSteps}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 border-b border-gray-200 bg-white flex items-center px-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Assessment</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium capitalize">{activeView.replace(/([A-Z])/g, " $1").trim()}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{renderActiveView()}</div>
      </main>

      <AIWritingPanel
        currentField={currentField}
        onInsertText={handleInsertText}
        contextData={{ clientData, assessmentData, selectedGoals }}
      />
    </div>
  )
}
