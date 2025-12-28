"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardPaste, CheckCircle2, Upload, ArrowRight, Loader2 } from "lucide-react"
import { assessmentTypes } from "@/lib/data/assessment-types"

interface ParsedDomain {
  name: string
  rawScore?: string
  standardScore?: string
  percentile?: string
  ageEquivalent?: string
  level?: string
  notes?: string
}

interface ParsedAssessmentData {
  assessmentType?: string
  assessmentDate?: string
  examiner?: string
  domains: ParsedDomain[]
  summary?: string
  recommendations?: string[]
}

interface AssessmentImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: ParsedAssessmentData) => void
}

export function AssessmentImportDialog({ open, onOpenChange, onImport }: AssessmentImportDialogProps) {
  const [pastedText, setPastedText] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedAssessmentData | null>(null)
  const [step, setStep] = useState<1 | 2>(1)

  // Auto-parse when text changes (debounced)
  useEffect(() => {
    if (!pastedText.trim()) {
      setParsedData(null)
      return
    }

    const timer = setTimeout(() => {
      parseAssessmentText(pastedText)
    }, 500)

    return () => clearTimeout(timer)
  }, [pastedText, selectedAssessment])

  const parseAssessmentText = async (text: string) => {
    if (!text.trim()) return

    setIsParsing(true)

    try {
      const lines = text.split("\n").filter((l) => l.trim())
      const parsed: ParsedAssessmentData = { domains: [], recommendations: [] }

      // Auto-detect assessment type
      for (const assessment of assessmentTypes) {
        const abbrevLower = assessment.abbreviation.toLowerCase().replace(/[-\s]/g, "")
        const textLower = text.toLowerCase().replace(/[-\s]/g, "")

        if (textLower.includes(abbrevLower) || text.toLowerCase().includes(assessment.name.toLowerCase())) {
          parsed.assessmentType = assessment.id
          if (!selectedAssessment) setSelectedAssessment(assessment.id)
          break
        }
      }

      // Parse date
      const datePatterns = [
        /(?:date|administered|assessment date|eval(?:uation)? date|test date)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
        /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
        /(\w+\s+\d{1,2},?\s+\d{4})/i,
      ]

      for (const pattern of datePatterns) {
        const match = text.match(pattern)
        if (match) {
          parsed.assessmentDate = match[1]
          break
        }
      }

      // Parse examiner
      const examinerMatch = text.match(
        /(?:examiner|evaluator|administered by|clinician|bcba|assessor|tester)[:\s]*([A-Za-z\s.,]+(?:BCBA|BCaBA|RBT|Ph\.?D|M\.?A|M\.?S|OTR|SLP)?)/i,
      )
      if (examinerMatch) {
        parsed.examiner = examinerMatch[1].trim()
      }

      const selectedAssessmentData = assessmentTypes.find((a) => a.id === (parsed.assessmentType || selectedAssessment))

      // Strategy 1: Use known domains from selected assessment
      if (selectedAssessmentData) {
        for (const domain of selectedAssessmentData.domains) {
          const escapedDomain = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s]*")
          const patterns = [
            new RegExp(`${escapedDomain}[:\\s\\-]+([\\d\\.]+(?:\\s*[\\-\\/]\\s*[\\d\\.]+)?)`, "i"),
            new RegExp(`${escapedDomain}[:\\s]*(?:score)?[:\\s]*([\\d\\.]+)`, "i"),
            new RegExp(`${escapedDomain}[:\\s]*Level\\s*([\\d]+)`, "i"),
          ]

          for (const regex of patterns) {
            const match = text.match(regex)
            if (match) {
              parsed.domains.push({
                name: domain,
                rawScore: match[1],
              })
              break
            }
          }
        }
      }

      // Strategy 2: Generic parsing
      if (parsed.domains.length === 0) {
        for (const line of lines) {
          if (line.length < 5) continue
          if (/^(domain|area|skill|category|score|name)/i.test(line.trim())) continue

          if (line.includes("\t")) {
            const parts = line
              .split("\t")
              .map((p) => p.trim())
              .filter((p) => p)
            if (parts.length >= 2 && parts[0].length > 2) {
              const scoreMatch = parts
                .slice(1)
                .join(" ")
                .match(/(\d+(?:\.\d+)?(?:\s*[/-]\s*\d+)?)/)
              if (scoreMatch) {
                parsed.domains.push({ name: parts[0], rawScore: scoreMatch[1] })
              }
            }
          } else if (line.includes(":") || line.includes("-")) {
            const parts = line.split(/[:-]/).map((p) => p.trim())
            if (parts.length >= 2 && parts[0].length > 2 && !/^\d/.test(parts[0])) {
              const scoreMatch = parts
                .slice(1)
                .join(" ")
                .match(/(\d+(?:\.\d+)?(?:\s*[/-]\s*\d+)?)/)
              if (scoreMatch) {
                parsed.domains.push({ name: parts[0], rawScore: scoreMatch[1] })
              }
            }
          } else {
            const match = line.match(/^([A-Za-z\s/&]+?)\s+(\d+(?:\.\d+)?(?:\s*[/-]\s*\d+)?)\s*$/)
            if (match && match[1].length > 2) {
              parsed.domains.push({ name: match[1].trim(), rawScore: match[2] })
            }
          }
        }
      }

      setParsedData(parsed)
    } catch (err) {
      console.error("[v0] Parse error:", err)
    } finally {
      setIsParsing(false)
    }
  }

  const handleImport = () => {
    if (parsedData) {
      onImport({
        ...parsedData,
        assessmentType: selectedAssessment || parsedData.assessmentType,
      })
    }
    resetState()
    onOpenChange(false)
  }

  const resetState = () => {
    setPastedText("")
    setParsedData(null)
    setSelectedAssessment("")
    setStep(1)
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setPastedText(text)
    } catch (err) {
      console.error("[v0] Clipboard error:", err)
    }
  }

  const canProceed = parsedData && (parsedData.domains.length > 0 || selectedAssessment)

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetState()
        onOpenChange(open)
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Import Assessment</DialogTitle>
              <DialogDescription>
                Paste data from any assessment tool - we'll extract it automatically
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 pt-2">
            {/* Quick Paste Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePasteFromClipboard}
              className="w-full h-14 gap-3 border-2 border-dashed hover:border-teal-400 hover:bg-teal-50/50 transition-all bg-transparent"
            >
              <ClipboardPaste className="h-5 w-5 text-teal-600" />
              <span className="font-medium">Click to Paste from Clipboard</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or type/paste below</span>
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              placeholder="Paste assessment data here...

Example formats supported:
• Communication: 85
• Social Skills    72
• Daily Living - 68
• Any tabular data from VB-MAPP, ABLLS-R, Vineland, etc."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              className="font-mono text-sm resize-none"
            />

            {/* Live Preview */}
            {isParsing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </div>
            )}

            {parsedData && !isParsing && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center gap-2 text-teal-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Data detected!</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {parsedData.assessmentType && (
                    <Badge className="bg-teal-600">
                      {assessmentTypes.find((a) => a.id === parsedData.assessmentType)?.abbreviation}
                    </Badge>
                  )}
                  {parsedData.assessmentDate && <Badge variant="secondary">{parsedData.assessmentDate}</Badge>}
                  {parsedData.domains.length > 0 && (
                    <Badge variant="secondary">{parsedData.domains.length} domains found</Badge>
                  )}
                </div>

                {parsedData.domains.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedData.domains.slice(0, 6).map((d, i) => (
                      <span key={i} className="text-xs bg-white px-2 py-1 rounded border text-slate-700">
                        {d.name}: <span className="font-mono font-medium">{d.rawScore}</span>
                      </span>
                    ))}
                    {parsedData.domains.length > 6 && (
                      <span className="text-xs text-slate-500 px-2 py-1">+{parsedData.domains.length - 6} more</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Optional Assessment Type Override */}
            {pastedText && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Assessment type:</span>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Auto-detect (or select manually)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {assessmentTypes.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {assessment.abbreviation}
                          </Badge>
                          <span className="text-sm">{assessment.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!canProceed}
                className="flex-1 gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Import Data
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
