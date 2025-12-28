"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  UsersIcon,
  ClipboardIcon,
  SettingsIcon,
  StarIcon,
  TrendingUpIcon,
  HomeIcon,
} from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetItem, safeSetItem } from "@/lib/safe-storage"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Data Collection": ClipboardIcon,
  "Behavior Management": SettingsIcon,
  "Skill Acquisition Teaching": TrendingUpIcon,
  "Generalization & Maintenance": HomeIcon,
}

// Types - Remove icon from interface since it can't be serialized
interface STO {
  id: string
  percentage: number
  status: "not-started" | "in-progress" | "mastered"
  dateStarted?: string
  dateMastered?: string
  notes: string
}

interface CaregiverGoal {
  id: string
  area: string
  color: string
  description: string
  lto: string
  baseline: number
  currentLevel: number
  stos: STO[]
  strategies: string[]
  selectedStrategies: string[]
  notes: string
}

const DEFAULT_CAREGIVER_GOALS: Omit<CaregiverGoal, "id">[] = [
  {
    area: "Data Collection",
    color: "bg-blue-500",
    description:
      "Caregiver will accurately collect data on target behaviors and skill acquisition using appropriate data collection methods",
    lto: "Caregiver will independently collect data with 90% accuracy across 3 consecutive sessions",
    baseline: 0,
    currentLevel: 0,
    stos: [
      { id: "dc-1", percentage: 20, status: "not-started", notes: "" },
      { id: "dc-2", percentage: 40, status: "not-started", notes: "" },
      { id: "dc-3", percentage: 60, status: "not-started", notes: "" },
      { id: "dc-4", percentage: 80, status: "not-started", notes: "" },
      { id: "dc-5", percentage: 100, status: "not-started", notes: "" },
    ],
    strategies: [
      "Model data collection procedures",
      "Provide written data collection guides",
      "Practice with role-play scenarios",
      "Review data together and provide feedback",
      "Use simplified data sheets initially",
      "Video record sessions for review",
    ],
    selectedStrategies: [],
    notes: "",
  },
  {
    area: "Behavior Management",
    color: "bg-purple-500",
    description:
      "Caregiver will implement behavior management strategies consistently to decrease challenging behaviors",
    lto: "Caregiver will independently implement behavior intervention procedures with 90% fidelity across 3 consecutive sessions",
    baseline: 0,
    currentLevel: 0,
    stos: [
      { id: "bm-1", percentage: 20, status: "not-started", notes: "" },
      { id: "bm-2", percentage: 40, status: "not-started", notes: "" },
      { id: "bm-3", percentage: 60, status: "not-started", notes: "" },
      { id: "bm-4", percentage: 80, status: "not-started", notes: "" },
      { id: "bm-5", percentage: 100, status: "not-started", notes: "" },
    ],
    strategies: [
      "Explain function of behavior",
      "Model antecedent strategies",
      "Practice de-escalation techniques",
      "Role-play reinforcement procedures",
      "Provide visual supports",
      "Create behavior support plan summary",
    ],
    selectedStrategies: [],
    notes: "",
  },
  {
    area: "Skill Acquisition Teaching",
    color: "bg-green-500",
    description: "Caregiver will implement teaching procedures to increase adaptive skills and communication",
    lto: "Caregiver will independently implement DTT and NET procedures with 90% fidelity across 3 consecutive sessions",
    baseline: 0,
    currentLevel: 0,
    stos: [
      { id: "sa-1", percentage: 20, status: "not-started", notes: "" },
      { id: "sa-2", percentage: 40, status: "not-started", notes: "" },
      { id: "sa-3", percentage: 60, status: "not-started", notes: "" },
      { id: "sa-4", percentage: 80, status: "not-started", notes: "" },
      { id: "sa-5", percentage: 100, status: "not-started", notes: "" },
    ],
    strategies: [
      "Demonstrate discrete trial teaching",
      "Practice natural environment teaching",
      "Model prompting hierarchies",
      "Train on error correction",
      "Practice reinforcement delivery",
      "Create teaching activity guides",
    ],
    selectedStrategies: [],
    notes: "",
  },
  {
    area: "Generalization & Maintenance",
    color: "bg-orange-500",
    description: "Caregiver will promote generalization of skills across settings, people, and materials",
    lto: "Caregiver will independently implement generalization strategies with 90% fidelity across 3 consecutive sessions",
    baseline: 0,
    currentLevel: 0,
    stos: [
      { id: "gm-1", percentage: 20, status: "not-started", notes: "" },
      { id: "gm-2", percentage: 40, status: "not-started", notes: "" },
      { id: "gm-3", percentage: 60, status: "not-started", notes: "" },
      { id: "gm-4", percentage: 80, status: "not-started", notes: "" },
      { id: "gm-5", percentage: 100, status: "not-started", notes: "" },
    ],
    strategies: [
      "Vary teaching materials",
      "Practice in different settings",
      "Include multiple communication partners",
      "Fade prompts systematically",
      "Thin reinforcement schedules",
      "Create maintenance schedules",
    ],
    selectedStrategies: [],
    notes: "",
  },
]

