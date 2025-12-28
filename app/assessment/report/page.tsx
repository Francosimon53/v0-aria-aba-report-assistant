"use client"

import { useState, useEffect } from "react"
import { ReportPreviewTool } from "@/components/report-preview-tool"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"

export default function ReportPage() {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
  const [agencyData, setAgencyData] = useState(null)
  const [reassessmentData, setReassessmentData] = useState(null)

  useEffect(() => {
    const storedClientData = sessionStorage.getItem("clientData")
    const storedAssessmentData = sessionStorage.getItem("assessmentData")
    const storedGoals = sessionStorage.getItem("selectedGoals")

    if (storedClientData) setClientData(JSON.parse(storedClientData))
    if (storedAssessmentData) setAssessmentData(JSON.parse(storedAssessmentData))
    if (storedGoals) setSelectedGoals(JSON.parse(storedGoals))
  }, [])

  const handleExport = () => {
    // Export handler for additional actions if needed
    console.log("Export initiated from report page")
  }

  return (
    <div className="w-full h-full bg-background">
      {clientData && assessmentData ? (
        <ReportPreviewTool
          clientData={clientData}
          assessmentData={assessmentData}
          selectedGoals={selectedGoals}
          agencyData={agencyData}
          reassessmentData={reassessmentData}
          onExport={handleExport}
        />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">No assessment data found</p>
            <p className="text-sm text-muted-foreground">Complete an assessment first to generate a report</p>
          </div>
        </div>
      )}
    </div>
  )
}
