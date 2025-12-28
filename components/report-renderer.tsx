"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Printer, Download, X } from "lucide-react"

interface ReportSection {
  id: string
  title: string
  content: string
  status?: string
}

interface AssessmentData {
  clientInfo?: {
    firstName?: string
    lastName?: string
    dob?: string
    age?: string
    diagnosis?: string
    icd10?: string
  }
  providerInfo?: {
    name?: string
    bcbaName?: string
  }
}

interface ReportRendererProps {
  // Support both string content and sections array
  content?: string
  sections?: ReportSection[]
  assessmentData?: AssessmentData
  clientName?: string
  reportDate?: string
  providerName?: string
  assessmentType?: string
  onClose?: () => void
  onExport?: (format: "pdf" | "word" | "print" | "docx") => void
}

export function ReportRenderer({
  content,
  sections,
  assessmentData,
  clientName,
  reportDate,
  providerName,
  assessmentType = "Initial Assessment",
  onClose,
  onExport,
}: ReportRendererProps) {
  // Build content from sections if provided
  const reportContent =
    content ||
    (sections
      ? sections
          .filter((s) => s.content && s.status === "complete")
          .map((s) => `## ${s.title}\n\n${s.content}`)
          .join("\n\n---\n\n")
      : "")

  // Get client name from props or assessmentData
  const displayClientName =
    clientName ||
    (assessmentData?.clientInfo
      ? `${assessmentData.clientInfo.firstName || ""} ${assessmentData.clientInfo.lastName || ""}`.trim()
      : "")

  const displayProviderName = providerName || assessmentData?.providerInfo?.bcbaName || ""

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-auto print:bg-white print:overflow-visible">
      {/* Toolbar - Hidden on print */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
        <div className="max-w-[8.5in] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">Report Preview</h2>
            {displayClientName && <span className="text-sm text-gray-500">Client: {displayClientName}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport?.("pdf")} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="py-8 print:py-0">
        <div className="report-document max-w-[8.5in] mx-auto bg-white shadow-2xl print:shadow-none print:max-w-none">
          {/* Document Header */}
          <div className="px-16 pt-12 pb-8 border-b-2 border-blue-600 print:px-[0.75in] print:pt-[0.5in]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">ARIA Behavioral Health</h1>
                    <p className="text-xs text-gray-500">Applied Behavior Analysis Services</p>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-600">
                <p className="font-semibold text-blue-600">{assessmentType}</p>
                <p>{reportDate || new Date().toLocaleDateString()}</p>
                {displayProviderName && <p>Provider: {displayProviderName}</p>}
              </div>
            </div>
            {displayClientName && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Client Name:</span>
                    <span className="ml-2 font-semibold text-gray-900">{displayClientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Report Date:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {reportDate || new Date().toLocaleDateString()}
                    </span>
                  </div>
                  {assessmentData?.clientInfo?.dob && (
                    <div>
                      <span className="text-gray-500">Date of Birth:</span>
                      <span className="ml-2 font-semibold text-gray-900">{assessmentData.clientInfo.dob}</span>
                    </div>
                  )}
                  {assessmentData?.clientInfo?.diagnosis && (
                    <div>
                      <span className="text-gray-500">Diagnosis:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {assessmentData.clientInfo.diagnosis} ({assessmentData.clientInfo.icd10 || "F84.0"})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Document Body with Markdown Rendering */}
          <div className="px-16 py-12 min-h-[11in] print:px-[0.75in] print:py-[0.5in]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // H1 - Document Title
                h1: ({ children }) => (
                  <h1 className="text-2xl font-serif font-bold text-gray-900 text-center mb-2 pb-4 border-b-2 border-blue-600">
                    {children}
                  </h1>
                ),

                // H2 - Section Headers
                h2: ({ children }) => (
                  <div className="mt-10 mb-6 first:mt-0">
                    <h2 className="text-sm font-sans font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-300 pb-2">
                      {children}
                    </h2>
                  </div>
                ),

                // H3 - Subsection Headers
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    {children}
                  </h3>
                ),

                // H4 - Minor Headers
                h4: ({ children }) => (
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mt-4 mb-2">{children}</h4>
                ),

                // Paragraphs - Legal document style
                p: ({ children }) => (
                  <p className="text-[11px] leading-relaxed text-gray-700 text-justify font-serif mb-4">{children}</p>
                ),

                // Strong/Bold
                strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,

                // Tables - Professional style
                table: ({ children }) => (
                  <div className="my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full border-collapse text-[10px]">{children}</table>
                  </div>
                ),

                thead: ({ children }) => (
                  <thead className="bg-gradient-to-r from-gray-800 to-gray-900 print:bg-gray-800">{children}</thead>
                ),

                th: ({ children }) => (
                  <th className="text-left py-3 px-4 text-white text-[9px] font-semibold uppercase tracking-wider">
                    {children}
                  </th>
                ),

                tbody: ({ children }) => <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>,

                tr: ({ children }) => (
                  <tr className="hover:bg-blue-50/30 transition-colors print:hover:bg-white">{children}</tr>
                ),

                td: ({ children }) => <td className="py-3 px-4 text-gray-700 text-[10px]">{children}</td>,

                // Lists
                ul: ({ children }) => <ul className="my-4 space-y-2 text-[11px] text-gray-700">{children}</ul>,

                ol: ({ children }) => (
                  <ol className="my-4 space-y-2 text-[11px] text-gray-700 list-decimal list-outside ml-6">
                    {children}
                  </ol>
                ),

                li: ({ children }) => (
                  <li className="flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-600 mt-1.5 flex-shrink-0">•</span>
                    <span className="font-serif">{children}</span>
                  </li>
                ),

                // Horizontal Rule - Section divider
                hr: () => <hr className="my-8 border-t-2 border-gray-200" />,

                // Blockquote - For important notes
                blockquote: ({ children }) => (
                  <blockquote className="my-6 pl-4 border-l-4 border-blue-600 bg-blue-50/50 py-3 pr-4 rounded-r-lg print:bg-blue-50">
                    <div className="text-[11px] text-gray-700 italic font-serif">{children}</div>
                  </blockquote>
                ),

                // Code - For CPT codes, etc.
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 bg-gray-100 text-blue-700 font-mono text-[10px] rounded font-semibold">
                    {children}
                  </code>
                ),

                // Pre - For code blocks
                pre: ({ children }) => (
                  <pre className="my-4 p-4 bg-gray-50 rounded-lg border overflow-x-auto text-[10px] font-mono">
                    {children}
                  </pre>
                ),
              }}
            >
              {reportContent}
            </ReactMarkdown>
          </div>

          {/* Document Footer */}
          <div className="px-16 py-6 border-t-2 border-gray-200 bg-gray-50 print:px-[0.75in] print:bg-gray-50">
            <div className="flex justify-between items-center text-[9px] text-gray-500">
              <span>{displayClientName && `Client: ${displayClientName}`}</span>
              <span className="font-medium">Generated by ARIA Assessment System</span>
              <span>{reportDate || new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-[8px] text-gray-400 text-center">
                This document contains confidential patient information protected under HIPAA. Unauthorized disclosure
                is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
