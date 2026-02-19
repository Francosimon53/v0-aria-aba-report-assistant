"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, SaveIcon, Loader2Icon } from "@/components/icons"
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
    <Card className={cn("mt-8 border-t-4 border-t-teal-500 shadow-lg", className)}>
      <CardContent className="p-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assessment Progress</span>
            <span className="text-sm font-bold text-teal-600">{progressPercent}% Complete</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>
              Step {currentIndex + 1} of {totalSteps}
            </span>
            <span>{currentStep ? WORKFLOW_STEPS.find((s) => s.id === currentStep)?.label : ""}</span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <div className="flex-1">
            {hasPrevious && onPrevious && prevStep && (
              <Button variant="outline" onClick={onPrevious} className="bg-transparent">
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                {prevLabel}
              </Button>
            )}
          </div>

          {/* Save Draft button */}
          {onSave && (
            <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaving} className="text-gray-500">
              {isSaving ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          )}

          {/* Next/Continue button */}
          <div className="flex-1 flex justify-end">
            {hasNext && onNext && !isLastStep && (
              <Button
                onClick={onNext}
                disabled={!canProceed || isSaving}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
                size="lg"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {nxtLabel}
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            )}

            {isLastStep && onNext && (
              <Button
                onClick={onNext}
                disabled={!canProceed || isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                size="lg"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Finish & Generate Report
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
