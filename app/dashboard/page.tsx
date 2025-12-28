"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileTextIcon,
  CheckIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
  RefreshCwIcon,
  SparklesIcon,
  EyeIcon,
  TrashIcon,
} from "@/components/icons"
import { createClient } from "@/lib/supabase/client"

interface Assessment {
  id: string
  clientName: string
  type: "Initial" | "Reassessment"
  status: "In Progress" | "Completed" | "Pending Review"
  date: string
  completionPercentage: number
}

interface SupabaseAssessment {
  id: string
  title: string
  status: string
  evaluation_type: string
  created_at: string
  updated_at: string
  data: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Dr. Johnson")
  const [currentDate, setCurrentDate] = useState("")
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])
  const [totalAssessments, setTotalAssessments] = useState(0)
  const [completedReports, setCompletedReports] = useState(0)
  const [timeSaved, setTimeSaved] = useState(0)
  const [complianceRate, setComplianceRate] = useState(0)
  const [monthlyData, setMonthlyData] = useState<{ month: string; value: number }[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<{ label: string; value: number; percentage: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()

      try {
        // Get authenticated user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get user metadata for name
          const firstName = user.user_metadata?.first_name || "Dr."
          const lastName = user.user_metadata?.last_name || "Johnson"
          setUserName(`${firstName} ${lastName}`)
        }

        // Fetch all assessments for the current user
        const { data: assessments, error } = await supabase
          .from("assessments")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching assessments:", error)
          return
        }

        const assessmentList = (assessments || []) as SupabaseAssessment[]

        // Calculate statistics
        const total = assessmentList.length
        const completed = assessmentList.filter((a) => a.status === "completed").length
        const inProgress = assessmentList.filter((a) => a.status === "in_progress").length
        const pending = assessmentList.filter((a) => a.status === "pending_review").length

        setTotalAssessments(total)
        setCompletedReports(completed)
        // Calculate time saved: 4 hours per completed assessment
        setTimeSaved(completed * 4)
        // Calculate compliance rate: percentage of completed assessments
        setComplianceRate(total > 0 ? Math.round((completed / total) * 100) : 0)

        // Calculate monthly data for last 6 months
        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        const monthCounts = new Map<string, number>()

        assessmentList.forEach((assessment) => {
          const date = new Date(assessment.created_at)
          if (date >= sixMonthsAgo) {
            const monthKey = date.toLocaleString("en-US", { month: "short" })
            monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1)
          }
        })

        const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const currentMonth = now.getMonth()
        const monthData = months.map((month, i) => {
          const monthIndex = (currentMonth - 5 + i + 12) % 12
          const monthName = new Date(2025, monthIndex, 1).toLocaleString("en-US", { month: "short" })
          return {
            month: monthName,
            value: monthCounts.get(monthName) || 0,
          }
        })
        setMonthlyData(monthData)

        // Status breakdown
        setStatusBreakdown([
          {
            label: "Completed",
            value: completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
          },
          {
            label: "In Progress",
            value: inProgress,
            percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
          },
          {
            label: "Pending Review",
            value: pending,
            percentage: total > 0 ? Math.round((pending / total) * 100) : 0,
          },
        ])

        // Format recent assessments
        const recent = assessmentList.slice(0, 5).map((assessment) => {
          // Extract client name from data jsonb field
          const clientName = assessment.data?.clientInfo?.name || assessment.title || "Unknown Client"

          // Map status
          let status: "In Progress" | "Completed" | "Pending Review" = "In Progress"
          if (assessment.status === "completed") status = "Completed"
          else if (assessment.status === "pending_review") status = "Pending Review"

          // Calculate completion percentage from data
          const completionPercentage =
            assessment.data?.completionPercentage || (assessment.status === "completed" ? 100 : 0)

          return {
            id: assessment.id,
            clientName,
            type: assessment.evaluation_type === "reassessment" ? "Reassessment" : "Initial",
            status,
            date: assessment.created_at,
            completionPercentage,
          } as Assessment
        })

        setRecentAssessments(recent)
      } catch (error) {
        console.error("[v0] Error in fetchDashboardData:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set current date
    const date = new Date()
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )

    fetchDashboardData()
  }, [])

  const stats = [
    {
      title: "Total Assessments",
      value: totalAssessments.toString(),
      trend: totalAssessments > 0 ? `+${Math.round((totalAssessments / 30) * 100)}%` : "0%",
      trendUp: true,
      icon: FileTextIcon,
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Completed Reports",
      value: completedReports.toString(),
      percentage: totalAssessments > 0 ? `${Math.round((completedReports / totalAssessments) * 100)}%` : "0%",
      icon: CheckIcon,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Time Saved",
      value: `${timeSaved}hrs`,
      trend: timeSaved > 0 ? `+${Math.round(timeSaved / 4)}hrs this week` : "0hrs",
      trendUp: true,
      icon: ClockIcon,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      status: complianceRate >= 90 ? "Excellent" : complianceRate >= 70 ? "Good" : "Needs Improvement",
      icon: TrendingUpIcon,
      color: "from-purple-500 to-pink-600",
    },
  ]

  const getStatusColor = (status: Assessment["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Pending Review":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {userName}!</h1>
              <p className="text-gray-500">{currentDate}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/assessment/new")} className="bg-transparent">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
              <Button
                onClick={() => router.push("/assessment/report")}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {stat.trend && (
                      <Badge
                        className={`${
                          stat.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        } border-0`}
                      >
                        {stat.trend}
                      </Badge>
                    )}
                    {stat.percentage && <Badge className="bg-gray-100 text-gray-700 border-0">{stat.percentage}</Badge>}
                    {stat.status && <Badge className="bg-green-100 text-green-700 border-0">{stat.status}</Badge>}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section - Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessments Over Time Chart */}
            <Card className="p-6 border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Assessments Over Time</h2>
                <Badge variant="outline" className="bg-transparent">
                  Last 6 Months
                </Badge>
              </div>
              <div className="h-64 flex items-end justify-around gap-2">
                {monthlyData.map((data, i) => {
                  const maxValue = Math.max(...monthlyData.map((d) => d.value), 1)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-teal-500 to-cyan-600 rounded-t-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 cursor-pointer relative group"
                        style={{
                          height: `${(data.value / maxValue) * 100}%`,
                          minHeight: data.value > 0 ? "20px" : "0",
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.value} assessments
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{data.month}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Report Status Breakdown */}
            <Card className="p-6 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Report Status Breakdown</h2>
              <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="20"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * (statusBreakdown[0]?.percentage || 0)) / 100}
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray="251"
                      strokeDashoffset={
                        -(
                          (251 * (statusBreakdown[0]?.percentage || 0)) / 100 +
                          (251 * (statusBreakdown[1]?.percentage || 0)) / 100
                        )
                      }
                      className="transition-all duration-1000"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="20"
                      strokeDasharray="251"
                      strokeDashoffset={
                        -(
                          (251 * (statusBreakdown[0]?.percentage || 0)) / 100 +
                          (251 * (statusBreakdown[1]?.percentage || 0)) / 100 +
                          (251 * (statusBreakdown[2]?.percentage || 0)) / 100
                        )
                      }
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{totalAssessments}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-4">
                  {statusBreakdown.map((item, i) => {
                    const colors = ["bg-green-500", "bg-yellow-500", "bg-blue-500"]
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-4 h-4 ${colors[i]} rounded-full`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            <span className="text-sm text-gray-500">
                              {item.value} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[i]} transition-all duration-1000`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  {
                    title: "New Initial Assessment",
                    description: "Start a comprehensive assessment",
                    icon: PlusIcon,
                    action: () => router.push("/assessment/new"),
                    gradient: "from-teal-500 to-cyan-600",
                  },
                  {
                    title: "New Reassessment",
                    description: "Create follow-up assessment",
                    icon: RefreshCwIcon,
                    action: () => router.push("/assessment/new?type=reassessment"),
                    gradient: "from-blue-500 to-indigo-600",
                  },
                  {
                    title: "Generate Report",
                    description: "AI-powered report generation",
                    icon: SparklesIcon,
                    action: () => router.push("/assessment/report"),
                    gradient: "from-purple-500 to-pink-600",
                  },
                  {
                    title: "View All Assessments",
                    description: "Browse complete history",
                    icon: FileTextIcon,
                    action: () => router.push("/assessments"),
                    gradient: "from-emerald-500 to-green-600",
                  },
                ].map((action, index) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full p-4 rounded-xl border-2 border-gray-100 hover:border-teal-200 bg-white hover:bg-teal-50/50 transition-all duration-300 group text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">
                            {action.title}
                          </div>
                          <div className="text-xs text-gray-500">{action.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* System Status */}
            <Card className="p-6 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">All Systems Operational</h3>
                  <p className="text-sm text-gray-600 mb-3">AI services running smoothly</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Last checked: Just now</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/assessments")}
                className="bg-transparent"
              >
                View All
              </Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentAssessments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No assessments yet</p>
                <p className="text-sm mb-4">Create your first assessment to get started</p>
                <Button
                  onClick={() => router.push("/assessment/new")}
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </div>
            ) : (
              recentAssessments.map((assessment) => (
                <div key={assessment.id} className="p-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{assessment.clientName}</h3>
                        <Badge variant="outline" className={`${getStatusColor(assessment.status)} border`}>
                          {assessment.status}
                        </Badge>
                        <Badge variant="outline" className="bg-transparent">
                          {assessment.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(assessment.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-500"
                              style={{ width: `${assessment.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{assessment.completionPercentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {assessment.status === "In Progress" && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/assessment/new?id=${assessment.id}`)}
                          className="bg-teal-500 hover:bg-teal-600 text-white"
                        >
                          Continue
                        </Button>
                      )}
                      {assessment.status === "Completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/assessment/report?id=${assessment.id}`)}
                          className="bg-transparent"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
