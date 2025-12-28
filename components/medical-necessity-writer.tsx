"use client"

import { useState } from "react"
import { Sparkles, RefreshCw, Copy, Check, FileText, AlertCircle, Loader2, Wand2, Edit3, Save } from "lucide-react"
import { safeSetItem } from "@/lib/safe-storage"

// ============== TYPES ==============
interface AssessmentData {
  clientInfo: {
    firstName: string
    lastName: string
    dob: string
    age?: number
  }
  diagnosis: {
    primary: string
    icd10: string
    secondary: string[]
  }
  functionalImpacts: {
    communication: { level: string; description: string }
    social: { level: string; description: string }
    adaptive: { level: string; description: string }
    behavior: { level: string; description: string }
  }
  goals: Array<{
    domain: string
    description: string
    baseline: string
    target: string
  }>
  recommendations: {
    weeklyHours: number
    duration: string
    frequency: string
  }
}

interface GeneratedStatement {
  id: string
  insurance: string
  content: string
  createdAt: Date
}

// ============== INSURANCE TEMPLATES ==============
const INSURANCE_OPTIONS = [
  { value: "general", label: "General / Universal", color: "gray" },
  { value: "aetna", label: "Aetna", color: "purple" },
  { value: "bcbs", label: "Blue Cross Blue Shield", color: "blue" },
  { value: "uhc", label: "UnitedHealthcare", color: "blue" },
  { value: "cigna", label: "Cigna", color: "orange" },
  { value: "anthem", label: "Anthem", color: "blue" },
  { value: "medicaid", label: "Medicaid", color: "green" },
  { value: "tricare", label: "Tricare", color: "blue" },
] as const

const INSURANCE_REQUIREMENTS: Record<string, string> = {
  general: "Focus on functional impairments, medical necessity criteria, and evidence-based treatment rationale.",
  aetna:
    "Emphasize standardized assessment scores, specific behavioral targets, and measurable outcomes. Include parent training justification.",
  bcbs: "Highlight developmental delays vs. peers, safety concerns, and caregiver training needs. Reference BACB guidelines.",
  uhc: "Focus on functional limitations in daily living, educational impact, and specific skill deficits with baseline data.",
  cigna: "Emphasize medical necessity criteria, treatment intensity justification, and expected outcomes timeline.",
  anthem:
    "Include comprehensive assessment data, functional behavior assessment results, and treatment plan specifics.",
  medicaid: "Document medical necessity, developmental appropriateness, and alignment with EPSDT requirements.",
  tricare: "Follow ABA medical necessity guidelines, include diagnostic confirmation, and treatment plan details.",
}

