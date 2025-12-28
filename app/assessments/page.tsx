"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { assessmentStorage } from "@/lib/assessment-storage"
import type { Assessment } from "@/lib/types/assessment"
import { EVALUATION_TYPES, type EvaluationType } from "@/lib/evaluation-type"
import {
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Zap,
  BarChart3,
  MoreVertical,
  Archive,
  Loader2,
} from "lucide-react"

export default function AssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      const data = await assessmentStorage.listAssessments()
      setAssessments(data)
    } catch (err) {
      console.error("[v0] Failed to load assessments:", err)
      setError(err instanceof Error ? err.message : "Failed to load assessments")
    } finally {
      setLoading(false)
    }
  }

  const handleNewAssessment = async (type: EvaluationType) => {
    try {
      setError(null)
      setLoading(true)
      console.log("[v0] Starting assessment creation:", type)
      const newAssessment = await assessmentStorage.createAssessment(type)
      console.log("[v0] Assessment created successfully, navigating to:", newAssessment.id)

      // Navigate with assessment ID in query param
      router.push(`/assessment/client-info?aid=${newAssessment.id}`)
    } catch (err) {
      console.error("[v0] Failed to create assessment:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create assessment"
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleContinueAssessment = (assessmentId: string, evaluationType: string) => {
    router.push(`/assessment/client-info?aid=${assessmentId}`)
  }

  const handleArchiveAssessment = async (assessmentId: string) => {
    try {
      await assessmentStorage.updateStatus(assessmentId, "archived")
      await loadAssessments()
    } catch (err) {
      console.error("[v0] Failed to archive assessment:", err)
    }
  }

  const getProgressPercentage = (assessment: Assessment): number => {
    const completedSteps = assessment.data?.completedSteps?.length || 0
    const totalSteps = assessment.evaluation_type === EVALUATION_TYPES.REASSESSMENT ? 12 : 11
    return Math.round((completedSteps / totalSteps) * 100)
  }

  const stats = {
    inProgress: assessments.filter((a) => a.status === "draft").length,
    completed: assessments.filter((a) => a.status === "completed").length,
    total: assessments.length,
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Assessments</h1>
            <p className="text-muted-foreground">Manage your ABA assessments with multi-device sync</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <Zap className="h-8 w-8 text-teal-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-2xl font-bold">~4h</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Assessment Buttons */}
          <div className="mb-8 flex gap-4">
            <Button
              onClick={() => handleNewAssessment(EVALUATION_TYPES.INITIAL)}
              className="gap-2 bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              New Initial Assessment
            </Button>
            <Button
              onClick={() => handleNewAssessment(EVALUATION_TYPES.REASSESSMENT)}
              className="gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Reassessment
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-8">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Assessments List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Assessments</h2>

            {loading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                  <p className="text-muted-foreground">Loading assessments...</p>
                </CardContent>
              </Card>
            ) : assessments.length === 0 ? (
              <Card className="border-0 shadow-sm border-dashed">
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No assessments yet</h3>
                  <p className="text-sm text-muted-foreground mb-6">Create your first assessment to get started</p>
                  <Button
                    onClick={() => handleNewAssessment(EVALUATION_TYPES.INITIAL)}
                    className="gap-2 bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              assessments
                .filter((a) => a.status !== "archived")
                .map((assessment) => {
                  const progress = getProgressPercentage(assessment)
                  return (
                    <Card key={assessment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">
                                {assessment.client_name || assessment.title || "Untitled Assessment"}
                              </CardTitle>
                              <Badge
                                variant={
                                  assessment.evaluation_type === EVALUATION_TYPES.INITIAL ? "default" : "secondary"
                                }
                              >
                                {assessment.evaluation_type === EVALUATION_TYPES.INITIAL ? "Initial" : "Reassessment"}
                              </Badge>
                              <Badge
                                variant={assessment.status === "completed" ? "outline" : "secondary"}
                                className="ml-auto"
                              >
                                {progress}%
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              Last updated: {new Date(assessment.updated_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleArchiveAssessment(assessment.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleContinueAssessment(assessment.id, assessment.evaluation_type)}
                          className="gap-2"
                        >
                          Continue
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
