"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  UserIcon,
  ClipboardListIcon,
  TargetIcon,
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  RepeatIcon,
  DatabaseIcon,
  HelpCircleIcon,
  HomeIcon,
  ClockIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  EditIcon,
  FileIcon,
  BarChart3Icon,
} from "@/components/icons"
import type { ClientData, AssessmentData } from "@/lib/types"

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
  | "progressreport"
  | "timesaved"
  | "support"

interface WizardStep {
  id: ActiveView
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  phase: number // 1-6 phases
  phaseLabel: string
}

const WIZARD_STEPS: WizardStep[] = [
  // Phase 1: Client Information
  {
    id: "client",
    label: "Client Info",
    icon: UserIcon,
    description: "Demographics & insurance",
    phase: 1,
    phaseLabel: "Client Information",
  },
  {
    id: "background",
    label: "Background & History",
    icon: FileIcon,
    description: "Developmental & clinical history",
    phase: 1,
    phaseLabel: "Client Information",
  },

  // Phase 2: Assessment
  {
    id: "assessment",
    label: "Assessment",
    icon: ClipboardListIcon,
    description: "Enter assessment data",
    phase: 2,
    phaseLabel: "Assessment",
  },
  {
    id: "abc",
    label: "ABC Observation",
    icon: ClipboardListIcon,
    description: "Record behavioral observations",
    phase: 2,
    phaseLabel: "Assessment",
  },
  {
    id: "risk",
    label: "Risk Assessment",
    icon: AlertTriangleIcon,
    description: "Safety evaluation & crisis plan",
    phase: 2,
    phaseLabel: "Assessment",
  },

  // Phase 3: Reassessment (Optional)
  {
    id: "reassessment",
    label: "Reassessment",
    icon: RepeatIcon,
    description: "Track progress & update",
    phase: 3,
    phaseLabel: "Reassessment",
  },
  {
    id: "progressdashboard",
    label: "Progress Dashboard",
    icon: BarChart3Icon,
    description: "Visual outcomes & comparison",
    phase: 3,
    phaseLabel: "Reassessment",
  },

  // Phase 4: Data & Goals
  {
    id: "integration",
    label: "Data Integration (Optional)", // Added "(Optional)" text
    icon: DatabaseIcon,
    description: "Import & visualize data",
    phase: 4,
    phaseLabel: "Data & Goals",
  },
  {
    id: "goals",
    label: "Goal Bank",
    icon: TargetIcon,
    description: "Select treatment goals",
    phase: 4,
    phaseLabel: "Data & Goals",
  },
  {
    id: "goalstracker",
    label: "Goals Tracker",
    icon: TrendingUpIcon,
    description: "Monitor progress & outcomes",
    phase: 4,
    phaseLabel: "Data & Goals",
  },
  {
    id: "interventions",
    label: "Interventions",
    icon: TargetIcon,
    description: "Evidence-based strategies",
    phase: 4,
    phaseLabel: "Data & Goals",
  },
  {
    id: "protocols",
    label: "Teaching Protocols",
    icon: FileTextIcon,
    description: "Build step-by-step programs",
    phase: 4,
    phaseLabel: "Data & Goals",
  },

  // Phase 5: Services & Training
  {
    id: "parenttraining",
    label: "Parent Training",
    icon: UsersIcon,
    description: "Track curriculum & fidelity",
    phase: 5,
    phaseLabel: "Services & Training",
  },
  {
    id: "schedule",
    label: "Service Schedule",
    icon: CalendarIcon,
    description: "Weekly CPT code planning",
    phase: 5,
    phaseLabel: "Services & Training",
  },
  {
    id: "cptauth",
    label: "CPT Auth Request",
    icon: FileTextIcon,
    description: "Service request & justification",
    phase: 5,
    phaseLabel: "Services & Training",
  },
  {
    id: "consent",
    label: "Consent Forms",
    icon: EditIcon,
    description: "Digital signatures & legal docs",
    phase: 5,
    phaseLabel: "Services & Training",
  },

  // Phase 6: Report & Finalize
  {
    id: "medicalnecessity",
    label: "Medical Necessity",
    icon: FileTextIcon,
    description: "AI-powered justification writer",
    phase: 6,
    phaseLabel: "Report & Finalize",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileTextIcon,
    description: "Generate & export",
    phase: 6,
    phaseLabel: "Report & Finalize",
  },
  {
    id: "progressreport",
    label: "Progress Report",
    icon: TrendingUpIcon,
    description: "Re-authorization updates",
    phase: 6,
    phaseLabel: "Report & Finalize",
  },
]

