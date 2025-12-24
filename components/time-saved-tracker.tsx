"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ClockIcon,
  TrendingUpIcon,
  AwardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "@/components/icons"

interface ReportEntry {
  type: string
  traditional: number
  actual: number
  saved: number
  date: string
}

interface TimeSavedStats {
  thisWeek: number
  thisMonth: number
  allTime: number
  reportsCompleted: number
  avgHourlyRate: number
  consecutiveDays: number
}

interface TimeSavedTrackerProps {
  stats?: TimeSavedStats
  recentReports?: ReportEntry[]
}

const defaultStats: TimeSavedStats = {
  thisWeek: 18.2,
  thisMonth: 47.5,
  allTime: 156.8,
  reportsCompleted: 24,
  avgHourlyRate: 85,
  consecutiveDays: 12,
}

const defaultReports: ReportEntry[] = [
  { type: "FBA Report", traditional: 8, actual: 1.5, saved: 6.5, date: "2024-11-29" },
  { type: "Progress Report", traditional: 6, actual: 1.2, saved: 4.8, date: "2024-11-28" },
  { type: "Initial Assessment", traditional: 10, actual: 2.1, saved: 7.9, date: "2024-11-27" },
  { type: "Reassessment", traditional: 7, actual: 1.4, saved: 5.6, date: "2024-11-26" },
]

export function TimeSavedTracker({ stats = defaultStats, recentReports = defaultReports }: TimeSavedTrackerProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const monthlyValue = stats.thisMonth * stats.avgHourlyRate
  const efficiencyGain = 83
  const avgReportTime = 1.1
  const traditionalTime = 7
  const yearlyProjection = Math.round((stats.thisMonth / 4) * 52)

  return (
    <div className="space-y-6">
      {/* Hero Card - Main Time Saved */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-2">Time Saved This Month</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-6xl font-bold">{stats.thisMonth}</h2>
                <span className="text-2xl text-indigo-100">hours</span>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ClockIcon className="h-8 w-8" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-100 mb-1">Equivalent Value</p>
            <p className="text-3xl font-bold">${monthlyValue.toLocaleString()}</p>
            <p className="text-xs text-indigo-200 mt-1">Based on ${stats.avgHourlyRate}/hour average BCBA rate</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-indigo-200 mb-1">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}h</p>
            </div>
            <div>
              <p className="text-xs text-indigo-200 mb-1">All Time</p>
              <p className="text-2xl font-bold">{stats.allTime}h</p>
            </div>
            <div>
              <p className="text-xs text-indigo-200 mb-1">Reports Done</p>
              <p className="text-2xl font-bold">{stats.reportsCompleted}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-green-600">{efficiencyGain}%</span>
              <span className="text-sm text-muted-foreground">faster</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs traditional methods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">{avgReportTime}</span>
              <span className="text-sm text-muted-foreground">hrs/report</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Before: {traditionalTime}-8 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-orange-600">{stats.consecutiveDays}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep the momentum going!</p>
          </CardContent>
        </Card>
      </div>

      {/* Expandable Report Breakdown */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <CardTitle className="text-base">Recent Reports Breakdown</CardTitle>
            {showBreakdown ? (
              <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </CardHeader>
        {showBreakdown && (
          <CardContent className="space-y-3 pt-0">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">{report.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(report.date).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Traditional</p>
                    <p className="font-semibold">{report.traditional}h</p>
                  </div>

                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">With ARIA</p>
                    <p className="font-semibold text-blue-600">{report.actual}h</p>
                  </div>
                </div>

                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Saved {report.saved}h</Badge>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Motivational Footer */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
              <AwardIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Yearly Projection</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                At your current pace, you'll save approximately{" "}
                <span className="font-bold">{yearlyProjection} hours</span> this year. That's more than{" "}
                <span className="font-bold">{Math.round(yearlyProjection / 40)} weeks</span> of traditional work time!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
