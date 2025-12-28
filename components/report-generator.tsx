"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FileTextIcon,
  ArrowLeftIcon,
  DownloadIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
  CopyIcon,
  RefreshCwIcon,
} from "@/components/icons"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"
import type { ABCObservation } from "@/lib/abc-report-generator"
import { generateMedicalNecessitySection, type MedicalNecessityInput } from "@/lib/medical-necessity-generator"
import { generateCPTAuthorizationRequest, type CPTAuthRequestInput } from "@/lib/cpt-auth-request-generator"
import { goalBank } from "@/lib/data/goal-bank"
import { assessmentTypes } from "@/lib/data/assessment-types"
import { insuranceTemplates } from "@/lib/data/insurance-templates"
import { useToast } from "@/hooks/use-toast"
import { SkeletonReportList } from "@/components/skeleton-report-card"
import { ReportReadyEmptyState } from "@/components/empty-states"
import { safeGetJSON, safeSetItem } from "@/lib/safe-storage"

interface ReportGeneratorProps {
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  selectedGoals: SelectedGoal[]
  onBack: () => void
}

export function ReportGenerator({ clientData, assessmentData, selectedGoals, onBack }: ReportGeneratorProps) {
  const { toast } = useToast()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)
  const [cptAuthRequest, setCPTAuthRequest] = useState<string | null>(null)

  const selectedAssessment = assessmentTypes.find((a) => a.id === assessmentData?.assessmentType)
  const insuranceTemplate = insuranceTemplates.find((t) => t.code === clientData?.insuranceProvider)

  const completionChecks = [
    { label: "Client Information", completed: !!clientData },
    { label: "Assessment Data", completed: !!assessmentData },
    { label: "Goals Selected", completed: selectedGoals.length > 0 },
  ]

  const allComplete = completionChecks.every((c) => c.completed)

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const generateReport = async () => {
    if (!allComplete) {
      toast({
        title: "Error",
        description: "Please complete all sections before generating the report",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const age = clientData ? calculateAge(clientData.dateOfBirth) : 0
    const goalsWithDetails = selectedGoals.map((sg) => ({
      ...sg,
      goal: goalBank.find((g) => g.id === sg.goalId),
    }))

    const storedABCData = safeGetJSON("aria_abc_observations", [])
    const abcObservations: ABCObservation[] = storedABCData

    const storedBackgroundData = safeGetJSON("aria_background_history", {})
    const backgroundData = storedBackgroundData

    const storedEvaluationData = safeGetJSON("aria_evaluation_data", {})
    const evaluationData = storedEvaluationData

    const storedRiskData = safeGetJSON("aria_risk_assessment", {})
    const riskData = storedRiskData

    const medicalNecessityInput: MedicalNecessityInput = {
      client: {
        name: `${clientData?.firstName || ""} ${clientData?.lastName || ""}`.trim(),
        age: age,
        gender: clientData?.gender,
      },
      diagnoses: {
        primaryDiagnosisName: clientData?.diagnosis || "Autism Spectrum Disorder",
        primaryDiagnosisCode: clientData?.diagnosisCode || "F84.0",
        secondaryDiagnoses: clientData?.secondaryDiagnoses || [],
      },
      assessmentContext: {
        datesOfEvaluation: assessmentData?.assessmentDate || new Date().toLocaleDateString(),
        settings: assessmentData?.settings || ["clinic"],
        toolsUsed: selectedAssessment ? [selectedAssessment.abbreviation] : [],
      },
      domains: {
        communication: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("communication"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("communication")).severity ||
                "moderate",
              keyDeficits:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("communication")).observations ||
                "Limited functional communication skills observed.",
              impact:
                "These communication deficits interfere with the client's ability to express needs, engage in social interactions, and participate in educational activities.",
            }
          : undefined,
        socialPlay: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("social"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("social")).severity ||
                "moderate",
              keyDeficits:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("social")).observations ||
                "Reduced peer interaction and limited play skills observed.",
              impact: "These social deficits limit opportunities for peer relationships and community participation.",
            }
          : undefined,
        adaptiveDailyLiving: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("adaptive"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("adaptive")).severity ||
                "moderate",
              keyDeficits:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("adaptive")).observations ||
                "Delays in self-care and daily living skills.",
              impact: "These deficits increase dependence on caregivers for basic self-care tasks.",
            }
          : undefined,
        maladaptiveBehaviors: backgroundData.behavioralConcerns
          ? {
              topographies: Array.isArray(backgroundData.behavioralConcerns)
                ? backgroundData.behavioralConcerns
                : [backgroundData.behavioralConcerns],
              frequency: "occur regularly across settings",
              settings: "home, school, and community",
              impact: "These behaviors interfere with learning opportunities and social participation.",
            }
          : undefined,
      },
      abcObservations: abcObservations,
      riskAssessment:
        riskData.risks?.length > 0
          ? {
              safetyConcerns: riskData.risks || [],
              supervisionLevel: riskData.supervisionLevel || "Moderate supervision is required.",
              impactOnClient: riskData.impactOnClient || "interferes with skill acquisition and independence",
              impactOnOthers: riskData.impactOnOthers || "requires significant caregiver monitoring",
            }
          : undefined,
      goalsSummary: goalsWithDetails.map((g) => g.goal?.title).join(", "),
      servicePlan: {
        code97153Hours: assessmentData?.hoursRecommended ? Math.floor(assessmentData.hoursRecommended * 0.7) : 10,
        code97155Hours: 2,
        code97156Hours: 2,
        totalHoursPerWeek: assessmentData?.hoursRecommended || 15,
        expectedDuration: "6–12 months",
      },
    }

    const medicalNecessityText = generateMedicalNecessitySection(medicalNecessityInput)

    const cptAuthInput: CPTAuthRequestInput = {
      clientName: `${clientData?.firstName || ""} ${clientData?.lastName || ""}`.trim(),
      clientAge: age,
      clientGender: clientData?.gender,
      livingSituation: clientData?.livingSituation || `lives with ${clientData?.guardianRelationship || "family"}`,
      primaryDiagnosisName: clientData?.diagnosis || "Autism Spectrum Disorder",
      primaryDiagnosisCode: clientData?.diagnosisCode || "F84.0",
      secondaryDiagnoses: clientData?.secondaryDiagnoses || [],
      datesOfEvaluation: assessmentData?.assessmentDate || new Date().toLocaleDateString(),
      settings: assessmentData?.settings || ["clinic"],
      assessmentToolsUsed: selectedAssessment ? [selectedAssessment.abbreviation] : [],
      domains: {
        communication: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("communication"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("communication")).severity ||
                "moderate",
              examples:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("communication")).observations ||
                "Limited functional communication skills",
              impact: "Limits ability to express needs and participate in social exchanges",
            }
          : undefined,
        social: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("social"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("social")).severity ||
                "moderate",
              examples:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("social")).observations ||
                "Reduced peer interaction",
              impact: "Limits peer relationships and social participation",
            }
          : undefined,
        adaptive: evaluationData.domains?.find((d: any) => d.name?.toLowerCase().includes("adaptive"))
          ? {
              severity:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("adaptive")).severity ||
                "moderate",
              examples:
                evaluationData.domains.find((d: any) => d.name?.toLowerCase().includes("adaptive")).observations ||
                "Delays in self-care skills",
              impact: "Increases dependence on caregivers",
            }
          : undefined,
        maladaptive: backgroundData.behavioralConcerns
          ? {
              severity: "moderate to severe",
              examples: Array.isArray(backgroundData.behavioralConcerns)
                ? backgroundData.behavioralConcerns.join(", ")
                : backgroundData.behavioralConcerns,
              impact: "Interferes with learning and social participation",
            }
          : undefined,
      },
      abcObservations: abcObservations.map((obs: any) => ({
        antecedent: obs.antecedent || "",
        behavior: obs.behavior || "",
        consequence: obs.consequence || "",
        function: obs.function || "Unknown",
      })),
      riskAssessment: {
        hasAggression: riskData.risks?.includes("aggression") || false,
        hasSelfInjury: riskData.risks?.includes("self-injury") || false,
        hasElopement: riskData.risks?.includes("elopement") || false,
        hasTantrums: riskData.risks?.includes("tantrums") || false,
        hasPropertyDestruction: riskData.risks?.includes("property destruction") || false,
        riskLevel: riskData.risks?.length > 2 ? "high" : riskData.risks?.length > 0 ? "moderate" : "low",
        riskDescription: riskData.supervisionLevel || "",
      },
      goalDomains: goalsWithDetails.map((g) => g.goal?.title || "").filter((t) => t),
      servicePlan: {
        cpt97153Hours: assessmentData?.hoursRecommended ? Math.floor(assessmentData.hoursRecommended * 0.7) : 10,
        cpt97155Hours: 2,
        cpt97156Hours: 2,
        authorizationPeriodMonths: 6,
      },
    }

    const cptAuthText = generateCPTAuthorizationRequest(cptAuthInput)

    safeSetItem("aria_cpt_auth_request", cptAuthText)
    setCPTAuthRequest(cptAuthText)

    const report = `
APPLIED BEHAVIOR ANALYSIS COMPREHENSIVE ASSESSMENT REPORT
═══════════════════════════════════════════════════════════════════════════════

CLIENT INFORMATION
──────────────────────────────────────────────────────────────────────────────
Name: ${clientData?.firstName} ${clientData?.lastName}
Date of Birth: ${clientData?.dateOfBirth} (Age: ${age} years)
Diagnosis: ${clientData?.diagnosis}
Assessment Date: ${assessmentData?.assessmentDate}
Assessor: ${clientData?.assessor || "N/A"}
Supervising BCBA: ${clientData?.supervisingBCBA || "N/A"}

Guardian: ${clientData?.guardianName || "N/A"}
Contact: ${clientData?.guardianPhone || "N/A"} | ${clientData?.guardianEmail || "N/A"}

Insurance: ${insuranceTemplate?.name || clientData?.insuranceProvider || "N/A"}
Policy Number: ${clientData?.insuranceId || "N/A"}

═══════════════════════════════════════════════════════════════════════════════

REASON FOR REFERRAL
──────────────────────────────────────────────────────────────────────────────
${clientData?.firstName} was referred for a comprehensive Applied Behavior Analysis (ABA) assessment to evaluate their current skill levels across developmental domains and to determine the appropriateness of ABA intervention services. The referral was received from ${clientData?.referralSource || "the family"} on ${clientData?.referralDate || "N/A"}.

═══════════════════════════════════════════════════════════════════════════════

ASSESSMENT INSTRUMENTS
──────────────────────────────────────────────────────────────────────────────
Primary Assessment: ${selectedAssessment?.name} (${selectedAssessment?.abbreviation})

${selectedAssessment?.description}

Age Range: ${selectedAssessment?.ageRange}
Scoring Type: ${selectedAssessment?.scoringType}

Domains Assessed:
${selectedAssessment?.domains.map((d) => `• ${d}`).join("\n")}

═══════════════════════════════════════════════════════════════════════════════

ASSESSMENT RESULTS
──────────────────────────────────────────────────────────────────────────────

DOMAIN SCORES:
${
  assessmentData?.domains
    ?.map(
      (d) => `${d.domain}: ${d.score}% of age-expected skills
   Notes: ${d.notes || "No additional notes"}`,
    )
    .join("\n\n") || "No domain scores recorded"
}

IDENTIFIED STRENGTHS:
${
  assessmentData?.strengths
    ?.filter((s) => s)
    .map((s) => `• ${s}`)
    .join("\n") || "• No strengths documented"
}

IDENTIFIED DEFICITS:
${
  assessmentData?.deficits
    ?.filter((d) => d)
    .map((d) => `• ${d}`)
    .join("\n") || "• No deficits documented"
}

BARRIERS TO LEARNING:
${
  assessmentData?.barriers
    ?.filter((b) => b)
    .map((b) => `• ${b}`)
    .join("\n") || "• No barriers documented"
}

═══════════════════════════════════════════════════════════════════════════════

CPT AUTHORIZATION REQUEST
──────────────────────────────────────────────────────────────────────────────

${cptAuthText}

═══════════════════════════════════════════════════════════════════════════════

TREATMENT RECOMMENDATIONS
──────────────────────────────────────────────────────────────────────────────

RECOMMENDED SERVICE HOURS: ${assessmentData?.hoursRecommended || 0} hours per week

JUSTIFICATION:
${assessmentData?.hoursJustification || "Hour justification not provided"}

═══════════════════════════════════════════════════════════════════════════════

TREATMENT GOALS
──────────────────────────────────────────────────────────────────────────────

${goalsWithDetails
  .map(
    (g, i) => `
