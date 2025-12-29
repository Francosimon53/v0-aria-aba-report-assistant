"use client"

import { useState } from "react"

import { useSectionData } from "@/hooks/use-section-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PlusIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  Sparkles,
  Loader2,
  BarChart3Icon,
  PieChartIcon,
  FileTextIcon,
  LightbulbIcon,
  CheckCircle2Icon,
  CopyIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
} from "@/components/icons"
import { premiumToast } from "@/components/ui/premium-toast"

interface ABCObservation {
  id: string
  timestamp: Date
  antecedent: string
  behavior: string
  consequence: string
  function: "attention" | "escape" | "tangible" | "automatic" | ""
  functionReasoning?: string
  collapsed: boolean
}

interface PatternAnalysis {
  functionBreakdown: {
    [key: string]: { count: number; percentage: number }
  }
  primaryFunction: string
  secondaryFunction: string | null
  commonAntecedents: string[]
  commonConsequences: string[]
  summary: string
  recommendations: string[]
  confidence: "high" | "medium" | "low"
  minimumObservationsMet: boolean
}

export function ABCObservation() {
  const {
    data: observations,
    setData: setObservations,
    isLoaded,
  } = useSectionData<ABCObservation[]>("abc-observations", [
    {
      id: "1",
      timestamp: new Date(),
      antecedent: "",
      behavior: "",
      consequence: "",
      function: "",
      collapsed: false,
    },
  ])

  const [isAnalyzingFunction, setIsAnalyzingFunction] = useState<string | null>(null)
  const [generatingField, setGeneratingField] = useState<{ id: string; field: string } | null>(null)
  const [isAnalyzingPattern, setIsAnalyzingPattern] = useState(false)
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null)

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const addObservation = () => {
    const newObservation: ABCObservation = {
      id: Date.now().toString(),
      timestamp: new Date(),
      antecedent: "",
      behavior: "",
      consequence: "",
      function: "",
      collapsed: false,
    }
    setObservations([...observations, newObservation])
    premiumToast.success("New observation added")
  }

  const removeObservation = (id: string) => {
    if (observations.length === 1) {
      premiumToast.error("Cannot remove the last observation")
      return
    }
    setObservations(observations.filter((obs) => obs.id !== id))
    premiumToast.success("Observation removed")
  }

  const updateObservation = (id: string, field: keyof ABCObservation, value: string | boolean) => {
    setObservations(observations.map((obs) => (obs.id === id ? { ...obs, [field]: value } : obs)))
  }

  const toggleCollapse = (id: string) => {
    setObservations(observations.map((obs) => (obs.id === id ? { ...obs, collapsed: !obs.collapsed } : obs)))
  }

  const handleAnalyzeFunction = async (observationId: string) => {
    const observation = observations.find((obs) => obs.id === observationId)

    if (!observation) return

    if (!observation.antecedent?.trim() || !observation.behavior?.trim() || !observation.consequence?.trim()) {
      premiumToast.error("Please fill in Antecedent, Behavior, and Consequence first")
      return
    }

    setIsAnalyzingFunction(observationId)

    try {
      const response = await fetch("/api/analyze-behavior-function", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          antecedent: observation.antecedent,
          behavior: observation.behavior,
          consequence: observation.consequence,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setObservations(
        observations.map((obs) =>
          obs.id === observationId
            ? {
                ...obs,
                function: data.function.toLowerCase() as ABCObservation["function"],
                functionReasoning: `${data.reasoning} (${data.confidence || "medium"} confidence)`,
              }
            : obs,
        ),
      )

      premiumToast.success(`AI suggests: ${data.function} function`, {
        description: data.reasoning,
      })
    } catch (error) {
      console.error("Error:", error)
      premiumToast.error(error instanceof Error ? error.message : "Could not analyze behavior function")
    } finally {
      setIsAnalyzingFunction(null)
    }
  }

  const handleGenerateField = async (observationId: string, field: "antecedent" | "behavior" | "consequence") => {
    setGeneratingField({ id: observationId, field })

    try {
      const observation = observations.find((obs) => obs.id === observationId)
      if (!observation) return

      const response = await fetch("/api/generate-abc-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          existingData: {
            antecedent: observation.antecedent,
            behavior: observation.behavior,
            consequence: observation.consequence,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setObservations(observations.map((obs) => (obs.id === observationId ? { ...obs, [field]: data.text } : obs)))

      premiumToast.success("Generated!", {
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been filled with AI-generated content`,
      })
    } catch (error) {
      console.error("Error:", error)
      premiumToast.error(error instanceof Error ? error.message : "Could not generate content")
    } finally {
      setGeneratingField(null)
    }
  }

  const handleAnalyzePattern = async () => {
    const validObservations = observations.filter(
      (obs) => obs.antecedent?.trim() || obs.behavior?.trim() || obs.consequence?.trim(),
    )

    if (validObservations.length < 2) {
      premiumToast.error("More observations needed", {
        description: "Please add at least 2 observations with data",
      })
      return
    }

    setIsAnalyzingPattern(true)

    try {
      const response = await fetch("/api/analyze-abc-pattern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observations: validObservations }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setPatternAnalysis(data)

      premiumToast.success("Pattern Analysis Complete", {
        description: `Primary function: ${data.primaryFunction}`,
      })
    } catch (error) {
      console.error("Error:", error)
      premiumToast.error(error instanceof Error ? error.message : "Could not analyze patterns")
    } finally {
      setIsAnalyzingPattern(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    premiumToast.success("Copied!", {
      description: "Summary copied to clipboard",
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ABC Observation Recording</h1>
          <p className="text-muted-foreground">
            Document behavioral observations with Antecedent-Behavior-Consequence analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addObservation} className="gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Observation
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {observations.map((observation, index) => (
          <Card
            key={observation.id}
            className="overflow-hidden border-2 hover:border-[#0D9488]/30 transition-all duration-300 ease-out"
            style={{
              animation: `slideIn 400ms ease-out ${index * 100}ms both`,
            }}
          >
            <div className="bg-gradient-to-r from-[#0D9488]/10 to-cyan-50/50 p-4 border-b flex items-center justify-between">
              <button
                onClick={() => toggleCollapse(observation.id)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
              >
                {observation.collapsed ? (
                  <ChevronRightIcon className="h-5 w-5 text-[#0D9488]" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-[#0D9488]" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Observation {index + 1}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    {formatTimestamp(observation.timestamp)}
                  </div>
                </div>
              </button>
              {observations.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObservation(observation.id)}
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!observation.collapsed && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor={`antecedent-${observation.id}`}
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                        A
                      </span>
                      Antecedent
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">What happened before the behavior?</p>
                    <div className="relative">
                      <Textarea
                        id={`antecedent-${observation.id}`}
                        value={observation.antecedent}
                        onChange={(e) => updateObservation(observation.id, "antecedent", e.target.value)}
                        placeholder="Describe the situation, context, or trigger that occurred immediately before the behavior..."
                        className="min-h-[120px] pr-10 resize-none focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors duration-300 ease-out"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateField(observation.id, "antecedent")}
                        disabled={generatingField?.id === observation.id && generatingField?.field === "antecedent"}
                        className="absolute bottom-2 right-2 h-7 w-7 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                        title="AI Generate Example"
                      >
                        {generatingField?.id === observation.id && generatingField?.field === "antecedent" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`behavior-${observation.id}`}
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <span className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                        B
                      </span>
                      Behavior
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">What did the person do?</p>
                    <div className="relative">
                      <Textarea
                        id={`behavior-${observation.id}`}
                        value={observation.behavior}
                        onChange={(e) => updateObservation(observation.id, "behavior", e.target.value)}
                        placeholder="Describe the specific, observable behavior in objective terms..."
                        className="min-h-[120px] pr-10 resize-none focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors duration-300 ease-out"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateField(observation.id, "behavior")}
                        disabled={generatingField?.id === observation.id && generatingField?.field === "behavior"}
                        className="absolute bottom-2 right-2 h-7 w-7 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                        title="AI Generate Example"
                      >
                        {generatingField?.id === observation.id && generatingField?.field === "behavior" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor={`consequence-${observation.id}`}
                      className="text-base font-semibold flex items-center gap-2"
                    >
                      <span className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">
                        C
                      </span>
                      Consequence
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">What happened after the behavior?</p>
                    <div className="relative">
                      <Textarea
                        id={`consequence-${observation.id}`}
                        value={observation.consequence}
                        onChange={(e) => updateObservation(observation.id, "consequence", e.target.value)}
                        placeholder="Describe the response or outcome that followed the behavior..."
                        className="min-h-[120px] pr-10 resize-none focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors duration-300 ease-out"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateField(observation.id, "consequence")}
                        disabled={generatingField?.id === observation.id && generatingField?.field === "consequence"}
                        className="absolute bottom-2 right-2 h-7 w-7 text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                        title="AI Generate Example"
                      >
                        {generatingField?.id === observation.id && generatingField?.field === "consequence" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`function-${observation.id}`}
                        className="text-base font-semibold flex items-center gap-2"
                      >
                        <span className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">
                          F
                        </span>
                        Impression of Function
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnalyzeFunction(observation.id)}
                        disabled={isAnalyzingFunction === observation.id}
                        className="text-teal-600 hover:text-teal-700 h-7 px-2"
                      >
                        {isAnalyzingFunction === observation.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            <span className="text-xs">AI Analyze</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">What was the likely purpose of this behavior?</p>
                    <Select
                      value={observation.function}
                      onValueChange={(value) => updateObservation(observation.id, "function", value)}
                    >
                      <SelectTrigger
                        id={`function-${observation.id}`}
                        className="focus:border-[#0D9488] focus:ring-[#0D9488] transition-colors duration-300 ease-out"
                      >
                        <SelectValue placeholder="Select behavioral function..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attention">Attention - To gain social attention or interaction</SelectItem>
                        <SelectItem value="escape">Escape - To avoid or escape from a demand or situation</SelectItem>
                        <SelectItem value="tangible">Tangible - To obtain a preferred item or activity</SelectItem>
                        <SelectItem value="automatic">Automatic/Sensory - For internal sensory stimulation</SelectItem>
                      </SelectContent>
                    </Select>

                    {observation.functionReasoning && (
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm mt-2">
                        <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-purple-800">{observation.functionReasoning}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-purple-600" />
              Pattern Analysis
            </h3>
            <p className="text-sm text-muted-foreground">Analyze all observations to identify behavioral patterns</p>
          </div>

          <Button
            onClick={handleAnalyzePattern}
            disabled={isAnalyzingPattern || observations.length < 2}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-2"
          >
            {isAnalyzingPattern ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing {observations.length} observations...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Pattern Summary
              </>
            )}
          </Button>
        </div>

        {observations.length < 2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            <AlertTriangleIcon className="h-4 w-4 inline mr-2" />
            Add at least 2 observations to enable pattern analysis.
            <span className="font-medium"> 4+ observations recommended</span> for reliable results.
          </div>
        )}

        {patternAnalysis && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 space-y-6">
            <div>
              <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Function Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(patternAnalysis.functionBreakdown).map(([func, data]: [string, any]) => (
                  <div
                    key={func}
                    className={`p-3 rounded-lg border-2 ${
                      func === patternAnalysis.primaryFunction
                        ? "border-purple-500 bg-purple-100"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="text-2xl font-bold text-purple-700">{data.percentage}%</div>
                    <div className="text-sm font-medium">{func}</div>
                    <div className="text-xs text-muted-foreground">{data.count} observations</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Primary Function</div>
                <div className="text-xl font-bold text-purple-700">{patternAnalysis.primaryFunction}</div>
              </div>
              {patternAnalysis.secondaryFunction && (
                <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Secondary Function</div>
                  <div className="text-xl font-bold text-gray-700">{patternAnalysis.secondaryFunction}</div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <ArrowRightIcon className="h-3 w-3 text-green-600" />
                  Common Antecedents
                </h5>
                <ul className="text-sm space-y-1">
                  {patternAnalysis.commonAntecedents.map((ant: string, i: number) => (
                    <li key={i} className="text-gray-600">
                      • {ant}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <ArrowLeftIcon className="h-3 w-3 text-blue-600" />
                  Common Consequences
                </h5>
                <ul className="text-sm space-y-1">
                  {patternAnalysis.commonConsequences.map((con: string, i: number) => (
                    <li key={i} className="text-gray-600">
                      • {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                <FileTextIcon className="h-3 w-3 text-purple-600" />
                Clinical Summary
              </h5>
              <p className="text-gray-700 leading-relaxed">{patternAnalysis.summary}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                <LightbulbIcon className="h-3 w-3 text-amber-500" />
                Recommended Interventions
              </h5>
              <ul className="text-sm space-y-2">
                {patternAnalysis.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patternAnalysis.confidence === "high"
                      ? "bg-green-100 text-green-700"
                      : patternAnalysis.confidence === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {patternAnalysis.confidence} confidence
                </span>
                {!patternAnalysis.minimumObservationsMet && (
                  <span className="text-amber-600 text-xs">⚠️ Add more observations for higher confidence</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(patternAnalysis.summary)}
                className="gap-1"
              >
                <CopyIcon className="h-3 w-3" />
                Copy Summary
              </Button>
            </div>
          </div>
        )}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="p-6">
          <h3 className="font-semibold text-foreground mb-3">ABC Analysis Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-600">Antecedent:</span>
              <p className="text-muted-foreground mt-1">
                Time, setting, people present, activities, instructions given
              </p>
            </div>
            <div>
              <span className="font-semibold text-red-600">Behavior:</span>
              <p className="text-muted-foreground mt-1">
                Specific, observable, measurable actions - avoid interpretations
              </p>
            </div>
            <div>
              <span className="font-semibold text-green-600">Consequence:</span>
              <p className="text-muted-foreground mt-1">
                Immediate responses, what was gained/avoided, staff reactions
              </p>
            </div>
            <div>
              <span className="font-semibold text-purple-600">Function:</span>
              <p className="text-muted-foreground mt-1">
                Hypothesized reason - may require multiple observations to confirm
              </p>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function formatTimestamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}
