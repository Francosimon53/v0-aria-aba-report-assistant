"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AITextarea } from "@/components/ui/ai-textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SparklesIcon, CheckIcon, AlertCircleIcon, FileTextIcon, CopyIcon, FileDownIcon } from "@/components/icons"
import { Loader2, FileDown } from "lucide-react"
import type { ClientData, AssessmentData } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { AssessmentTypeBadge } from "./assessment-type-badge"

interface MedicalNecessityGeneratorProps {
  clientData?: ClientData | null
  assessmentData?: AssessmentData | null
  behaviors?: string[]
}

const TEMPLATE_OPTIONS = [
  { value: "mild", label: "Mild Case", description: "1-2 domains affected, minimal support needs" },
  { value: "moderate", label: "Moderate Case", description: "3-4 domains affected, regular support needed" },
  { value: "severe", label: "Severe Case", description: "5+ domains affected, intensive support required" },
]

const KEY_PHRASES = [
  "significant impairment",
  "evidence-based treatment",
  "medically necessary",
  "skilled intervention required",
  "functional impairment",
  "intensive services",
  "clinical necessity",
  "substantial limitations",
]

export function MedicalNecessityGenerator({
  clientData,
  assessmentData,
  behaviors = [],
}: MedicalNecessityGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [isSmartFilling, setIsSmartFilling] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [editedText, setEditedText] = useState("")
  const [template, setTemplate] = useState<string>("moderate")
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [activeField, setActiveField] = useState<string | null>(null)

  const [diagnosis, setDiagnosis] = useState(clientData?.diagnosis || "")
  const [targetBehaviors, setTargetBehaviors] = useState(behaviors.join(", ") || "")
  const [severity, setSeverity] = useState("")
  const [functionalImpact, setFunctionalImpact] = useState("")
  const [previousTreatments, setPreviousTreatments] = useState("")
  const [requestedHours, setRequestedHours] = useState("25")
  const [environmentalFactors, setEnvironmentalFactors] = useState("")

  useEffect(() => {
    setCharacterCount(editedText.length)
  }, [editedText])

  const highlightKeyPhrases = (text: string) => {
    let highlightedText = text
    KEY_PHRASES.forEach((phrase) => {
      const regex = new RegExp(`(${phrase})`, "gi")
      highlightedText = highlightedText.replace(
        regex,
        '<span class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1 rounded font-medium">$1</span>',
      )
    })
    return highlightedText
  }

  const calculateConfidence = (text: string): number => {
    let score = 60 // Base score

    // Check for key phrases
    const phraseCount = KEY_PHRASES.filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase())).length
    score += phraseCount * 5

    // Check length (aim for 300-500 words)
    const wordCount = text.split(/\s+/).length
    if (wordCount >= 300 && wordCount <= 500) {
      score += 10
    } else if (wordCount < 200) {
      score -= 10
    }

    // Check for data/numbers
    if (/\d+%|\d+\/\d+/.test(text)) {
      score += 5
    }

    return Math.min(100, Math.max(0, score))
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const prompt = `Write a comprehensive medical necessity statement for ABA services authorization.

CLIENT: ${clientData?.firstName ? `${clientData.firstName} ${clientData.lastName}` : "Client"}, age ${clientData?.dateOfBirth ? new Date().getFullYear() - new Date(clientData.dateOfBirth).getFullYear() : 5} years old
DIAGNOSIS: ${diagnosis || "Autism Spectrum Disorder"}
INSURANCE: ${clientData?.insurance || "Not specified"}
REQUESTED HOURS: ${requestedHours}/week

TARGET BEHAVIORS: ${targetBehaviors}
SEVERITY/FREQUENCY: ${severity}
FUNCTIONAL IMPACT: ${functionalImpact}
PREVIOUS TREATMENTS: ${previousTreatments}
ENVIRONMENTAL FACTORS: ${environmentalFactors}

Generate a professional, insurance-compliant medical necessity statement (300-500 words). Include the key phrases naturally: significant impairment, evidence-based treatment, medically necessary, skilled intervention required, functional impairment, intensive services, clinical necessity, substantial limitations.`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          isTextGeneration: true,
          fieldName: "Medical Necessity Statement",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error("Failed to generate medical necessity statement")
      }

      const data = await response.json()
      const generatedContent = data.message || data.content || ""
      setGeneratedText(generatedContent)
      setEditedText(generatedContent)

      const confidence = calculateConfidence(generatedContent)
      setConfidenceScore(confidence)
    } catch (error) {
      console.error("Error generating medical necessity:", error)
      alert("Failed to generate statement. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImproveStatement = async () => {
    console.log("[v0] Improve statement clicked")
    setLoading(true)
    try {
      const payload = {
        type: "medicalNecessity",
        action: "improve",
        data: {
          currentStatement: editedText,
          clientName: clientData?.firstName ? `${clientData.firstName} ${clientData.lastName}` : "Client",
          diagnosis: diagnosis || "Autism Spectrum Disorder",
          requestedHours: Number.parseInt(requestedHours) || 25,
          focusArea: "clinical language, insurance key phrases, and compliance",
        },
      }

      console.log("[v0] Improve payload:", payload)

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Improve and enhance this medical necessity statement. Make it more clinically rigorous, include relevant insurance key phrases naturally, and ensure it meets insurance submission standards. Do not add markdown formatting. Current statement:\n\n${editedText}`,
            },
          ],
          fieldName: "Medical Necessity Statement",
          currentStep: "Medical Necessity",
          isTextGeneration: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to improve statement")
      }

      const data = await response.json()
      console.log("[v0] Improved statement:", data)

      const improvedText = data.text || data.content || ""
      setEditedText(improvedText)
      setGeneratedText(improvedText)

      const confidence = calculateConfidence(improvedText)
      setConfidenceScore(confidence)
      console.log("[v0] New confidence score:", confidence)
    } catch (error) {
      console.error("[v0] Error improving statement:", error)
      alert("Failed to improve statement. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      alert("Medical necessity statement copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      alert("Failed to copy to clipboard")
    }
  }

  const handleExportToWord = () => {
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Medical Necessity Statement</title></head><body><h1>Medical Necessity Statement</h1><p>${editedText.replace(/\n/g, "<br>")}</p></body></html>`,
      ],
      { type: "application/msword" },
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `medical-necessity-${clientData?.lastName || "statement"}.doc`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleInsertKeyPhrase = (phrase: string) => {
    console.log("[v0] Insert key phrase:", phrase, "into field:", activeField)

    const setters: Record<string, (value: string) => void> = {
      behaviors: setTargetBehaviors,
      severity: setSeverity,
      impact: setFunctionalImpact,
      previous: setPreviousTreatments,
      environmental: setEnvironmentalFactors,
    }

    const getters: Record<string, string> = {
      behaviors: targetBehaviors,
      severity: severity,
      impact: functionalImpact,
      previous: previousTreatments,
      environmental: environmentalFactors,
    }

    if (setters[activeField]) {
      const currentValue = getters[activeField]
      setters[activeField](currentValue + (currentValue ? " " : "") + phrase)
    }
  }

  const handleAutoFill = async () => {
    setIsAutoFilling(true)

    try {
      const rawClientInfo = JSON.parse(localStorage.getItem("aria-client-info") || "{}")
      const clientInfo = rawClientInfo.data || rawClientInfo
      const abcObservations = JSON.parse(
        localStorage.getItem("aria-assessment-abc-observations") ||
        localStorage.getItem("aria-abc-observations") ||
        localStorage.getItem("aria-abc-observation") || "[]"
      )
      const goals = JSON.parse(
        localStorage.getItem("aria-assessment-selected-goals") ||
        localStorage.getItem("aria-goals") ||
        localStorage.getItem("aria-goals-tracker") || "[]"
      )
      const interventions = JSON.parse(localStorage.getItem("aria-interventions") || "[]")
      const rawRiskAssessment = JSON.parse(localStorage.getItem("aria-risk-assessment") || "{}")
      const riskAssessment = rawRiskAssessment.data || rawRiskAssessment

      // Auto-fill diagnosis
      if (clientInfo.diagnosis) {
        setDiagnosis(clientInfo.diagnosis)
      }

      // Auto-fill target behaviors from ABC observations
      if (abcObservations.length > 0) {
        const behaviors = abcObservations.map((obs: any) => obs.behavior).filter(Boolean)
        const uniqueBehaviors = [...new Set(behaviors)].slice(0, 3)
        setTargetBehaviors(uniqueBehaviors.join(", "))
      }

      // Auto-fill severity from ABC data
      if (abcObservations.length > 0) {
        const severityText = `${abcObservations.length} incidents documented. Behaviors occur multiple times daily requiring constant supervision and intervention.`
        setSeverity(severityText)
      }

      // Auto-fill functional impact from goals
      if (goals.length > 0) {
        const domains = goals.map((g: any) => g.domain).filter(Boolean)
        const uniqueDomains = [...new Set(domains)]
        const impactText = `Deficits impact ${uniqueDomains.join(", ")}. Client requires intensive support for daily living skills, communication, and social interaction.`
        setFunctionalImpact(impactText)
      }

      // Auto-fill environmental factors from risk assessment
      if (riskAssessment.environmentalFactors) {
        setEnvironmentalFactors(riskAssessment.environmentalFactors)
      }

      toast({
        title: "Data Imported",
        description: "Fields populated from your assessment data. Review and edit as needed.",
      })
    } catch (error) {
      console.error("Auto-fill error:", error)
      toast({
        title: "Import Failed",
        description: "Could not load assessment data. Fill fields manually.",
        variant: "destructive",
      })
    } finally {
      setIsAutoFilling(false)
    }
  }

  const handleAISmartFill = async () => {
    setIsSmartFilling(true)

    try {
      const rawClientInfo = JSON.parse(localStorage.getItem("aria-client-info") || "{}")
      const clientInfo = rawClientInfo.data || rawClientInfo
      const abcObservations = JSON.parse(
        localStorage.getItem("aria-assessment-abc-observations") ||
        localStorage.getItem("aria-abc-observations") ||
        localStorage.getItem("aria-abc-observation") || "[]"
      )
      const goals = JSON.parse(
        localStorage.getItem("aria-assessment-selected-goals") ||
        localStorage.getItem("aria-goals") ||
        localStorage.getItem("aria-goals-tracker") || "[]"
      )
      const interventions = JSON.parse(localStorage.getItem("aria-interventions") || "[]")

      const response = await fetch("/api/smart-fill-medical-necessity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientInfo,
          abcObservations,
          goals,
          interventions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate smart fill")
      }

      const data = await response.json()

      // Fill all fields with AI-optimized content
      setDiagnosis(data.diagnosis || diagnosis)
      setTargetBehaviors(data.targetBehaviors || targetBehaviors)
      setSeverity(data.severityFrequency || severity)
      setFunctionalImpact(data.functionalImpact || functionalImpact)
      setPreviousTreatments(data.previousTreatment || previousTreatments)
      setEnvironmentalFactors(data.environmentalFactors || environmentalFactors)

      toast({
        title: "Smart Fill Complete",
        description: "AI has optimized all fields for insurance approval",
      })
    } catch (error) {
      console.error("Smart fill error:", error)
      toast({
        title: "Error",
        description: "Failed to generate smart fill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSmartFilling(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 pb-24 bg-gray-50 dark:bg-gray-950 min-h-full">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0D9488] to-cyan-600 flex items-center justify-center">
              <FileTextIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Necessity Generator</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered insurance justification for ABA services
              </p>
            </div>
            <AssessmentTypeBadge />
          </div>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Inputs */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Input Data</h2>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mb-4">
              <Button
                onClick={handleAISmartFill}
                disabled={isSmartFilling || isAutoFilling}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSmartFilling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    AI Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    AI Smart Fill (Recommended)
                  </>
                )}
              </Button>

              <Button
                onClick={handleAutoFill}
                disabled={isAutoFilling || isSmartFilling}
                variant="outline"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 bg-transparent"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Auto-fill from Assessment Data
                  </>
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1 pr-4 max-h-[calc(100vh-400px)]">
              <div className="space-y-4 pb-4">
                <div>
                  <Label htmlFor="diagnosis">Child's Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g., Autism Spectrum Disorder Level 2"
                  />
                </div>

                <div>
                  <Label htmlFor="behaviors">Target Behaviors *</Label>
                  <AITextarea
                    id="behaviors"
                    value={targetBehaviors}
                    onChange={(e) => setTargetBehaviors(e.target.value)}
                    onFocus={() => setActiveField("behaviors")}
                    fieldName="Target Behaviors for ABA Treatment"
                    placeholder="e.g., Aggression, elopement, limited communication"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="severity">Severity/Frequency *</Label>
                  <AITextarea
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    onFocus={() => setActiveField("severity")}
                    fieldName="Behavior Severity and Frequency"
                    placeholder="e.g., Aggression occurs 15-20x daily, requiring constant supervision"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="impact">Functional Impact *</Label>
                  <AITextarea
                    id="impact"
                    value={functionalImpact}
                    onChange={(e) => setFunctionalImpact(e.target.value)}
                    onFocus={() => setActiveField("impact")}
                    fieldName="Functional Impact on Daily Life"
                    placeholder="Describe impact on education, social interactions, family life, safety"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="previous">Previous Treatment Attempts</Label>
                  <AITextarea
                    id="previous"
                    value={previousTreatments}
                    onChange={(e) => setPreviousTreatments(e.target.value)}
                    onFocus={() => setActiveField("previous")}
                    fieldName="Previous Treatment History"
                    placeholder="e.g., Speech therapy (2 years), OT (18 months) - limited progress"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="hours">Requested Service Hours/Week *</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={requestedHours}
                    onChange={(e) => setRequestedHours(e.target.value)}
                    placeholder="25"
                    min="10"
                    max="40"
                  />
                </div>

                <div>
                  <Label htmlFor="environmental">Environmental Factors</Label>
                  <AITextarea
                    id="environmental"
                    value={environmentalFactors}
                    onChange={(e) => setEnvironmentalFactors(e.target.value)}
                    onFocus={() => setActiveField("environmental")}
                    fieldName="Environmental and Contextual Factors"
                    placeholder="e.g., Limited community resources, parent works full-time, sibling with special needs"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !diagnosis || !targetBehaviors}
                  className="w-full bg-gradient-to-r from-[#0D9488] to-cyan-600 hover:from-[#0F766E] hover:to-cyan-700 text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <SparklesIcon className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="mr-2 h-5 w-5" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            </ScrollArea>
          </Card>

          {/* Right Panel: Generated Text */}
          <Card className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated Statement</h2>
              {confidenceScore !== null && (
                <Badge
                  variant={confidenceScore >= 80 ? "default" : confidenceScore >= 60 ? "secondary" : "destructive"}
                  className="text-sm"
                >
                  {confidenceScore >= 80 ? (
                    <CheckIcon className="mr-1 h-3 w-3" />
                  ) : (
                    <AlertCircleIcon className="mr-1 h-3 w-3" />
                  )}
                  Confidence: {confidenceScore}%
                </Badge>
              )}
            </div>

            {generatedText ? (
              <>
                <ScrollArea className="flex-1 mb-4 max-h-[calc(100vh-400px)]">
                  <AITextarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onFocus={() => setActiveField(null)}
                    fieldName="Medical Necessity Statement"
                    className="min-h-[400px] font-sans text-base leading-relaxed"
                    placeholder="Generated medical necessity statement will appear here..."
                  />

                  {/* Key phrases indicator below the textarea */}
                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Key phrases highlighted
                  </div>
                </ScrollArea>

                <div className="space-y-3 border-t pt-4">
                  <Button
                    onClick={handleImproveStatement}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 h-4 w-4" />
                        Improve with AI
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <span
                        className={characterCount >= 300 && characterCount <= 500 ? "text-green-600" : "text-gray-500"}
                      >
                        {characterCount} characters
                      </span>
                      <span
                        className={characterCount >= 300 && characterCount <= 500 ? "text-green-600" : "text-gray-500"}
                      >
                        ~{Math.round(editedText.split(/\s+/).length)} words
                      </span>
                    </div>
                    {confidenceScore !== null && (
                      <Badge
                        variant={
                          confidenceScore >= 80 ? "default" : confidenceScore >= 60 ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {confidenceScore}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="flex-1 bg-transparent">
                    <CopyIcon className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportToWord} className="flex-1 bg-transparent">
                    <FileDownIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" className="flex-1 bg-[#0D9488] hover:bg-[#0F766E]">
                    Copy to Report
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="max-w-sm">
                  <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <h3 className="text-lg font-semibold mb-2">No Statement Generated</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the required fields on the left and click "Generate Draft" to create your medical necessity
                    statement using AI.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Key Phrases Reference */}
        <Card className="mt-8 p-4 mb-4 relative z-10">
          <div className="flex items-start gap-4">
            <AlertCircleIcon className="h-5 w-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                Insurance Key Phrases
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (Click to insert into active field)
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {KEY_PHRASES.map((phrase) => (
                  <Badge
                    key={phrase}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-[#0D9488] hover:text-white transition-colors"
                    onClick={() => handleInsertKeyPhrase(phrase)}
                  >
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