GOAL ${i + 1}: ${g.goal?.title || "Unknown Goal"}
Domain: ${g.goal?.domain} - ${g.goal?.subdomain}
Priority: ${g.priority.toUpperCase()}
Target Date: ${g.targetDate || "TBD"}

Objective: ${g.goal?.description}

Mastery Criteria: ${g.goal?.criteria}

Baseline Data: ${g.baselineData || "To be collected"}

Measurement Type: ${g.goal?.measurementType}
`,
  )
  .join("\n" + "─".repeat(78) + "\n")}

═══════════════════════════════════════════════════════════════════════════════

${medicalNecessityText}

═══════════════════════════════════════════════════════════════════════════════

PARENT/CAREGIVER TRAINING
──────────────────────────────────────────────────────────────────────────────
Parent training is an essential component of ${clientData?.firstName}'s treatment plan. Caregivers will receive training in:

• Understanding ABA principles and terminology
• Implementing behavior management strategies
• Collecting accurate data on target behaviors
• Implementing skill acquisition programs at home
• Promoting generalization of learned skills

Training will occur for a minimum of 2 hours per month.

═══════════════════════════════════════════════════════════════════════════════

SIGNATURES
──────────────────────────────────────────────────────────────────────────────

_________________________________          Date: _______________
${clientData?.assessor || "Assessor"}
Board Certified Behavior Analyst


_________________________________          Date: _______________
${clientData?.supervisingBCBA || "Supervising BCBA"}
Board Certified Behavior Analyst

═══════════════════════════════════════════════════════════════════════════════
Report Generated: ${new Date().toLocaleDateString()}
`

    setGeneratedReport(report)
    setIsGenerating(false)
    toast({ title: "Success", description: "Report generated successfully" })
  }

  const handleCopy = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport)
      toast({ title: "Success", description: "Report copied to clipboard" })
    }
  }

  const handleDownload = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ABA_Assessment_${clientData?.lastName}_${clientData?.firstName}_${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({ title: "Success", description: "Report downloaded" })
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <FileTextIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Report Generator</h2>
            <p className="text-sm text-muted-foreground">Generate and export assessment report</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          {generatedReport && (
            <>
              <Button variant="outline" onClick={handleCopy}>
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
          <Button onClick={generateReport} disabled={!allComplete || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : generatedReport ? (
              <>
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Regenerate
              </>
            ) : (
              <>
                <FileTextIcon className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Completion Status */}
        <div className="w-80 border-r border-border bg-card overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Report Checklist</h3>

              <div className="space-y-3 mb-6">
                {completionChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    {check.completed ? (
                      <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className={check.completed ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Summary */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Client</h4>
                  <p className="font-medium">
                    {clientData ? `${clientData.firstName} ${clientData.lastName}` : "Not entered"}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Assessment</h4>
                  <p className="font-medium">{selectedAssessment?.abbreviation || "Not selected"}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Goals Selected</h4>
                  <p className="font-medium">{selectedGoals.length} goals</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Recommended Hours</h4>
                  <p className="font-medium">{assessmentData?.hoursRecommended || 0} hrs/week</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Insurance</h4>
                  <p className="font-medium">{insuranceTemplate?.name || "Not specified"}</p>
                </div>
              </div>

              {insuranceTemplate && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Required Sections ({insuranceTemplate.code})
                    </h4>
                    <div className="space-y-1">
                      {insuranceTemplate.requiredSections.map((section) => (
                        <div key={section} className="flex items-center gap-2 text-sm">
                          <CheckCircle2Icon className="h-3 w-3 text-green-500" />
                          <span>{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Report Preview */}
        <div className="flex-1 p-6 overflow-hidden">
          <Card className="h-full flex flex-col overflow-hidden">
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>
                {generatedReport
                  ? "Review the generated report below"
                  : "Click 'Generate Report' to create the assessment report"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isGenerating ? (
                <div className="h-full overflow-hidden">
                  <ScrollArea className="h-full">
                    <SkeletonReportList count={5} />
                  </ScrollArea>
                </div>
              ) : generatedReport ? (
                <div className="h-full overflow-hidden">
                  <ScrollArea className="h-full">
                    <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-muted rounded-lg">
                      {generatedReport}
                    </pre>
                  </ScrollArea>
                </div>
              ) : (
                <ReportReadyEmptyState
                  completionChecks={completionChecks}
                  onGenerate={allComplete ? generateReport : undefined}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
