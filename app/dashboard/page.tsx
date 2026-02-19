"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  Clock,
  CheckCircle2,
  Timer,
  ArrowRight,
  UserPlus,
  RefreshCw,
  BookOpen,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { clearAssessmentCache } from "@/lib/assessment-storage"

interface AssessmentRow {
  id: string
  clientName: string
  type: "initial" | "reassessment"
  status: "draft" | "in_progress" | "complete"
  updatedAt: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    hoursSaved: 0,
  })
  const [recentAssessments, setRecentAssessments] = useState<AssessmentRow[]>([])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Fetch profile for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()

        if (profile?.full_name) {
          setFirstName(profile.full_name.split(" ")[0])
        }

        // Fetch assessments
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("Error loading assessments:", error)
          setLoading(false)
          return
        }

        const assessments = data || []

        // Compute stats
        const total = assessments.length
        const inProgress = assessments.filter((a: any) => a.status === "in_progress").length
        const completed = assessments.filter((a: any) => a.status === "complete").length
        const hoursSaved = Math.round((total * 45) / 60)

        setStats({ total, inProgress, completed, hoursSaved })

        // Map recent 5 to table rows
        const recent: AssessmentRow[] = assessments.slice(0, 5).map((item: any) => {
          const clientInfo = item.data?.client_info || item.data?.clientInformation
          const fName =
            clientInfo?.firstName ||
            clientInfo?.first_name ||
            clientInfo?.client_first_name
          const lName =
            clientInfo?.lastName ||
            clientInfo?.last_name ||
            clientInfo?.client_last_name
          const clientName =
            fName && lName
              ? `${fName} ${lName}`
              : fName || item.title || "Unnamed Client"

          // Determine type based on assessment data
          const isReassessment =
            item.type === "reassessment" ||
            item.data?.assessment_type === "reassessment" ||
            !!item.data?.previous_assessment_id

          return {
            id: item.id,
            clientName,
            type: isReassessment ? "reassessment" : "initial",
            status: item.status || "draft",
            updatedAt: item.updated_at || item.created_at,
          }
        })

        setRecentAssessments(recent)
        setLoading(false)
      } catch (err) {
        console.error("Dashboard error:", err)
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const handleNewInitial = () => {
    clearAssessmentCache()
    router.push("/assessment/initial/new")
  }

  const handleNewReassessment = () => {
    clearAssessmentCache()
    router.push("/assessment/reassessment/new")
  }

  const statCards = [
    {
      label: "Total Assessments",
      value: stats.total,
      icon: FileText,
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
    },
    {
      label: "Hours Saved",
      value: stats.hoursSaved,
      icon: Timer,
    },
  ]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Greeting skeleton */}
        <div className="mb-10">
          <Skeleton className="h-9 w-72 mb-2" />
          <Skeleton className="h-5 w-56" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 shadow-sm p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero / Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {getGreeting()}, {firstName || "there"}
        </h1>
        <p className="text-gray-500 mt-1">{getFormattedDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-sm text-gray-500">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Assessments Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-10">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Assessments</h2>
          <Link
            href="/assessments"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentAssessments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No assessments yet</p>
            <p className="text-xs text-gray-400">
              Create your first assessment to get started
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                  Client Name
                </TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                  Last Updated
                </TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAssessments.map((assessment) => (
                <TableRow key={assessment.id} className="group">
                  <TableCell className="font-medium text-gray-900">
                    {assessment.clientName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        assessment.type === "initial"
                          ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700"
                          : "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      }
                    >
                      {assessment.type === "initial" ? "Initial" : "Reassessment"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        assessment.status === "complete"
                          ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700"
                          : assessment.status === "in_progress"
                            ? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700"
                            : "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                      }
                    >
                      {assessment.status === "complete"
                        ? "Complete"
                        : assessment.status === "in_progress"
                          ? "In Progress"
                          : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatRelativeDate(assessment.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/assessment/new?id=${assessment.id}`}
                      className="text-gray-400 group-hover:text-teal-600 transition-colors"
                    >
                      <ArrowRight className="h-4 w-4 inline-block" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Quick Start */}
      <div className="mb-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleNewInitial}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-left hover:border-teal-200 hover:shadow-md transition-all group"
          >
            <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
              <UserPlus className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">New Initial Assessment</p>
            <p className="text-xs text-gray-500 mt-1">
              Comprehensive evaluation for new clients
            </p>
          </button>

          <button
            onClick={handleNewReassessment}
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-left hover:border-teal-200 hover:shadow-md transition-all group"
          >
            <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
              <RefreshCw className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">New Reassessment</p>
            <p className="text-xs text-gray-500 mt-1">
              Periodic review for existing clients
            </p>
          </button>

          <Link
            href="/goals"
            className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 text-left hover:border-teal-200 hover:shadow-md transition-all group"
          >
            <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
              <BookOpen className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Browse Goal Bank</p>
            <p className="text-xs text-gray-500 mt-1">
              Find and select treatment goals
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
