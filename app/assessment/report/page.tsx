"use client"

import { useState, useEffect } from "react"
import { ReportPreviewTool } from "@/components/report-preview-tool"
import { useRouter } from "next/navigation"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"

export default function ReportPage() {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
  const [agencyData, setAgencyData] = useState(null)
  const [reassessmentData, setReassessmentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedClientData = sessionStorage.getItem("clientData") || localStorage.getItem("clientData")
    const storedAssessmentData = sessionStorage.getItem("assessmentData") || localStorage.getItem("assessmentData")
    const storedGoals = sessionStorage.getItem("selectedGoals") || localStorage.getItem("selectedGoals")

    if (storedClientData) setClientData(JSON.parse(storedClientData))
    if (storedAssessmentData) setAssessmentData(JSON.parse(storedAssessmentData))
    if (storedGoals) setSelectedGoals(JSON.parse(storedGoals))

    setIsLoading(false)
  }, [])

  const handleExport = () => {
    console.log("Export initiated from report page")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!clientData || !assessmentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No assessment data found</p>
          <p className="text-sm text-muted-foreground mb-6">Complete an assessment first to generate a report</p>
          <button
            onClick={() => router.push("/assessment/new")}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Create New Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-background">
      <ReportPreviewTool
        clientData={clientData}
        assessmentData={assessmentData}
        selectedGoals={selectedGoals}
        agencyData={agencyData}
        reassessmentData={reassessmentData}
        onExport={handleExport}
      />
    </div>
  )
}
