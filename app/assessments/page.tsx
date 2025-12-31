"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileTextIcon, PlusIcon, EyeIcon, TrashIcon, SearchIcon } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { safeParseDate, safeFormatDate } from "@/lib/safe-date"

interface Assessment {
  id: string
  clientName?: string
  status: "draft" | "in_progress" | "complete"
  createdAt: string
  updatedAt?: string
  progress?: number
  data?: any
}

export default function AssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = () => {
    try {
      setIsLoading(true)

      const saved = localStorage.getItem("aria-assessments")
      if (saved) {
        const data = JSON.parse(saved)
        const assessmentList = Array.isArray(data) ? data : []

        // Filter out assessments with invalid dates
        const validAssessments = assessmentList.filter((a: any) => {
          if (a.createdAt) {
            return safeParseDate(a.createdAt) !== null
          }
          return true
        })

        setAssessments(validAssessments)
        console.log("[v0] Loaded", validAssessments.length, "assessments from localStorage")
      } else {
        setAssessments([])
      }
    } catch (error) {
      console.error("[v0] Error loading assessments:", error)
      setAssessments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    try {
      console.log("[v0] Deleting assessment:", id)

      const saved = localStorage.getItem("aria-assessments")
      if (saved) {
        const data = JSON.parse(saved)
        const assessmentList = Array.isArray(data) ? data : []
        const filtered = assessmentList.filter((a: any) => a.id !== id)
        localStorage.setItem("aria-assessments", JSON.stringify(filtered))
      }

      setAssessments((prev) => prev.filter((a) => a.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Error deleting assessment:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-700 border-green-200"
      case "in_progress":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "draft":
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "complete":
        return "Complete"
      case "in_progress":
        return "In Progress"
      case "draft":
      default:
        return "Draft"
    }
  }

  const calculateProgress = (assessment: Assessment) => {
    if (assessment.progress !== undefined) return assessment.progress
    if (assessment.status === "complete") return 100
    if (assessment.status === "in_progress") return 50
    return 0
  }

  const filteredAssessments = assessments
    .filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.data?.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "all" || a.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      const dateA = safeParseDate(a.createdAt)
      const dateB = safeParseDate(b.createdAt)
      if (!dateA || !dateB) return 0
      return dateB.getTime() - dateA.getTime()
    })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Assessments</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all your client assessments in one place</p>
          </div>
          <Button onClick={() => router.push("/assessment/new")} className="bg-teal-600 hover:bg-teal-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "draft" ? "default" : "outline"}
                onClick={() => setFilterStatus("draft")}
                size="sm"
              >
                Draft
              </Button>
              <Button
                variant={filterStatus === "in_progress" ? "default" : "outline"}
                onClick={() => setFilterStatus("in_progress")}
                size="sm"
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === "complete" ? "default" : "outline"}
                onClick={() => setFilterStatus("complete")}
                size="sm"
              >
                Complete
              </Button>
            </div>
          </div>
        </Card>

        {/* Assessments List */}
        {filteredAssessments.length === 0 ? (
          <Card className="p-12 text-center">
            <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || filterStatus !== "all" ? "No assessments found" : "No assessments yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first assessment to get started"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Button onClick={() => router.push("/assessment/new")} className="bg-teal-600 hover:bg-teal-700">
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Assessment
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAssessments.map((assessment) => {
              const progress = calculateProgress(assessment)
              const clientName = assessment.clientName || assessment.data?.clientName || "Unnamed Client"
              const createdDate = safeFormatDate(assessment.createdAt) || "Unknown date"
              const updatedDate = assessment.updatedAt
                ? safeFormatDate(assessment.updatedAt) || createdDate
                : createdDate

              return (
                <Card key={assessment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{clientName}</h3>
                        <Badge className={getStatusColor(assessment.status)}>{getStatusLabel(assessment.status)}</Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Created</div>
                          <div className="font-medium text-gray-900 dark:text-white">{createdDate}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Last Modified</div>
                          <div className="font-medium text-gray-900 dark:text-white">{updatedDate}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 mb-1">Status</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {getStatusLabel(assessment.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/assessment/new?id=${assessment.id}`)}
                        className="hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(assessment.id)}
                        className="hover:bg-red-50 hover:border-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assessment and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
