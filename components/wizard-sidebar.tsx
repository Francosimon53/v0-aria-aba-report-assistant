"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeftIcon, ChevronRightIcon, CheckCircle2Icon, HomeIcon } from "@/components/icons"
import type { ClientData, AssessmentData } from "@/lib/types"
import {
  getStepsByEvaluationType,
  getNextStepInArray,
  getPreviousStepInArray,
  type WizardStep,
} from "@/lib/wizard-steps-config"
import { withAid, getAidFromParams } from "@/lib/navigation-helpers"

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

interface WizardSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  collapsed: boolean
  onToggleCollapse: () => void
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  selectedGoalsCount: number
  completedSteps: ActiveView[]
  evaluationType: "Initial Assessment" | "Reassessment"
  assessmentId?: string | null // Add assessmentId prop</CHANGE>
}

export function WizardSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  clientData,
  assessmentData,
  selectedGoalsCount,
  completedSteps,
  evaluationType,
  assessmentId, // Accept assessmentId prop</CHANGE>
}: WizardSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const safeCompletedSteps = completedSteps ?? []

  const WIZARD_STEPS = getStepsByEvaluationType(evaluationType)

  // Get current step index
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === activeView)
  const currentPhase = currentStepIndex >= 0 ? WIZARD_STEPS[currentStepIndex].phase : 0

  // Check if a step is accessible (current or previous phases completed)
  const isStepAccessible = (step: WizardStep) => {
    const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step.id)
    return stepIndex <= currentStepIndex || safeCompletedSteps.includes(step.id) || step.phase <= currentPhase
  }

  const handleStepClick = (step: WizardStep) => {
    if (step.route) {
      const aidFromUrl = getAidFromParams(searchParams)
      const aid = aidFromUrl || assessmentId
      router.push(withAid(step.route, aid))
    } else {
      onViewChange(step.id)
    }
  }

  // Group steps by phase
  const phases = Array.from(new Set((WIZARD_STEPS ?? []).map((s) => s.phase))).sort()
  const phaseLabels: Record<number, string> = {}
  ;(WIZARD_STEPS ?? []).forEach((step) => {
    if (!phaseLabels[step.phase]) {
      phaseLabels[step.phase] = step.phaseLabel
    }
  })

  const isPhaseComplete = (phase: number) => {
    const phaseSteps = (WIZARD_STEPS ?? []).filter((s) => s.phase === phase)
    return phaseSteps.every((s) => safeCompletedSteps.includes(s.id))
  }

  const isPhaseActive = (phase: number) => {
    return currentPhase === phase
  }

  const isStepInFlow = (stepId: ActiveView) => {
    return (WIZARD_STEPS ?? []).some((s) => s.id === stepId)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-border bg-card transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488] text-white font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="font-semibold text-foreground">ARIA</h1>
              <p className="text-xs text-muted-foreground">Assessment Wizard</p>
            </div>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8">
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Wizard Progress Bar */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-[#0D9488]">
              {Math.round(
                (safeCompletedSteps.filter((s) => isStepInFlow(s)).length / Math.max((WIZARD_STEPS ?? []).length, 1)) *
                  100,
              )}
              %
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] to-cyan-500 transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${(safeCompletedSteps.filter((s) => isStepInFlow(s)).length / Math.max((WIZARD_STEPS ?? []).length, 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Wizard Steps */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Home button */}
        <div className="px-2 mb-2">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-auto py-2 text-muted-foreground hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <HomeIcon className="h-4 w-4" />
              {!collapsed && <span className="text-sm">Back to Home</span>}
            </Button>
          </Link>
        </div>

        {/* Phases */}
        {phases.map((phase) => {
          const phaseSteps = WIZARD_STEPS.filter((s) => s.phase === phase)
          const phaseComplete = isPhaseComplete(phase)
          const phaseActive = isPhaseActive(phase)

          return (
            <div key={phase} className="mb-1">
              {/* Phase Header */}
              {!collapsed && (
                <div className={cn("flex items-center gap-2 px-4 py-2 mt-2", phaseActive && "bg-[#0D9488]/5")}>
                  <div
                    className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold transition-all duration-300",
                      phaseComplete && "bg-[#0D9488] text-white",
                      phaseActive &&
                        !phaseComplete &&
                        "bg-[#0D9488]/20 text-[#0D9488] ring-2 ring-[#0D9488] ring-offset-1",
                      !phaseActive && !phaseComplete && "bg-muted text-muted-foreground",
                    )}
                  >
                    {phaseComplete ? <CheckCircle2Icon className="h-4 w-4" /> : phase}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      phaseActive ? "text-[#0D9488]" : "text-muted-foreground",
                    )}
                  >
                    {phaseLabels[phase]}
                  </span>
                </div>
              )}

              {/* Phase Steps */}
              <div className="px-2 space-y-0.5">
                {phaseSteps.map((step, stepIndex) => {
                  const Icon = step.icon
                  const isActive = activeView === step.id
                  const isCompleted = safeCompletedSteps.includes(step.id)
                  const accessible = isStepAccessible(step)
                  const globalIndex = WIZARD_STEPS.findIndex((s) => s.id === step.id)

                  return (
                    <div key={step.id} className="relative">
                      {/* Vertical connector line */}
                      {!collapsed && stepIndex < phaseSteps.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-[22px] top-10 w-0.5 h-4 transition-colors duration-300",
                            isCompleted ? "bg-[#0D9488]" : "bg-muted",
                          )}
                        />
                      )}

                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-auto py-2.5 pl-3 transition-all duration-300",
                          collapsed && "justify-center px-2",
                          isActive && "bg-[#0D9488]/10 border-l-2 border-[#0D9488] rounded-l-none",
                          !accessible && "opacity-50 cursor-not-allowed",
                        )}
                        onClick={() => accessible && handleStepClick(step)}
                        disabled={!accessible}
                      >
                        {/* Step indicator */}
                        <div
                          className={cn(
                            "relative flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-all duration-300 shrink-0",
                            isCompleted && "bg-[#0D9488] text-white",
                            isActive && !isCompleted && "bg-white border-2 border-[#0D9488] text-[#0D9488] shadow-md",
                            !isActive && !isCompleted && "bg-muted text-muted-foreground",
                          )}
                        >
                          {isCompleted ? <CheckCircle2Icon className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                          {/* Pulse animation for current step */}
                          {isActive && !isCompleted && (
                            <div className="absolute inset-0 rounded-full bg-[#0D9488]/20 animate-ping" />
                          )}
                        </div>

                        {!collapsed && (
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-sm font-medium truncate w-full text-left",
                                isActive ? "text-[#0D9488]" : "text-foreground",
                              )}
                            >
                              {step.label}
                            </span>
                            <span className="text-xs text-muted-foreground truncate w-full text-left">
                              {step.description}
                            </span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer with step counter */}
      {!collapsed && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step</span>
            <span className="font-bold text-[#0D9488]">
              {currentStepIndex + 1} / {WIZARD_STEPS.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Navigation helper functions (exported for use in parent components)
export function getNextStep(
  currentView: ActiveView,
  evaluationType: "Initial Assessment" | "Reassessment",
): ActiveView | null {
  const steps = getStepsByEvaluationType(evaluationType)
  return getNextStepInArray(currentView, steps)
}

export function getPreviousStep(
  currentView: ActiveView,
  evaluationType: "Initial Assessment" | "Reassessment",
): ActiveView | null {
  const steps = getStepsByEvaluationType(evaluationType)
  return getPreviousStepInArray(currentView, steps)
}
