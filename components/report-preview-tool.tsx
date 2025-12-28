"use client"

import { useRef } from "react"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
  FileTextIcon,
  DownloadIcon,
  PrinterIcon,
  EditIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  SparklesIcon,
  XIcon,
  CopyIcon,
  SendIcon,
  CheckIcon,
  LoaderIcon,
} from "@/components/icons"
import { SignaturePad } from "@/components/signature-pad"
import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"
import { safeGetItem } from "@/lib/safe-storage"

type ExportStatus = "idle" | "loading" | "success" | "error"

interface ReportSection {
  id: string
  title: string
  required: boolean
  completed: boolean
  content: string
  order: number
  enabled: boolean
  issues?: string[]
}

interface ReportPreviewToolProps {
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  backgroundData: any | null
  goalsData: SelectedGoal[]
}

export function ReportPreviewTool({ clientData, assessmentData, backgroundData, goalsData }: ReportPreviewToolProps) {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("preview")
  const [versions, setVersions] = useState<{ date: Date; sections: ReportSection[] }[]>([])
  const [showCompliance, setShowCompliance] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [complianceScore, setComplianceScore] = useState(0)

  const [copyStatus, setCopyStatus] = useState<ExportStatus>("idle")
  const [emailStatus, setEmailStatus] = useState<ExportStatus>("idle")
  const [pdfStatus, setPdfStatus] = useState<ExportStatus>("idle")
  const [docxStatus, setDocxStatus] = useState<ExportStatus>("idle")
  const [printStatus, setPrintStatus] = useState<ExportStatus>("idle")

  const reportRef = useRef<HTMLDivElement>(null)

  const [signatures, setSignatures] = useState<{
    bcba: { signature: string | null; name: string; date: string } | null
    parent: { signature: string | null; name: string; date: string } | null
  }>({
    bcba: null,
    parent: null,
  })

  const handleSignatureChange = (type: "bcba" | "parent", signature: string | null, name: string, date: string) => {
    setSignatures((prev) => ({
      ...prev,
      [type]: { signature, name, date },
    }))

    setSections((prev) =>
      prev.map((s) =>
        s.id === "signatures"
          ? {
              ...s,
              completed: !!(signatures.bcba?.name || signatures.parent?.name || name),
              issues: [],
            }
          : s,
      ),
    )
  }

  const generateClientInfo = () => {
    if (!clientData) return ""
    return `Name: ${clientData.firstName} ${clientData.lastName}
Date of Birth: ${clientData.dateOfBirth}
Diagnosis: ${clientData.diagnosis}
Insurance: ${clientData.insuranceProvider}
Policy #: ${clientData.insuranceId}`
  }

  const generateAssessmentInstruments = () => {
    if (!assessmentData) return ""
    return `Primary Assessment: ${assessmentData.assessmentType}
Assessment Date: ${assessmentData.assessmentDate}`
  }

  const generateResults = () => {
    if (!assessmentData?.domains) return ""
    return assessmentData.domains.map((d) => `${d.domain}: ${d.score}%\nNotes: ${d.notes || "None"}`).join("\n\n")
  }

  const generateGoals = () => {
    if (goalsData.length === 0) return ""
    return goalsData.map((g, i) => `Goal ${i + 1}: ${g.goalId}\nPriority: ${g.priority}`).join("\n\n")
  }

  const generateParentTraining = () => {
    return `Parent training will occur for a minimum of 2 hours per month and will include:
• Understanding ABA principles and terminology
• Implementing behavior management strategies
• Data collection procedures
• Generalization strategies`
  }

  const generateSignatures = () => {
    return `______________________________    Date: __________
${signatures.bcba?.name || "Assessor Name"}
Board Certified Behavior Analyst

______________________________    Date: __________
${signatures.parent?.name || "Parent/Guardian"}`
  }

  useEffect(() => {
    const initialSections: ReportSection[] = [
      {
        id: "client-info",
        title: "Client Information",
        required: true,
        completed: !!clientData,
        content: generateClientInfo(),
        order: 1,
        enabled: true,
        issues: !clientData ? ["Client data not entered"] : [],
      },
      {
        id: "reason-referral",
        title: "Reason for Referral",
        required: true,
        completed: !!assessmentData?.reasonForReferral,
        content: assessmentData?.reasonForReferral || "",
        order: 2,
        enabled: true,
        issues: !assessmentData?.reasonForReferral ? ["Reason for referral not provided"] : [],
      },
      {
        id: "assessment-instruments",
        title: "Assessment Instruments",
        required: true,
        completed: !!assessmentData?.assessmentType,
        content: generateAssessmentInstruments(),
        order: 3,
        enabled: true,
        issues: !assessmentData?.assessmentType ? ["Assessment type not selected"] : [],
      },
      {
        id: "results",
        title: "Assessment Results",
        required: true,
        completed: !!assessmentData?.domains,
        content: generateResults(),
        order: 4,
        enabled: true,
        issues: !assessmentData?.domains ? ["Assessment domains not completed"] : [],
      },
      {
        id: "goals",
        title: "Treatment Goals & Objectives",
        required: true,
        completed: goalsData.length > 0,
        content: generateGoals(),
        order: 5,
        enabled: true,
        issues: goalsData.length === 0 ? ["No treatment goals selected"] : [],
      },
      {
        id: "medical-necessity",
        title: "Medical Necessity Statement",
        required: true,
        completed: !!assessmentData?.medicalNecessity,
        content: assessmentData?.medicalNecessity || "",
        order: 6,
        enabled: true,
        issues: !assessmentData?.medicalNecessity ? ["Medical necessity statement required"] : [],
      },
      {
        id: "cpt-auth-request",
        title: "CPT Authorization Request Summary",
        required: true,
        completed: !!safeGetItem("aria_cpt_auth_request", ""),
        content: safeGetItem("aria_cpt_auth_request", ""),
        order: 7,
        enabled: true,
        issues: !safeGetItem("aria_cpt_auth_request", "") ? ["CPT Authorization Request not generated"] : [],
      },
      {
        id: "hours-justification",
        title: "Service Hours Justification",
        required: true,
        completed: !!assessmentData?.hoursJustification,
        content: assessmentData?.hoursJustification || "",
        order: 8,
        enabled: true,
        issues: !assessmentData?.hoursJustification ? ["Hours justification required for insurance"] : [],
      },
      {
        id: "parent-training",
        title: "Parent/Caregiver Training Plan",
        required: true,
        completed: !!assessmentData?.parentTrainingPlan,
        content: assessmentData?.parentTrainingPlan || generateParentTraining(),
        order: 9,
        enabled: true,
      },
      {
        id: "crisis-plan",
        title: "Crisis & Safety Plan",
        required: false,
        completed: !!assessmentData?.crisisPlan,
        content: assessmentData?.crisisPlan || "",
        order: 10,
        enabled: true,
      },
      {
        id: "signatures",
        title: "Signatures & Consent",
        required: true,
        completed: false,
        content: generateSignatures(),
        order: 11,
        enabled: true,
        issues: ["Digital signatures pending"],
      },
    ]
    setSections(initialSections)
  }, [clientData, assessmentData, goalsData])

  useEffect(() => {
    if (sections.length > 0) {
      setCompletionPercentage(getCompletionPercentage())
      setComplianceScore(getComplianceScore())
    }
  }, [sections])

  const complianceChecks = [
    {
      label: "All required sections completed",
      completed: sections.filter((s) => s.required).every((s) => s.completed),
      required: true,
    },
    {
      label: "Goals have measurable criteria",
      completed: goalsData.length > 0,
      required: true,
    },
    {
      label: "Service hours justified",
      completed: !!assessmentData?.hoursJustification,
      required: true,
    },
    {
      label: "Medical necessity statement included",
      completed: !!assessmentData?.medicalNecessity,
      required: true,
    },
    {
      label: "Risk assessment completed (if applicable)",
      completed: true,
      required: false,
    },
    {
      label: "Parent training plan outlined",
      completed: !!assessmentData?.parentTrainingPlan,
      required: true,
    },
    {
      label: "Consent form signed",
      completed: false,
      required: true,
    },
    {
      label: "Report reviewed by BCBA",
      completed: false,
      required: true,
    },
  ]

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sections]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newSections.length) return
    ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
    newSections[index].order = index + 1
    newSections[targetIndex].order = targetIndex + 1
    setSections(newSections)
  }

  const toggleSection = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  const updateContent = (id: string, content: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content, completed: content.length > 0 } : s)))
  }

  const addCustomSection = () => {
    const newSection: ReportSection = {
      id: `custom-${Date.now()}`,
      title: "Custom Section",
      required: false,
      completed: false,
      content: "",
      order: sections.length + 1,
      enabled: true,
    }
    setSections([...sections, newSection])
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  const saveVersion = () => {
    setVersions([...versions, { date: new Date(), sections: [...sections] }])
  }

  const generateFullReport = () => {
    return sections
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map((s) => `${s.title.toUpperCase()}\n${"=".repeat(60)}\n${s.content}\n\n`)
      .join("")
  }

  const generateHTMLReport = () => {
    const clientName = clientData ? `${clientData.firstName} ${clientData.lastName}` : "Client"
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ABA Assessment Report - ${clientName}</title>
        <style>
          @page { margin: 1in; size: letter; }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0D9488;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24pt;
            margin: 0 0 10px 0;
            color: #0D9488;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #0D9488;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section-content {
            white-space: pre-wrap;
            text-align: justify;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 10pt;
            color: #666;
            text-align: center;
          }
          .signature-block {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 45%;
          }
          .signature-line hr {
            border: none;
            border-top: 1px solid #333;
            margin-bottom: 5px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Behavior Analysis Assessment Report</h1>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Report Date:</strong> ${reportDate}</p>
          <p><strong>Assessment Type:</strong> ${assessmentData?.assessmentType || "Initial Assessment"}</p>
        </div>
        ${sections
          .filter((s) => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map(
            (s) => `
          <div class="section">
            <div class="section-title">${s.title}</div>
            <div class="section-content">${s.content || "Not completed"}</div>
          </div>
        `,
          )
          .join("")}
        <div class="footer">
          <p>This report is confidential and intended for authorized recipients only.</p>
          <p>Generated by ARIA ABA Report Assistant on ${reportDate}</p>
        </div>
      </body>
      </html>
    `
  }

  const handleCopy = async () => {
    setCopyStatus("loading")
    try {
      const reportText = generateFullReport()
      await navigator.clipboard.writeText(reportText)
      setCopyStatus("success")
      setTimeout(() => setCopyStatus("idle"), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
      setCopyStatus("error")
      setTimeout(() => setCopyStatus("idle"), 2000)
    }
  }

  const handleEmail = () => {
    setEmailStatus("loading")
    try {
      const clientName = clientData ? `${clientData.firstName} ${clientData.lastName}` : "Client"
      const reportDate = new Date().toLocaleDateString()

      const subject = encodeURIComponent(`ABA Assessment Report - ${clientName} - ${reportDate}`)

      const enabledSections = sections
        .filter((s) => s.enabled)
        .map((s) => s.title)
        .join(", ")
      const body = encodeURIComponent(
        `ABA Assessment Report for ${clientName}\n\n` +
          `Report Date: ${reportDate}\n` +
          `Included Sections: ${enabledSections}\n\n` +
          `---\n` +
          `Please request the full PDF report from your BCBA.\n\n` +
          `Generated by ARIA ABA Report Assistant`,
      )

      window.location.href = `mailto:?subject=${subject}&body=${body}`

      setEmailStatus("success")
      setTimeout(() => setEmailStatus("idle"), 2000)
    } catch (error) {
      console.error("[v0] Email failed:", error)
      setEmailStatus("error")
      setTimeout(() => setEmailStatus("idle"), 2000)
    }
  }

  const handleExportPDF = async () => {
    setPdfStatus("loading")
    try {
      const clientName = clientData ? `${clientData.firstName} ${clientData.lastName}` : "Client"
      const htmlContent = generateHTMLReport()

      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            setPdfStatus("success")
            setTimeout(() => setPdfStatus("idle"), 2000)
          }, 250)
        }
      } else {
        throw new Error("Popup blocked")
      }
    } catch (error) {
      console.error("PDF export failed:", error)
      setPdfStatus("error")
      setTimeout(() => setPdfStatus("idle"), 2000)
    }
  }

  const handleExportDOCX = async () => {
    setDocxStatus("loading")
    try {
      const clientName = clientData ? `${clientData.firstName} ${clientData.lastName}` : "Client"
      const reportDate = new Date().toLocaleDateString()

      let rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}}
{\\colortbl;\\red13\\green148\\blue136;}
\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440
\\pard\\qc\\b\\fs36\\cf1 Behavior Analysis Assessment Report\\b0\\fs24\\cf0\\par
\\pard\\qc\\par
\\b Client:\\b0  ${clientName}\\par
\\b Report Date:\\b0  ${reportDate}\\par
\\b Assessment Type:\\b0  ${assessmentData?.assessmentType || "Initial Assessment"}\\par
\\pard\\par
\\pard\\brdrb\\brdrs\\brdrw10\\brsp20\\par
\\par
`

      sections
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order)
        .forEach((section) => {
          rtfContent += `\\pard\\b\\fs28\\cf1 ${section.title.toUpperCase()}\\b0\\fs24\\cf0\\par
\\pard\\par
${section.content.replace(/\n/g, "\\par\n") || "Not completed"}\\par
\\par
`
        })

      rtfContent += `\\pard\\brdrb\\brdrs\\brdrw10\\brsp20\\par
\\pard\\qc\\fs20\\i This report is confidential and intended for authorized recipients only.\\par
Generated by ARIA ABA Report Assistant\\i0\\fs24\\par
}`

      const blob = new Blob([rtfContent], { type: "application/rtf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ABA_Report_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.rtf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setDocxStatus("success")
      setTimeout(() => setDocxStatus("idle"), 2000)
    } catch (error) {
      console.error("DOCX export failed:", error)
      setDocxStatus("error")
      setTimeout(() => setDocxStatus("idle"), 2000)
    }
  }

  const handlePrint = () => {
    setPrintStatus("loading")
    try {
      const htmlContent = generateHTMLReport()
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            setPrintStatus("success")
            setTimeout(() => setPrintStatus("idle"), 2000)
          }, 250)
        }
      } else {
        throw new Error("Popup blocked")
      }
    } catch (error) {
      console.error("Print failed:", error)
      setPrintStatus("error")
      setTimeout(() => setPrintStatus("idle"), 2000)
    }
  }

  const getCompletionPercentage = () => {
    const requiredSections = sections.filter((s) => s.required)
    if (requiredSections.length === 0) return 0
    const completedRequired = requiredSections.filter((s) => s.completed).length
    return Math.round((completedRequired / requiredSections.length) * 100)
  }

  const getComplianceScore = () => {
    const requiredChecks = complianceChecks.filter((c) => c.required)
    if (requiredChecks.length === 0) return 0
    const completedChecks = requiredChecks.filter((c) => c.completed).length
    return Math.round((completedChecks / requiredChecks.length) * 100)
  }

  const renderExportButton = (
    label: string,
    icon: React.ReactNode,
    status: ExportStatus,
    onClick: () => void,
    variant: "default" | "outline" = "outline",
  ) => {
    const isLoading = status === "loading"
    const isSuccess = status === "success"
    const isError = status === "error"

    return (
      <Button
        variant={variant}
        size="sm"
        onClick={onClick}
        disabled={isLoading}
        className={`relative transition-all duration-300 ${
          isSuccess ? "bg-green-500 text-white border-green-500 hover:bg-green-600" : ""
        } ${isError ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : ""}`}
      >
        {isLoading ? (
          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
        ) : isSuccess ? (
          <CheckIcon className="h-4 w-4 mr-2" />
        ) : (
          icon
        )}
        {isLoading ? "Processing..." : isSuccess ? "Done!" : isError ? "Failed" : label}
      </Button>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">Report Builder</h1>
            <p className="text-sm text-muted-foreground">Review, customize, and export your clinical report</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {renderExportButton("Copy", <CopyIcon className="h-4 w-4 mr-2" />, copyStatus, handleCopy)}
            {renderExportButton("Email", <SendIcon className="h-4 w-4 mr-2" />, emailStatus, handleEmail)}
            {renderExportButton("PDF", <DownloadIcon className="h-4 w-4 mr-2" />, pdfStatus, handleExportPDF)}
            {renderExportButton("DOCX", <DownloadIcon className="h-4 w-4 mr-2" />, docxStatus, handleExportDOCX)}
            {renderExportButton("Print", <PrinterIcon className="h-4 w-4 mr-2" />, printStatus, handlePrint)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0D9488]" />
            <span className="text-muted-foreground">Report Completeness:</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${complianceScore >= 90 ? "bg-green-500" : complianceScore >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
            />
            <span className="text-muted-foreground">Insurance Compliance:</span>
            <span className="font-semibold">{complianceScore}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-80 border-r border-border bg-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex-shrink-0">
            <Button variant="outline" className="w-full bg-transparent" onClick={addCustomSection}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Custom Section
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3 text-sm">Section Checklist</h3>
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedSection === section.id
                          ? "border-[#0D9488] bg-[#0D9488]/5"
                          : "border-border hover:border-[#0D9488]/50"
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {section.completed ? (
                            <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                          ) : section.issues && section.issues.length > 0 ? (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{section.title}</span>
                            {section.required && <span className="text-xs text-red-500 flex-shrink-0">*</span>}
                          </div>
                          {section.issues && section.issues.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {section.issues.map((issue, i) => (
                                <p key={i} className="text-xs text-red-600">
                                  {issue}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-muted-foreground">{section.content.length} chars</div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveSection(index, "up")
                            }}
                            disabled={index === 0}
                          >
                            <ArrowUpIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveSection(index, "down")
                            }}
                            disabled={index === sections.length - 1}
                          >
                            <ArrowDownIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Checkbox
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs text-muted-foreground">Include in report</span>
                        {!section.required && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSection(section.id)
                            }}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showCompliance && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Pre-Submission Checklist</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCompliance(false)}>
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {complianceChecks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Checkbox checked={check.completed} className="mt-0.5" disabled />
                        <span className={`text-xs ${check.completed ? "text-foreground" : "text-muted-foreground"}`}>
                          {check.label}
                          {check.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {versions.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-sm mb-3">Version History</h3>
                  <div className="space-y-2">
                    {versions.map((version, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs bg-transparent"
                      >
                        {version.date.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/50 flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant={previewMode === "preview" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("preview")}
                className={previewMode === "preview" ? "bg-[#0D9488] hover:bg-[#0D9488]/90" : ""}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                variant={previewMode === "edit" ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode("edit")}
                className={previewMode === "edit" ? "bg-[#0D9488] hover:bg-[#0D9488]/90" : ""}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={saveVersion}>
                Save Version
              </Button>
              {selectedSection && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#0D9488] border-[#0D9488] hover:bg-[#0D9488]/10 bg-transparent"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  AI Improve
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {previewMode === "preview" ? (
              <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="p-8">
                  <div className="text-center border-b-2 border-[#0D9488] pb-6 mb-8">
                    <h1 className="text-2xl font-bold text-[#0D9488] mb-2">Behavior Analysis Assessment Report</h1>
                    <p className="text-muted-foreground">
                      <strong>Client:</strong>{" "}
                      {clientData ? `${clientData.firstName} ${clientData.lastName}` : "Not specified"}
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Date:</strong>{" "}
                      {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  {sections
                    .filter((s) => s.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <div key={section.id} className="mb-8">
                        <h2 className="text-lg font-semibold text-[#0D9488] border-b border-border pb-2 mb-4 uppercase tracking-wide">
                          {section.title}
                        </h2>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {section.content || <span className="text-muted-foreground italic">No content entered</span>}
                        </div>
                      </div>
                    ))}
                  <div className="mt-12 pt-8 border-t-2 border-primary/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileTextIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Digital Signatures</h3>
                        <p className="text-sm text-muted-foreground">Sign using your mouse, trackpad, or touchscreen</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <SignaturePad
                        label="BCBA Signature"
                        sublabel="Board Certified Behavior Analyst"
                        onSignatureChange={(sig, name, date) => handleSignatureChange("bcba", sig, name, date)}
                      />
                      <SignaturePad
                        label="Parent/Guardian Signature"
                        sublabel="Legal Guardian or Caregiver"
                        onSignatureChange={(sig, name, date) => handleSignatureChange("parent", sig, name, date)}
                      />
                    </div>

                    {(signatures.bcba?.name || signatures.parent?.name) && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {signatures.bcba?.name && signatures.parent?.name
                              ? "Both signatures captured"
                              : signatures.bcba?.name
                                ? "BCBA signature captured"
                                : "Parent/Guardian signature captured"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                    <p>This report is confidential and intended for authorized recipients only.</p>
                    <p className="mt-1">Generated by ARIA ABA Report Assistant</p>
                  </div>
                </CardContent>
              </Card>
            ) : selectedSection ? (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Input
                        value={sections.find((s) => s.id === selectedSection)?.title || ""}
                        onChange={(e) => {
                          setSections(
                            sections.map((s) => (s.id === selectedSection ? { ...s, title: e.target.value } : s)),
                          )
                        }}
                        className="text-lg font-semibold"
                        placeholder="Section Title"
                      />
                    </div>
                    <Textarea
                      value={sections.find((s) => s.id === selectedSection)?.content || ""}
                      onChange={(e) => updateContent(selectedSection, e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Enter section content..."
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {sections
                          .find((s) => s.id === selectedSection)
                          ?.content.split(/\s+/)
                          .filter(Boolean).length || 0}{" "}
                        words
                      </span>
                      <span>{sections.find((s) => s.id === selectedSection)?.content.length || 0} characters</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a section from the left to edit</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
