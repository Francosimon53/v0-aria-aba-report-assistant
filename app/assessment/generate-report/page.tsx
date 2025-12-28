"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { AIReportGenerator, type AIReportGeneratorRef } from "@/components/ai-report-generator"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { safeGetJSON, safeGetString } from "@/lib/safe-storage"

function safeParseJSON(key: string): any {
  if (typeof window === "undefined") return null
  return safeGetJSON(key, null)
}

export default function GenerateReportPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const reportGeneratorRef = useRef<AIReportGeneratorRef>(null)
  const [evaluationType, setEvaluationType] = useState<"Initial Assessment" | "Reassessment">("Initial Assessment")

  useEffect(() => {
    setIsClient(true)
    const savedType = safeGetString("aria_evaluation_type", null)
    if (savedType === "Reassessment") {
      setEvaluationType("Reassessment")
    }

    const data = {
      clientInfo: safeParseJSON("aria-client-info") || {},
      backgroundHistory: safeParseJSON("aria-background-history") || {},
      assessmentData: safeParseJSON("aria-assessment-data") || {},
      domains: safeParseJSON("aria-domains") || {},
      abcObservation: safeParseJSON("aria-abc-observation") || {},
      riskAssessment: safeParseJSON("aria-risk-assessment") || {},
      goals: safeParseJSON("aria-goals") || [],
      servicePlan: safeParseJSON("aria-service-plan") || {},
      cptAuthorization: safeParseJSON("aria-cpt-authorization") || {},
      medicalNecessity: safeParseJSON("aria_medical_necessity") || {},
    }
    setReportData(data)
  }, [])

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/generate-report")
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : allSteps.length
  const totalSteps = allSteps.length

  const handleExportPDF = () => {
    if (reportGeneratorRef.current) {
      reportGeneratorRef.current.exportReport("pdf")
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900">ARIA - ABA Report Assistant</h1>
            <Badge variant="outline">
              Step {stepNumber} of {totalSteps}
            </Badge>
            <span className="text-slate-500">Generate Report</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push("/assessment/medical-necessity")}>
              Previous
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2 bg-transparent">
              Export PDF
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/dashboard")}>
              Save & Exit
            </Button>
          </div>
        </header>

        {/* Main Content - Using AIReportGenerator */}
        <main className="flex-1 overflow-y-auto p-6">
          <AIReportGenerator ref={reportGeneratorRef} reportData={reportData} />
        </main>
      </div>
    </div>
  )
}
