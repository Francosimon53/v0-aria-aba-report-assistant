"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const WORKFLOW_STEPS = [
  { id: "client", label: "Client Info" },
  { id: "background", label: "Background & History" },
  { id: "assessment", label: "Assessment Data" },
  { id: "abc", label: "ABC Observations" },
  { id: "risk", label: "Risk Assessment" },
  { id: "goals", label: "Goal Bank" },
  { id: "goalstracker", label: "Goals Tracker" },
  { id: "interventions", label: "Interventions" },
  { id: "protocols", label: "Teaching Protocols" },
  { id: "parenttraining", label: "Parent Training" },
  { id: "schedule", label: "Service Schedule" },
  { id: "medicalnecessity", label: "Medical Necessity" },
  { id: "report", label: "Generate Report" },
]

interface WizardNavigationProps {
  currentStep?: string
  onPrevious?: () => void
  onNext?: () => void
  onSave?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  isLastStep?: boolean
  isSaving?: boolean
  canProceed?: boolean
  previousLabel?: string
  nextLabel?: string
  className?: string
}

export function WizardNavigation({
  currentStep,
  onPrevious,
  onNext,
  onSave,
  hasPrevious = true,
  hasNext = true,
  isLastStep = false,
  isSaving = false,
  canProceed = true,
  previousLabel,
  nextLabel,
  className,
}: WizardNavigationProps) {
  const currentIndex = currentStep ? WORKFLOW_STEPS.findIndex((s) => s.id === currentStep) : -1
  const totalSteps = WORKFLOW_STEPS.length
  const progressPercent = currentIndex >= 0 ? Math.round(((currentIndex + 1) / totalSteps) * 100) : 0

  const prevStep = currentIndex > 0 ? WORKFLOW_STEPS[currentIndex - 1] : null
  const nextStep = currentIndex < totalSteps - 1 ? WORKFLOW_STEPS[currentIndex + 1] : null

  const prevLabel = previousLabel || (prevStep ? `Back to ${prevStep.label}` : "Previous")
  const nxtLabel = nextLabel || (nextStep ? `Save & Continue to ${nextStep.label}` : "Next")

  return (
    <div className={cn("border-t bg-white/80 backdrop-blur-sm px-4 py-2 sticky bottom-0 mt-6", className)}>
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        {/* Previous button */}
        {hasPrevious && onPrevious && prevStep ? (
          <Button variant="ghost" size="sm" onClick={onPrevious} className="shrink-0 text-gray-500 h-7 px-2">
            <ChevronLeftIcon className="h-3.5 w-3.5 mr-1" />
            Back
          </Button>
        ) : (
          <div className="w-16" />
        )}

        {/* Progress bar */}
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          Step {currentIndex + 1} of {totalSteps}
        </span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-teal-600 whitespace-nowrap">
          {progressPercent}%
        </span>

        {/* Next / Complete button */}
        {hasNext && onNext && !isLastStep && (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSaving}
            size="sm"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shrink-0 h-7 px-3 text-xs"
          >
            {isSaving ? "Saving..." : "Save & Continue"}
            {!isSaving && <ChevronRightIcon className="h-3.5 w-3.5 ml-1" />}
          </Button>
        )}
        {isLastStep && onNext && (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSaving}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shrink-0 h-7 px-3 text-xs"
          >
            {isSaving ? "Saving..." : "Finish & Generate Report"}
          </Button>
        )}
      </div>
    </div>
  )
}
