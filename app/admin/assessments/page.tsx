"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, TrendingUp, Clock, CheckCircle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface AssessmentStats {
  total: number
  draft: number
  complete: number
  thisMonth: number
  avgPerUser: number
}

interface MonthlyData {
  month: string
  count: number
}

interface TypeData {
  name: string
  value: number
}

const COLORS = ["#0d9488", "#0891b2", "#6366f1", "#8b5cf6", "#ec4899"]

export default function AssessmentsPage() {
  const [stats, setStats] = useState<AssessmentStats>({
    total: 0,
    draft: 0,
    complete: 0,
    thisMonth: 0,
    avgPerUser: 0,
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [typeData, setTypeData] = useState<TypeData[]>([])
  const [timeRange, setTimeRange] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAssessmentData()
  }, [timeRange])

  const fetchAssessmentData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch total assessments
    const { count: total } = await supabase.from("assessments").select("*", { count: "exact", head: true })

    // Fetch by status
    const { count: draft } = await supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft")

    const { count: complete } = await supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("status", "complete")

    // Fetch this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: thisMonth } = await supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())

    // Get user count for avg calculation
    const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    setStats({
      total: total || 0,
      draft: draft || 0,
      complete: complete || 0,
      thisMonth: thisMonth || 0,
      avgPerUser: userCount ? Math.round(((total || 0) / userCount) * 10) / 10 : 0,
    })

    // Fetch monthly data
    const months = timeRange === "12months" ? 12 : 6
    const monthlyStats: MonthlyData[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonthDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const { count } = await supabase
        .from("assessments")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonthDate.toISOString())
        .lte("created_at", endOfMonthDate.toISOString())

      monthlyStats.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        count: count || 0,
      })
    }

    setMonthlyData(monthlyStats)

    // Fetch by evaluation type
    const { data: assessments } = await supabase.from("assessments").select("evaluation_type")

    const typeCounts: Record<string, number> = {}
    assessments?.forEach((a) => {
      const type = a.evaluation_type || "Unknown"
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    setTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })))

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assessment Analytics</h1>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assessment Analytics</h1>
          <p className="text-muted-foreground">Track assessment creation and usage patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="12months">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Draft</p>
                <p className="text-xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complete</p>
                <p className="text-xl font-bold">{stats.complete}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg/User</p>
                <p className="text-xl font-bold">{stats.avgPerUser}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessments Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By Evaluation Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Creation Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
