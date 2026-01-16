"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sparkles,
  Save,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react"
import { toast } from "sonner"

interface FadePlanProps {
  onSave?: () => void
}

const PHASES = [
  { value: "phase-1", label: "Phase 1 (Intensive)" },
  { value: "phase-2", label: "Phase 2 (Moderate)" },
  { value: "phase-3", label: "Phase 3 (Maintenance)" },
  { value: "discharge-ready", label: "Discharge Ready" },
]

const ASSESSMENT_TOOLS = [
  { value: "vineland-3", label: "Vineland-3" },
  { value: "srs-2", label: "SRS-2" },
  { value: "ablls-r", label: "ABLLS-R" },
  { value: "other", label: "Other" },
]

interface PhaseCriteria {
  hoursPerWeek: string
  criteriaToAdvance: string
}

interface DischargeCriterion {
  id: string
  tool: string
  domain: string
  targetScore: string
  currentScore: string
}

export function FadePlan({ onSave }: FadePlanProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPhase, setCurrentPhase] = useState("")
  const [generatedNarrative, setGeneratedNarrative] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const [phaseCriteria, setPhaseCriteria] = useState<Record<string, PhaseCriteria>>({
    "phase-1": { hoursPerWeek: "", criteriaToAdvance: "" },
    "phase-2": { hoursPerWeek: "", criteriaToAdvance: "" },
    "phase-3": { hoursPerWeek: "", criteriaToAdvance: "" },
    discharge: { hoursPerWeek: "N/A", criteriaToAdvance: "" },
  })

  const [dischargeCriteria, setDischargeCriteria] = useState<DischargeCriterion[]>([
    { id: "1", tool: "", domain: "", targetScore: "", currentScore: "" },
  ])

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aria-fade-plan")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCurrentPhase(data.currentPhase || "")
        setPhaseCriteria(data.phaseCriteria || phaseCriteria)
        setDischargeCriteria(
          data.dischargeCriteria || [{ id: "1", tool: "", domain: "", targetScore: "", currentScore: "" }],
        )
        if (data.generatedNarrative) setGeneratedNarrative(data.generatedNarrative)
      } catch (e) {
        console.error("Error loading fade plan data:", e)
      }
    }
  }, [])

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        "aria-fade-plan",
        JSON.stringify({
          currentPhase,
          phaseCriteria,
          dischargeCriteria,
          generatedNarrative,
        }),
      )
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [currentPhase, phaseCriteria, dischargeCriteria, generatedNarrative])

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "fadePlanNarrative",
          data: { currentPhase, phaseCriteria, dischargeCriteria },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()
      setGeneratedNarrative(data.content)
      setIsExpanded(true)
      toast.success("Fade plan narrative generated successfully")
    } catch (error) {
      console.error("AI Generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedNarrative) {
      await navigator.clipboard.writeText(generatedNarrative)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(
        "aria-fade-plan",
        JSON.stringify({
          currentPhase,
          phaseCriteria,
          dischargeCriteria,
          generatedNarrative,
        }),
      )
      toast.success("Fade plan saved")
      onSave?.()
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const addCriterion = () => {
    setDischargeCriteria((prev) => [
      ...prev,
      { id: Date.now().toString(), tool: "", domain: "", targetScore: "", currentScore: "" },
    ])
  }

  const removeCriterion = (id: string) => {
    setDischargeCriteria((prev) => prev.filter((c) => c.id !== id))
  }

  const updateCriterion = (id: string, field: keyof DischargeCriterion, value: string) => {
    setDischargeCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const isCriterionMet = (criterion: DischargeCriterion): boolean | null => {
    if (!criterion.targetScore || !criterion.currentScore) return null
    const target = Number(criterion.targetScore)
    const current = Number(criterion.currentScore)
    // For SRS-2, lower is better; for others, higher is better
    if (criterion.tool === "srs-2") {
      return current <= target
    }
    return current >= target
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fade Plan</h2>
            <p className="text-sm text-gray-500">Define service intensity reduction and discharge criteria</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isGenerating ? "Generating..." : "AI Generate Narrative"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Current Phase */}
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Current Treatment Phase</CardTitle>
          <CardDescription>Select the client's current phase in the treatment fade plan</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={currentPhase} onValueChange={setCurrentPhase}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select current phase" />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((phase) => (
                <SelectItem key={phase.value} value={phase.value}>
                  {phase.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Phase Criteria Table */}
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Phase Criteria</CardTitle>
          <CardDescription>Define hours and criteria for each treatment phase</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Phase</TableHead>
                <TableHead className="w-[150px]">Hours/Week</TableHead>
                <TableHead>Criteria to Move to Next Phase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { key: "phase-1", label: "Phase 1 (Intensive)" },
                { key: "phase-2", label: "Phase 2 (Moderate)" },
                { key: "phase-3", label: "Phase 3 (Maintenance)" },
                { key: "discharge", label: "Discharge" },
              ].map((phase) => (
                <TableRow key={phase.key}>
                  <TableCell className="font-medium">{phase.label}</TableCell>
                  <TableCell>
                    {phase.key === "discharge" ? (
                      <span className="text-gray-500">N/A</span>
                    ) : (
                      <Input
                        type="number"
                        value={phaseCriteria[phase.key]?.hoursPerWeek || ""}
                        onChange={(e) =>
                          setPhaseCriteria((prev) => ({
                            ...prev,
                            [phase.key]: { ...prev[phase.key], hoursPerWeek: e.target.value },
                          }))
                        }
                        placeholder="Hours"
                        className="w-24"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={phaseCriteria[phase.key]?.criteriaToAdvance || ""}
                      onChange={(e) =>
                        setPhaseCriteria((prev) => ({
                          ...prev,
                          [phase.key]: { ...prev[phase.key], criteriaToAdvance: e.target.value },
                        }))
                      }
                      placeholder={
                        phase.key === "discharge" ? "Discharge criteria..." : "Criteria to advance to next phase..."
                      }
                      className="min-h-[80px] resize-none"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Measurable Discharge Criteria */}
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Measurable Discharge Criteria</CardTitle>
          <CardDescription>Define specific, measurable targets for treatment completion</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment Tool</TableHead>
                <TableHead>Domain/Subscale</TableHead>
                <TableHead>Target Score</TableHead>
                <TableHead>Current Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dischargeCriteria.map((criterion) => {
                const status = isCriterionMet(criterion)
                return (
                  <TableRow key={criterion.id}>
                    <TableCell>
                      <Select
                        value={criterion.tool}
                        onValueChange={(value) => updateCriterion(criterion.id, "tool", value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSESSMENT_TOOLS.map((tool) => (
                            <SelectItem key={tool.value} value={tool.value}>
                              {tool.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={criterion.domain}
                        onChange={(e) => updateCriterion(criterion.id, "domain", e.target.value)}
                        placeholder="e.g., Communication"
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={criterion.targetScore}
                        onChange={(e) => updateCriterion(criterion.id, "targetScore", e.target.value)}
                        placeholder="Target"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={criterion.currentScore}
                        onChange={(e) => updateCriterion(criterion.id, "currentScore", e.target.value)}
                        placeholder="Current"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      {status === null ? (
                        <Badge variant="outline" className="text-gray-500">
                          Pending
                        </Badge>
                      ) : status ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Met
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Met
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {dischargeCriteria.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeCriterion(criterion.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <Button variant="outline" size="sm" onClick={addCriterion} className="mt-4 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        </CardContent>
      </Card>

      {generatedNarrative && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <Card className="border-2 border-purple-200 bg-purple-50/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-purple-100/50 transition-colors py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <CardTitle className="text-sm font-medium text-purple-900">
                      AI Generated: Fade Plan Narrative
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy()
                      }}
                      className="h-8 px-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-purple-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="bg-white rounded-lg p-4 border border-purple-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedNarrative}</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}
