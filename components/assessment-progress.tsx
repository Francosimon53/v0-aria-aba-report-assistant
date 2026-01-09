"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CheckCircle2Icon, ChevronDownIcon, ChevronRightIcon, FileTextIcon, SparklesIcon } from "@/components/icons"
import { STORAGE_KEYS } from "@/lib/assessment-storage"
import { calculateAssessmentProgress, getAssessmentDataFromStorage } from "@/lib/calculate-progress"

interface AssessmentProgressProps {
  onNavigate?: (view: string) => void
}

// Map section names to their navigation views
const SECTION_CONFIG = [
  {
    name: "Client Information",
    key: STORAGE_KEYS.CLIENT_INFO,
    view: "client",
    description: "Basic client demographics and insurance details",
    required: true,
  },
  {
    name: "Background & History",
    key: STORAGE_KEYS.BACKGROUND_HISTORY,
    view: "background",
    description: "Medical history, developmental milestones, and family information",
    required: true,
  },
  {
    name: "Assessment Data",
    key: STORAGE_KEYS.ASSESSMENT_DATA,
    view: "assessment",
    description: "Standardized assessment scores and clinical observations",
    required: true,
  },
  {
    name: "ABC Observations",
    key: STORAGE_KEYS.ABC_OBSERVATIONS,
    view: "abc",
    description: "Antecedent-Behavior-Consequence data collection",
    required: false,
  },
  {
    name: "Risk Assessment",
    key: STORAGE_KEYS.RISK_ASSESSMENT,
    view: "risk",
    description: "Safety concerns and crisis intervention planning",
    required: false,
  },
  {
    name: "Goals",
    key: STORAGE_KEYS.GOALS,
    view: "goalbank",
    description: "Treatment goals selected from the goal bank",
    required: true,
  },
  {
    name: "Goals Tracker",
    key: STORAGE_KEYS.GOALS_TRACKER,
    view: "goals",
    description: "Progress monitoring and data tracking for goals",
    required: false,
  },
  {
    name: "Interventions",
    key: STORAGE_KEYS.INTERVENTIONS,
    view: "interventions",
    description: "Evidence-based intervention strategies",
    required: true,
  },
  {
    name: "Teaching Protocols",
    key: STORAGE_KEYS.TEACHING_PROTOCOLS,
    view: "protocols",
    description: "Structured teaching procedures and skill acquisition programs",
    required: false,
  },
  {
    name: "Parent Training",
    key: STORAGE_KEYS.PARENT_TRAINING,
    view: "training",
    description: "Caregiver training topics and progress",
    required: false,
  },
  {
    name: "Service Schedule",
    key: STORAGE_KEYS.SERVICE_SCHEDULE,
    view: "schedule",
    description: "Weekly service hours by CPT code",
    required: true,
  },
  {
    name: "Medical Necessity",
    key: STORAGE_KEYS.MEDICAL_NECESSITY,
    view: "medical",
    description: "Medical necessity justification statement",
    required: true,
  },
  {
    name: "CPT Authorization",
    key: "aria-cpt-authorization",
    view: "cptauth",
    description: "CPT code hours and justification for insurance",
    required: false,
  },
]

function getPreviewText(key: string): string {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return ""

    const parsed = JSON.parse(raw)
    const data = parsed.data || parsed

    // Extract meaningful preview text based on section type
    if (key === STORAGE_KEYS.CLIENT_INFO) {
      const name = `${data.firstName || ""} ${data.lastName || ""}`.trim()
      const dob = data.dateOfBirth ? `DOB: ${data.dateOfBirth}` : ""
      const diagnosis = data.primaryDiagnosis || ""
      return [name, dob, diagnosis].filter(Boolean).join(" • ")
    }

    if (key === STORAGE_KEYS.BACKGROUND_HISTORY) {
      return data.presentingConcerns || data.medicalHistory || data.developmentalHistory || ""
    }

    if (key === STORAGE_KEYS.ASSESSMENT_DATA) {
      const scores = []
      if (data.vinelandScores) scores.push(`Vineland: ${JSON.stringify(data.vinelandScores).slice(0, 50)}...`)
      if (data.ablsScores) scores.push(`ABLS-R scores recorded`)
      return scores.join(" • ") || "Assessment scores recorded"
    }

    if (key === STORAGE_KEYS.ABC_OBSERVATIONS) {
      const count = Array.isArray(data) ? data.length : data.observations?.length || 0
      return `${count} observation(s) recorded`
    }

    if (key === STORAGE_KEYS.RISK_ASSESSMENT) {
      const level = data.overallRiskLevel || data.riskLevel || "Not assessed"
      return `Risk Level: ${level}`
    }

    if (key === STORAGE_KEYS.GOALS) {
      const count = Array.isArray(data) ? data.length : Object.keys(data).length
      return `${count} goal(s) selected`
    }

    if (key === STORAGE_KEYS.INTERVENTIONS || key === STORAGE_KEYS.SELECTED_INTERVENTIONS) {
      const count = Array.isArray(data) ? data.length : 0
      return `${count} intervention(s) selected`
    }

    if (key === STORAGE_KEYS.MEDICAL_NECESSITY) {
      return data.justification || data.medicalNecessityStatement || "Statement generated"
    }

    if (key === STORAGE_KEYS.SERVICE_SCHEDULE) {
      const totalHours = data.totalWeeklyHours || "0"
      return `${totalHours} hours/week scheduled`
    }

    // Generic fallback
    if (typeof data === "string") return data.slice(0, 150)
    if (typeof data === "object") {
      const str = JSON.stringify(data)
      return str.length > 150 ? str.slice(0, 150) + "..." : str
    }

    return "Data saved"
  } catch {
    return "Data saved"
  }
}

