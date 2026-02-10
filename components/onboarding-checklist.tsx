"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Sparkles, X, FileText, UserPlus, ClipboardList, Wand2 } from "lucide-react"
import { clearAssessmentCache } from "@/lib/assessment-storage"

interface OnboardingStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  checkFn: (stats: { totalAssessments: number; completedReports: number }) => boolean
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "create",
    label: "Create your first assessment",
    description: "Start a new client evaluation",
    icon: <UserPlus className="h-4 w-4" />,
    checkFn: (stats) => stats.totalAssessments > 0,
  },
  {
    id: "client_info",
    label: "Fill in client information",
    description: "Add demographics, diagnosis, and insurance",
    icon: <ClipboardList className="h-4 w-4" />,
    checkFn: (stats) => stats.totalAssessments > 0,
  },
  {
    id: "assessment_data",
    label: "Add assessment data",
    description: "ABC observations, goals, and risk assessment",
    icon: <FileText className="h-4 w-4" />,
    checkFn: (stats) => stats.totalAssessments > 0,
  },
  {
    id: "generate_report",
    label: "Generate your first report",
    description: "Let AI create a professional 21-section report",
    icon: <Wand2 className="h-4 w-4" />,
    checkFn: (stats) => stats.completedReports > 0,
  },
]

interface OnboardingChecklistProps {
  stats: {
    totalAssessments: number
    completedReports: number
    inProgress: number
    timeSaved: number
  }
}

export function OnboardingChecklist({ stats }: OnboardingChecklistProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("aria-onboarding-dismissed")
    if (saved === "true") setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("aria-onboarding-dismissed", "true")
  }

  const handleCreateAssessment = () => {
    clearAssessmentCache()
    router.push("/assessment/initial/new")
  }

  // Hide if dismissed or user has a completed report
  if (dismissed || stats.completedReports > 0) return null

  const completedCount = ONBOARDING_STEPS.filter((step) => step.checkFn(stats)).length

  return (
    <Card className="mb-8 border-2 border-teal-200 bg-gradient-to-br from-white to-teal-50/30 shadow-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Left side — content */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Welcome to ARIA!</h2>
                  <p className="text-sm text-gray-500">Let&apos;s get you started.</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                title="Skip tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              {ONBOARDING_STEPS.map((step, index) => {
                const isComplete = step.checkFn(stats)
                const isNext = !isComplete && ONBOARDING_STEPS.slice(0, index).every((s) => s.checkFn(stats))

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isComplete
                        ? "bg-teal-50/50"
                        : isNext
                          ? "bg-white border border-teal-200 shadow-sm"
                          : "opacity-60"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-teal-500" />
                      ) : (
                        <Circle className={`h-5 w-5 ${isNext ? "text-teal-400" : "text-gray-300"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isComplete ? "text-teal-700 line-through" : "text-gray-800"}`}>
                        Step {index + 1}: {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    </div>
                    {isNext && index === 0 && (
                      <Button
                        size="sm"
                        onClick={handleCreateAssessment}
                        className="bg-teal-600 hover:bg-teal-700 text-white shrink-0"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        Create Assessment
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Most BCBAs complete their first report in under 45 minutes
              </p>
              <button onClick={handleDismiss} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Skip tour
              </button>
            </div>
          </div>

          {/* Right side — progress ring */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 px-12">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={`${(completedCount / ONBOARDING_STEPS.length) * 100}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-white">{completedCount}/{ONBOARDING_STEPS.length}</span>
              </div>
              <p className="text-sm text-white/80 mt-2 font-medium">Steps Complete</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
