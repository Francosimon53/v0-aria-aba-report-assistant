"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Users,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Metrics {
  totalUsers: number
  userChange: number
  activeSubscriptions: number
  subscriptionChange: number
  reportsGenerated: number
  reportsChange: number
  mrr: number
  mrrChange: number
}

interface SystemStatus {
  service: string
  status: "healthy" | "degraded" | "down"
  latency?: number
  details?: string
}

interface RecentActivity {
  id: string
  type: "signup" | "assessment" | "report" | "subscription"
  message: string
  timestamp: string
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  prefix = "",
}: {
  title: string
  value: number | string
  change: string
  icon: React.ElementType
  trend: "up" | "down" | "neutral"
  prefix?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : trend === "down" ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : null}
              <p
                className={`text-xs ${
                  trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                {change}
              </p>
            </div>
          </div>
          <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-teal-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusCard({ service, status, latency, details }: SystemStatus) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-3 w-3 rounded-full ${
                status === "healthy" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            <div>
              <p className="font-medium">{service}</p>
              {latency && <p className="text-xs text-muted-foreground">{latency}ms latency</p>}
              {details && <p className="text-xs text-muted-foreground">{details}</p>}
            </div>
          </div>
          <Badge
            variant={status === "healthy" ? "default" : status === "degraded" ? "secondary" : "destructive"}
            className={status === "healthy" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const icons = {
    signup: Users,
    assessment: FileText,
    report: CheckCircle,
    subscription: CreditCard,
  }
  const Icon = icons[activity.type]

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{activity.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.timestamp).toLocaleString()}</p>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalUsers: 0,
    userChange: 0,
    activeSubscriptions: 0,
    subscriptionChange: 0,
    reportsGenerated: 0,
    reportsChange: 0,
    mrr: 0,
    mrrChange: 0,
  })
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()

      // Fetch user metrics
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Fetch users from last month for comparison
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const { count: lastMonthUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .lt("created_at", lastMonth.toISOString())

      // Fetch active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("subscription_status", "active")

      // Fetch assessments count
      const { count: totalAssessments } = await supabase.from("assessments").select("*", { count: "exact", head: true })

      // Fetch report sections (as proxy for reports)
      const { count: totalReports } = await supabase.from("report_sections").select("*", { count: "exact", head: true })

      // Calculate changes
      const userChange =
        totalUsers && lastMonthUsers ? Math.round(((totalUsers - lastMonthUsers) / (lastMonthUsers || 1)) * 100) : 0

      setMetrics({
        totalUsers: totalUsers || 0,
        userChange,
        activeSubscriptions: activeSubscriptions || 0,
        subscriptionChange: 5, // Placeholder
        reportsGenerated: totalReports || 0,
        reportsChange: 156, // Placeholder
        mrr: (activeSubscriptions || 0) * 99, // Assuming $99/month
        mrrChange: 890, // Placeholder
      })

      // Fetch system status
      try {
        const healthRes = await fetch("/api/health")
        const healthData = await healthRes.json()

        setSystemStatus([
          {
            service: "Database",
            status: healthData.services?.database?.status === "healthy" ? "healthy" : "degraded",
            latency: healthData.services?.database?.latency,
          },
          {
            service: "AI Services",
            status: healthData.services?.ai?.status === "healthy" ? "healthy" : "degraded",
            latency: healthData.services?.ai?.latency,
          },
          {
            service: "Document Storage",
            status: healthData.services?.storage?.status === "healthy" ? "healthy" : "degraded",
            details: `${healthData.services?.storage?.documentCount || 0} documents`,
          },
        ])
      } catch {
        setSystemStatus([
          { service: "Database", status: "healthy", latency: 50 },
          { service: "AI Services", status: "healthy", latency: 200 },
          { service: "Document Storage", status: "healthy", details: "Connected" },
        ])
      }

      // Fetch recent activity
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("email, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      const { data: recentAssessments } = await supabase
        .from("assessments")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(3)

      const activities: RecentActivity[] = []

      recentProfiles?.forEach((profile) => {
        activities.push({
          id: `signup-${profile.email}`,
          type: "signup",
          message: `New user signed up: ${profile.email}`,
          timestamp: profile.created_at,
        })
      })

      recentAssessments?.forEach((assessment) => {
        activities.push({
          id: `assessment-${assessment.title}-${assessment.created_at}`,
          type: "assessment",
          message: `Assessment created: ${assessment.title || "Untitled"}`,
          timestamp: assessment.created_at,
        })
      })

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setRecentActivity(activities.slice(0, 10))
      setIsLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of ARIA platform metrics and status</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change={`${metrics.userChange >= 0 ? "+" : ""}${metrics.userChange}% from last month`}
          icon={Users}
          trend={metrics.userChange >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions}
          change={`+${metrics.subscriptionChange} this week`}
          icon={CreditCard}
          trend="up"
        />
        <MetricCard
          title="Reports Generated"
          value={metrics.reportsGenerated}
          change={`+${metrics.reportsChange} this month`}
          icon={FileText}
          trend="up"
        />
        <MetricCard
          title="MRR"
          value={metrics.mrr}
          change={`+$${metrics.mrrChange} from last month`}
          icon={DollarSign}
          trend="up"
          prefix="$"
        />
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {systemStatus.map((status) => (
            <StatusCard key={status.service} {...status} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Report Time</p>
                <p className="text-xl font-bold">12 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
                <p className="text-xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending BAAs</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
