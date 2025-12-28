"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

interface WizardNavigationProps {
  onPrevious?: () => void
  onNext?: () => void
  onSave?: () => void
  hasPrevious: boolean
  hasNext: boolean
  isLastStep?: boolean
  isSaving?: boolean
  canProceed?: boolean
  previousLabel?: string
  nextLabel?: string
  className?: string
  currentStep?: string
}

export function WizardNavigation({
  onPrevious,
  onNext,
  onSave,
  hasPrevious,
  hasNext,
  isLastStep = false,
  isSaving = false,
  canProceed = true,
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
  currentStep,
}: WizardNavigationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-t border-border bg-card/80 backdrop-blur-sm",
        className,
      )}
    >
      {/* Previous Button */}
      <div>
        {hasPrevious ? (
          <Button
            variant="outline"
            onClick={onPrevious}
            className="gap-2 transition-all duration-300 hover:gap-3 bg-transparent"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            {previousLabel}
          </Button>
        ) : (
          <div /> // Placeholder for spacing
        )}
      </div>

      {/* Center - Save indicator */}
      <div className="flex items-center gap-2">
        {onSave && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="text-muted-foreground hover:text-foreground"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckIcon className="h-3 w-3" />
                Save Draft
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Next Button */}
      <div>
        {hasNext && (
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              "gap-2 transition-all duration-300 hover:gap-3",
              isLastStep
                ? "bg-gradient-to-r from-[#0D9488] to-cyan-600 hover:from-[#0F766E] hover:to-cyan-700"
                : "bg-[#0D9488] hover:bg-[#0F766E]",
            )}
          >
            {isLastStep ? "Finish & Generate Report" : nextLabel}
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
