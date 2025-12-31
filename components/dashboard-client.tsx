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
  ArrowUpIcon,
  ArrowDownIcon,
  MoreVerticalIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"

interface Assessment {
  id: string
  clientName: string
  type: "Initial" | "Reassessment"
  status: "In Progress" | "Completed" | "Pending Review"
  date: string
  completionPercentage: number
}

interface DashboardStats {
  totalAssessments: number
  completedReports: number
  timeSaved: number
  complianceRate: number
}

interface DashboardClientProps {
  userName: string
  userEmail: string
  stats: DashboardStats
  monthlyData: { month: string; value: number }[]
  statusBreakdown: { label: string; value: number; percentage: number }[]
  recentAssessments: Assessment[]
}

export function DashboardClient({
  userName,
  userEmail,
  stats,
  monthlyData,
  statusBreakdown,
  recentAssessments,
}: DashboardClientProps) {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

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

  const productivityScore = Math.min(
    100,
    Math.round(
      (stats.completedReports / Math.max(stats.totalAssessments, 1)) * 40 +
        (stats.complianceRate / 100) * 30 +
        Math.min(stats.timeSaved / 10, 30),
    ),
  )

  const statCards = [
    {
      title: "Total Assessments",
      value: stats.totalAssessments.toString(),
      trend: "+12%",
      trendUp: true,
      icon: FileTextIcon,
      gradient: "from-teal-500 via-cyan-500 to-blue-500",
      sparklineData: [12, 15, 13, 18, 20, 17, stats.totalAssessments],
    },
    {
      title: "Completed Reports",
      value: stats.completedReports.toString(),
      trend: "+8%",
      trendUp: true,
      icon: CheckIcon,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      sparklineData: [8, 10, 12, 11, 14, 13, stats.completedReports],
    },
    {
      title: "Time Saved",
      value: `${stats.timeSaved}hrs`,
      trend: "+18hrs",
      trendUp: true,
      icon: ClockIcon,
      gradient: "from-blue-500 via-indigo-500 to-purple-500",
      sparklineData: [5, 8, 12, 15, 18, 22, stats.timeSaved],
    },
    {
      title: "Compliance Rate",
      value: `${stats.complianceRate}%`,
      trend: "+5%",
      trendUp: true,
      icon: TrendingUpIcon,
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      sparklineData: [85, 87, 90, 88, 92, 91, stats.complianceRate],
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {/* Header */}
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => {
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

            {/* Recent Assessments */}
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
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Start New Assessment
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Productivity Score */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white overflow-hidden">
              <div className="p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

                <div className="relative">
                  <div className="text-sm font-medium mb-2 opacity-90">Productivity Score</div>
                  <div className="text-5xl font-bold mb-4">{productivityScore}</div>
                  <p className="text-sm opacity-80 mb-4">
                    {productivityScore >= 80
                      ? "Outstanding performance!"
                      : productivityScore >= 60
                        ? "Great progress!"
                        : "Keep building momentum!"}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-80">Target: 100</span>
                      <span className="font-semibold">{productivityScore}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${productivityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="p-6 space-y-3">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Quick Actions</h3>
                <Button
                  onClick={() => router.push("/assessment/new")}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
                <Button
                  onClick={() => router.push("/assessment/report")}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </Card>

            {/* Status Breakdown */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Status Overview</h3>
                <div className="space-y-4">
                  {statusBreakdown.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                          <span className="text-xs text-gray-500">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            item.label === "Completed"
                              ? "bg-gradient-to-r from-emerald-400 to-green-500"
                              : item.label === "In Progress"
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : "bg-gradient-to-r from-blue-400 to-indigo-500",
                          )}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Monthly Chart */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Monthly Activity</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {monthlyData.map((data, index) => {
                    const maxValue = Math.max(...monthlyData.map((d) => d.value))
                    const height = maxValue > 0 ? (data.value / maxValue) * 100 : 0
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full relative group">
                          <div
                            className="w-full bg-gradient-to-t from-teal-500 to-cyan-500 rounded-t-lg transition-all duration-300 hover:from-teal-600 hover:to-cyan-600"
                            style={{ height: `${Math.max(height, 8)}px` }}
                          />
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {data.value} assessments
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
