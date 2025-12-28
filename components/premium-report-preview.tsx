"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Printer, Download, Mail, Copy, Check, FileText } from "lucide-react"

interface ReportSection {
  id: string
  title: string
  content: string
}

interface AssessmentData {
  clientInfo?: {
    firstName?: string
    lastName?: string
    dob?: string
    age?: string
    gender?: string
    address?: string
    phone?: string
    insuranceId?: string
    insuranceCompany?: string
    authorizationNumber?: string
    diagnosisCode?: string
    diagnosisDescription?: string
  }
  providerInfo?: {
    name?: string
    credentials?: string
    npi?: string
    phone?: string
    email?: string
    agency?: string
    address?: string
  }
  assessmentType?: string
  assessmentDate?: string
  authorizationPeriod?: {
    start?: string
    end?: string
  }
  servicePlan?: {
    totalWeeklyHours?: number
    services?: Array<{
      cptCode?: string
      description?: string
      unitsPerWeek?: number
      hoursPerWeek?: number
      location?: string
    }>
  }
}

interface PremiumReportPreviewProps {
  sections: ReportSection[]
  assessmentData: AssessmentData
  onClose: () => void
  onExport?: (format: "pdf" | "word" | "print" | "email") => void
}

export function PremiumReportPreview({ sections, assessmentData, onClose, onExport }: PremiumReportPreviewProps) {
  const [copied, setCopied] = useState(false)

  const clientName =
    `${assessmentData.clientInfo?.firstName || ""} ${assessmentData.clientInfo?.lastName || ""}`.trim() ||
    "[Client Name]"
  const providerName = assessmentData.providerInfo?.name || "[Provider Name]"
  const providerCredentials = assessmentData.providerInfo?.credentials || "BCBA, LBA"
  const providerAgency = assessmentData.providerInfo?.agency || "[Agency Name]"
  const assessmentType = assessmentData.assessmentType || "Initial Assessment"
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const copyFullReport = async () => {
    const fullReport = sections
      .filter((s) => s.content)
      .map((s) => `${"=".repeat(60)}\n${s.title.toUpperCase()}\n${"=".repeat(60)}\n\n${s.content}`)
      .join("\n\n")

    await navigator.clipboard.writeText(fullReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  // Parse content to render structured elements
  const renderContent = (content: string, sectionId: string) => {
    // Check if this is the service recommendations section with table data
    if (sectionId === "service-recommendations" && content.includes("CPT")) {
      return renderServiceTable(content)
    }

    // Check for behavior definitions
    if (sectionId === "maladaptive-behaviors") {
      return renderBehaviorDefinitions(content)
    }

    // Check for goals
    if (
      sectionId === "skill-acquisition-goals" ||
      sectionId === "behavior-reduction-goals" ||
      sectionId === "caregiver-goals"
    ) {
      return renderGoals(content)
    }

    // Check for interventions
    if (sectionId === "hypothesis-interventions") {
      return renderInterventions(content)
    }

    // Default paragraph rendering with proper formatting
    return (
      <div className="space-y-4 font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
        {content.split("\n\n").map((paragraph, idx) => {
          // Check for headers (lines ending with :)
          if (paragraph.trim().endsWith(":") && paragraph.length < 100) {
            return (
              <h4 key={idx} className="font-sans font-semibold text-gray-900 text-xs mt-6 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                {paragraph.trim()}
              </h4>
            )
          }

          // Check for bullet points
          if (paragraph.includes("• ") || paragraph.includes("- ")) {
            const items = paragraph.split(/[•-]\s+/).filter(Boolean)
            return (
              <ul key={idx} className="space-y-1 ml-4">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{item.trim()}</span>
                  </li>
                ))}
              </ul>
            )
          }

          // Regular paragraph
          return (
            <p key={idx} className="indent-8">
              {paragraph}
            </p>
          )
        })}
      </div>
    )
  }

  const renderServiceTable = (content: string) => {
    const services = assessmentData.servicePlan?.services || []
    const totalHours = assessmentData.servicePlan?.totalWeeklyHours || 0

    if (services.length === 0) {
      return (
        <div className="font-serif text-[11px] leading-relaxed text-gray-800 text-justify whitespace-pre-wrap">
          {content}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-700 to-gray-800">
                <th className="text-left py-3 px-4 text-white text-[10px] font-semibold uppercase tracking-wide">
                  CPT Code
                </th>
                <th className="text-left py-3 px-4 text-white text-[10px] font-semibold uppercase tracking-wide">
                  Description
                </th>
                <th className="text-center py-3 px-4 text-white text-[10px] font-semibold uppercase tracking-wide">
                  Units/Week
                </th>
                <th className="text-center py-3 px-4 text-white text-[10px] font-semibold uppercase tracking-wide">
                  Hours/Week
                </th>
                <th className="text-center py-3 px-4 text-white text-[10px] font-semibold uppercase tracking-wide">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-blue-600">{service.cptCode}</td>
                  <td className="py-3 px-4 text-[11px] text-gray-700">{service.description}</td>
                  <td className="py-3 px-4 text-center text-[11px] text-gray-900 font-medium">
                    {service.unitsPerWeek?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-gray-900 font-medium">
                    {service.hoursPerWeek} hrs
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-gray-600">{service.location}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td colSpan={3} className="py-3 px-4 text-[11px] font-bold text-gray-700 uppercase">
                  Total Weekly Hours
                </td>
                <td className="py-3 px-4 text-center text-sm font-bold text-gray-900">{totalHours} hrs</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="font-serif text-[11px] leading-relaxed text-gray-800 text-justify whitespace-pre-wrap">
          {content}
        </div>
      </div>
    )
  }

  const renderBehaviorDefinitions = (content: string) => {
    // Parse behavior definitions from content
    const behaviors = content.split(/\n(?=\d+\.\s|[A-Z][a-z]+\s+[A-Z]|Behavior:)/g).filter(Boolean)

    return (
      <div className="space-y-4">
        {behaviors.map((behavior, idx) => {
          const lines = behavior.split("\n").filter(Boolean)
          const title = lines[0]?.replace(/^\d+\.\s*/, "").trim() || `Behavior ${idx + 1}`

          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{title}</h4>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Function TBD
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-[11px] font-serif text-gray-700">
                {lines.slice(1).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGoals = (content: string) => {
    // Parse goals - look for LTO/STO patterns
    const goalBlocks = content.split(/(?=Long[-\s]?Term|LTO|Goal\s*\d+:)/gi).filter(Boolean)

    return (
      <div className="space-y-6">
        {goalBlocks.map((block, idx) => {
          const lines = block.split("\n").filter(Boolean)
          const isLTO = /long[-\s]?term|lto/i.test(lines[0] || "")

          if (isLTO) {
            return (
              <div key={idx} className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">
                    Long-Term Objective
                  </span>
                </div>
                <p className="text-[11px] text-gray-800 font-medium font-serif">{lines.slice(1).join(" ")}</p>
              </div>
            )
          }

          // Check for STOs
          const stos = block.match(/STO\s*#?\d+[:\s].+/gi) || []
          if (stos.length > 0) {
            return (
              <div key={idx} className="ml-4 space-y-2">
                {stos.map((sto, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 py-2 px-3 rounded ${
                      i === 0 ? "bg-green-50 border border-green-200" : "bg-gray-50"
                    }`}
                  >
                    <span className={`text-[9px] font-bold ${i === 0 ? "text-green-600" : "text-gray-400"}`}>
                      STO #{i + 1}
                    </span>
                    <p className="text-[10px] text-gray-700 font-serif">{sto.replace(/STO\s*#?\d+[:\s]/i, "")}</p>
                    {i === 0 && (
                      <span className="ml-auto text-[8px] bg-green-600 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                        CURRENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )
          }

          // Default rendering
          return (
            <div key={idx} className="font-serif text-[11px] leading-relaxed text-gray-800 text-justify">
              {block}
            </div>
          )
        })}
      </div>
    )
  }

  const renderInterventions = (content: string) => {
    // Parse by function
    const functionBlocks = content.split(/(?=Function:|Attention|Escape|Tangible|Automatic|Sensory)/gi).filter(Boolean)

    const functionColors: Record<string, { bg: string; text: string; gradient: string }> = {
      attention: { bg: "bg-purple-50", text: "text-purple-700", gradient: "from-purple-600 to-purple-700" },
      escape: { bg: "bg-blue-50", text: "text-blue-700", gradient: "from-blue-600 to-blue-700" },
      tangible: { bg: "bg-amber-50", text: "text-amber-700", gradient: "from-amber-600 to-amber-700" },
      automatic: { bg: "bg-green-50", text: "text-green-700", gradient: "from-green-600 to-green-700" },
      sensory: { bg: "bg-pink-50", text: "text-pink-700", gradient: "from-pink-600 to-pink-700" },
    }

    return (
      <div className="space-y-6">
        {functionBlocks.map((block, idx) => {
          const lines = block.split("\n").filter(Boolean)
          const functionName = lines[0]?.replace(/Function:?\s*/i, "").trim() || `Function ${idx + 1}`
          const functionKey = functionName.toLowerCase().split(" ")[0]
          const colors = functionColors[functionKey] || functionColors.attention

          return (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`bg-gradient-to-r ${colors.gradient} px-4 py-2`}>
                <h4 className="text-white font-bold text-sm uppercase tracking-wide">Function: {functionName}</h4>
              </div>

              <div className="p-4 space-y-4 text-[11px] font-serif text-gray-700">
                {lines.slice(1).map((line, i) => {
                  if (/preventive|antecedent/i.test(line)) {
                    return (
                      <h5
                        key={i}
                        className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 font-sans"
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Preventive Strategies
                      </h5>
                    )
                  }
                  if (/replacement|teaching/i.test(line)) {
                    return (
                      <h5
                        key={i}
                        className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 font-sans"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Replacement Skills
                      </h5>
                    )
                  }
                  if (/consequence|management/i.test(line)) {
                    return (
                      <h5
                        key={i}
                        className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 font-sans"
                      >
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Management Strategies
                      </h5>
                    )
                  }
                  return (
                    <p key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {line}
                    </p>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const totalWords = sections.reduce((acc, s) => acc + (s.content?.split(/\s+/).length || 0), 0)
  const estimatedPages = Math.ceil(totalWords / 400)

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 print:relative print:bg-white print:py-0">
      {/* Toolbar - Hidden on print */}
      <div className="fixed top-4 right-4 flex items-center gap-2 no-print z-50">
        <div className="bg-white rounded-lg shadow-lg px-3 py-1.5 text-xs text-gray-600">
          {totalWords.toLocaleString()} words • ~{estimatedPages} pages
        </div>
        <Button variant="outline" size="sm" onClick={copyFullReport} className="bg-white hover:bg-gray-50">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="bg-white hover:bg-gray-50">
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onExport?.("pdf")} className="bg-white hover:bg-gray-50">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onExport?.("email")} className="bg-white hover:bg-gray-50">
          <Mail className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="bg-white hover:bg-gray-50">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Document Container */}
      <div className="max-w-[8.5in] w-full mx-4 bg-white shadow-2xl print:shadow-none print:mx-0">
        <div className="px-12 py-10 print:px-0 print:py-0">
          {/* Document Header - Professional Letterhead */}
          <header className="border-b-2 border-gray-200 pb-6 mb-8 print:pb-4 print:mb-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-sans font-bold text-gray-900 tracking-tight">ABA Assessment Report</h1>
                    <p className="text-xs text-gray-500">Applied Behavior Analysis</p>
                  </div>
                </div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200 uppercase tracking-wide">
                  {assessmentType}
                </span>
              </div>
              <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-900">{providerName}</p>
                <p className="text-gray-500">{providerCredentials}</p>
                <p>{assessmentData.providerInfo?.phone || "[Phone]"}</p>
                <p>{assessmentData.providerInfo?.email || "[Email]"}</p>
              </div>
            </div>
          </header>

          {/* Client Information Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8 grid grid-cols-2 gap-6 text-[11px]">
            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Client Name</span>
                <p className="font-semibold text-gray-900">{clientName}</p>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Date of Birth</span>
                <p className="text-gray-700">{assessmentData.clientInfo?.dob || "[DOB]"}</p>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Diagnosis</span>
                <p className="text-gray-700">
                  {assessmentData.clientInfo?.diagnosisCode} -{" "}
                  {assessmentData.clientInfo?.diagnosisDescription || "Autism Spectrum Disorder"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Insurance</span>
                <p className="text-gray-700">{assessmentData.clientInfo?.insuranceCompany || "[Insurance]"}</p>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Member ID</span>
                <p className="text-gray-700">{assessmentData.clientInfo?.insuranceId || "[Member ID]"}</p>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">Report Date</span>
                <p className="text-gray-700">{reportDate}</p>
              </div>
            </div>
          </div>

          {/* Report Sections */}
          {sections
            .filter((s) => s.content)
            .map((section, index) => (
              <div key={section.id} className="mb-10 print:break-inside-avoid">
                {/* Section Header */}
                <div className="mb-4">
                  <h2 className="text-sm font-sans font-bold text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-2 inline-block">
                    {index + 1}. {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                {renderContent(section.content, section.id)}
              </div>
            ))}

          {/* Medical Necessity Section - Special styling */}
          {sections.find((s) => s.id === "medical-necessity" && s.content) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8 print:break-before-page">
              <h3 className="text-center text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-300">
                Statement of Medical Necessity
              </h3>
              <div className="text-[11px] leading-relaxed text-gray-800 text-justify font-serif space-y-4">
                {sections
                  .find((s) => s.id === "medical-necessity")
                  ?.content.split("\n\n")
                  .map((p, i) => (
                    <p key={i} className="indent-8">
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <footer className="mt-12 pt-6 border-t border-gray-200 print:mt-8 print:pt-4">
            <div className="flex justify-between items-end text-[9px] text-gray-500">
              <div>
                <p className="font-medium text-gray-700">
                  {clientName} | DOB: {assessmentData.clientInfo?.dob || "[DOB]"}
                </p>
                <p>Report Date: {reportDate}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-700">{providerAgency}</p>
                <p>Generated by ARIA Assessment System</p>
              </div>
            </div>
          </footer>

          {/* Signature Block */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-2">
                <div className="border-b border-gray-400 h-12"></div>
                <p className="text-[10px] text-gray-600">
                  {providerName}, {providerCredentials}
                </p>
                <p className="text-[9px] text-gray-500">Board Certified Behavior Analyst</p>
              </div>
              <div className="space-y-2">
                <div className="border-b border-gray-400 h-12"></div>
                <p className="text-[10px] text-gray-600">Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 11px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          @page {
            margin: 0.75in;
            size: letter;
          }
        }
      `}</style>
    </div>
  )
}
