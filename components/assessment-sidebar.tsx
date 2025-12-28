"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ChevronDown, ChevronRight, ChevronLeft, Home, Menu, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS, type WizardStep } from "@/lib/wizard-steps-config"
import { useAssessmentSession } from "@/components/assessment/AssessmentSessionProvider"
import { withAid, getAidFromParams } from "@/lib/navigation-helpers"

// Group steps by phase for sidebar organization
interface StepGroup {
  title: string
  phase: number
  steps: WizardStep[]
}

function groupStepsByPhase(steps: WizardStep[]): StepGroup[] {
  const phaseMap = new Map<number, StepGroup>()

  steps.forEach((step) => {
    if (!phaseMap.has(step.phase)) {
      phaseMap.set(step.phase, {
        title: step.phaseLabel,
        phase: step.phase,
        steps: [],
      })
    }
    phaseMap.get(step.phase)!.steps.push(step)
  })

  return Array.from(phaseMap.values()).sort((a, b) => a.phase - b.phase)
}

function AssessmentSidebarWithParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { evaluationType: sessionEvaluationType, assessmentId } = useAssessmentSession()

  const [expandedGroups, setExpandedGroups] = useState<number[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const evaluationType: "Initial Assessment" | "Reassessment" =
    sessionEvaluationType === "reassessment" ? "Reassessment" : "Initial Assessment"

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const stepGroups = groupStepsByPhase(allSteps)

  useEffect(() => {
    setExpandedGroups(stepGroups.map((g) => g.phase))
  }, [evaluationType])

  const currentStepIndex = allSteps.findIndex((step) => step.route === pathname)
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1

  const toggleGroup = (phase: number) => {
    setExpandedGroups((prev) => (prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]))
  }

  const handleStepClick = (route?: string) => {
    if (route) {
      // Preserve aid parameter when navigating between steps
      const aidFromUrl = getAidFromParams(searchParams)
      const aid = aidFromUrl || assessmentId
      router.push(withAid(route, aid))
      setIsMobileOpen(false)
    }
  }

  const completedSteps = Math.max(0, currentStep - 1)
  const totalSteps = allSteps.length
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground">ARIA</h2>
              <p className="text-xs text-muted-foreground truncate">
                {evaluationType === "Reassessment" ? "Reassessment" : "Initial Assessment"}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex flex-shrink-0 h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="text-teal-600 font-semibold">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {completedSteps} step{completedSteps !== 1 ? "s" : ""} completed
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-3 mb-3">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10",
              isCollapsed && "justify-center px-2",
            )}
            onClick={() => router.push("/dashboard")}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Back to Home</span>}
          </Button>
        </div>

        {stepGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.phase)
          const groupStepsCompleted = group.steps.filter((step) => {
            const stepIndex = allSteps.findIndex((s) => s.id === step.id)
            return stepIndex + 1 < currentStep
          }).length
          const allGroupCompleted = groupStepsCompleted === group.steps.length

          return (
            <div key={group.phase} className="mb-1">
              <button
                onClick={() => toggleGroup(group.phase)}
                className={cn(
                  "w-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold transition-colors",
                  "text-muted-foreground hover:bg-muted/50",
                  isCollapsed && "justify-center px-2",
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                    allGroupCompleted ? "bg-teal-600 text-white" : "bg-teal-600/20 text-teal-600",
                  )}
                >
                  {allGroupCompleted ? <Check className="h-3 w-3" /> : group.phase}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left uppercase tracking-wide">{group.title}</span>
                    <span className="text-[10px] text-muted-foreground/70 mr-1">
                      {groupStepsCompleted}/{group.steps.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                  </>
                )}
              </button>

              {isExpanded && !isCollapsed && (
                <div className="mt-1 space-y-0.5 px-2">
                  {group.steps.map((step) => {
                    const stepIndex = allSteps.findIndex((s) => s.id === step.id)
                    const stepNum = stepIndex + 1
                    const isActive = step.route === pathname
                    const isCompleted = stepNum < currentStep
                    const StepIcon = step.icon

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(step.route)}
                        className={cn(
                          "w-full px-3 py-2.5 rounded-lg flex items-center gap-3 text-left transition-all min-h-[52px]",
                          isActive
                            ? "bg-teal-600/10 text-teal-700 dark:text-teal-400 border-2 border-teal-600/30"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border-2 border-transparent",
                        )}
                      >
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                            isActive
                              ? "bg-teal-600 text-white"
                              : isCompleted
                                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isCompleted && !isActive ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium truncate",
                                isActive && "text-teal-700 dark:text-teal-400",
                              )}
                            >
                              {step.label}
                            </span>
                            {isCompleted && !isActive && (
                              <div className="h-4 w-4 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-xs truncate mt-0.5",
                              isActive ? "text-teal-600/80 dark:text-teal-400/80" : "text-muted-foreground",
                            )}
                          >
                            {step.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t bg-muted/20">
          <p className="text-xs text-center text-muted-foreground">{evaluationType} Wizard</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md h-10 w-10"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "hidden lg:block h-screen sticky top-0 transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-16" : "w-72",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}

export function AssessmentSidebar() {
  return (
    <Suspense
      fallback={
        <div className="hidden lg:block h-screen w-72 bg-background border-r">
          <div className="p-4 border-b">
            <div className="h-8 w-8 rounded-lg bg-teal-600 animate-pulse" />
          </div>
        </div>
      }
    >
      <AssessmentSidebarWithParams />
    </Suspense>
  )
}
