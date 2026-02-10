"use client"

import {
  Trophy,
  FileDown,
  FileText,
  Printer,
  Mail,
  Copy,
  Check,
  Clock,
  BarChart3,
  Sparkles,
  Share2,
} from "lucide-react"
import { useState } from "react"

interface PostGenerationSummaryProps {
  totalWords: number
  sectionCount: number
  generationTime: number
  onExport: (format: "pdf" | "docx" | "print" | "email") => void
  onCopyAll: () => void
}

export function PostGenerationSummary({
  totalWords,
  sectionCount,
  generationTime,
  onExport,
  onCopyAll,
}: PostGenerationSummaryProps) {
  const [copied, setCopied] = useState(false)
  const timeSavedMinutes = Math.ceil(totalWords / 40)
  const pages = Math.ceil(totalWords / 300)

  const handleCopy = () => {
    onCopyAll()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs} seconds`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  return (
    <div className="bg-gradient-to-br from-[#0D9488] via-teal-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Top section - Achievement */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Report Complete!</h3>
            <p className="text-white/80 text-sm mt-1">
              Your professional ABA assessment report is ready for review and export.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <BarChart3 className="h-4 w-4 text-white/70 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalWords.toLocaleString()}</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Words</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <FileText className="h-4 w-4 text-white/70 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{sectionCount}</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Sections</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Clock className="h-4 w-4 text-white/70 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{formatTime(generationTime)}</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Generated In</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Sparkles className="h-4 w-4 text-white/70 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">~{timeSavedMinutes}m</p>
            <p className="text-[10px] text-white/60 uppercase tracking-wide">Time Saved</p>
          </div>
        </div>
      </div>

      {/* Export actions */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/10 p-4">
        <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-3">Export Your Report</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onExport("pdf")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#0D9488] rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg text-sm"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </button>
          <button
            onClick={() => onExport("docx")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all text-sm backdrop-blur-sm"
          >
            <FileText className="h-4 w-4" />
            Word Doc
          </button>
          <button
            onClick={() => onExport("print")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all text-sm backdrop-blur-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-all text-sm backdrop-blur-sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>
    </div>
  )
}
