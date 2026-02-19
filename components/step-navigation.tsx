"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeftIcon, ChevronRightIcon, SaveIcon, CheckCircle2Icon, Loader2Icon } from "@/components/icons"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface StepNavigationProps {
  currentStep: string
  onSave?: () => Promise<void> | void
  onNext?: () => void
  onPrevious?: () => void
  nextLabel?: string
  previousLabel?: string
  showPrevious?: boolean
  showNext?: boolean
  isLastStep?: boolean
  saveStatus?: "idle" | "saving" | "saved" | "error"
}

// Define the assessment workflow order
const WORKFLOW_STEPS = [
  { id: "client", label: "Client Info", next: "background" },
  { id: "background", label: "Background & History", next: "assessment", prev: "client" },
  { id: "assessment", label: "Assessment Data", next: "abc", prev: "background" },
  { id: "abc", label: "ABC Observations", next: "risk", prev: "assessment" },
  { id: "risk", label: "Risk Assessment", next: "goals", prev: "abc" },
  { id: "goals", label: "Goal Bank", next: "goalstracker", prev: "risk" },
  { id: "goalstracker", label: "Goals Tracker", next: "interventions", prev: "goals" },
  { id: "interventions", label: "Interventions", next: "protocols", prev: "goalstracker" },
  { id: "protocols", label: "Teaching Protocols", next: "parenttraining", prev: "interventions" },
  { id: "parenttraining", label: "Parent Training", next: "schedule", prev: "protocols" },
  { id: "schedule", label: "Service Schedule", next: "medicalnecessity", prev: "parenttraining" },
  { id: "medicalnecessity", label: "Medical Necessity", next: "report", prev: "schedule" },
  { id: "report", label: "Generate Report", prev: "medicalnecessity" },
]

export function getNextStepId(currentId: string): string | null {
  const step = WORKFLOW_STEPS.find((s) => s.id === currentId)
  return step?.next || null
}

export function getPreviousStepId(currentId: string): string | null {
  const step = WORKFLOW_STEPS.find((s) => s.id === currentId)
  return step?.prev || null
}

export function getStepLabel(stepId: string): string {
  const step = WORKFLOW_STEPS.find((s) => s.id === stepId)
  return step?.label || stepId
}

export function StepNavigation({
  currentStep,
  onSave,
  onNext,
  onPrevious,
  nextLabel,
  previousLabel,
  showPrevious = true,
  showNext = true,
  isLastStep = false,
  saveStatus = "idle",
}: StepNavigationProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [localSaveStatus, setLocalSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep)
  const totalSteps = WORKFLOW_STEPS.length
  const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100)

  const nextStep = WORKFLOW_STEPS.find((s) => s.id === currentStep)?.next
  const prevStep = WORKFLOW_STEPS.find((s) => s.id === currentStep)?.prev
  const nextStepLabel = nextStep ? WORKFLOW_STEPS.find((s) => s.id === nextStep)?.label : null

  const handleSaveAndContinue = async () => {
    setIsSaving(true)
    setLocalSaveStatus("saving")

    try {
      if (onSave) {
        await onSave()
      }
      setLocalSaveStatus("saved")

      // Navigate after short delay to show saved status
      setTimeout(() => {
        if (onNext) {
          onNext()
        }
      }, 500)
    } catch (error) {
      setLocalSaveStatus("error")
      console.error("[v0] Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const displayStatus = saveStatus !== "idle" ? saveStatus : localSaveStatus

  return (
    <Card className="mt-8 border-t-4 border-t-teal-500 shadow-lg">
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
            <span>{getStepLabel(currentStep)}</span>
          </div>
        </div>

        {/* Save status indicator */}
        {displayStatus !== "idle" && (
          <div
            className={cn(
              "mb-4 p-3 rounded-lg flex items-center gap-2 text-sm",
              displayStatus === "saving" && "bg-blue-50 text-blue-700",
              displayStatus === "saved" && "bg-green-50 text-green-700",
              displayStatus === "error" && "bg-red-50 text-red-700",
            )}
          >
            {displayStatus === "saving" && (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span>Saving your progress...</span>
              </>
            )}
            {displayStatus === "saved" && (
              <>
                <CheckCircle2Icon className="h-4 w-4" />
                <span>All changes saved successfully!</span>
              </>
            )}
            {displayStatus === "error" && (
              <>
                <span>Error saving. Please try again.</span>
              </>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <div className="flex-1">
            {showPrevious && prevStep && (
              <Button variant="outline" onClick={onPrevious} className="w-full sm:w-auto bg-transparent">
                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                {previousLabel || `Back to ${WORKFLOW_STEPS.find((s) => s.id === prevStep)?.label}`}
              </Button>
            )}
          </div>

          {/* Save & Continue button */}
          <div className="flex-1 flex justify-end">
            {showNext && nextStep && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {nextLabel || `Save & Continue to ${nextStepLabel}`}
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            {/* Final step - just save */}
            {isLastStep && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2Icon className="h-4 w-4 mr-2" />
                    Save & Complete Assessment
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
