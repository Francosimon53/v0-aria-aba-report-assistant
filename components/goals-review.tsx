"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RefreshCwIcon, SaveIcon, CheckCircleIcon, XCircleIcon, EditIcon } from "@/components/icons"

interface GoalDecision {
  id: string
  goalName: string
  domain: string
  currentProgress: string
  decision: "continue" | "modify" | "discontinue" | "pending"
  rationale: string
  modifications?: string
}

interface GoalsReviewProps {
  onSave?: () => void
}

export function GoalsReview({ onSave }: GoalsReviewProps) {
  const [goals, setGoals] = useState<GoalDecision[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aria-reassessment-goals-review")
      if (saved) {
        setGoals(JSON.parse(saved))
      } else {
        // Load from previous goals progress
        const previousGoals = localStorage.getItem("aria-reassessment-previous-goals")
        if (previousGoals) {
          const parsed = JSON.parse(previousGoals)
          const converted = parsed.map((g: any) => ({
            id: g.id,
            goalName: g.goalName,
            domain: g.domain,
            currentProgress: `${g.progressPercentage}%`,
            decision: "pending" as const,
            rationale: "",
            modifications: "",
          }))
          setGoals(converted)
        }
      }
    }
  }, [])

  const updateGoal = (id: string, field: keyof GoalDecision, value: any) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  const handleSave = () => {
    localStorage.setItem("aria-reassessment-goals-review", JSON.stringify(goals))
    onSave?.()
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "continue":
        return "bg-green-100 text-green-700 border-green-300"
      case "modify":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "discontinue":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const summary = {
    continue: goals.filter((g) => g.decision === "continue").length,
    modify: goals.filter((g) => g.decision === "modify").length,
    discontinue: goals.filter((g) => g.decision === "discontinue").length,
    pending: goals.filter((g) => g.decision === "pending").length,
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.continue}</div>
            <div className="text-sm text-green-600">Continue</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{summary.modify}</div>
            <div className="text-sm text-blue-600">Modify</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.discontinue}</div>
            <div className="text-sm text-red-600">Discontinue</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{summary.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <RefreshCwIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-orange-800">Goals Review</CardTitle>
              <CardDescription>Decide whether to continue, modify, or discontinue each goal</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <RefreshCwIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No goals to review.</p>
              <p className="text-sm">Complete the "Previous Goals Progress" section first.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className={`border-2 ${getDecisionColor(goal.decision)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{goal.goalName || "Unnamed Goal"}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{goal.domain}</Badge>
                        <span className="text-sm text-gray-500">Progress: {goal.currentProgress}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Decision Buttons */}
                  <div className="space-y-2">
                    <Label>Decision</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={goal.decision === "continue" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateGoal(goal.id, "decision", "continue")}
                        className={goal.decision === "continue" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Continue
                      </Button>
                      <Button
                        variant={goal.decision === "modify" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateGoal(goal.id, "decision", "modify")}
                        className={goal.decision === "modify" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        <EditIcon className="h-4 w-4 mr-1" />
                        Modify
                      </Button>
                      <Button
                        variant={goal.decision === "discontinue" ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateGoal(goal.id, "decision", "discontinue")}
                        className={goal.decision === "discontinue" ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Discontinue
                      </Button>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="space-y-2">
                    <Label>Rationale for Decision</Label>
                    <Textarea
                      value={goal.rationale}
                      onChange={(e) => updateGoal(goal.id, "rationale", e.target.value)}
                      placeholder="Explain why you chose to continue, modify, or discontinue this goal..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Modifications (if applicable) */}
                  {goal.decision === "modify" && (
                    <div className="space-y-2">
                      <Label>Proposed Modifications</Label>
                      <Textarea
                        value={goal.modifications}
                        onChange={(e) => updateGoal(goal.id, "modifications", e.target.value)}
                        placeholder="Describe the changes to be made to this goal..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
