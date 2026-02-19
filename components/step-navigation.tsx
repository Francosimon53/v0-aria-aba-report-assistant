"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CheckCircle2Icon, Loader2Icon } from "@/components/icons"
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
    <div className="border-t bg-white/80 backdrop-blur-sm px-4 py-2 sticky bottom-0 mt-6">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        {/* Previous button */}
        {showPrevious && prevStep ? (
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

        {/* Save status */}
        {displayStatus === "saving" && (
          <span className="text-xs text-blue-600 flex items-center gap-1 whitespace-nowrap">
            <Loader2Icon className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        {displayStatus === "saved" && (
          <span className="text-xs text-green-600 flex items-center gap-1 whitespace-nowrap">
            <CheckCircle2Icon className="h-3 w-3" />
            Saved
          </span>
        )}
        {displayStatus === "error" && (
          <span className="text-xs text-red-600 whitespace-nowrap">Save error</span>
        )}

        {/* Next / Complete button */}
        {showNext && nextStep && (
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            size="sm"
            className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shrink-0 h-7 px-3 text-xs"
          >
            {isSaving ? "Saving..." : "Save & Continue"}
            {!isSaving && <ChevronRightIcon className="h-3.5 w-3.5 ml-1" />}
          </Button>
        )}
        {isLastStep && (
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shrink-0 h-7 px-3 text-xs"
          >
            {isSaving ? "Saving..." : "Complete Assessment"}
          </Button>
        )}
      </div>
    </div>
  )
}
