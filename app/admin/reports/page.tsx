"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText, Download, TrendingUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

interface ReportStats {
  total: number
  thisMonth: number
  avgWordCount: number
  completionRate: number
}

interface SectionStats {
  name: string
  count: number
  avgWords: number
}

const COLORS = ["#0d9488", "#0891b2", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    thisMonth: 0,
    avgWordCount: 0,
    completionRate: 0,
  })
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([])
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([])
  const [timeRange, setTimeRange] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch total report sections
    const { count: total, data: sections } = await supabase.from("report_sections").select("*")

    // Calculate stats
    const totalWordCount = sections?.reduce((acc, s) => acc + (s.word_count || 0), 0) || 0
    const avgWordCount = total ? Math.round(totalWordCount / total) : 0

    // Fetch completed sections
    const { count: completed } = await supabase
      .from("report_sections")
      .select("*", { count: "exact", head: true })
      .eq("status", "complete")

    const completionRate = total ? Math.round(((completed || 0) / total) * 100) : 0

    // This month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: thisMonth } = await supabase
      .from("report_sections")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())

    setStats({
      total: total || 0,
      thisMonth: thisMonth || 0,
      avgWordCount,
      completionRate,
    })

    // Monthly data
    const months = timeRange === "12months" ? 12 : 6
    const monthlyStats: { month: string; count: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonthDate = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonthDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const { count } = await supabase
        .from("report_sections")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonthDate.toISOString())
        .lte("created_at", endOfMonthDate.toISOString())

      monthlyStats.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        count: count || 0,
      })
    }

    setMonthlyData(monthlyStats)

    // Section stats by name
    const sectionCounts: Record<string, { count: number; totalWords: number }> = {}
    sections?.forEach((s) => {
      const name = s.section_name || "Unknown"
      if (!sectionCounts[name]) {
        sectionCounts[name] = { count: 0, totalWords: 0 }
      }
      sectionCounts[name].count++
      sectionCounts[name].totalWords += s.word_count || 0
    })

    setSectionStats(
      Object.entries(sectionCounts)
        .map(([name, data]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          count: data.count,
          avgWords: Math.round(data.totalWords / data.count),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    )

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Report Analytics</h1>
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
          <h1 className="text-2xl font-bold">Report Analytics</h1>
          <p className="text-muted-foreground">Track report generation and section usage</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sections</p>
                <p className="text-xl font-bold">{stats.total}</p>
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
                <Download className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Words</p>
                <p className="text-xl font-bold">{stats.avgWordCount}</p>
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
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reports Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0d9488" fill="#0d948833" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {sectionStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Details */}
      <Card>
        <CardHeader>
          <CardTitle>Section Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sectionStats.slice(0, 5).map((section, index) => (
              <div key={section.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{section.name}</span>
                  <span className="text-muted-foreground">
                    {section.count} sections | {section.avgWords} avg words
                  </span>
                </div>
                <Progress value={(section.count / (sectionStats[0]?.count || 1)) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
