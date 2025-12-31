"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { FileTextIcon, PlusIcon, EyeIcon, TrashIcon, SearchIcon } from "@/components/icons"
import { getUserAssessments, deleteAssessment, getCurrentUser } from "@/app/actions/assessment-actions"
import { premiumToast } from "@/components/ui/premium-toast"
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
import { Input } from "@/components/ui/input"

export default function AssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Assessments: Fetching assessments")

      const user = await getCurrentUser()
      if (!user) {
        console.log("[v0] Assessments: No user found")
        premiumToast.error("Please log in", "You need to be logged in to view assessments")
        router.push("/login")
        return
      }

      const data = await getUserAssessments(user.id)
      setAssessments(data || [])
      console.log("[v0] Assessments: Loaded", data?.length, "assessments")
    } catch (error) {
      console.error("[v0] Assessments: Error fetching:", error)
      premiumToast.error("Error", "Failed to load assessments")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log("[v0] Assessments: Deleting assessment", id)
      await deleteAssessment(id)
      setAssessments((prev) => prev.filter((a) => a.id !== id))
      premiumToast.success("Deleted", "Assessment deleted successfully")
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Assessments: Error deleting:", error)
      premiumToast.error("Error", "Failed to delete assessment")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-700 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "complete":
        return "Completed"
      case "draft":
        return "In Progress"
      default:
        return "Pending"
    }
  }

  const filteredAssessments = assessments
    .filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.data?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "all" || a.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading assessments...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Assessments</h1>
              <p className="text-gray-600">Manage all your client assessments in one place</p>
            </div>
            <Button
              onClick={() => router.push("/assessment/new")}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
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
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "complete" ? "default" : "outline"}
                  onClick={() => setFilterStatus("complete")}
                  size="sm"
                >
                  Completed
                </Button>
              </div>
            </div>
          </Card>

          {filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center">
              <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first assessment"}
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button
                  onClick={() => router.push("/assessment/new")}
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Assessment
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {assessment.data?.name || assessment.title || "Unnamed Client"}
                        </h3>
                        <Badge className={getStatusColor(assessment.status)}>{getStatusLabel(assessment.status)}</Badge>
                        <Badge variant="outline">{assessment.evaluation_type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Created</div>
                          <div className="font-medium">{new Date(assessment.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Last Modified</div>
                          <div className="font-medium">{new Date(assessment.updated_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Diagnosis</div>
                          <div className="font-medium">{assessment.data?.diagnosis || "Not specified"}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Assessment Type</div>
                          <div className="font-medium">{assessment.evaluation_type}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/assessment/${assessment.id}`)}
                        className="hover:bg-teal-50 hover:border-teal-500 hover:text-teal-700"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
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
              ))}
            </div>
          )}
        </div>
      </div>

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
    </>
  )
}
