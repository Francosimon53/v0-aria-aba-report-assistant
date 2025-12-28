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
  CheckCircle,
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
const MOTIVATIONAL_MESSAGES = [
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
  const [copyFeedback, setCopyFeedback] = useState(false)

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
        setMotivationalIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isGenerating])

  const handleDemoMode = () => {
    console.log("[v0] Demo Mode activated")
    setDemoMode(true)
    setAssessmentData(sampleAssessmentData)
    console.log("[v0] Assessment data set:", sampleAssessmentData.clientInfo)
    console.log("[v0] Demo Mode state after activation:", true)
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

      // Show completion toast
      alert("Report generation complete! All sections have been generated.")
    } catch (error) {
      console.error("[v0] Error generating full report:", error)
      alert("An error occurred while generating the report. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate progress
  const completedCount = sections.filter((s) => s.status === "complete").length
  const progress = Math.round((completedCount / sections.length) * 100)

  console.log("[v0] Demo Mode:", demoMode, "Progress:", progress, "Completed:", completedCount)

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy to clipboard:", error)
    }
  }

  // Get all report content
  const getAllContent = () => {
    return sections
      .filter((s) => s.status === "complete")
      .map((s) => `## ${s.title}\n\n${s.content}`)
      .join("\n\n---\n\n")
  }

  // Print function
  const handlePrint = () => {
    const printContent = getAllContent()
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ABA Assessment Report - ${assessmentData?.clientInfo?.firstName || "Client"} ${assessmentData?.clientInfo?.lastName || ""}</title>
            <style>
              body {
                font-family: 'Times New Roman', Times, serif;
                line-height: 1.6;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 1in;
                color: #333;
              }
              h2 {
                color: #0D9488;
                border-bottom: 2px solid #0D9488;
                padding-bottom: 0.5em;
                margin-top: 2em;
              }
              h3 { margin-top: 1.5em; }
              p { margin: 0.5em 0; }
              @media print {
                body { margin: 0; padding: 0.5in; }
                h2 { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            ${printContent
              .split("\n")
              .map((line) => {
                if (line.startsWith("## ")) {
                  return `<h2>${line.substring(3)}</h2>`
                } else if (line.startsWith("### ")) {
                  return `<h3>${line.substring(4)}</h3>`
                } else if (line === "---") {
                  return "<hr />"
                } else if (line.trim()) {
                  return `<p>${line}</p>`
                }
                return ""
              })
              .join("\n")}
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  // PDF export function using jspdf
  const handleExportPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 1
      const maxWidth = pageWidth - 2 * margin
      let yPosition = margin

      // Add title
      doc.setFontSize(20)
      doc.setTextColor(13, 148, 136) // Teal color
      doc.text("ABA Assessment Report", margin, yPosition)
      yPosition += 0.3

      // Add client info
      if (assessmentData?.clientInfo) {
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`${assessmentData.clientInfo.firstName} ${assessmentData.clientInfo.lastName}`, margin, yPosition)
        yPosition += 0.2
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`${assessmentData.clientInfo.diagnosis}`, margin, yPosition)
        yPosition += 0.5
      }

      // Add each section
      for (const section of sections) {
        if (section.status === "complete" && section.content) {
          // Check if we need a new page
          if (yPosition > pageHeight - 1.5) {
            doc.addPage()
            yPosition = margin
          }

          // Section title
          doc.setFontSize(14)
          doc.setTextColor(13, 148, 136)
          doc.text(section.title, margin, yPosition)
          yPosition += 0.3

          // Section content
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          const lines = doc.splitTextToSize(section.content, maxWidth)

          for (const line of lines) {
            if (yPosition > pageHeight - margin) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin, yPosition)
            yPosition += 0.2
          }

          yPosition += 0.3
        }
      }

      // Save PDF
      const fileName = `ABA_Report_${assessmentData?.clientInfo?.firstName || "Client"}_${new Date().toISOString().split("T")[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("[v0] Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">AI Report Generator</h1>
          </div>
          {!demoMode && (
            <button
              onClick={handleDemoMode}
              className="px-6 py-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-2 font-semibold shadow-md"
            >
              <Trophy className="h-5 w-5" />
              Demo Mode
            </button>
          )}
        </div>

        {/* Welcome Screen when Demo Mode is not active */}
        {!demoMode && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Sparkles className="h-16 w-16 text-teal-600 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-slate-900 mb-4">AI-Powered ABA Report Generator</h2>
                <p className="text-xl text-slate-600">
                  Generate comprehensive, professional ABA assessment reports using artificial intelligence. Each
                  section is tailored with clinical precision and insurance compliance.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-teal-50 rounded-xl p-6">
                  <FileText className="h-10 w-10 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">12 Report Sections</h3>
                  <p className="text-slate-600">From client information to treatment recommendations</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-6">
                  <Sparkles className="h-10 w-10 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">AI-Generated Content</h3>
                  <p className="text-slate-600">Professional clinical language with evidence-based insights</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6">
                  <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Insurance Ready</h3>
                  <p className="text-slate-600">Compliant with payer requirements and documentation standards</p>
                </div>
              </div>

              <button
                onClick={handleDemoMode}
                className="px-12 py-5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all font-bold text-xl shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              >
                <Trophy className="h-6 w-6" />
                Try Demo Mode
              </button>
              <p className="text-slate-500 mt-4">Uses sample data for Marcus Johnson (ASD Level 2)</p>
            </div>
          </div>
        )}

        {/* Main Content - Show when Demo Mode IS active */}
        {demoMode && assessmentData && (
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-teal-100">
              <div className="flex items-center justify-between gap-6">
                {/* Left: Circular Progress */}
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0D9488" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </linearGradient>
                      </defs>
                      {/* Background circle */}
                      <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                      {/* Progress circle */}
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#progressGradient)"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * progress) / 100}
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-teal-600">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  <p className="text-center text-sm text-slate-600 mt-2">
                    {completedCount} of {sections.length} sections
                  </p>
                </div>

                {/* Center: Client Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {assessmentData.clientInfo.firstName} {assessmentData.clientInfo.lastName}
                  </h3>
                  <p className="text-lg text-slate-600">{assessmentData.clientInfo.diagnosis}</p>
                </div>

                {/* Right: Progress Stats */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-teal-600">{Math.round(progress)}%</div>
                  <div className="text-sm text-slate-600">
                    {completedCount} of {sections.length} sections
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                {isGenerating && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-200">
                    <div className="flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
                      <p className="text-teal-700 font-semibold text-lg">{MOTIVATIONAL_MESSAGES[motivationalIndex]}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateFullReport}
                    disabled={isGenerating}
                    className="flex-1 px-8 py-4 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6" />
                        Generate Full Report
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(getAllContent())}
                    disabled={completedCount === 0}
                    className="px-6 py-4 rounded-lg border-2 border-teal-200 text-teal-600 hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
                  >
                    <Copy className="h-5 w-5" />
                    {copyFeedback ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={completedCount === 0}
                    className="px-6 py-4 rounded-lg border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={completedCount === 0}
                    className="px-6 py-4 rounded-lg border-2 border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Report Sections Grid */}
              <div className="grid gap-4 mt-6">
                {sections.map((section) => (
                  <div key={section.id} className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
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
                          <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 rounded text-sm bg-white border hover:bg-slate-50 transition-colors"
                          >
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
        )}
      </div>
    </div>
  )
}