// Utility pages (always accessible at bottom)
const UTILITY_ITEMS = [
  { id: "timesaved" as ActiveView, label: "Time Saved", icon: ClockIcon, description: "Track your productivity" },
  {
    id: "support" as ActiveView,
    label: "Compliance & Support",
    icon: HelpCircleIcon,
    description: "HIPAA, regulations & FAQs",
  },
]

interface WizardSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  collapsed: boolean
  onToggleCollapse: () => void
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  selectedGoalsCount: number
  completedSteps: ActiveView[]
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
}: WizardSidebarProps) {
  // Get current step index
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === activeView)
  const currentPhase = currentStepIndex >= 0 ? WIZARD_STEPS[currentStepIndex].phase : 0

  // Check if a step is accessible (current or previous phases completed)
  const isStepAccessible = (step: WizardStep) => {
    // All steps are accessible if we want free navigation within completed phases
    const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step.id)
    return stepIndex <= currentStepIndex || completedSteps.includes(step.id) || step.phase <= currentPhase
  }

  // Group steps by phase
  const phases = [1, 2, 3, 4, 5, 6]
  const phaseLabels: Record<number, string> = {
    1: "Client Information",
    2: "Assessment",
    3: "Reassessment",
    4: "Data & Goals",
    5: "Services & Training",
    6: "Report & Finalize",
  }

  const isPhaseComplete = (phase: number) => {
    const phaseSteps = WIZARD_STEPS.filter((s) => s.phase === phase)
    return phaseSteps.every((s) => completedSteps.includes(s.id))
  }

  const isPhaseActive = (phase: number) => {
    return currentPhase === phase
  }

  const safeCompletedSteps = Array.isArray(completedSteps) ? completedSteps : []
  // </CHANGE>

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
              {Math.round((safeCompletedSteps.length / WIZARD_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] to-cyan-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(safeCompletedSteps.length / WIZARD_STEPS.length) * 100}%` }}
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
                  const isCompleted = safeCompletedSteps.includes(step.id) // Use safeCompletedSteps for checking if step is completed
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
                        onClick={() => accessible && onViewChange(step.id)}
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
                          <div className="flex-1 text-left min-w-0">
                            <div
                              className={cn(
                                "text-sm font-medium truncate transition-colors duration-300",
                                isActive ? "text-[#0D9488]" : isCompleted ? "text-foreground" : "text-muted-foreground",
                              )}
                            >
                              {step.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{step.description}</div>
                          </div>
                        )}

                        {/* Goal count badge */}
                        {!collapsed && step.id === "goals" && selectedGoalsCount > 0 && (
                          <span className="ml-auto bg-[#0D9488] text-white text-xs px-2 py-0.5 rounded-full">
                            {selectedGoalsCount}
                          </span>
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Utility Items - Always accessible */}
        <div className="mt-4 pt-4 border-t border-border px-2">
          {!collapsed && (
            <div className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Utilities</div>
          )}
          {UTILITY_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-auto py-2.5", collapsed && "justify-center px-2")}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-[#0D9488]" : "text-muted-foreground")} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                  </div>
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Footer with step counter */}
      {!collapsed && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step</span>
            <span className="font-bold text-[#0D9488]">
              {currentStepIndex >= 0 ? currentStepIndex + 1 : "-"} / {WIZARD_STEPS.length}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export step utilities for navigation
export const getNextStep = (current: ActiveView): ActiveView | null => {
  const index = WIZARD_STEPS.findIndex((s) => s.id === current)
  if (index >= 0 && index < WIZARD_STEPS.length - 1) {
    return WIZARD_STEPS[index + 1].id
  }
  return null
}

export const getPreviousStep = (current: ActiveView): ActiveView | null => {
  const index = WIZARD_STEPS.findIndex((s) => s.id === current)
  if (index > 0) {
    return WIZARD_STEPS[index - 1].id
  }
  return null
}

export const WIZARD_STEPS_EXPORT = WIZARD_STEPS
