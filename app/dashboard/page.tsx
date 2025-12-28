"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileTextIcon, CheckIcon, ClockIcon, TrendingUpIcon, PlusIcon, SparklesIcon, EyeIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Assessment {
  id: string
  clientName: string
  type: "Initial" | "Reassessment"
  status: "In Progress" | "Completed" | "Pending Review"
  date: string
  completionPercentage: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("Welcome back")
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
    console.log("[v0] Dashboard: Component mounted")

    const fetchUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.log("[v0] Dashboard: Auth error:", error.message)
          setUserName("Welcome back")
        } else if (user) {
          const displayName =
            user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Welcome back"
          setUserName(displayName)
          console.log("[v0] Dashboard: User loaded:", displayName)
        } else {
          setUserName("Welcome back")
          console.log("[v0] Dashboard: No user found")
        }
      } catch (error) {
        console.log("[v0] Dashboard: Failed to fetch user:", error)
        setUserName("Welcome back")
      }
    }

    fetchUserData()

    const date = new Date()
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
    setTimeout(() => {
      setIsLoading(false)
      console.log("[v0] Dashboard: Data loaded")
    }, 500)
  }, [])

  const stats = [
    {
      title: "Total Assessments",
      value: totalAssessments.toString(),
      trend: "+12%",
      trendUp: true,
      icon: FileTextIcon,
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Completed Reports",
      value: completedReports.toString(),
      percentage: "75%",
      icon: CheckIcon,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Time Saved",
      value: `${timeSaved}hrs`,
      trend: "+18hrs this week",
      trendUp: true,
      icon: ClockIcon,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      status: "Excellent",
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {userName.includes("@") || userName === "Welcome back" ? userName : `Welcome back, ${userName}`}!
              </h1>
              <p className="text-gray-500">{currentDate}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/assessment/new")}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Assessment
              </Button>
              <Button
                onClick={() => router.push("/assessment/report")}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
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
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {stat.trend && <Badge className="bg-green-100 text-green-700 border-0">{stat.trend}</Badge>}
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
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assessments Over Time */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Assessments Over Time</h2>
              <div className="h-64 flex items-end justify-around gap-2">
                {monthlyData.map((data, i) => {
                  const maxValue = Math.max(...monthlyData.map((d) => d.value))
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-teal-500 to-cyan-600 rounded-t-lg"
                        style={{
                          height: `${(data.value / maxValue) * 100}%`,
                          minHeight: data.value > 0 ? "20px" : "0",
                        }}
                      />
                      <span className="text-sm text-gray-600">{data.month}</span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Status Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Report Status</h2>
              <div className="space-y-4">
                {statusBreakdown.map((item, i) => {
                  const colors = ["bg-green-500", "bg-yellow-500", "bg-blue-500"]
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-gray-500">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i]}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/assessment/new")}
                  className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
                <Button
                  onClick={() => router.push("/assessment/report")}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button onClick={() => router.push("/assessments")} className="w-full justify-start" variant="outline">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {recentAssessments.map((assessment) => (
              <div key={assessment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{assessment.clientName}</h3>
                      <Badge className={getStatusColor(assessment.status)}>{assessment.status}</Badge>
                      <Badge variant="outline">{assessment.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(assessment.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${assessment.completionPercentage}%` }}
                          />
                        </div>
                        <span>{assessment.completionPercentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {assessment.status === "Completed" && (
                      <Button size="sm" variant="outline">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
