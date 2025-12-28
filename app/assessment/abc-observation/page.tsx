"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Save,
  Clock,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"

interface IntensityLevel {
  level: 1 | 2 | 3 | 4
  label: string
  description: string
}

interface MaladaptiveBehavior {
  id: string
  name: string
  operationalDefinition: string
  inclusions: string
  exclusions: string
  function: string
  currentIntensity: 1 | 2 | 3 | 4
  intensityDescriptions: {
    1: string
    2: string
    3: string
    4: string
  }
  baselineFrequency: string
  baselineData: string
}

interface ABCEntry {
  id: string
  time: string
  antecedent: string
  behavior: string
  consequence: string
  function: string
  notes: string
  behaviorId?: string
  intensity?: 1 | 2 | 3 | 4
}

const BEHAVIOR_FUNCTIONS = [
  {
    value: "escape",
    label: "Escape/Avoidance",
    color: "bg-amber-100 text-amber-800",
    description: "Behaviors are maintained to avoid or escape from a situation.",
  },
  {
    value: "attention",
    label: "Attention",
    color: "bg-blue-100 text-blue-800",
    description: "Behaviors are maintained to gain attention.",
  },
  {
    value: "tangible",
    label: "Tangible/Access",
    color: "bg-green-100 text-green-800",
    description: "Behaviors are maintained to access desired items or activities.",
  },
  {
    value: "automatic",
    label: "Automatic/Sensory",
    color: "bg-purple-100 text-purple-800",
    description: "Behaviors are maintained due to sensory or automatic responses.",
  },
]

const DEFAULT_INTENSITY_DESCRIPTIONS = {
  1: "Mild - Behavior occurs but does not disrupt activity or require intervention",
  2: "Moderate - Behavior disrupts activity and requires verbal redirection",
  3: "Severe - Behavior requires physical intervention or removal from environment",
  4: "Crisis - Behavior poses immediate danger to self or others; emergency protocol needed",
}

