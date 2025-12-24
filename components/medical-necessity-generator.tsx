"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SparklesIcon, CheckIcon, AlertCircleIcon, FileTextIcon } from "@/components/icons"
import type { ClientData, AssessmentData } from "@/lib/types"

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
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [editedText, setEditedText] = useState("")
  const [template, setTemplate] = useState<string>("moderate")
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)
  const [characterCount, setCharacterCount] = useState(0)

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
      const response = await fetch("/api/aba-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "medicalNecessity",
          data: {
            clientName: clientData?.firstName ? `${clientData.firstName} ${clientData.lastName}` : "Client",
            age: clientData?.dateOfBirth
              ? new Date().getFullYear() - new Date(clientData.dateOfBirth).getFullYear()
              : 5,
            diagnosis: diagnosis || "Autism Spectrum Disorder",
            impairments: assessmentData?.domains || [],
            hoursRequested: Number.parseInt(requestedHours) || 25,
            insurance: clientData?.insurance || "Standard",
            targetBehaviors,
            severity,
            functionalImpact,
            previousTreatments,
            environmentalFactors,
            template,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate medical necessity statement")
      }

      const data = await response.json()
      setGeneratedText(data.content)
      setEditedText(data.content)

      const confidence = calculateConfidence(data.content)
      setConfidenceScore(confidence)
    } catch (error) {
      console.error("Error generating medical necessity:", error)
      alert("Failed to generate statement. Please try again.")
    } finally {
      setLoading(false)
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
          </div>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
          {/* Left Panel: Inputs */}
          <Card className="p-6 flex flex-col max-h-[700px]">
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

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
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
                  <Textarea
                    id="behaviors"
                    value={targetBehaviors}
                    onChange={(e) => setTargetBehaviors(e.target.value)}
                    placeholder="e.g., Aggression, elopement, limited communication"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="severity">Severity/Frequency *</Label>
                  <Textarea
                    id="severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    placeholder="e.g., Aggression occurs 15-20x daily, requiring constant supervision"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="impact">Functional Impact *</Label>
                  <Textarea
                    id="impact"
                    value={functionalImpact}
                    onChange={(e) => setFunctionalImpact(e.target.value)}
                    placeholder="Describe impact on education, social interactions, family life, safety"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="previous">Previous Treatment Attempts</Label>
                  <Textarea
                    id="previous"
                    value={previousTreatments}
                    onChange={(e) => setPreviousTreatments(e.target.value)}
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
                  <Textarea
                    id="environmental"
                    value={environmentalFactors}
                    onChange={(e) => setEnvironmentalFactors(e.target.value)}
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
          <Card className="p-6 flex flex-col max-h-[700px]">
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
                <ScrollArea className="flex-1 mb-4">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[400px] font-mono text-sm leading-relaxed"
                    placeholder="Generated medical necessity statement will appear here..."
                  />

                  {/* Highlighted Preview */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      Key phrases highlighted
                    </div>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: highlightKeyPhrases(editedText) }}
                    />
                  </div>
                </ScrollArea>

                <div className="flex items-center justify-between text-sm border-t pt-4">
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Save to Library
                    </Button>
                    <Button size="sm" className="bg-[#0D9488] hover:bg-[#0F766E]">
                      Copy to Report
                    </Button>
                  </div>
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
        <Card className="mt-6 p-4 mb-4 flex-shrink-0">
          <div className="flex items-start gap-4">
            <AlertCircleIcon className="h-5 w-5 text-[#0D9488] mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Insurance Key Phrases</h3>
              <div className="flex flex-wrap gap-2">
                {KEY_PHRASES.map((phrase) => (
                  <Badge key={phrase} variant="outline" className="text-xs">
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