// ============== COMPONENT ==============
export function MedicalNecessityWriter({
  assessmentData,
  onSave,
}: {
  assessmentData?: Partial<AssessmentData>
  onSave?: (statement: string) => void
}) {
  const [selectedInsurance, setSelectedInsurance] = useState("general")
  const [generatedStatement, setGeneratedStatement] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatement, setEditedStatement] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedStatements, setSavedStatements] = useState<GeneratedStatement[]>([])

  const calculateAge = (dob: string): number => {
    if (!dob) return 0
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const generateStatement = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log("[v0] Starting medical necessity generation...")
      console.log("[v0] Assessment data available:", {
        hasClientInfo: !!assessmentData?.clientInfo,
        hasDiagnosis: !!assessmentData?.diagnosis,
        hasFunctionalImpacts: !!assessmentData?.functionalImpacts,
        hasGoals: !!assessmentData?.goals,
        hasRecommendations: !!assessmentData?.recommendations,
      })

      const insuranceReqs = INSURANCE_REQUIREMENTS[selectedInsurance] || INSURANCE_REQUIREMENTS.general
      const insuranceLabel = INSURANCE_OPTIONS.find((i) => i.value === selectedInsurance)?.label || "General"

      // Build context from assessment data with safe defaults
      const clientAge = assessmentData?.clientInfo?.age || calculateAge(assessmentData?.clientInfo?.dob || "")
      const clientName =
        `${assessmentData?.clientInfo?.firstName || ""} ${assessmentData?.clientInfo?.lastName || ""}`.trim() ||
        "[Client Name]"

      const primaryDiagnosis = assessmentData?.diagnosis?.primary || "Autism Spectrum Disorder"
      const icd10Code = assessmentData?.diagnosis?.icd10 || "F84.0"
      const secondaryDiagnoses = assessmentData?.diagnosis?.secondary || []
      const hasSecondary = secondaryDiagnoses.length > 0
      const secondaryLine = hasSecondary ? `- Secondary Diagnoses: ${secondaryDiagnoses.join(", ")}` : ""

      const commLevel = assessmentData?.functionalImpacts?.communication?.level || "Moderate"
      const commDesc =
        assessmentData?.functionalImpacts?.communication?.description || "Deficits in expressive and receptive language"
      const socialLevel = assessmentData?.functionalImpacts?.social?.level || "Moderate"
      const socialDesc =
        assessmentData?.functionalImpacts?.social?.description || "Limited peer interaction and social reciprocity"
      const adaptiveLevel = assessmentData?.functionalImpacts?.adaptive?.level || "Moderate"
      const adaptiveDesc =
        assessmentData?.functionalImpacts?.adaptive?.description || "Requires support for daily living activities"
      const behaviorLevel = assessmentData?.functionalImpacts?.behavior?.level || "Moderate"
      const behaviorDesc =
        assessmentData?.functionalImpacts?.behavior?.description ||
        "Exhibits challenging behaviors that interfere with learning"

      const goals = assessmentData?.goals || []
      const goalsCount = goals.length
      const goalsText =
        goals.length > 0
          ? goals
              .slice(0, 5)
              .map((g, i) => `${i + 1}. ${g.domain}: ${g.description}`)
              .join("\n")
          : "Goals to be specified based on assessment"

      const weeklyHours = assessmentData?.recommendations?.weeklyHours || 20
      const duration = assessmentData?.recommendations?.duration || "6 months"
      const frequency = assessmentData?.recommendations?.frequency || "5 days/week"

      const prompt = `Generate a comprehensive Medical Necessity Statement for ABA therapy authorization.

CLIENT INFORMATION:
- Name: ${clientName}
- Age: ${clientAge || "[Age]"} years old
- Primary Diagnosis: ${primaryDiagnosis} (${icd10Code})
${secondaryLine}

FUNCTIONAL IMPACTS:
- Communication: ${commLevel} - ${commDesc}
- Social Skills: ${socialLevel} - ${socialDesc}
- Adaptive Behavior: ${adaptiveLevel} - ${adaptiveDesc}
- Behavior: ${behaviorLevel} - ${behaviorDesc}

TREATMENT GOALS (${goalsCount} goals identified):
${goalsText}

RECOMMENDED SERVICES:
- Weekly Hours: ${weeklyHours} hours/week
- Duration: ${duration}
- Frequency: ${frequency}

INSURANCE: ${insuranceLabel}
SPECIFIC REQUIREMENTS: ${insuranceReqs}

Generate a professional medical necessity statement that:
1. Clearly establishes the diagnosis and its impact on functioning
2. Describes specific skill deficits and behavioral challenges
3. Explains why ABA therapy is medically necessary
4. Justifies the recommended treatment intensity
5. References evidence-based practices
6. Addresses the specific insurance requirements listed above
7. Includes appropriate clinical language

Format the statement with clear paragraphs. Do not use headers or bullet points - write in flowing professional prose suitable for insurance submission.`

      console.log("[v0] Making API request to /api/ai-assistant...")

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          currentStep: 10,
          clientDiagnosis: primaryDiagnosis,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API error response:", errorData)
        throw new Error(errorData.error || `API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response received, content length:", data.content?.length || 0)

      const statement = data.content || ""

      if (!statement) {
        throw new Error("No content generated")
      }

      setGeneratedStatement(statement)
      setEditedStatement(statement)
      console.log("[v0] Statement generated successfully")
    } catch (err) {
      console.error("[v0] Generation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Failed to generate statement: ${errorMessage}. Please check your API configuration and try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    const textToCopy = isEditing ? editedStatement : generatedStatement
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveStatement = () => {
    const statement = isEditing ? editedStatement : generatedStatement
    const newSaved: GeneratedStatement = {
      id: crypto.randomUUID(),
      insurance: selectedInsurance,
      content: statement,
      createdAt: new Date(),
    }
    setSavedStatements((prev) => [newSaved, ...prev])
    onSave?.(statement)
    setIsEditing(false)

    // Also save to localStorage
    if (typeof window !== "undefined") {
      safeSetItem("aria_medical_necessity_statement", statement)
    }
  }

  const regenerate = () => {
    setGeneratedStatement("")
    setEditedStatement("")
    generateStatement()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-teal-600" />
            Medical Necessity Statement Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">AI-powered statements tailored to insurance requirements</p>
        </div>
      </div>

      {/* Insurance Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Select Insurance Provider</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INSURANCE_OPTIONS.map((insurance) => (
            <button
              key={insurance.value}
              onClick={() => setSelectedInsurance(insurance.value)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedInsurance === insurance.value
                  ? "border-teal-600 bg-teal-50 text-teal-600"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              {insurance.label}
            </button>
          ))}
        </div>

        {/* Insurance-specific tip */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> {INSURANCE_REQUIREMENTS[selectedInsurance]}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      {!generatedStatement && (
        <button
          onClick={generateStatement}
          disabled={isGenerating}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Statement...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Medical Necessity Statement
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generated Statement */}
      {generatedStatement && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Statement Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              <span className="font-medium text-gray-900">Generated Statement</span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                {INSURANCE_OPTIONS.find((i) => i.value === selectedInsurance)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-colors ${
                  isEditing ? "bg-teal-600 text-white" : "hover:bg-gray-100 text-gray-600"
                }`}
                title={isEditing ? "View mode" : "Edit mode"}
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={regenerate}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Statement Content */}
          <div className="p-6">
            {isEditing ? (
              <textarea
                value={editedStatement}
                onChange={(e) => setEditedStatement(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{generatedStatement}</p>
              </div>
            )}
          </div>

          {/* Statement Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              {(isEditing ? editedStatement : generatedStatement).split(/\s+/).length} words
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={regenerate}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
              <button
                onClick={saveStatement}
                className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Statements */}
      {savedStatements.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Saved Statements</h3>
          <div className="space-y-3">
            {savedStatements.map((saved) => (
              <div
                key={saved.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => {
                  setGeneratedStatement(saved.content)
                  setEditedStatement(saved.content)
                  setSelectedInsurance(saved.insurance)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    {INSURANCE_OPTIONS.find((i) => i.value === saved.insurance)?.label}
                  </span>
                  <span className="text-xs text-gray-400">{saved.createdAt.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{saved.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-medium text-amber-800 mb-2">Tips for Approval</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Review and customize the generated statement for accuracy</li>
          <li>• Ensure all clinical data matches your assessment findings</li>
          <li>• Add specific examples from your direct observation</li>
          <li>• Verify treatment hours align with your clinical judgment</li>
        </ul>
      </div>
    </div>
  )
}
