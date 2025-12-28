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
  const [userName, setUserName] = useState("Dr. Johnson")
  const [currentDate, setCurrentDate] = useState("")
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])

  useEffect(() => {
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

    // Load mock recent assessments
    setRecentAssessments([
      {
        id: "1",
        clientName: "Marcus Johnson",
        type: "Initial",
        status: "Completed",
        date: "2025-12-27",
        completionPercentage: 100,
      },
      {
        id: "2",
        clientName: "Emma Williams",
        type: "Reassessment",
        status: "In Progress",
        date: "2025-12-26",
        completionPercentage: 65,
      },
      {
        id: "3",
        clientName: "Noah Martinez",
        type: "Initial",
        status: "Pending Review",
        date: "2025-12-25",
        completionPercentage: 90,
      },
      {
        id: "4",
        clientName: "Olivia Davis",
        type: "Reassessment",
        status: "In Progress",
        date: "2025-12-24",
        completionPercentage: 45,
      },
    ])
  }, [])

  const stats = [
    {
      title: "Total Assessments",
      value: "47",
      trend: "+12%",
      trendUp: true,
      icon: FileTextIcon,
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Completed Reports",
      value: "42",
      percentage: "89%",
      icon: CheckIcon,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Time Saved",
      value: "156hrs",
      trend: "+24hrs this week",
      trendUp: true,
      icon: ClockIcon,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Compliance Rate",
      value: "98%",
      status: "Excellent",
      icon: TrendingUpIcon,
      color: "from-purple-500 to-pink-600",
    },
  ]

  const quickActions = [
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
                {[
                  { month: "Jul", value: 5 },
                  { month: "Aug", value: 8 },
                  { month: "Sep", value: 6 },
                  { month: "Oct", value: 10 },
                  { month: "Nov", value: 12 },
                  { month: "Dec", value: 14 },
                ].map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-teal-500 to-cyan-600 rounded-t-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 cursor-pointer relative group"
                      style={{ height: `${(data.value / 14) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {data.value} assessments
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{data.month}</span>
                  </div>
                ))}
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
                      strokeDashoffset="26"
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
                      strokeDashoffset="-150"
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
                      strokeDashoffset="-210"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">47</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-4">
                  {[
                    { label: "Completed", value: 42, percentage: 89, color: "bg-green-500" },
                    { label: "In Progress", value: 3, percentage: 6, color: "bg-yellow-500" },
                    { label: "Pending Review", value: 2, percentage: 4, color: "bg-blue-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${item.color} rounded-full`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-sm text-gray-500">
                            {item.value} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all duration-1000`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                {quickActions.map((action, index) => {
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
            {recentAssessments.map((assessment) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