export default function ABCObservationPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const {
    value: observationData,
    setValue: setObservationData,
    saveNow,
  } = useStepData<{
    behaviors: MaladaptiveBehavior[]
    entries: ABCEntry[]
  }>("abc-observation", { behaviors: [], entries: [] })
  const [maladaptiveBehaviors, setMaladaptiveBehaviors] = useState<MaladaptiveBehavior[]>([])
  const [abcEntries, setABCEntries] = useState<ABCEntry[]>([])
  const [expandedBehavior, setExpandedBehavior] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const { navigateTo, isNavigating } = useSafeNavigation(saveNow)

  const [evaluationType, setEvaluationType] = useState<"Initial Assessment" | "Reassessment">("Initial Assessment")
  const [isLoadingNav, setIsLoadingNav] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (observationData) {
      setMaladaptiveBehaviors(observationData.behaviors || [])
      setABCEntries(observationData.entries || [])
    }
  }, [observationData])

  useEffect(() => {
    setObservationData({
      behaviors: maladaptiveBehaviors,
      entries: abcEntries,
    })
  }, [maladaptiveBehaviors, abcEntries, setObservationData])

  const saveAndContinue = async () => {
    setIsSaving(true)
    try {
      await navigateTo("/assessment/risk-assessment")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const handlePrevious = async () => {
    setIsLoadingNav(true)
    try {
      await navigateTo("/assessment/domains")
    } catch (error) {
      setIsLoadingNav(false)
    }
  }

  const addBehavior = () => {
    setMaladaptiveBehaviors((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        operationalDefinition: "",
        inclusions: "",
        exclusions: "",
        function: "",
        currentIntensity: 2,
        intensityDescriptions: { ...DEFAULT_INTENSITY_DESCRIPTIONS },
        baselineFrequency: "",
        baselineData: "",
      },
    ])
  }

  const removeBehavior = (id: string) => {
    if (maladaptiveBehaviors.length > 1) {
      setMaladaptiveBehaviors((prev) => prev.filter((b) => b.id !== id))
    }
  }

  const updateBehavior = (id: string, field: keyof MaladaptiveBehavior, value: any) => {
    setMaladaptiveBehaviors((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const updateIntensityDescription = (behaviorId: string, level: 1 | 2 | 3 | 4, description: string) => {
    setMaladaptiveBehaviors((prev) =>
      prev.map((b) => {
        if (b.id === behaviorId) {
          return {
            ...b,
            intensityDescriptions: {
              ...b.intensityDescriptions,
              [level]: description,
            },
          }
        }
        return b
      }),
    )
  }

  const toggleBehaviorExpanded = (id: string) => {
    setExpandedBehavior((prev) => (prev === id ? null : id))
  }

  const addEntry = () => {
    console.log("[v0] addEntry called")
    const newEntry = {
      id: Date.now().toString(),
      time: "",
      antecedent: "",
      behavior: "",
      consequence: "",
      function: "",
      notes: "",
      behaviorId: "",
      intensity: 2 as 1 | 2 | 3 | 4,
    }
    console.log("[v0] Creating new entry:", newEntry)
    setABCEntries((prev) => {
      console.log("[v0] Previous entries count:", prev.length)
      return [...prev, newEntry]
    })
  }

  const removeEntry = (id: string) => {
    if (abcEntries.length > 1) {
      setABCEntries((prev) => prev.filter((e) => e.id !== id))
    }
  }

  const updateEntry = (id: string, field: keyof ABCEntry, value: string | number) => {
    setABCEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const getIntensityColor = (level: 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800 border-green-300"
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300"
      case 4:
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  const getIntensityLabel = (level: 1 | 2 | 3 | 4) => {
    switch (level) {
      case 1:
        return "Mild"
      case 2:
        return "Moderate"
      case 3:
        return "Severe"
      case 4:
        return "Crisis"
    }
  }

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/abc-observation")
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 5
  const totalSteps = allSteps.length

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssessmentSidebar />

      <div className="flex-1 p-6 pb-24">
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Maladaptive Behaviors & ABC Observation</h1>
              <p className="text-sm text-slate-500">
                Step {stepNumber} of {totalSteps} - Define behaviors and document observations
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    console.log("[v0] Switching to tab: behaviors")
                  }}
                  className="capitalize"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Behaviors
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] Switching to tab: observations")
                  }}
                  className="capitalize"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Observations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] Switching to tab: summary")
                  }}
                  className="capitalize"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Summary
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] Add button clicked, activeTab: behaviors")
                    addBehavior()
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Behavior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log("[v0] Add button clicked, activeTab: observations")
                    addEntry()
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
                <Button variant="outline" onClick={saveAndContinue} disabled={isSaving || isNavigating}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving || isNavigating ? "Saving..." : "Save and Continue"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Behaviors List */}
            {maladaptiveBehaviors.map((behavior, index) => (
              <Card key={behavior.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getIntensityColor(behavior.currentIntensity)}`}
                      >
                        {behavior.currentIntensity}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{behavior.name || `Behavior #${index + 1}`}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {behavior.function && (
                            <Badge className={BEHAVIOR_FUNCTIONS.find((f) => f.value === behavior.function)?.color}>
                              {BEHAVIOR_FUNCTIONS.find((f) => f.value === behavior.function)?.label}
                            </Badge>
                          )}
                          <span>Current: {getIntensityLabel(behavior.currentIntensity)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleBehaviorExpanded(behavior.id)}>
                        {expandedBehavior === behavior.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBehavior(behavior.id)}
                        disabled={maladaptiveBehaviors.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Behavior Name</Label>
                      <Input
                        value={behavior.name}
                        onChange={(e) => updateBehavior(behavior.id, "name", e.target.value)}
                        placeholder="e.g., Physical Aggression, Elopement"
                      />
                    </div>
                    <div>
                      <Label>Hypothesized Function</Label>
                      <Select
                        value={behavior.function}
                        onValueChange={(v) => updateBehavior(behavior.id, "function", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select function" />
                        </SelectTrigger>
                        <SelectContent>
                          {BEHAVIOR_FUNCTIONS.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Operational Definition</Label>
                    <Textarea
                      value={behavior.operationalDefinition}
                      onChange={(e) => updateBehavior(behavior.id, "operationalDefinition", e.target.value)}
                      placeholder="Define the behavior in observable, measurable terms..."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-green-700">Inclusions (What counts as this behavior)</Label>
                      <Textarea
                        value={behavior.inclusions}
                        onChange={(e) => updateBehavior(behavior.id, "inclusions", e.target.value)}
                        placeholder="Examples that ARE included: hitting, kicking, biting..."
                        className="mt-1 border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label className="text-red-700">Exclusions (What does NOT count)</Label>
                      <Textarea
                        value={behavior.exclusions}
                        onChange={(e) => updateBehavior(behavior.id, "exclusions", e.target.value)}
                        placeholder="Examples that are NOT included: accidental contact, self-defense..."
                        className="mt-1 border-red-200 focus:border-red-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Baseline Frequency</Label>
                      <Input
                        value={behavior.baselineFrequency}
                        onChange={(e) => updateBehavior(behavior.id, "baselineFrequency", e.target.value)}
                        placeholder="e.g., 15 instances per day"
                      />
                    </div>
                    <div>
                      <Label>Current Intensity Level</Label>
                      <Select
                        value={String(behavior.currentIntensity)}
                        onValueChange={(v) =>
                          updateBehavior(behavior.id, "currentIntensity", Number(v) as 1 | 2 | 3 | 4)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Mild</SelectItem>
                          <SelectItem value="2">2 - Moderate</SelectItem>
                          <SelectItem value="3">3 - Severe</SelectItem>
                          <SelectItem value="4">4 - Crisis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Intensity Scale - Expanded */}
                  {expandedBehavior === behavior.id && (
                    <div className="p-4 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium text-slate-700">Intensity Scale (Customized for this behavior)</h4>
                      </div>
                      <div className="space-y-3">
                        {([1, 2, 3, 4] as const).map((level) => (
                          <div key={level} className={`p-3 rounded-lg border ${getIntensityColor(level)}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getIntensityColor(level)}>
                                Level {level}: {getIntensityLabel(level)}
                              </Badge>
                              {behavior.currentIntensity === level && (
                                <Badge className="bg-slate-800 text-white">CURRENT</Badge>
                              )}
                            </div>
                            <Input
                              value={behavior.intensityDescriptions[level]}
                              onChange={(e) => updateIntensityDescription(behavior.id, level, e.target.value)}
                              placeholder={DEFAULT_INTENSITY_DESCRIPTIONS[level]}
                              className="bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* ABC Observations */}
            {abcEntries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No ABC entries yet. Add your first observation.</p>
                  <Button onClick={addEntry}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              abcEntries.map((entry, index) => (
                <Card key={entry.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Entry #{index + 1}
                        {entry.time && (
                          <span className="text-sm font-normal text-muted-foreground">at {entry.time}</span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {entry.function && (
                          <Badge className={BEHAVIOR_FUNCTIONS.find((f) => f.value === entry.function)?.color}>
                            {BEHAVIOR_FUNCTIONS.find((f) => f.value === entry.function)?.label}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                          disabled={abcEntries.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Time of Observation</Label>
                        <Input
                          type="time"
                          value={entry.time}
                          onChange={(e) => updateEntry(entry.id, "time", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Linked Behavior</Label>
                        <Select
                          value={entry.behaviorId || "none"}
                          onValueChange={(v) => updateEntry(entry.id, "behaviorId", v === "none" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select behavior" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- No linked behavior --</SelectItem>
                            {maladaptiveBehaviors.filter((b) => b.name).length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Define behaviors in Behaviors tab first
                              </div>
                            ) : (
                              maladaptiveBehaviors
                                .filter((b) => b.name)
                                .map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Hypothesized Function</Label>
                        <Select
                          value={entry.function || "none"}
                          onValueChange={(v) => updateEntry(entry.id, "function", v === "none" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select function" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-- Select function --</SelectItem>
                            {BEHAVIOR_FUNCTIONS.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Antecedent (What happened before)</Label>
                      <Textarea
                        value={entry.antecedent}
                        onChange={(e) => updateEntry(entry.id, "antecedent", e.target.value)}
                        placeholder="Describe what was happening immediately before the behavior..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Behavior (What the client did)</Label>
                      <Textarea
                        value={entry.behavior}
                        onChange={(e) => updateEntry(entry.id, "behavior", e.target.value)}
                        placeholder="Describe the specific behavior observed..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Consequence (What happened after)</Label>
                      <Textarea
                        value={entry.consequence}
                        onChange={(e) => updateEntry(entry.id, "consequence", e.target.value)}
                        placeholder="Describe what happened immediately after the behavior..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={entry.notes}
                        onChange={(e) => updateEntry(entry.id, "notes", e.target.value)}
                        placeholder="Any additional observations..."
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {abcEntries.length > 0 && (
              <Button variant="outline" onClick={addEntry} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Entry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 right-0 left-[308px] border-t border-slate-200 bg-white/95 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={isLoadingNav || isNavigating}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-slate-600">
            <span className="font-medium">
              Step {stepNumber} of {totalSteps}
            </span>
            <span className="mx-2">•</span>
            <span>ABC Observation</span>
          </div>

          <button
            onClick={saveAndContinue}
            disabled={isSaving || isLoadingNav || isNavigating}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving || isLoadingNav || isNavigating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="h-20" />
    </div>
  )
}
