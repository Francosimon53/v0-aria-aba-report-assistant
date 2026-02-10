"use client"

import { useState, useEffect } from "react"
import { Check, Brain, Clock, Zap, AlertCircle } from "lucide-react"

interface SectionStatus {
  id: string
  title: string
  status: "pending" | "generating" | "complete" | "error"
  content: string
}

interface GenerationProgressProps {
  sections: SectionStatus[]
  isGenerating: boolean
  startTime: number | null
}

const motivationalTips = [
  "ARIA adapts recommendations based on the client's age and diagnosis",
  "Each section uses your actual assessment data — no generic filler",
  "The report follows insurance-compliant formatting standards",
  "You can edit any section after generation is complete",
  "Reports are saved to your account for future reference",
]

export function GenerationProgress({ sections, isGenerating, startTime }: GenerationProgressProps) {
  const [currentTip, setCurrentTip] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const completedCount = sections.filter((s) => s.status === "complete").length
  const generatingSection = sections.find((s) => s.status === "generating")
  const errorCount = sections.filter((s) => s.status === "error").length
  const totalSections = sections.length
  const progress = Math.round((completedCount / totalSections) * 100)

  // Time tracking
  useEffect(() => {
    if (!isGenerating || !startTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isGenerating, startTime])

  // Rotate tips
  useEffect(() => {
    if (!isGenerating) return
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % motivationalTips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isGenerating])

  if (!isGenerating && completedCount === 0) return null

  // Estimate remaining time: avg time per section * remaining sections
  const avgTimePerSection = completedCount > 0 ? elapsed / completedCount : 8
  const remainingSections = totalSections - completedCount
  const estimatedRemaining = Math.ceil(avgTimePerSection * remainingSections)

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`
    return `${Math.floor(secs / 60)}m ${secs % 60}s`
  }

  if (!isGenerating) return null

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl mb-6 overflow-hidden relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
      </div>

      <div className="relative">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Generating Report</h3>
              <p className="text-sm text-gray-400">
                {completedCount} of {totalSections} sections complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsed)}</span>
            </div>
            {estimatedRemaining > 0 && completedCount > 0 && (
              <div className="flex items-center gap-1.5 text-teal-400">
                <Zap className="h-4 w-4" />
                <span>~{formatTime(estimatedRemaining)} remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Section pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                section.status === "complete"
                  ? "bg-teal-500/20 text-teal-300"
                  : section.status === "generating"
                    ? "bg-white/10 text-white ring-1 ring-teal-400/50"
                    : section.status === "error"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-gray-700/50 text-gray-500"
              }`}
            >
              {section.status === "complete" ? (
                <Check className="h-3 w-3" />
              ) : section.status === "generating" ? (
                <div className="h-3 w-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              ) : section.status === "error" ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-600" />
              )}
              <span className="truncate max-w-[100px]">{section.title.replace("& ", "").split(" ").slice(0, 2).join(" ")}</span>
            </div>
          ))}
        </div>

        {/* Currently generating section */}
        {generatingSection && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-teal-300">Now generating: {generatingSection.title}</span>
            </div>
            {generatingSection.content && (
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                {generatingSection.content.substring(0, 200)}...
              </p>
            )}
          </div>
        )}

        {/* Motivational tip */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Zap className="h-3 w-3 text-teal-500 shrink-0" />
          <span className="transition-opacity duration-300">{motivationalTips[currentTip]}</span>
        </div>
      </div>
    </div>
  )
}
