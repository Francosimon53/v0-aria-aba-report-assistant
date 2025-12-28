"use client"

export const dynamic = "force-dynamic"

import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { safeGetJSON } from "@/lib/safe-storage"
import {
  Target,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Wand2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { GoalSuggester } from "@/components/goal-suggester"

interface BehaviorReductionSTO {
  id: string
  number: number
  targetFrequency: number
  targetPercentReduction: number
  duration: string
  status: "not-started" | "in-progress" | "mastered"
  masteredDate?: string
}

interface STO {
  id: string
  number: number
  description: string
  targetPercentage: number
  duration: string
  status: "not-started" | "in-progress" | "mastered"
  masteredDate?: string
}

interface Goal {
  id: string
  domain: string
  goalType: "skill-acquisition" | "behavior-reduction"
  shortTerm: string
  longTerm: string
  baseline: string
  baselinePercentage: number
  baselineFrequency?: number
  baselineUnit?: "per hour" | "per day" | "per session" | "per week"
  baselineDate: string
  target?: string
  targetDate?: string
  timeline?: string
  priority?: string
  isCustom?: boolean
  stos: STO[]
  behaviorReductionSTOs?: BehaviorReductionSTO[]
  currentSTO: number
  masteryCriteria: string
  consecutiveWeeks: number
  targetBehavior?: string
  replacementBehavior?: string
}

interface DomainAssessment {
  level: "none" | "mild" | "moderate" | "severe"
  description: string
  priority: "low" | "medium" | "high"
}

interface AssessmentContext {
  diagnosis: string
  age: number
  domains: {
    communication: DomainAssessment
    social: DomainAssessment
    adaptive: DomainAssessment
    behavior: DomainAssessment
    cognitive: DomainAssessment
    motor: DomainAssessment
  }
}

const DOMAINS = [
  "Communication/Language",
  "Social Skills",
  "Adaptive/Daily Living",
  "Behavior Reduction",
  "Academic/Pre-Academic",
  "Play/Leisure",
  "Motor Skills",
]

export default function GoalsPage() {
  const router = useRouter()

  const { navigateWithSave } = useSafeNavigation()

  const { value: goals, setValue: setGoals, saveNow } = useStepData<Goal[]>("goals", [])

  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("manual")
  const [expandedGoals, setExpandedGoals] = useState<string[]>([])

  const [assessmentContext, setAssessmentContext] = useState<AssessmentContext>({
    diagnosis: "Autism Spectrum Disorder",
    age: 7,
    domains: {
      communication: { level: "moderate", description: "", priority: "high" },
      social: { level: "moderate", description: "", priority: "high" },
      adaptive: { level: "mild", description: "", priority: "medium" },
      behavior: { level: "moderate", description: "", priority: "high" },
      cognitive: { level: "mild", description: "", priority: "medium" },
      motor: { level: "none", description: "", priority: "low" },
    },
  })

  useEffect(() => {
    setIsClient(true)

    const clientData = safeGetJSON("aria-client-info", null)
    const domainsData = safeGetJSON("aria-domains", null)

    if (clientData) {
      const dob = clientData.clientDetails?.dateOfBirth
      let age = 7
      if (dob) {
        const birthDate = new Date(dob)
        const today = new Date()
        age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      }
      setAssessmentContext((prev) => ({
        ...prev,
        diagnosis: clientData.clientDetails?.primaryDiagnosis || "Autism Spectrum Disorder",
        age,
      }))
    }

    if (domainsData) {
      if (domainsData.domains) {
        setAssessmentContext((prev) => ({
          ...prev,
          domains: {
            communication: domainsData.domains.communication || prev.domains.communication,
            social: domainsData.domains.social || prev.domains.social,
            adaptive: domainsData.domains.adaptive || prev.domains.adaptive,
            behavior: domainsData.domains.behavior || prev.domains.behavior,
            cognitive: domainsData.domains.cognitive || prev.domains.cognitive,
            motor: domainsData.domains.motor || prev.domains.motor,
          },
        }))
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await saveNow()
    setIsSaving(false)
    toast({ title: "Saved", description: "Goals saved successfully" })
  }

  const addGoal = () => {
    setGoals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        domain: "",
        goalType: "skill-acquisition",
        shortTerm: "",
        longTerm: "",
        baseline: "",
        baselinePercentage: 0,
        baselineFrequency: 0,
        baselineUnit: "per day",
        baselineDate: new Date().toISOString().split("T")[0],
        targetDate: "",
        priority: "medium",
        stos: [],
        behaviorReductionSTOs: [],
        currentSTO: 1,
        masteryCriteria: "90% accuracy for 8 consecutive weeks",
        consecutiveWeeks: 8,
      },
    ])
  }

  const removeGoal = (id: string) => {
    if (goals.length > 1) {
      setGoals((prev) => prev.filter((g) => g.id !== id))
    }
  }

  const updateGoal = (id: string, field: keyof Goal, value: string | number | STO[] | BehaviorReductionSTO[]) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  const generateSTOs = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const baseline = goal.baselinePercentage || 0
    const target = 90 // LTO target is always 90%
    const increment = 10 // Each STO increases by 10%
    const stos: STO[] = []

    let currentTarget = baseline + increment
    let stoNumber = 1

    while (currentTarget < target && stoNumber <= 11) {
      stos.push({
        id: `${goalId}-sto-${stoNumber}`,
        number: stoNumber,
        description: `Client will demonstrate skill at ${currentTarget}% accuracy across 3 consecutive sessions`,
        targetPercentage: currentTarget,
        duration: "4 weeks",
        status: "not-started",
      })
      currentTarget += increment
      stoNumber++
    }

    // Final STO at target
    if (stoNumber <= 11) {
      stos.push({
        id: `${goalId}-sto-${stoNumber}`,
        number: stoNumber,
        description: `Client will demonstrate skill at ${target}% accuracy for ${goal.consecutiveWeeks} consecutive weeks (LTO)`,
        targetPercentage: target,
        duration: "8 weeks",
        status: "not-started",
      })
    }

    updateGoal(goalId, "stos", stos)
    toast({
      title: "STOs Generated",
      description: `Generated ${stos.length} Short-Term Objectives progressing from ${baseline}% to ${target}%`,
    })
  }

  const generateBehaviorReductionSTOs = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal || !goal.baselineFrequency) return

    const baseline = goal.baselineFrequency
    const stos: BehaviorReductionSTO[] = []

    // Generate 7-11 STOs reducing by 10% each
    const reductions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

    reductions.forEach((reduction, index) => {
      const targetFreq = Math.max(0, Math.round(baseline * (1 - reduction / 100) * 10) / 10)
      stos.push({
        id: `${goalId}-br-sto-${index + 1}`,
        number: index + 1,
        targetFrequency: targetFreq,
        targetPercentReduction: reduction,
        duration: index < 9 ? "4 weeks" : "8 weeks",
        status: "not-started",
      })
    })

    updateGoal(goalId, "behaviorReductionSTOs", stos)

    toast({
      title: "Behavior Reduction STOs Generated",
      description: `Generated ${stos.length} STOs reducing from ${baseline} to 0 ${goal.baselineUnit}`,
    })
  }

  const updateSTO = (goalId: string, stoId: string, field: keyof STO, value: string | number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedSTOs = g.stos.map((s) => (s.id === stoId ? { ...s, [field]: value } : s))
          return { ...g, stos: updatedSTOs }
        }
        return g
      }),
    )
  }

  // Updated updateSTO to handle behavior reduction STOs
  const updateBehaviorReductionSTO = (
    goalId: string,
    stoId: string,
    field: keyof BehaviorReductionSTO,
    value: string | number,
  ) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId && g.behaviorReductionSTOs) {
          const updatedSTOs = g.behaviorReductionSTOs.map((s) => (s.id === stoId ? { ...s, [field]: value } : s))
          return { ...g, behaviorReductionSTOs: updatedSTOs }
        }
        return g
      }),
    )
  }

  const toggleGoalExpanded = (id: string) => {
    setExpandedGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getSTOStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-slate-100 text-slate-600 border-slate-300"
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-teal-500" />
              Treatment Goals with STOs
            </h1>
            <p className="text-sm text-slate-500">Step 8 of 18 - Define LTOs with 7-11 progressive STOs</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1 mr-2">
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "manual" ? "bg-white text-teal-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="h-4 w-4" />
                Goals & STOs
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeTab === "ai" ? "bg-white text-teal-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                AI Suggester
              </button>
            </div>
            {activeTab === "manual" && (
              <Button variant="outline" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            )}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === "ai" ? (
              <GoalSuggester assessmentContext={assessmentContext} selectedGoals={goals} onGoalsChange={setGoals} />
            ) : (
              <div className="space-y-4">
                {/* Info Banner */}
                <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg shrink-0">
                      <Target className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-teal-900">Goals with Progressive STOs</h3>
                      <p className="text-sm text-teal-700 mt-1">
                        Each Long-Term Objective (LTO) should have 7-11 Short-Term Objectives (STOs) that progress by
                        10% increments. Enter the baseline and click "Generate STOs" to auto-create the progression.
                        Mastery criteria: 90% accuracy for 8 consecutive weeks.
                      </p>
                    </div>
                  </div>
                </div>

                {goals.map((goal, index) => (
                  <Card key={goal.id} className="overflow-hidden">
                    {/* CardHeader updated for expanded view and goal type */}
                    <CardHeader
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleGoalExpanded(goal.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {goal.domain || "New Goal"}
                              <Badge
                                variant="outline"
                                className={
                                  goal.goalType === "behavior-reduction"
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-teal-50 text-teal-700 border-teal-200"
                                }
                              >
                                {goal.goalType === "behavior-reduction" ? (
                                  <>
                                    <TrendingDown className="h-3 w-3 mr-1" /> Reduction
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp className="h-3 w-3 mr-1" /> Acquisition
                                  </>
                                )}
                              </Badge>
                              {goal.priority && (
                                <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {goal.goalType === "behavior-reduction"
                                ? `Baseline: ${goal.baselineFrequency || 0} ${goal.baselineUnit || "per day"}`
                                : `Baseline: ${goal.baselinePercentage}%`}
                              {goal.stos.length > 0 || (goal.behaviorReductionSTOs?.length || 0) > 0
                                ? ` • ${goal.goalType === "behavior-reduction" ? goal.behaviorReductionSTOs?.length : goal.stos.length} STOs`
                                : " • No STOs generated"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeGoal(goal.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {expandedGoals.includes(goal.id) ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {expandedGoals.includes(goal.id) && (
                      <CardContent className="space-y-6 pt-0">
                        <div className="p-4 bg-slate-50 rounded-lg border">
                          <Label className="text-sm font-medium mb-3 block">Goal Type</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => updateGoal(goal.id, "goalType", "skill-acquisition")}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                goal.goalType === "skill-acquisition"
                                  ? "border-teal-500 bg-teal-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp
                                  className={`h-5 w-5 ${goal.goalType === "skill-acquisition" ? "text-teal-600" : "text-slate-400"}`}
                                />
                                <span className="font-medium">Skill Acquisition</span>
                              </div>
                              <p className="text-xs text-slate-500">Increase a skill from baseline % to 90% mastery</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateGoal(goal.id, "goalType", "behavior-reduction")}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                goal.goalType === "behavior-reduction"
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingDown
                                  className={`h-5 w-5 ${goal.goalType === "behavior-reduction" ? "text-orange-600" : "text-slate-400"}`}
                                />
                                <span className="font-medium">Behavior Reduction</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Reduce a behavior from baseline frequency to zero
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Domain and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Domain</Label>
                            <Select value={goal.domain} onValueChange={(v) => updateGoal(goal.id, "domain", v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                              <SelectContent>
                                {DOMAINS.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Select value={goal.priority} onValueChange={(v) => updateGoal(goal.id, "priority", v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {goal.goalType === "behavior-reduction" ? (
                          <>
                            {/* Behavior Reduction Baseline */}
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <Label className="font-medium text-orange-900">Target Behavior for Reduction</Label>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm">Target Behavior</Label>
                                  <Input
                                    value={goal.targetBehavior || ""}
                                    onChange={(e) => updateGoal(goal.id, "targetBehavior", e.target.value)}
                                    placeholder="e.g., Physical aggression, Elopement, Self-injury"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Replacement Behavior</Label>
                                  <Input
                                    value={goal.replacementBehavior || ""}
                                    onChange={(e) => updateGoal(goal.id, "replacementBehavior", e.target.value)}
                                    placeholder="e.g., Request break, Use words, Deep breathing"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-sm">Baseline Frequency</Label>
                                    <Input
                                      type="number"
                                      value={goal.baselineFrequency || ""}
                                      onChange={(e) =>
                                        updateGoal(goal.id, "baselineFrequency", Number.parseFloat(e.target.value) || 0)
                                      }
                                      placeholder="e.g., 15"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">Unit</Label>
                                    <Select
                                      value={goal.baselineUnit || "per day"}
                                      onValueChange={(v) => updateGoal(goal.id, "baselineUnit", v)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="per hour">per hour</SelectItem>
                                        <SelectItem value="per session">per session</SelectItem>
                                        <SelectItem value="per day">per day</SelectItem>
                                        <SelectItem value="per week">per week</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm">Baseline Date</Label>
                                    <Input
                                      type="date"
                                      value={goal.baselineDate}
                                      onChange={(e) => updateGoal(goal.id, "baselineDate", e.target.value)}
                                    />
                                  </div>
                                </div>
                                <Button
                                  onClick={() => generateBehaviorReductionSTOs(goal.id)}
                                  disabled={!goal.baselineFrequency}
                                  className="w-full bg-orange-600 hover:bg-orange-700"
                                >
                                  <Wand2 className="h-4 w-4 mr-2" />
                                  Generate Reduction STOs (10% decrements)
                                </Button>
                              </div>
                            </div>

                            {/* Behavior Reduction STOs Display */}
                            {goal.behaviorReductionSTOs && goal.behaviorReductionSTOs.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">
                                    Behavior Reduction STOs ({goal.behaviorReductionSTOs.length})
                                  </Label>
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                    {goal.baselineFrequency} → 0 {goal.baselineUnit}
                                  </Badge>
                                </div>
                                <div className="grid gap-2">
                                  {goal.behaviorReductionSTOs.map((sto, stoIndex) => {
                                    const isCurrent = sto.status === "in-progress"
                                    const isMastered = sto.status === "mastered"
                                    return (
                                      <div
                                        key={sto.id}
                                        className={`p-3 rounded-lg border ${
                                          isCurrent
                                            ? "border-orange-400 bg-orange-50"
                                            : isMastered
                                              ? "border-green-300 bg-green-50"
                                              : "border-slate-200 bg-white"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                                isCurrent
                                                  ? "bg-orange-500 text-white"
                                                  : isMastered
                                                    ? "bg-green-500 text-white"
                                                    : "bg-slate-200 text-slate-600"
                                              }`}
                                            >
                                              {isMastered ? <CheckCircle2 className="h-4 w-4" /> : sto.number}
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">
                                                STO {sto.number}: Reduce to {sto.targetFrequency} {goal.baselineUnit}
                                              </p>
                                              <p className="text-xs text-slate-500">
                                                {sto.targetPercentReduction}% reduction from baseline • {sto.duration}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {isCurrent && (
                                              <Badge className="bg-orange-100 text-orange-700">CURRENT</Badge>
                                            )}
                                            <Select
                                              value={sto.status}
                                              onValueChange={(v) =>
                                                updateBehaviorReductionSTO(goal.id, sto.id, "status", v)
                                              }
                                            >
                                              <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="not-started">Not Started</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="mastered">Mastered</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Skill Acquisition Baseline - existing code */}
                            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-teal-600" />
                                <Label className="font-medium text-teal-900">Baseline & Target</Label>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-sm">Baseline %</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={goal.baselinePercentage}
                                    onChange={(e) =>
                                      updateGoal(goal.id, "baselinePercentage", Number.parseInt(e.target.value) || 0)
                                    }
                                    placeholder="e.g., 10"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Baseline Date</Label>
                                  <Input
                                    type="date"
                                    value={goal.baselineDate}
                                    onChange={(e) => updateGoal(goal.id, "baselineDate", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Consecutive Weeks</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={goal.consecutiveWeeks}
                                    onChange={(e) =>
                                      updateGoal(goal.id, "consecutiveWeeks", Number.parseInt(e.target.value) || 8)
                                    }
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() => generateSTOs(goal.id)}
                                className="w-full mt-3 bg-teal-600 hover:bg-teal-700"
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate STOs (10% increments to 90%)
                              </Button>
                            </div>

                            {/* Skill Acquisition STOs - existing code */}
                            {goal.stos.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">Short-Term Objectives ({goal.stos.length})</Label>
                                  <Badge variant="outline" className="bg-teal-50 text-teal-700">
                                    {goal.baselinePercentage}% → 90%
                                  </Badge>
                                </div>
                                <div className="grid gap-2">
                                  {goal.stos.map((sto, stoIndex) => {
                                    const isCurrent = stoIndex === goal.currentSTO - 1
                                    const isMastered = sto.status === "mastered"
                                    return (
                                      <div
                                        key={sto.id}
                                        className={`p-3 rounded-lg border ${
                                          isCurrent
                                            ? "border-teal-400 bg-teal-50"
                                            : isMastered
                                              ? "border-green-300 bg-green-50"
                                              : "border-slate-200 bg-white"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                                isCurrent
                                                  ? "bg-teal-500 text-white"
                                                  : isMastered
                                                    ? "bg-green-500 text-white"
                                                    : "bg-slate-200 text-slate-600"
                                              }`}
                                            >
                                              {isMastered ? <CheckCircle2 className="h-4 w-4" /> : sto.number}
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">
                                                STO {sto.number}: {sto.targetPercentage}% accuracy
                                              </p>
                                              <p className="text-xs text-slate-500">{sto.duration}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {isCurrent && <Badge className="bg-teal-100 text-teal-700">CURRENT</Badge>}
                                            <Select
                                              value={sto.status}
                                              onValueChange={(v) => updateSTO(goal.id, sto.id, "status", v)}
                                            >
                                              <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="not-started">Not Started</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="mastered">Mastered</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* LTO Description */}
                        <div>
                          <Label>Long-Term Objective (LTO)</Label>
                          <Textarea
                            value={goal.longTerm}
                            onChange={(e) => updateGoal(goal.id, "longTerm", e.target.value)}
                            placeholder={
                              goal.goalType === "behavior-reduction"
                                ? "e.g., Client will reduce physical aggression to 0 instances per day for 8 consecutive weeks"
                                : "e.g., Client will independently request items using 2-3 word phrases at 90% accuracy for 8 consecutive weeks"
                            }
                            rows={3}
                          />
                        </div>

                        {/* Mastery Criteria */}
                        <div>
                          <Label>Mastery Criteria</Label>
                          <Input
                            value={goal.masteryCriteria}
                            onChange={(e) => updateGoal(goal.id, "masteryCriteria", e.target.value)}
                            placeholder={
                              goal.goalType === "behavior-reduction"
                                ? "0 instances for 8 consecutive weeks"
                                : "90% accuracy for 8 consecutive weeks"
                            }
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => navigateWithSave("/assessment/risk-assessment", saveNow)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: Risk Assessment
          </Button>
          <Button onClick={() => navigateWithSave("/assessment/service-plan", saveNow)} disabled={goals.length === 0}>
            Continue: Service Plan
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
