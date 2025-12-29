"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import {
  TargetIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  Sparkles,
  Loader2,
} from "@/components/icons"
import { goalBank, domains } from "@/lib/data/goal-bank"
import type { SelectedGoal } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoGoalsEmptyState, SearchNoResults } from "@/components/empty-states"

interface GoalBankBrowserProps {
  onGoalSelect: (goal: SelectedGoal) => void
  onGoalRemove: (goalId: string) => void
  selectedGoals?: SelectedGoal[]
}

interface BaselineData {
  measurementType: string
  // Frequency fields
  currentRate?: string
  ratePer?: string
  // Accuracy/Discrete Trial fields
  percentCorrect?: string
  totalTrials?: string
  // Duration fields
  averageDuration?: string
  durationUnit?: string
  minDuration?: string
  maxDuration?: string
  // Task Analysis fields
  stepsCompleted?: string
  totalSteps?: string
  // Interval fields
  percentOfIntervals?: string
  observationDuration?: string
  // Common fields
  promptLevel: string
  setting: string
  dataSource: string
  collectionPeriod: string
  notes?: string
}

export function GoalBankBrowser({ onGoalSelect, onGoalRemove, selectedGoals = [] }: GoalBankBrowserProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedGoalForAdd, setSelectedGoalForAdd] = useState<string | null>(null)
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [targetDate, setTargetDate] = useState("")
  const [isSuggestingDate, setIsSuggestingDate] = useState(false)
  const [targetDateReasoning, setTargetDateReasoning] = useState("") // Added state to store AI reasoning for target date
  const [baseline, setBaseline] = useState<BaselineData>({
    measurementType: "",
    promptLevel: "Independent",
    setting: "Clinic",
    dataSource: "Direct Observation",
    collectionPeriod: "5",
  })
  const [customizations, setCustomizations] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredGoals = goalBank.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = selectedDomain === "all" || goal.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  const goalsByDomain = filteredGoals.reduce(
    (acc, goal) => {
      if (!acc[goal.domain]) {
        acc[goal.domain] = []
      }
      acc[goal.domain].push(goal)
      return acc
    },
    {} as Record<string, typeof goalBank>,
  )

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }))
  }

  const isGoalSelected = (goalId: string) => {
    return (selectedGoals ?? []).some((g) => g.goalId === goalId)
  }

  const generateBaselineStatement = (): string => {
    const { measurementType, promptLevel, setting, dataSource, collectionPeriod } = baseline

    if (!measurementType) return "Please fill in baseline data fields to see preview."

    let performanceText = ""

    switch (measurementType.toLowerCase()) {
      case "frequency":
        if (baseline.currentRate && baseline.ratePer) {
          performanceText = `${baseline.currentRate} occurrences per ${baseline.ratePer}`
        }
        break
      case "accuracy":
      case "discrete trial":
      case "opportunity":
        if (baseline.percentCorrect && baseline.totalTrials) {
          performanceText = `${baseline.percentCorrect}% accuracy across ${baseline.totalTrials} trials`
        }
        break
      case "duration":
        if (baseline.averageDuration && baseline.durationUnit) {
          performanceText = `${baseline.averageDuration} ${baseline.durationUnit} average duration`
          if (baseline.minDuration || baseline.maxDuration) {
            performanceText += ` (range: ${baseline.minDuration || "?"}-${baseline.maxDuration || "?"} ${baseline.durationUnit})`
          }
        }
        break
      case "task analysis":
        if (baseline.stepsCompleted && baseline.totalSteps) {
          const percent = Math.round((Number(baseline.stepsCompleted) / Number(baseline.totalSteps)) * 100)
          performanceText = `${baseline.stepsCompleted}/${baseline.totalSteps} steps completed (${percent}%)`
        }
        break
      case "interval":
        if (baseline.percentOfIntervals && baseline.observationDuration) {
          performanceText = `${baseline.percentOfIntervals}% of intervals during ${baseline.observationDuration} minute observations`
        }
        break
    }

    if (!performanceText) return "Please complete all required fields for a baseline preview."

    const promptText = promptLevel !== "Independent" ? ` with ${promptLevel.toLowerCase()} prompt` : ""
    const settingText = ` in the ${setting.toLowerCase()} setting`
    const dataText = `, based on ${collectionPeriod} days of ${dataSource.toLowerCase()}`

    return `Client currently demonstrates ${performanceText}${promptText}${settingText}${dataText}.`
  }

  const handleAddGoal = () => {
    if (!selectedGoalForAdd) return

    const baselineStatement = generateBaselineStatement()

    const newGoal: SelectedGoal = {
      goalId: selectedGoalForAdd,
      priority,
      targetDate,
      baselineData: baselineStatement,
      customizations,
    }

    onGoalSelect(newGoal)
    setShowAddDialog(false)
    setSelectedGoalForAdd(null)
    setPriority("medium")
    setTargetDate("")
    setBaseline({
      measurementType: "",
      promptLevel: "Independent",
      setting: "Clinic",
      dataSource: "Direct Observation",
      collectionPeriod: "5",
    })
    setCustomizations("")

    toast({
      title: "Goal Added",
      description: "The goal has been added to your assessment.",
    })
  }

  const handleAutoGenerate = async () => {
    if (!selectedGoalForAdd) return

    setIsGenerating(true)

    const goal = goalBank.find((g) => g.id === selectedGoalForAdd)

    try {
      const response = await fetch("/api/generate-baseline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalTitle: goal?.title,
          goalDescription: goal?.description,
          measurementType: goal?.measurementType,
          criteria: goal?.criteria,
          ageRange: goal?.ageRange,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate baseline")
      }

      const data = await response.json()

      console.log("[v0] AI Generated Baseline Data:", data)

      const newBaseline: BaselineData = {
        measurementType: goal?.measurementType || baseline.measurementType,
        // Frequency fields
        currentRate: data.currentRate?.toString() || baseline.currentRate,
        ratePer: data.ratePer || data.rateUnit || baseline.ratePer,
        // Accuracy/Discrete Trial fields
        percentCorrect: data.percentCorrect?.toString() || baseline.percentCorrect,
        totalTrials: data.totalTrials?.toString() || baseline.totalTrials,
        // Duration fields
        averageDuration: data.averageDuration?.toString() || baseline.averageDuration,
        durationUnit: data.durationUnit || baseline.durationUnit,
        minDuration: data.minDuration?.toString() || baseline.minDuration,
        maxDuration: data.maxDuration?.toString() || baseline.maxDuration,
        // Task Analysis fields
        stepsCompleted: data.stepsCompleted?.toString() || baseline.stepsCompleted,
        totalSteps: data.totalSteps?.toString() || baseline.totalSteps,
        // Interval fields
        percentOfIntervals: data.percentOfIntervals?.toString() || baseline.percentOfIntervals,
        observationDuration: data.observationDuration?.toString() || baseline.observationDuration,
        // Common fields - normalize values to match dropdown options
        promptLevel: normalizeDropdownValue(
          data.promptLevel,
          ["Independent", "Gestural", "Verbal", "Model", "Partial Physical", "Full Physical"],
          baseline.promptLevel,
        ),
        setting: normalizeDropdownValue(
          data.setting,
          ["Home", "Clinic", "School", "Community", "Multiple"],
          baseline.setting,
        ),
        dataSource: normalizeDropdownValue(
          data.dataSource,
          ["Direct Observation", "Parent Report", "Teacher Report", "Formal Assessment", "Probe Data"],
          baseline.dataSource,
        ),
        collectionPeriod: data.collectionPeriod?.toString() || baseline.collectionPeriod,
        notes: data.notes || baseline.notes,
      }

      console.log("[v0] Normalized Baseline Data:", newBaseline)
      setBaseline(newBaseline)

      toast({
        title: "Baseline data generated",
        description: "AI has generated realistic baseline data for this goal.",
      })
    } catch (error) {
      console.error("[v0] Error generating baseline:", error)
      toast({
        title: "Generation failed",
        description: "Could not generate baseline data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestTargetDate = async () => {
    if (!selectedGoalForAdd) return

    setIsSuggestingDate(true)

    const goal = goalBank.find((g) => g.id === selectedGoalForAdd)

    try {
      const response = await fetch("/api/suggest-target-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalTitle: goal?.title,
          goalDescription: goal?.description,
          domain: goal?.domain,
          measurementType: goal?.measurementType,
          targetPercentage: goal?.targetPercentage,
          ageRange: goal?.ageRange,
          baselineData: baseline,
        }),
      })

      const data = await response.json()

      if (data.targetDate) {
        setTargetDate(data.targetDate)
        setTargetDateReasoning(data.reasoning || "")
        toast({
          title: "Target Date Suggested",
          description: "AI has calculated a realistic target date.",
        })
      }
    } catch (error) {
      console.error("Error suggesting target date:", error)
      toast({
        title: "Suggestion failed",
        description: "Could not calculate target date.",
        variant: "destructive",
      })
    } finally {
      setIsSuggestingDate(false)
    }
  }

  const normalizeDropdownValue = (value: string | undefined, validOptions: string[], fallback: string): string => {
    if (!value) return fallback

    // Convert to title case and find exact match
    const normalized = value
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Find case-insensitive match in valid options
    const match = validOptions.find((option) => option.toLowerCase() === normalized.toLowerCase())

    console.log(`[v0] Normalizing "${value}" -> "${normalized}" -> "${match || fallback}"`)
    return match || fallback
  }

  const openAddDialog = (goalId: string) => {
    setSelectedGoalForAdd(goalId)
    const goal = goalBank.find((g) => g.id === goalId)
    if (goal) {
      setBaseline((prev) => ({
        ...prev,
        measurementType: goal.measurementType,
      }))
    }
    setShowAddDialog(true)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#0D9488]/10">
              <TargetIcon className="h-6 w-6 text-[#0D9488]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goal Bank</h1>
              <p className="text-sm text-gray-600">
                Browse and select evidence-based goals for your client's treatment plan
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search goals by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[200px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-6 space-y-4">
            {/* Selected Goals Summary */}
            {(selectedGoals?.length ?? 0) > 0 && (
              <Card className="border-[#0D9488] bg-[#0D9488]/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-[#0D9488]" />
                      <span className="font-medium text-[#0D9488]">
                        {selectedGoals?.length ?? 0} goal{(selectedGoals?.length ?? 0) !== 1 && "s"} selected
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals by Domain */}
            {filteredGoals.length === 0 ? (
              searchTerm ? (
                <SearchNoResults searchQuery={searchTerm} onClearSearch={() => setSearchTerm("")} />
              ) : (
                <NoGoalsEmptyState />
              )
            ) : (
              Object.entries(goalsByDomain).map(([domain, goals]) => (
                <Collapsible
                  key={domain}
                  open={expandedDomains[domain] ?? true}
                  onOpenChange={() => toggleDomain(domain)}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="flex flex-row items-center justify-between py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {(expandedDomains[domain] ?? true) ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                          )}
                          <CardTitle className="text-lg">{domain}</CardTitle>
                          <Badge variant="secondary">{goals.length} goals</Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        {goals.map((goal) => {
                          const selected = isGoalSelected(goal.id)
                          return (
                            <div
                              key={goal.id}
                              className={`p-4 border rounded-lg transition-all duration-200 ${
                                selected
                                  ? "border-[#0D9488] bg-[#0D9488]/5"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {goal.subdomain}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    <span>Criteria: {goal.criteria}</span>
                                    <span>•</span>
                                    <span>Age: {goal.ageRange}</span>
                                    <span>•</span>
                                    <span>Measurement: {goal.measurementType}</span>
                                  </div>
                                </div>
                                <div>
                                  {selected ? (
                                    <Button size="sm" variant="outline" onClick={() => onGoalRemove(goal.id)}>
                                      <CheckIcon className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => openAddDialog(goal.id)}>
                                      <PlusIcon className="h-4 w-4 mr-1" />
                                      Add
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Goal to Assessment</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-auto pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as "high" | "medium" | "low")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Target Date</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestTargetDate}
                    disabled={isSuggestingDate || !selectedGoalForAdd}
                    className="text-teal-600 hover:text-teal-700 h-6 px-2"
                  >
                    {isSuggestingDate ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Suggest
                      </>
                    )}
                  </Button>
                </div>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => {
                    setTargetDate(e.target.value)
                    setTargetDateReasoning("")
                  }}
                />

                {targetDateReasoning && (
                  <div className="flex items-start gap-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm">
                    <Sparkles className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-teal-800">{targetDateReasoning}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Baseline Data</Label>
                  <Badge variant="outline" className="text-xs">
                    {baseline.measurementType || "Select type"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoGenerate}
                  disabled={isGenerating || !selectedGoalForAdd}
                  className="h-8 bg-transparent"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Auto-generate
                    </>
                  )}
                </Button>
              </div>

              {/* Measurement Type */}
              <div className="space-y-2">
                <Label>Measurement Type</Label>
                <Select
                  value={baseline.measurementType}
                  onValueChange={(v) => setBaseline({ ...baseline, measurementType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frequency">Frequency</SelectItem>
                    <SelectItem value="Accuracy">Accuracy</SelectItem>
                    <SelectItem value="Duration">Duration</SelectItem>
                    <SelectItem value="Task Analysis">Task Analysis</SelectItem>
                    <SelectItem value="Interval">Interval</SelectItem>
                    <SelectItem value="Discrete Trial">Discrete Trial</SelectItem>
                    <SelectItem value="Opportunity">Opportunity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Fields Based on Measurement Type */}
              {baseline.measurementType === "Frequency" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Current Rate</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={baseline.currentRate || ""}
                      onChange={(e) => setBaseline({ ...baseline, currentRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Per</Label>
                    <Select
                      value={baseline.ratePer || ""}
                      onValueChange={(v) => setBaseline({ ...baseline, ratePer: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="session">Session</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {(baseline.measurementType === "Accuracy" ||
                baseline.measurementType === "Discrete Trial" ||
                baseline.measurementType === "Opportunity") && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Percent Correct</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 45"
                      min="0"
                      max="100"
                      value={baseline.percentCorrect || ""}
                      onChange={(e) => setBaseline({ ...baseline, percentCorrect: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Trials</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 20"
                      value={baseline.totalTrials || ""}
                      onChange={(e) => setBaseline({ ...baseline, totalTrials: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {baseline.measurementType === "Duration" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Average Duration</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 15"
                        value={baseline.averageDuration || ""}
                        onChange={(e) => setBaseline({ ...baseline, averageDuration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select
                        value={baseline.durationUnit || ""}
                        onValueChange={(v) => setBaseline({ ...baseline, durationUnit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Min Duration (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        value={baseline.minDuration || ""}
                        onChange={(e) => setBaseline({ ...baseline, minDuration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Duration (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 30"
                        value={baseline.maxDuration || ""}
                        onChange={(e) => setBaseline({ ...baseline, maxDuration: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {baseline.measurementType === "Task Analysis" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Steps Completed</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={baseline.stepsCompleted || ""}
                      onChange={(e) => setBaseline({ ...baseline, stepsCompleted: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Steps</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 8"
                      value={baseline.totalSteps || ""}
                      onChange={(e) => setBaseline({ ...baseline, totalSteps: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {baseline.measurementType === "Interval" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Percent of Intervals</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 60"
                      min="0"
                      max="100"
                      value={baseline.percentOfIntervals || ""}
                      onChange={(e) => setBaseline({ ...baseline, percentOfIntervals: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Observation Duration (min)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      value={baseline.observationDuration || ""}
                      onChange={(e) => setBaseline({ ...baseline, observationDuration: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Common Fields */}
              {baseline.measurementType && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Prompt Level</Label>
                      <Select
                        value={baseline.promptLevel}
                        onValueChange={(v) => setBaseline({ ...baseline, promptLevel: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Independent">Independent</SelectItem>
                          <SelectItem value="Gestural">Gestural</SelectItem>
                          <SelectItem value="Verbal">Verbal</SelectItem>
                          <SelectItem value="Model">Model</SelectItem>
                          <SelectItem value="Partial Physical">Partial Physical</SelectItem>
                          <SelectItem value="Full Physical">Full Physical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Setting</Label>
                      <Select value={baseline.setting} onValueChange={(v) => setBaseline({ ...baseline, setting: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Clinic">Clinic</SelectItem>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                          <SelectItem value="Multiple">Multiple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Data Source</Label>
                      <Select
                        value={baseline.dataSource}
                        onValueChange={(v) => setBaseline({ ...baseline, dataSource: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Direct Observation">Direct Observation</SelectItem>
                          <SelectItem value="Parent Report">Parent Report</SelectItem>
                          <SelectItem value="Teacher Report">Teacher Report</SelectItem>
                          <SelectItem value="Formal Assessment">Formal Assessment</SelectItem>
                          <SelectItem value="Probe Data">Probe Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Collection Period (days)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        value={baseline.collectionPeriod}
                        onChange={(e) => setBaseline({ ...baseline, collectionPeriod: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any additional context about baseline data..."
                      value={baseline.notes || ""}
                      onChange={(e) => setBaseline({ ...baseline, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium mb-2 block">Baseline Statement Preview</Label>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{generateBaselineStatement()}</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 mt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddGoal} className="flex-1 bg-[#0D9488] hover:bg-[#0F766E]">
              Add Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