function getIconForArea(area: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[area] || ClipboardIcon
}

export default function CaregiverTrainingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [goals, setGoals] = useState<CaregiverGoal[]>([])
  const [activeGoal, setActiveGoal] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // Initialize goals
  useEffect(() => {
    const saved = safeGetItem("aria_caregiver_training_data", null)
    if (saved) {
      const data = saved
      setGoals(data.goals || [])
      if (data.goals?.length > 0) {
        setActiveGoal(data.goals[0].id)
      }
    } else {
      initializeGoals()
    }
  }, [])

  const initializeGoals = () => {
    const initialGoals = DEFAULT_CAREGIVER_GOALS.map((g, i) => ({
      ...g,
      id: `cg-${i}`,
    }))
    setGoals(initialGoals)
    setActiveGoal(initialGoals[0]?.id)
  }

  const updateGoal = (goalId: string, updates: Partial<CaregiverGoal>) => {
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g)))
  }

  const updateSTO = (goalId: string, stoId: string, updates: Partial<STO>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        return {
          ...g,
          stos: g.stos.map((s) => (s.id === stoId ? { ...s, ...updates } : s)),
        }
      }),
    )
  }

  const toggleStrategy = (goalId: string, strategy: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const selected = g.selectedStrategies.includes(strategy)
          ? g.selectedStrategies.filter((s) => s !== strategy)
          : [...g.selectedStrategies, strategy]
        return { ...g, selectedStrategies: selected }
      }),
    )
  }

  const markSTOComplete = (goalId: string, stoId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    const stoIndex = goal?.stos.findIndex((s) => s.id === stoId) ?? -1

    if (goal && stoIndex >= 0) {
      updateSTO(goalId, stoId, {
        status: "mastered",
        dateMastered: new Date().toISOString().split("T")[0],
      })

      const newLevel = goal.stos[stoIndex].percentage
      updateGoal(goalId, { currentLevel: newLevel })

      if (stoIndex < goal.stos.length - 1) {
        updateSTO(goalId, goal.stos[stoIndex + 1].id, {
          status: "in-progress",
          dateStarted: new Date().toISOString().split("T")[0],
        })
      }

      const allComplete = goal.stos.every((s, i) => i === stoIndex || s.status === "mastered")
      if (allComplete && stoIndex === goal.stos.length - 1) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }

      toast({
        title: "STO Mastered!",
        description: `${goal.area}: ${newLevel}% fidelity achieved`,
      })
    }
  }

  const getOverallProgress = () => {
    if (goals.length === 0) return 0
    const total = goals.reduce((acc, g) => acc + g.currentLevel, 0)
    return Math.round(total / goals.length)
  }

  const getGoalProgress = (goal: CaregiverGoal) => {
    const mastered = goal.stos.filter((s) => s.status === "mastered").length
    return Math.round((mastered / goal.stos.length) * 100)
  }

  const getCurrentSTO = (goal: CaregiverGoal) => {
    return goal.stos.find((s) => s.status === "in-progress") || goal.stos.find((s) => s.status === "not-started")
  }

  // Save data
  useEffect(() => {
    if (goals.length > 0) {
      safeSetItem("aria_caregiver_training_data", { goals })
    }
  }, [goals])

  const activeGoalData = goals.find((g) => g.id === activeGoal)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex">
      <AssessmentSidebar />

      <div className="flex-1">
        {/* Celebration Banner */}
        {showCelebration && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 text-center animate-in slide-in-from-top">
            <div className="flex items-center justify-center gap-2">
              <StarIcon className="h-6 w-6" />
              <span className="font-bold">Goal Mastered! Great Progress!</span>
              <StarIcon className="h-6 w-6" />
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-background border-b sticky top-0 z-40">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Button variant="ghost" size="sm" onClick={() => router.push("/assessment/generalization")}>
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <span>Step 13 of 18</span>
                </div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <UsersIcon className="h-6 w-6 text-primary" />
                  Caregiver Training Goals
                </h1>
                <p className="text-muted-foreground">Track caregiver training progress and fidelity</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Overall Progress</div>
                  <div className="text-2xl font-bold text-primary">{getOverallProgress()}%</div>
                </div>
                <Button onClick={() => router.push("/assessment/coordination-care")}>
                  Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Goals Sidebar */}
            <div className="col-span-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Training Areas</h3>
                <div className="space-y-2">
                  {goals.map((goal) => {
                    const Icon = getIconForArea(goal.area)
                    const progress = getGoalProgress(goal)
                    const currentSTO = getCurrentSTO(goal)

                    return (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          activeGoal === goal.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => setActiveGoal(goal.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full ${goal.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{goal.area}</div>
                            <div className="text-sm text-muted-foreground">
                              Current: {goal.currentLevel}% | Target: 90%
                            </div>
                            <Progress value={progress} className="h-1.5 mt-2" />
                            {currentSTO && (
                              <div className="text-xs text-primary mt-1">
                                Working on: {currentSTO.percentage}% fidelity
                              </div>
                            )}
                          </div>
                          {progress === 100 && <CheckIcon className="h-5 w-5 text-green-500" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Goal Details */}
            <div className="col-span-8 space-y-6">
              {activeGoalData && (
                <>
                  {/* Goal Header */}
                  <Card className={`p-6 border-l-4 ${activeGoalData.color.replace("bg-", "border-")}`}>
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-full ${activeGoalData.color} flex items-center justify-center`}
                      >
                        {(() => {
                          const IconComponent = getIconForArea(activeGoalData.area)
                          return <IconComponent className="h-6 w-6 text-white" />
                        })()}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{activeGoalData.area}</h2>
                        <p className="text-muted-foreground mt-1">{activeGoalData.description}</p>
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium">Long-Term Objective (LTO)</div>
                          <p className="text-sm">{activeGoalData.lto}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* STOs Progress */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Short-Term Objectives (STOs)</h3>
                    <div className="space-y-4">
                      {activeGoalData.stos.map((sto, index) => (
                        <div
                          key={sto.id}
                          className={`p-4 rounded-lg border ${
                            sto.status === "mastered"
                              ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                              : sto.status === "in-progress"
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                                : "bg-muted/50 border-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  sto.status === "mastered"
                                    ? "bg-green-500 text-white"
                                    : sto.status === "in-progress"
                                      ? "bg-blue-500 text-white"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {sto.status === "mastered" ? <CheckIcon className="h-4 w-4" /> : index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{sto.percentage}% Fidelity</div>
                                <div className="text-sm text-muted-foreground">
                                  {sto.status === "mastered" && sto.dateMastered
                                    ? `Mastered: ${sto.dateMastered}`
                                    : sto.status === "in-progress" && sto.dateStarted
                                      ? `Started: ${sto.dateStarted}`
                                      : "Not started"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  sto.status === "mastered"
                                    ? "default"
                                    : sto.status === "in-progress"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {sto.status === "mastered"
                                  ? "Mastered"
                                  : sto.status === "in-progress"
                                    ? "In Progress"
                                    : "Not Started"}
                              </Badge>
                              {sto.status === "in-progress" && (
                                <Button size="sm" onClick={() => markSTOComplete(activeGoalData.id, sto.id)}>
                                  Mark Complete
                                </Button>
                              )}
                              {sto.status === "not-started" && index === 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateSTO(activeGoalData.id, sto.id, {
                                      status: "in-progress",
                                      dateStarted: new Date().toISOString().split("T")[0],
                                    })
                                  }
                                >
                                  Start Training
                                </Button>
                              )}
                            </div>
                          </div>
                          {sto.status !== "not-started" && (
                            <div className="mt-3">
                              <Label className="text-xs">Session Notes</Label>
                              <Textarea
                                value={sto.notes}
                                onChange={(e) => updateSTO(activeGoalData.id, sto.id, { notes: e.target.value })}
                                placeholder="Add notes about caregiver performance..."
                                className="mt-1 text-sm"
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Teaching Strategies */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Teaching Strategies</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the strategies being used to train this skill area
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {activeGoalData.strategies.map((strategy) => (
                        <div
                          key={strategy}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            activeGoalData.selectedStrategies.includes(strategy)
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50"
                          }`}
                          onClick={() => toggleStrategy(activeGoalData.id, strategy)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={activeGoalData.selectedStrategies.includes(strategy)} />
                            <span className="text-sm">{strategy}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Additional Notes */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Additional Notes</h3>
                    <Textarea
                      value={activeGoalData.notes}
                      onChange={(e) => updateGoal(activeGoalData.id, { notes: e.target.value })}
                      placeholder="Add any additional notes about caregiver training progress, barriers, or recommendations..."
                      rows={4}
                    />
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
