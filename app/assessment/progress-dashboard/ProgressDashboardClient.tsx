"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2, Upload, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CheckCircle2Icon } from "lucide-react"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { safeGetItem, safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

export default function ProgressDashboardClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [evaluationType, setEvaluationType] = useState<"initial" | "reassessment">("initial")
  const [clientData, setClientData] = useState<any>(null)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [reassessmentData, setReassessmentData] = useState<any>(null)
  const [previousAssessmentData, setPreviousAssessmentData] = useState<any>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)

  useEffect(() => {
    const type = (safeGetItem("evaluationType") as "initial" | "reassessment") || "initial"
    setEvaluationType(type)

    const clientInfo = safeGetJSON("clientInfo", null)
    const backgroundHistory = safeGetJSON("backgroundHistory", null)
    const domains = safeGetJSON("domains", null)
    const goals = safeGetJSON("goals", null)
    const interventions = safeGetJSON("interventions", null)
    const previousData = safeGetJSON("previousAssessmentData", null)

    if (clientInfo) setClientData(clientInfo)
    if (domains) setAssessmentData({ domains })
    if (goals || interventions) {
      setReassessmentData({
        goals: goals || null,
        interventions: interventions || null,
      })
    }
    if (previousData) setPreviousAssessmentData(previousData)
  }, [])

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setPreviousAssessmentData(data)
        safeSetJSON("previousAssessmentData", data)
        setShowImportDialog(false)
      } catch (error) {
        console.error("Error parsing imported file:", error)
        alert("Error importing file. Please make sure it's a valid JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleContinue = async () => {
    setIsLoading(true)

    const steps = evaluationType === "initial" ? INITIAL_ASSESSMENT_STEPS : REASSESSMENT_STEPS
    const currentIndex = steps.findIndex((s) => s.route === "/assessment/progress-dashboard")
    const nextStep = steps[currentIndex + 1]

    if (nextStep) {
      router.push(nextStep.route)
    }
  }

  const handlePrevious = () => {
    const steps = evaluationType === "initial" ? INITIAL_ASSESSMENT_STEPS : REASSESSMENT_STEPS
    const currentIndex = steps.findIndex((s) => s.route === "/assessment/progress-dashboard")
    const prevStep = steps[currentIndex - 1]

    if (prevStep) {
      router.push(prevStep.route)
    }
  }

  const steps = evaluationType === "initial" ? INITIAL_ASSESSMENT_STEPS : REASSESSMENT_STEPS
  const currentStepIndex = steps.findIndex((s) => s.route === "/assessment/progress-dashboard")
  const stepNumber = currentStepIndex + 1
  const totalSteps = steps.length

  return (
    <div className="flex min-h-screen bg-background">
      <AssessmentSidebar />

      <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-foreground">Progress Dashboard</h1>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowImportDialog(!showImportDialog)}
                  className="gap-2 border-purple-300 hover:bg-purple-50"
                >
                  <Upload className="h-4 w-4" />
                  Import Previous Assessment
                </Button>
                <span className="text-sm text-muted-foreground">
                  Step {stepNumber} of {totalSteps}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              {evaluationType === "reassessment"
                ? "Compare progress and outcomes from initial assessment to current status"
                : "Review assessment data and progress indicators"}
            </p>
          </div>

          {!previousAssessmentData && (
            <Card className="mb-6 border-2 border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">No Previous Assessment Data</h3>
                    <p className="text-sm text-amber-700">
                      Click "Import Previous Assessment" to upload data from the client's prior evaluation for
                      comparison and progress tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showImportDialog && (
            <Card className="mb-6 border-2 border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Import Previous Assessment Data
                </CardTitle>
                <CardDescription>
                  Upload a JSON file containing the client's previous assessment data to compare progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input type="file" accept=".json" onChange={handleImportFile} className="flex-1" />
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                </div>
                {previousAssessmentData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Previous assessment data loaded successfully
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <ProgressDashboard
              clientData={clientData}
              assessmentData={assessmentData}
              reassessmentData={reassessmentData}
              previousAssessmentData={previousAssessmentData}
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 lg:ml-64">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Step {stepNumber} of {totalSteps} • Progress Dashboard
                </div>

                <Button onClick={handleContinue} disabled={isLoading} className="min-w-[120px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="h-24" />
        </div>
      </main>
    </div>
  )
}
