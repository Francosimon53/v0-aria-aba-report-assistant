"use client"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { HomeIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { getStepsByEvaluationType, getCurrentStepIndex } from "@/lib/wizard-steps-config"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { safeGetItem } from "@/lib/safe-storage"

type EvaluationType = "Initial Assessment" | "Reassessment"

export function AssessmentNav() {
  const pathname = usePathname()
  const { navigateWithSave } = useSafeNavigation()
  const [evaluationType, setEvaluationType] = useState<EvaluationType>("Initial Assessment")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = safeGetItem("evaluationType")
    if (stored === "Reassessment" || stored === "Initial Assessment") {
      setEvaluationType(stored)
    }
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  const steps = getStepsByEvaluationType(evaluationType)
  const currentRouteStep = steps.find((s) => s.route === pathname)

  if (!currentRouteStep) {
    return null // Not in assessment flow
  }

  const currentIndex = getCurrentStepIndex(currentRouteStep.id, steps)
  const prevStepId = currentIndex > 0 ? steps[currentIndex - 1].id : null
  const nextStepId = currentIndex < steps.length - 1 ? steps[currentIndex + 1].id : null
  const prevStep = prevStepId ? steps.find((s) => s.id === prevStepId) : null
  const nextStep = nextStepId ? steps.find((s) => s.id === nextStepId) : null

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Dashboard button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => navigateWithSave("/dashboard", undefined, { skipSave: true })}
          >
            <HomeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          {/* Center: Step indicator */}
          <div className="flex items-center gap-2">
            {currentRouteStep && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-teal-50 dark:bg-teal-950 rounded-full">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-sm font-medium flex items-center justify-center">
                  {currentIndex + 1}
                </span>
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300 hidden sm:inline">
                  {currentRouteStep.label}
                </span>
                <span className="text-xs text-teal-600 dark:text-teal-400">of {steps.length}</span>
              </div>
            )}
          </div>

          {/* Right: Navigation buttons */}
          <div className="flex items-center gap-2">
            {prevStep && prevStep.route && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 bg-transparent"
                onClick={() => navigateWithSave(prevStep.route, undefined, { skipSave: true })}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            )}
            {nextStep && nextStep.route && (
              <Button
                size="sm"
                className="gap-1 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                onClick={() => navigateWithSave(nextStep.route, undefined, { skipSave: true })}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
