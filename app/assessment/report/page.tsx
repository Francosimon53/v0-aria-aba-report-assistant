"use client"

import { useState, useEffect } from "react"
import { AIReportGenerator } from "@/components/ai-report-generator"
import { useRouter } from "next/navigation"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"

export default function ReportPage() {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([])
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Assessment Data</h2>
            <p className="text-gray-600 mb-6">Complete an assessment first to generate a professional report</p>
          </div>
          <button
            onClick={() => router.push("/assessment/new")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-background">
      <AIReportGenerator />
    </div>
  )
}
