"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileTextIcon,
  CheckIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
  SparklesIcon,
  EyeIcon,
  CalendarIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MoreVerticalIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
} from "@/components/icons"
import {
  getCurrentUser,
  getDashboardStats,
  getMonthlyAssessments,
  getStatusBreakdown,
  getRecentAssessments,
} from "@/app/actions/assessment-actions"
import { cn } from "@/lib/utils"

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
  const [userEmail, setUserEmail] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])
  const [totalAssessments, setTotalAssessments] = useState(0)
  const [completedReports, setCompletedReports] = useState(0)
  const [timeSaved, setTimeSaved] = useState(0)
  const [complianceRate, setComplianceRate] = useState(0)
  const [monthlyData, setMonthlyData] = useState<{ month: string; value: number }[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<{ label: string; value: number; percentage: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productivityScore, setProductivityScore] = useState(0)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = await getCurrentUser()

        if (user) {
          const displayName =
            user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Welcome back"
          setUserName(displayName)
          setUserEmail(user.email || "")

          const stats = await getDashboardStats(user.id)
          setTotalAssessments(stats.totalAssessments)
          setCompletedReports(stats.completedReports)
          setTimeSaved(stats.timeSaved)
          setComplianceRate(stats.complianceRate)

          const score = Math.min(
            100,
            Math.round(
              (stats.completedReports / Math.max(stats.totalAssessments, 1)) * 40 +
                (stats.complianceRate / 100) * 30 +
                Math.min(stats.timeSaved / 10, 30),
            ),
          )
          setProductivityScore(score)

          const monthly = await getMonthlyAssessments(user.id)
          setMonthlyData(monthly)

          const breakdown = await getStatusBreakdown(user.id)
          setStatusBreakdown(breakdown)

          const recent = await getRecentAssessments(user.id, 5)
          setRecentAssessments(recent as Assessment[])
        }
      } catch (error) {
        console.error("Dashboard error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    const date = new Date()
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
  }, [])

  const stats = [
    {
      title: "Total Assessments",
      value: totalAssessments.toString(),
      trend: "+12%",
      trendUp: true,
      icon: FileTextIcon,
      gradient: "from-teal-500 via-cyan-500 to-blue-500",
      sparklineData: [12, 15, 13, 18, 20, 17, totalAssessments],
    },
    {
      title: "Completed Reports",
      value: completedReports.toString(),
      trend: "+8%",
      trendUp: true,
      icon: CheckIcon,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      sparklineData: [8, 10, 12, 11, 14, 13, completedReports],
    },
    {
      title: "Time Saved",
      value: `${timeSaved}hrs`,
      trend: "+18hrs",
      trendUp: true,
      icon: ClockIcon,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      sparklineData: [5, 8, 12, 15, 18, 22, timeSaved],
    },
    {
      title: "Compliance Rate",
      value: `${complianceRate}%`,
      trend: "+5%",
      trendUp: true,
      icon: TrendingUpIcon,
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      sparklineData: [85, 87, 90, 88, 92, 91, complianceRate],
    },
  ]

  const getStatusColor = (status: Assessment["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Pending Review":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-teal-400 to-cyan-500",
      "from-purple-400 to-pink-500",
      "from-orange-400 to-red-500",
      "from-blue-400 to-indigo-500",
      "from-green-400 to-emerald-500",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      <div className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {userName.includes("@") || userName === "Welcome back" ? "Welcome back" : `Welcome back, ${userName}`}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentDate}</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-medium">{currentTime}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm">
                  <span className="font-semibold text-teal-600">{recentAssessments.length}</span> assessments due this
                  week
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <SearchIcon className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
                <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-600">
                  ⌘K
                </kbd>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={index}
                    className="group relative overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur"
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity",
                        stat.gradient,
                      )}
                    />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={cn(
                            "w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                            stat.gradient,
                          )}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {stat.trendUp ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <ArrowUpIcon className="h-3 w-3" />
                            {stat.trend}
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
                            <ArrowDownIcon className="h-3 w-3" />
                            {stat.trend}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-500 font-medium">{stat.title}</div>
                      </div>

                      <div className="mt-4 h-8 flex items-end gap-1">
                        {stat.sparklineData.map((value, i) => {
                          const maxValue = Math.max(...stat.sparklineData)
                          const height = (value / maxValue) * 100
                          return (
                            <div
                              key={i}
                              className={cn(
                                "flex-1 rounded-t bg-gradient-to-t opacity-40 group-hover:opacity-70 transition-all",
                                stat.gradient,
                              )}
                              style={{ height: `${height}%`, minHeight: "4px" }}
                            />
                          )
                        })}
                      </div>
                    </div>

                    <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r", stat.gradient)} />
                  </Card>
                )
              })}
            </div>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recent Assessments</h2>
                    <p className="text-sm text-gray-500 mt-1">Your latest client assessments and progress</p>
                  </div>
                  <Button onClick={() => router.push("/assessments")} variant="outline" size="sm" className="gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    View All
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {recentAssessments.length > 0 ? (
                  recentAssessments.map((assessment) => (
                    <Card
                      key={assessment.id}
                      className="group hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer border border-gray-100 bg-gradient-to-br from-white to-gray-50/50"
                      onClick={() => router.push(`/assessment/${assessment.id}`)}
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                            <AvatarFallback
                              className={cn(
                                "bg-gradient-to-br text-white font-bold text-lg",
                                getAvatarColor(assessment.clientName),
                              )}
                            >
                              {getInitials(assessment.clientName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{assessment.clientName}</h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={cn("border", getStatusColor(assessment.status))}>
                                    {assessment.status}
                                  </Badge>
                                  <Badge variant="outline" className="border-gray-200">
                                    {assessment.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(assessment.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Completion Progress</span>
                                <span className="text-sm font-bold text-teal-600">
                                  {assessment.completionPercentage}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500 shadow-sm"
                                  style={{ width: `${assessment.completionPercentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/assessment/${assessment.id}`)
                                }}
                              >
                                <EyeIcon className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/assessment/report`)
                                }}
                              >
                                <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
                                Generate Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-1 bg-gradient-to-r",
                          assessment.status === "Completed"
                            ? "from-emerald-400 to-green-500"
                            : assessment.status === "In Progress"
                              ? "from-amber-400 to-orange-500"
                              : "from-blue-400 to-indigo-500",
                        )}
                      />
                    </Card>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FileTextIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No assessments yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Create your first assessment to start tracking client progress and generating reports
                    </p>
                    <Button
                      onClick={() => router.push("/assessment/new")}
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Assessment
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Assessments Over Time</h3>
                  <div className="h-64 flex items-end justify-around gap-3">
                    {monthlyData.length > 0 ? (
                      monthlyData.map((data, i) => {
                        const maxValue = Math.max(...monthlyData.map((d) => d.value), 1)
                        const height = (data.value / maxValue) * 100
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                            <div
                              className="w-full bg-gradient-to-t from-teal-500 via-cyan-500 to-blue-400 rounded-t-xl transition-all duration-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-500 cursor-pointer relative overflow-hidden"
                              style={{
                                height: `${height}%`,
                                minHeight: data.value > 0 ? "30px" : "0",
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm font-bold text-gray-900">{data.value}</div>
                            <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                        <FileTextIcon className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-sm font-medium">No data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Status Distribution</h3>
                  <div className="space-y-5">
                    {statusBreakdown.length > 0 ? (
                      statusBreakdown.map((item, i) => {
                        const gradients = [
                          "from-emerald-400 to-green-500",
                          "from-amber-400 to-orange-500",
                          "from-blue-400 to-indigo-500",
                        ]
                        return (
                          <div key={i} className="group">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">{item.value}</span>
                                <span className="text-sm font-bold text-gray-900">({item.percentage}%)</span>
                              </div>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full bg-gradient-to-r transition-all duration-700 group-hover:scale-x-105",
                                  gradients[i],
                                )}
                                style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center text-gray-400 py-12">
                        <p className="text-sm font-medium">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-teal-50/30 backdrop-blur overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Assessment Readiness</h3>
                <p className="text-xs text-gray-500 mb-6">Overall productivity score</p>

                <div className="relative w-48 h-48 mx-auto">
                  {/* Background ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="currentColor"
                      strokeWidth="16"
                      fill="none"
                      className="text-gray-100"
                    />
                    {/* Progress ring with gradient */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(productivityScore / 100) * 502.4} 502.4`}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(20, 184, 166, 0.5))",
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      {productivityScore}%
                    </div>
                    <div className="text-sm text-gray-500 font-medium mt-1">
                      {productivityScore >= 80 ? "Excellent" : productivityScore >= 60 ? "Good" : "Needs Work"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Client Info</div>
                    <div className="text-lg font-bold text-teal-600">85%</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Goals</div>
                    <div className="text-lg font-bold text-cyan-600">92%</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Assessment</div>
                    <div className="text-lg font-bold text-blue-600">78%</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Reports</div>
                    <div className="text-lg font-bold text-purple-600">88%</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50/50 backdrop-blur overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                </div>

                <div className="space-y-3">
                  {recentAssessments.filter((a) => a.completionPercentage > 70 && a.completionPercentage < 100).length >
                    0 && (
                    <div className="p-4 bg-white/80 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <AlertCircleIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium mb-2">
                            Assessment for{" "}
                            {
                              recentAssessments.find((a) => a.completionPercentage > 70 && a.completionPercentage < 100)
                                ?.clientName
                            }{" "}
                            is{" "}
                            {
                              recentAssessments.find((a) => a.completionPercentage > 70 && a.completionPercentage < 100)
                                ?.completionPercentage
                            }
                            % complete
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            Finish Goals section →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-white/80 rounded-xl border border-purple-100 hover:border-purple-200 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <ClockIcon className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          You typically complete assessments on Thursdays
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                        >
                          Schedule time →
                        </Button>
                      </div>
                    </div>
                  </div>

                  {recentAssessments.filter((a) => {
                    const daysSince = Math.floor((Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24))
                    return daysSince > 7 && a.status !== "Completed"
                  }).length > 0 && (
                    <div className="p-4 bg-white/80 rounded-xl border border-orange-100 hover:border-orange-200 transition-colors cursor-pointer group">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <FileTextIcon className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium mb-2">
                            {
                              recentAssessments.filter((a) => {
                                const daysSince = Math.floor(
                                  (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24),
                                )
                                return daysSince > 7 && a.status !== "Completed"
                              }).length
                            }{" "}
                            assessments haven't been touched in 7+ days
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            Review now →
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push("/assessment/new")}
                    className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                  <Button
                    onClick={() => router.push("/assessment/report")}
                    className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button
                    onClick={() => router.push("/assessments")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    View All Assessments
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 hover:scale-110 transition-all"
          onClick={() => router.push("/assessment/new")}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

function NavItem({
  active,
  label,
  completed,
  onClick,
}: {
  active: boolean
  label: string
  completed?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
        active ? "bg-teal-50 text-teal-700 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      )}
    >
      {completed && <CheckIcon className="h-3.5 w-3.5 text-teal-600" />}
      <span className="flex-1 text-left">{label}</span>
    </button>
  )
}
