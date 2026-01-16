"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUpIcon, SaveIcon, PlusIcon, TrashIcon } from "@/components/icons"

interface GoalProgress {
  id: string
  goalName: string
  domain: string
  baselineLevel: string
  currentLevel: string
  targetLevel: string
  progressPercentage: number
  status: "on-track" | "behind" | "exceeded" | "not-started"
  notes: string
}

interface PreviousGoalsProgressProps {
  onSave?: () => void
}

export function PreviousGoalsProgress({ onSave }: PreviousGoalsProgressProps) {
  const [goals, setGoals] = useState<GoalProgress[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aria-reassessment-previous-goals")
      if (saved) {
        setGoals(JSON.parse(saved))
      } else {
        // Try to load from initial assessment goals
        const initialGoals = localStorage.getItem("aria-goals-tracker")
        if (initialGoals) {
          const parsed = JSON.parse(initialGoals)
          const converted = (parsed.goals || []).map((g: any) => ({
            id: g.id || crypto.randomUUID(),
            goalName: g.goal || g.name || "",
            domain: g.domain || "Communication",
            baselineLevel: g.baseline || "0%",
            currentLevel: "",
            targetLevel: g.target || "80%",
            progressPercentage: 0,
            status: "not-started" as const,
            notes: "",
          }))
          setGoals(converted)
        }
      }
    }
  }, [])

  const addGoal = () => {
    setGoals([
      ...goals,
      {
        id: crypto.randomUUID(),
        goalName: "",
        domain: "Communication",
        baselineLevel: "",
        currentLevel: "",
        targetLevel: "",
        progressPercentage: 0,
        status: "not-started",
        notes: "",
      },
    ])
  }

  const updateGoal = (id: string, field: keyof GoalProgress, value: any) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const handleSave = () => {
    localStorage.setItem("aria-reassessment-previous-goals", JSON.stringify(goals))
    onSave?.()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "exceeded":
        return "text-green-600 bg-green-100"
      case "on-track":
        return "text-blue-600 bg-blue-100"
      case "behind":
        return "text-orange-600 bg-orange-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <TrendingUpIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-orange-800">Previous Goals Progress</CardTitle>
                <CardDescription>Review progress on goals from the previous authorization period</CardDescription>
              </div>
            </div>
            <Button
              onClick={addGoal}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 bg-transparent"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No previous goals found.</p>
              <p className="text-sm">Click "Add Goal" to manually add goals from the previous period.</p>
            </div>
          ) : (
            goals.map((goal, index) => (
              <Card key={goal.id} className="border-gray-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Goal {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal Name</Label>
                      <Input
                        value={goal.goalName}
                        onChange={(e) => updateGoal(goal.id, "goalName", e.target.value)}
                        placeholder="Enter goal description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Select value={goal.domain} onValueChange={(v) => updateGoal(goal.id, "domain", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Communication">Communication</SelectItem>
                          <SelectItem value="Social Skills">Social Skills</SelectItem>
                          <SelectItem value="Adaptive Behavior">Adaptive Behavior</SelectItem>
                          <SelectItem value="Behavior Reduction">Behavior Reduction</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Motor Skills">Motor Skills</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Baseline Level</Label>
                      <Input
                        value={goal.baselineLevel}
                        onChange={(e) => updateGoal(goal.id, "baselineLevel", e.target.value)}
                        placeholder="e.g., 20%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Level</Label>
                      <Input
                        value={goal.currentLevel}
                        onChange={(e) => updateGoal(goal.id, "currentLevel", e.target.value)}
                        placeholder="e.g., 65%"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Level</Label>
                      <Input
                        value={goal.targetLevel}
                        onChange={(e) => updateGoal(goal.id, "targetLevel", e.target.value)}
                        placeholder="e.g., 80%"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Progress Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={goal.progressPercentage}
                          onChange={(e) => updateGoal(goal.id, "progressPercentage", Number(e.target.value))}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <Progress value={goal.progressPercentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={goal.status} onValueChange={(v: any) => updateGoal(goal.id, "status", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exceeded">Exceeded Target</SelectItem>
                          <SelectItem value="on-track">On Track</SelectItem>
                          <SelectItem value="behind">Behind Schedule</SelectItem>
                          <SelectItem value="not-started">Not Started</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Progress Notes</Label>
                    <Textarea
                      value={goal.notes}
                      onChange={(e) => updateGoal(goal.id, "notes", e.target.value)}
                      placeholder="Document progress, barriers, and recommendations..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600">
            <SaveIcon className="h-4 w-4 mr-2" />
            Save & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
