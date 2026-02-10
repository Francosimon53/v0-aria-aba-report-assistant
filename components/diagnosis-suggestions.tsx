"use client"

import { useState } from "react"
import { Lightbulb, X, Plus, Check } from "lucide-react"

interface DiagnosisSuggestionsProps {
  diagnosis: string
  onAddAssessments?: (assessments: string[]) => void
}

const DIAGNOSIS_ASSESSMENTS: Record<string, { label: string; tools: string[] }> = {
  "F84.0": {
    label: "Autism Spectrum Disorder",
    tools: ["ABLLS-R", "VB-MAPP", "Vineland-3", "SRS-2", "Functional Behavior Assessment (FBA)"],
  },
  F88: {
    label: "Global Developmental Delay",
    tools: ["Bayley-4", "Vineland-3", "ABLLS-R", "ASQ-3", "DAYC-2"],
  },
  F89: {
    label: "Neurodevelopmental Disorder",
    tools: ["Vineland-3", "ABLLS-R", "DAYC-2", "Conners-4"],
  },
  "F90.0": {
    label: "ADHD Inattentive",
    tools: ["Conners-4", "Vineland-3", "BRIEF-2", "BASC-3", "Vanderbilt Assessment Scale"],
  },
  "F90.2": {
    label: "ADHD Combined",
    tools: ["Conners-4", "Vineland-3", "BRIEF-2", "BASC-3", "Vanderbilt Assessment Scale"],
  },
}

function getICD10FromDiagnosis(diagnosis: string): string | null {
  const match = diagnosis.match(/F\d+\.?\d*/i)
  if (match) return match[0].toUpperCase()

  if (diagnosis.toLowerCase().includes("autism")) return "F84.0"
  if (diagnosis.toLowerCase().includes("adhd") && diagnosis.toLowerCase().includes("inattentive")) return "F90.0"
  if (diagnosis.toLowerCase().includes("adhd")) return "F90.2"
  if (diagnosis.toLowerCase().includes("global developmental")) return "F88"
  if (diagnosis.toLowerCase().includes("neurodevelopmental")) return "F89"

  return null
}

export function DiagnosisSuggestions({ diagnosis, onAddAssessments }: DiagnosisSuggestionsProps) {
  const [dismissed, setDismissed] = useState(false)
  const [added, setAdded] = useState<string[]>([])

  if (dismissed || !diagnosis) return null

  const icd10 = getICD10FromDiagnosis(diagnosis)
  if (!icd10 || !DIAGNOSIS_ASSESSMENTS[icd10]) return null

  const suggestion = DIAGNOSIS_ASSESSMENTS[icd10]
  const remainingTools = suggestion.tools.filter((t) => !added.includes(t))

  if (remainingTools.length === 0) return null

  const handleAdd = (tool: string) => {
    setAdded((prev) => [...prev, tool])
    if (onAddAssessments) onAddAssessments([tool])
  }

  const handleAddAll = () => {
    setAdded((prev) => [...prev, ...remainingTools])
    if (onAddAssessments) onAddAssessments(remainingTools)
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Recommended assessments for {suggestion.label}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {remainingTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => handleAdd(tool)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  {tool}
                </button>
              ))}
            </div>
            {added.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {added.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700"
                  >
                    <Check className="h-3 w-3" />
                    {tool}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2">
              <button
                onClick={handleAddAll}
                className="text-xs font-medium text-amber-600 hover:text-amber-800 underline"
              >
                Add all recommended
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 p-1 rounded shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
