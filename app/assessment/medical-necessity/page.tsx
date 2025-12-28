"use client"

export const dynamic = "force-dynamic"
// </CHANGE>

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CopyIcon } from "@/components/icons"
import { ChevronLeft, ChevronRight, Sparkles, FileText } from "lucide-react"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { MedicalNecessityWriter } from "@/components/medical-necessity-writer"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { safeGetJSON, safeSetJSON, safeSetItem, safeGetString } from "@/lib/safe-storage"

export default function MedicalNecessityPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("ai")
  const [evaluationType, setEvaluationType] = useState<"Initial Assessment" | "Reassessment">("Initial Assessment")

  const [diagnosticSection, setDiagnosticSection] = useState({
    diagnosis: "",
    diagnosisDate: "",
    diagnosisSource: "",
    dsmCriteria: [] as string[],
  })

  const [functionalLimitationsSection, setFunctionalLimitationsSection] = useState({
    communication: { severity: "moderate", deficits: "", barriers: "" },
    social: { severity: "moderate", deficits: "", barriers: "" },
    adaptive: { severity: "moderate", deficits: "", barriers: "" },
    behavioral: { severity: "moderate", deficits: "", barriers: "" },
    safety: { concerns: "", level: "" },
    generalization: { deficits: "" },
  })

  const [impactSection, setImpactSection] = useState({
    home: "",
    school: "",
    community: "",
    peers: "",
    routines: "",
    familyStress: "",
  })

  const [rationaleSection, setRationaleSection] = useState({
    domains: [] as string[],
    skillAcquisition: "",
    behaviorReduction: "",
    oneOnOneNeed: "",
    progressWithoutABA: "",
    regressionRisk: "",
    bcbaRequirement: "",
    intensityRationale: "",
  })

  const [servicesSection, setServicesSection] = useState({
    direct: 0,
    supervision: 0,
    family: 0,
    duration: "6 months",
    outcomes: "",
    measurement: "",
  })

  const [finalStatement, setFinalStatement] = useState("")
  const [assessmentData, setAssessmentData] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    const saved = safeGetJSON("aria_medical_necessity", null)
    if (saved) {
      if (saved.diagnostic) setDiagnosticSection(saved.diagnostic)
      if (saved.limitations) setFunctionalLimitationsSection(saved.limitations)
      if (saved.impact) setImpactSection(saved.impact)
      if (saved.rationale) setRationaleSection(saved.rationale)
      if (saved.services) setServicesSection(saved.services)
    }

    const parsedClient = safeGetJSON("aria_client_data", {})
    const parsedGoals = safeGetJSON("aria_goals", { selectedGoals: [] })
    const parsedDomains = safeGetJSON("aria_domains", {})

    setAssessmentData({
      clientInfo: {
        firstName: parsedClient.firstName || "",
        lastName: parsedClient.lastName || "",
        dob: parsedClient.dob || "",
      },
      diagnosis: {
        primary: parsedClient.primaryDiagnosis || "Autism Spectrum Disorder",
        icd10: parsedClient.icd10Code || "F84.0",
        secondary: parsedClient.secondaryDiagnoses || [],
      },
      functionalImpacts: {
        communication: {
          level: parsedDomains?.communication?.severity || "Moderate",
          description: parsedDomains?.communication?.description || "",
        },
        social: {
          level: parsedDomains?.social?.severity || "Moderate",
          description: parsedDomains?.social?.description || "",
        },
        adaptive: {
          level: parsedDomains?.adaptive?.severity || "Moderate",
          description: parsedDomains?.adaptive?.description || "",
        },
        behavior: {
          level: parsedDomains?.behavior?.severity || "Moderate",
          description: parsedDomains?.behavior?.description || "",
        },
      },
      goals: parsedGoals.selectedGoals || [],
      recommendations: {
        weeklyHours: servicesSection.direct + servicesSection.supervision + servicesSection.family,
        duration: servicesSection.duration,
        frequency: "5 days/week",
      },
    })
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedType = safeGetString("aria_evaluation_type", null)
      if (savedType === "Reassessment") {
        setEvaluationType("Reassessment")
      }
    }
  }, [])

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/medical-necessity")
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 10
  const totalSteps = allSteps.length

  useEffect(() => {
    if (!isClient) return

    const statement = generateFinalStatement()
    setFinalStatement(statement)
    const words = statement.split(/\s+/).filter((w) => w.length > 0).length
    setWordCount(words)

    setAutoSaving(true)
    const timer = setTimeout(() => {
      safeSetJSON("aria_medical_necessity", {
        diagnostic: diagnosticSection,
        limitations: functionalLimitationsSection,
        impact: impactSection,
        rationale: rationaleSection,
        services: servicesSection,
      })
      setAutoSaving(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [diagnosticSection, functionalLimitationsSection, impactSection, rationaleSection, servicesSection, isClient])

  const generateFinalStatement = () => {
    return `Medical Necessity Statement for ABA Services

Diagnostic Information:
${diagnosticSection.diagnosis ? `Primary Diagnosis: ${diagnosticSection.diagnosis}` : ""}
${diagnosticSection.diagnosisDate ? `Date of Diagnosis: ${diagnosticSection.diagnosisDate}` : ""}

Functional Limitations:
Communication: ${functionalLimitationsSection.communication.deficits || "Not specified"}
Social Skills: ${functionalLimitationsSection.social.deficits || "Not specified"}
Adaptive Behavior: ${functionalLimitationsSection.adaptive.deficits || "Not specified"}
Behavioral Concerns: ${functionalLimitationsSection.behavioral.deficits || "Not specified"}

Impact on Daily Functioning:
Home: ${impactSection.home || "Not specified"}
School: ${impactSection.school || "Not specified"}
Community: ${impactSection.community || "Not specified"}

Treatment Rationale:
${rationaleSection.skillAcquisition || ""}
${rationaleSection.behaviorReduction || ""}
${rationaleSection.intensityRationale || ""}

Requested Services:
Direct Services: ${servicesSection.direct} hours/week
Supervision: ${servicesSection.supervision} hours/week
Family Training: ${servicesSection.family} hours/week
Authorization Duration: ${servicesSection.duration}
`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(finalStatement)
  }

  const handleAISave = (statement: string) => {
    setFinalStatement(statement)
    safeSetItem("aria_medical_necessity_statement", statement)
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Medical Necessity</h1>
            <p className="text-sm text-slate-500">
              Step {stepNumber} of {totalSteps} - Document medical necessity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{wordCount} words</Badge>
            {autoSaving && <span className="text-xs text-slate-400">Saving...</span>}
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <CopyIcon className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </header>

        <div className="bg-white border-b px-6 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === "ai" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              AI Generator
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                activeTab === "manual" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              Manual Entry
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === "ai" ? (
              <MedicalNecessityWriter assessmentData={assessmentData} onSave={handleAISave} />
            ) : (
              <>
                <Accordion type="multiple" defaultValue={["diagnostic", "limitations"]} className="space-y-4">
                  <AccordionItem value="diagnostic" className="bg-white rounded-lg border">
                    <AccordionTrigger className="px-4">Diagnostic Information</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Primary Diagnosis</Label>
                          <Input
                            value={diagnosticSection.diagnosis}
                            onChange={(e) => setDiagnosticSection((prev) => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="e.g., Autism Spectrum Disorder"
                          />
                        </div>
                        <div>
                          <Label>Date of Diagnosis</Label>
                          <Input
                            type="date"
                            value={diagnosticSection.diagnosisDate}
                            onChange={(e) =>
                              setDiagnosticSection((prev) => ({ ...prev, diagnosisDate: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Diagnosing Source</Label>
                        <Input
                          value={diagnosticSection.diagnosisSource}
                          onChange={(e) =>
                            setDiagnosticSection((prev) => ({ ...prev, diagnosisSource: e.target.value }))
                          }
                          placeholder="e.g., Dr. Smith, Child Psychologist"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="limitations" className="bg-white rounded-lg border">
                    <AccordionTrigger className="px-4">Functional Limitations</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      {["communication", "social", "adaptive", "behavioral"].map((domain) => (
                        <div key={domain} className="border rounded-lg p-4">
                          <h4 className="font-medium capitalize mb-2">{domain}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Severity</Label>
                              <Select
                                value={(functionalLimitationsSection as any)[domain].severity}
                                onValueChange={(v) =>
                                  setFunctionalLimitationsSection((prev) => ({
                                    ...prev,
                                    [domain]: { ...(prev as any)[domain], severity: v },
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mild">Mild</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Severe</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Deficits</Label>
                              <Textarea
                                value={(functionalLimitationsSection as any)[domain].deficits}
                                onChange={(e) =>
                                  setFunctionalLimitationsSection((prev) => ({
                                    ...prev,
                                    [domain]: { ...(prev as any)[domain], deficits: e.target.value },
                                  }))
                                }
                                placeholder="Describe specific deficits..."
                                className="h-20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="impact" className="bg-white rounded-lg border">
                    <AccordionTrigger className="px-4">Impact on Daily Functioning</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Home Environment</Label>
                          <Textarea
                            value={impactSection.home}
                            onChange={(e) => setImpactSection((prev) => ({ ...prev, home: e.target.value }))}
                            placeholder="Impact on home routines..."
                            className="h-24"
                          />
                        </div>
                        <div>
                          <Label>School/Educational</Label>
                          <Textarea
                            value={impactSection.school}
                            onChange={(e) => setImpactSection((prev) => ({ ...prev, school: e.target.value }))}
                            placeholder="Impact on educational progress..."
                            className="h-24"
                          />
                        </div>
                        <div>
                          <Label>Community</Label>
                          <Textarea
                            value={impactSection.community}
                            onChange={(e) => setImpactSection((prev) => ({ ...prev, community: e.target.value }))}
                            placeholder="Impact on community participation..."
                            className="h-24"
                          />
                        </div>
                        <div>
                          <Label>Family Stress</Label>
                          <Textarea
                            value={impactSection.familyStress}
                            onChange={(e) => setImpactSection((prev) => ({ ...prev, familyStress: e.target.value }))}
                            placeholder="Impact on family..."
                            className="h-24"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rationale" className="bg-white rounded-lg border">
                    <AccordionTrigger className="px-4">Treatment Rationale</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div>
                        <Label>Skill Acquisition Needs</Label>
                        <Textarea
                          value={rationaleSection.skillAcquisition}
                          onChange={(e) =>
                            setRationaleSection((prev) => ({ ...prev, skillAcquisition: e.target.value }))
                          }
                          placeholder="Skills to be developed..."
                          className="h-24"
                        />
                      </div>
                      <div>
                        <Label>Behavior Reduction Needs</Label>
                        <Textarea
                          value={rationaleSection.behaviorReduction}
                          onChange={(e) =>
                            setRationaleSection((prev) => ({ ...prev, behaviorReduction: e.target.value }))
                          }
                          placeholder="Behaviors to be reduced..."
                          className="h-24"
                        />
                      </div>
                      <div>
                        <Label>Intensity Rationale</Label>
                        <Textarea
                          value={rationaleSection.intensityRationale}
                          onChange={(e) =>
                            setRationaleSection((prev) => ({ ...prev, intensityRationale: e.target.value }))
                          }
                          placeholder="Why these hours are needed..."
                          className="h-24"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="services" className="bg-white rounded-lg border">
                    <AccordionTrigger className="px-4">Requested Services</AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Direct Services (hrs/week)</Label>
                          <Input
                            type="number"
                            value={servicesSection.direct}
                            onChange={(e) =>
                              setServicesSection((prev) => ({ ...prev, direct: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Supervision (hrs/week)</Label>
                          <Input
                            type="number"
                            value={servicesSection.supervision}
                            onChange={(e) =>
                              setServicesSection((prev) => ({ ...prev, supervision: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Family Training (hrs/week)</Label>
                          <Input
                            type="number"
                            value={servicesSection.family}
                            onChange={(e) =>
                              setServicesSection((prev) => ({ ...prev, family: Number(e.target.value) }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Authorization Duration</Label>
                        <Select
                          value={servicesSection.duration}
                          onValueChange={(v) => setServicesSection((prev) => ({ ...prev, duration: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3 months">3 months</SelectItem>
                            <SelectItem value="6 months">6 months</SelectItem>
                            <SelectItem value="12 months">12 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Card className="p-6">
                  <h3 className="font-medium mb-4">Generated Statement Preview</h3>
                  <pre className="whitespace-pre-wrap text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                    {finalStatement}
                  </pre>
                </Card>
              </>
            )}
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => router.push("/assessment/cpt-authorization")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => router.push("/assessment/generate-report")}>
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
