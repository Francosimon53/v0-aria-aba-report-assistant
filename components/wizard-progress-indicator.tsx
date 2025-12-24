"use client"

import { CheckIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

type WizardStep = {
  id: string
  label: string
  number: number
}

const STEPS: WizardStep[] = [
  { id: "client", label: "Client Info", number: 1 },
  { id: "assessment", label: "Assessment", number: 2 },
  { id: "reassessment", label: "Reassessment", number: 3 },
  { id: "data", label: "Data", number: 4 },
  { id: "goals", label: "Goals", number: 5 },
  { id: "report", label: "Report", number: 6 },
]

interface WizardProgressIndicatorProps {
  currentStep: number // 1-6
  completedSteps?: number[] // Array of completed step numbers
  className?: string
}

export function WizardProgressIndicator({ currentStep, completedSteps = [], className }: WizardProgressIndicatorProps) {
  const getStepState = (stepNumber: number): "completed" | "current" | "upcoming" => {
    if (completedSteps.includes(stepNumber)) return "completed"
    if (stepNumber === currentStep) return "current"
    return "upcoming"
  }

  const isLineCompleted = (stepNumber: number): boolean => {
    return completedSteps.includes(stepNumber) || stepNumber < currentStep
  }

  return (
    <div className={cn("w-full px-4 py-8", className)}>
      <div className="relative flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((step, index) => {
          const state = getStepState(step.number)
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.id} className="relative flex flex-col items-center flex-1">
              {/* Connecting Line */}
              {!isLast && (
                <div className="absolute top-6 left-[50%] w-full h-0.5 -z-10">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                  {/* Animated fill line */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-[#0D9488] transition-all duration-500 ease-out origin-left",
                      isLineCompleted(step.number) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </div>
              )}

              {/* Step Circle */}
              <div className="relative mb-3">
                {/* Pulse ring for current step */}
                {state === "current" && (
                  <div className="absolute inset-0 -m-2 rounded-full bg-[#0D9488]/30 animate-ping" />
                )}

                {/* Main circle */}
                <div
                  className={cn(
                    "relative h-12 w-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ease-out border-2",
                    // Completed state
                    state === "completed" && "bg-[#0D9488] border-[#0D9488] text-white scale-100",
                    // Current state with scale effect
                    state === "current" &&
                      "bg-white dark:bg-gray-900 border-[#0D9488] text-[#0D9488] dark:text-teal-400 scale-110 shadow-lg shadow-[#0D9488]/30",
                    // Upcoming state
                    state === "upcoming" &&
                      "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400",
                  )}
                >
                  {state === "completed" ? (
                    <CheckIcon className="h-5 w-5 animate-in zoom-in-50 duration-300" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
              </div>

              {/* Step Label */}
              <div
                className={cn(
                  "text-center text-sm transition-all duration-300 ease-out",
                  state === "current" && "font-bold text-foreground scale-105",
                  state === "completed" && "font-medium text-[#0D9488] dark:text-teal-400",
                  state === "upcoming" && "font-normal text-muted-foreground",
                )}
              >
                {step.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
