"use client"

import { useState, useEffect } from "react"
import type React from "react"
import {
  FileText,
  Check,
  Copy,
  Printer,
  Eye,
  AlertCircle,
  User,
  ClipboardList,
  BookOpen,
  Target,
  Brain,
  Heart,
  Calendar,
  FileCheck,
  Sparkles,
  Trophy,
  ChevronDown,
  FileDown,
  Loader2,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Badge } from "@/components/ui/badge"
// SAMPLE DATA - Marcus Johnson Demo
// ============================================
const sampleAssessmentData = {
  clientInfo: {
    firstName: "Marcus",
    lastName: "Johnson",
    dob: "03/15/2020",
    age: 4,
    gender: "Male",
    diagnosis: "Autism Spectrum Disorder - Level 2",
    icd10Code: "F84.0",
    clientId: "MJ-2024-001",
    address: "123 Oak Street, Naples, FL 34102",
    caregiver: "Sarah Johnson (Mother)",
    phone: "(239) 555-0123",
  },
  providerInfo: {
    name: "ARIA Behavioral Health Services",
    bcbaName: "Dr. Amanda Rodriguez, BCBA-D",
    bcbaLicense: "FL-BCBA-12345",
    bcbaPhone: "(239) 555-9876",
    bcbaEmail: "dr.rodriguez@ariabehavioral.com",
    npi: "1234567890",
  },
  insurance: {
    provider: "Blue Cross Blue Shield of Florida",
    policyNumber: "BCB-987654321",
    authNumber: "AUTH-2024-56789",
  },
  background: {
    developmental:
      "Marcus was born full-term following an uncomplicated pregnancy. Developmental concerns emerged around 18 months when Marcus did not develop speech as expected.",
    medical: "No significant medical history. Up to date on vaccinations. No known allergies.",
    educational: "Currently attends Little Stars Preschool 4 days per week with ESE services.",
    family: "Lives with mother Sarah (35), father Michael (37), and older sister Emma (7).",
    strengths: "Strong visual-spatial skills, excellent memory, shows affection toward family.",
    weaknesses: "Significant delays in expressive and receptive language, difficulty with social reciprocity.",
  },
  assessmentTools: ["VB-MAPP", "Vineland-3", "ABLLS-R", "FBA", "Direct Observation"],
  assessmentDates: "December 1-15, 2024",
  behaviors: [
    { name: "Tantrum Behavior", baseline: "8-12 per day", function: "Tangible/Escape" },
    { name: "Vocal Stereotypy", baseline: "30-50% of intervals", function: "Automatic" },
    { name: "Non-compliance", baseline: "60-70% of instructions", function: "Escape" },
  ],
  goals: [
    { domain: "Communication", shortTerm: "Request items with 80% accuracy", longTerm: "Use 2-3 word phrases" },
    { domain: "Social Skills", shortTerm: "Respond to name 80% of time", longTerm: "Engage in peer interactions" },
    { domain: "Adaptive", shortTerm: "Toilet training initiation", longTerm: "Independent toileting" },
  ],
  recommendations: {
    weeklyHours: 25,
    rbtHours: 20,
    bcbaHours: 4,
    parentTrainingHours: "2 hours/week",
  },
} // ============================================
// TYPES
// ============================================
interface ReportSection {
  id: string
  title: string
  status: "pending" | "generating" | "complete" | "error"
  content: string
  icon: React.ReactNode
  estimatedWords: string
}

interface AssessmentData {
  clientInfo?: any
  providerInfo?: any
  insurance?: any
  background?: any
  assessmentTools?: string[]
  assessmentDates?: string
  behaviors?: any[]
  goals?: any[]
  recommendations?: any
}

// ============================================
// REPORT SECTIONS CONFIG
// ============================================
const REPORT_SECTIONS = [
  { id: "header", title: "Header & Client Information", icon: <User className="h-4 w-4" />, estimatedWords: "150-200" },
  {
    id: "service_recommendations",
    title: "Service Recommendations",
    icon: <Calendar className="h-4 w-4" />,
    estimatedWords: "100-150",
  },
  {
    id: "referral",
    title: "Reason for Referral",
    icon: <ClipboardList className="h-4 w-4" />,
    estimatedWords: "150-200",
  },
  {
    id: "background",
    title: "Background Information",
    icon: <BookOpen className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "assessments",
    title: "Assessments Conducted",
    icon: <FileCheck className="h-4 w-4" />,
    estimatedWords: "200-300",
  },
  { id: "abc_observations", title: "ABC Observations", icon: <Eye className="h-4 w-4" />, estimatedWords: "400-600" },
  {
    id: "preference_assessment",
    title: "Preference Assessment",
    icon: <Heart className="h-4 w-4" />,
    estimatedWords: "150-200",
  },
  {
    id: "maladaptive_behaviors",
    title: "Maladaptive Behaviors",
    icon: <AlertCircle className="h-4 w-4" />,
    estimatedWords: "600-1000",
  },
  {
    id: "hypothesis_interventions",
    title: "Hypothesis-Based Interventions",
    icon: <Brain className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "intervention_descriptions",
    title: "Description of Interventions",
    icon: <Target className="h-4 w-4" />,
    estimatedWords: "600-800",
  },
  {
    id: "teaching_procedures",
    title: "Teaching Procedures",
    icon: <BookOpen className="h-4 w-4" />,
    estimatedWords: "800-1200",
  },
  {
    id: "skill_acquisition_goals",
    title: "Skill Acquisition Goals",
    icon: <Target className="h-4 w-4" />,
    estimatedWords: "600-1000",
  },
]