function getFullContent(key: string): string {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return ""

    const parsed = JSON.parse(raw)
    const data = parsed.data || parsed

    return JSON.stringify(data, null, 2)
  } catch {
    return ""
  }
}

export function AssessmentProgress({ onNavigate }: AssessmentProgressProps) {
  const [sections, setSections] = useState<typeof SECTION_CONFIG>([])
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [sectionData, setSectionData] = useState<
    Record<string, { hasData: boolean; preview: string; fullContent: string }>
  >({})
  const [completedCount, setCompletedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [completedRequired, setCompletedRequired] = useState(0)
  const [allRequiredComplete, setAllRequiredComplete] = useState(false)

  useEffect(() => {
    const loadSectionData = () => {
      const assessmentData = getAssessmentDataFromStorage()
      const progress = calculateAssessmentProgress(assessmentData)

      const data: Record<string, { hasData: boolean; preview: string; fullContent: string }> = {}

      progress.sections.forEach((section) => {
        data[section.key] = {
          hasData: section.isComplete,
          preview: section.isComplete ? getPreviewText(section.key) : "",
          fullContent: section.isComplete ? getFullContent(section.key) : "",
        }
      })

      setSectionData(data)
      setSections(
        progress.sections.map((s) => ({
          name: s.name,
          key: s.key,
          view: s.id,
          description: SECTION_CONFIG.find((c) => c.key === s.key)?.description || "",
          required: s.required,
        })),
      )

      setCompletedCount(progress.completedCount)
      setTotalCount(progress.totalSections)
      setProgressPercent(progress.percentage)
      setCompletedRequired(progress.requiredCompleted)
      setAllRequiredComplete(progress.allRequiredComplete)
    }

    loadSectionData()

    // Refresh every 3 seconds
    const interval = setInterval(loadSectionData, 3000)
    return () => clearInterval(interval)
  }, [])

  const requiredSections = SECTION_CONFIG.filter((s) => s.required)
  const missingSections = requiredSections.filter((s) => !sectionData[s.key]?.hasData)

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileTextIcon className="h-7 w-7 text-teal-600" />
              Assessment Progress
            </h1>
            <p className="text-gray-600 mt-1">Track your progress and review completed sections</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-teal-600">{progressPercent}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {completedCount} of {totalCount} sections completed
            </span>
            <span>
              {completedRequired} of {requiredSections.length} required sections
            </span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-teal-100" />
        </div>
      </div>

      {/* Section Cards */}
      <div className="space-y-3">
        {sections.map((section, index) => {
          const data = sectionData[section.key]
          const hasData = data?.hasData || false
          const isExpanded = expandedSection === section.key

          return (
            <Card
              key={section.key}
              className={`transition-all duration-200 ${
                hasData
                  ? "border-l-4 border-l-green-500 bg-white shadow-sm"
                  : "border-l-4 border-l-gray-200 bg-gray-50/50"
              }`}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        hasData ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      {hasData ? (
                        <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className={`text-base ${hasData ? "text-gray-900" : "text-gray-500"}`}>
                          {section.name}
                        </CardTitle>
                        {section.required && (
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
                      {hasData && (
                        <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>
                      )}
                      {!hasData && (
                        <Badge variant="secondary" className="mt-2">
                          Not started
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={hasData ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleNavigate(section.view)}
                    className={hasData ? "" : "bg-teal-600 hover:bg-teal-700"}
                  >
                    {hasData ? "Edit" : "Start"}
                  </Button>
                </div>
              </CardHeader>

              {hasData && data?.preview && (
                <CardContent className="pt-0 pb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                    <p className="line-clamp-2">{data.preview}</p>
                  </div>

                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => setExpandedSection(isExpanded ? null : section.key)}
                  >
                    <CollapsibleTrigger className="flex items-center gap-1 text-teal-600 text-sm mt-3 hover:text-teal-700 transition-colors">
                      {isExpanded ? (
                        <>
                          <ChevronDownIcon className="h-4 w-4" />
                          Hide full content
                        </>
                      ) : (
                        <>
                          <ChevronRightIcon className="h-4 w-4" />
                          View full content
                        </>
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{data.fullContent}</pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Generate Report Section */}
      <Card
        className={`border-2 ${allRequiredComplete ? "border-teal-200 bg-teal-50/50" : "border-gray-200 bg-gray-50"}`}
      >
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${allRequiredComplete ? "bg-teal-100" : "bg-gray-100"}`}>
                <SparklesIcon className={`h-6 w-6 ${allRequiredComplete ? "text-teal-600" : "text-gray-400"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Generate Full Report</h3>
                {allRequiredComplete ? (
                  <p className="text-sm text-green-600">All required sections complete! Ready to generate.</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Complete {requiredSections.length - completedRequired} more required section(s) to generate report
                  </p>
                )}
              </div>
            </div>
            <Button
              size="lg"
              disabled={!allRequiredComplete}
              onClick={() => handleNavigate("report")}
              className={
                allRequiredComplete ? "bg-teal-600 hover:bg-teal-700 shadow-lg" : "bg-gray-300 cursor-not-allowed"
              }
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Generate Report
            </Button>
          </div>

          {!allRequiredComplete && missingSections.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-2">Missing required sections:</p>
              <div className="flex flex-wrap gap-2">
                {missingSections.map((section) => (
                  <Badge
                    key={section.key}
                    variant="outline"
                    className="border-amber-300 text-amber-700 cursor-pointer hover:bg-amber-100"
                    onClick={() => handleNavigate(section.view)}
                  >
                    {section.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