// ============================================
// MOTIVATIONAL MESSAGES
// ============================================
const motivationalMessages = [
  "Crafting your professional report...",
  "Generating clinical insights...",
  "Building evidence-based recommendations...",
  "Compiling assessment findings...",
  "Synthesizing behavioral data...",
  "Creating personalized treatment plan...",
  "Optimizing report quality...",
  "Finalizing clinical documentation...",
]

// ============================================
// MAIN COMPONENT
// ============================================
export function AIReportGenerator() {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [motivationalIndex, setMotivationalIndex] = useState(0)
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)

  // Initialize report sections
  useEffect(() => {
    const initialSections: ReportSection[] = REPORT_SECTIONS.map((section) => ({
      ...section,
      status: "pending",
      content: "",
    }))
    setSections(initialSections)
  }, [])

  // Update motivational message every 2 seconds
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  // Toggle demo mode
  const handleDemoMode = () => {
    setDemoMode(true)
    setAssessmentData(sampleAssessmentData)
  }

  // Generate single section
  const generateSection = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "generating" } : s)))

    try {
      const data = assessmentData || sampleAssessmentData

      // Build prompt text for the section
      const promptText = `Generate a professional clinical report section for "${section.title}" with the following client information:

Client: ${data.clientInfo?.firstName} ${data.clientInfo?.lastName}
Age: ${data.clientInfo?.age} years old
Diagnosis: ${data.clientInfo?.diagnosis}
ICD-10: ${data.clientInfo?.icd10Code}

Background Information:
- Developmental: ${data.background?.developmental || "Not provided"}
- Medical: ${data.background?.medical || "Not provided"}
- Educational: ${data.background?.educational || "Not provided"}
- Family: ${data.background?.family || "Not provided"}
- Strengths: ${data.background?.strengths || "Not provided"}

Assessment Tools Used: ${data.assessmentTools?.join(", ") || "Not specified"}
Assessment Dates: ${data.assessmentDates || "Not specified"}

Behaviors Observed:
${data.behaviors?.map((b: any) => `- ${b.name}: Baseline ${b.baseline}, Function: ${b.function}`).join("\n") || "Not provided"}

Goals:
${data.goals?.map((g: any) => `- ${g.domain}: ${g.shortTerm}`).join("\n") || "Not provided"}

Service Recommendations:
- Weekly Hours: ${data.recommendations?.weeklyHours || "Not specified"}
- RBT Hours: ${data.recommendations?.rbtHours || "Not specified"}
- BCBA Hours: ${data.recommendations?.bcbaHours || "Not specified"}

Write this section in professional clinical language appropriate for insurance submission. Include evidence-based recommendations and detailed behavioral analysis. Target approximately ${section.estimatedWords} words.`

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
          clientDiagnosis: data.clientInfo?.diagnosis || "Autism Spectrum Disorder",
          isReportSection: true,
          sectionType: sectionId,
          clientData: data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate section")
      }

      const result = await response.json()
      const content = result.content || result.message || ""

      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "complete", content } : s)))
    } catch (error) {
      console.error(`[v0] Error generating section ${sectionId}:`, error)
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, status: "error" } : s)))
    }
  }

  // Generate full report
  const handleGenerateFullReport = async () => {
    if (!assessmentData && !demoMode) {
      console.error("[v0] No assessment data available")
      return
    }

    setIsGenerating(true)
    setMotivationalIndex(0)

    try {
      // Generate all sections sequentially
      for (const section of sections) {
        await generateSection(section.id)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate progress
  const completedCount = sections.filter((s) => s.status === "complete").length
  const progressPercent = Math.round((completedCount / sections.length) * 100)

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get all report content
  const getAllContent = () => {
    return sections
      .filter((s) => s.status === "complete")
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n")
  }

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-teal-600" />
              <h1 className="text-2xl font-bold text-slate-900">AI Report Generator</h1>
            </div>
            {!demoMode && (
              <button
                onClick={handleDemoMode}
                className="px-4 py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium"
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                Demo Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {demoMode && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-teal-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {assessmentData?.clientInfo?.firstName} {assessmentData?.clientInfo?.lastName}
                </h2>
                <p className="text-sm text-slate-600">{assessmentData?.clientInfo?.diagnosis}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-teal-600">{progressPercent}%</div>
                <p className="text-sm text-slate-600">
                  {completedCount} of {sections.length} sections
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Motivational Message */}
            {isGenerating && (
              <div className="mt-4 flex items-center gap-2 text-teal-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">{motivationalMessages[motivationalIndex]}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleGenerateFullReport}
                disabled={isGenerating}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Full Report"}
              </button>
              <button
                onClick={() => copyToClipboard(getAllContent())}
                disabled={completedCount === 0}
                className="px-6 py-3 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 disabled:opacity-50 font-semibold transition-colors flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                disabled={completedCount === 0}
                className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-semibold transition-colors flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Sections Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border border-slate-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors"
            >
              {/* Section Header */}
              <button
                onClick={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-teal-600">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                    <p className="text-xs text-slate-500">{section.estimatedWords} words</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  {section.status === "pending" && <Badge className="bg-slate-100 text-slate-700">Pending</Badge>}
                  {section.status === "generating" && (
                    <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating
                    </Badge>
                  )}
                  {section.status === "complete" && (
                    <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                  {section.status === "error" && <Badge className="bg-red-100 text-red-700">Error</Badge>}

                  {/* Generate Button */}
                  {section.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        generateSection(section.id)
                      }}
                      className="px-3 py-1 rounded text-sm bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                    >
                      Generate
                    </button>
                  )}

                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      expandedSectionId === section.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Section Content */}
              {expandedSectionId === section.id && section.status === "complete" && (
                <div className="px-6 py-4 border-t bg-slate-50">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>

                  {/* Section Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => copyToClipboard(section.content)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-white border hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-white border hover:bg-slate-50 transition-colors">
                      <Printer className="h-4 w-4" />
                      Print
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
