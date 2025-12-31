"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusIcon, FileTextIcon, CheckCircleIcon, ClockIcon } from "@/components/icons"
import { safeParseDate } from "@/lib/safe-date"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedReports: 0,
    inProgress: 0,
    timeSaved: 0,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("aria-assessments")
        if (saved) {
          const data = JSON.parse(saved)
          const assessments = Array.isArray(data) ? data : []

          const validAssessments = assessments.filter((a: any) => {
            if (a.createdAt) {
              return safeParseDate(a.createdAt) !== null
            }
            return true // Keep assessments without dates
          })

          setStats({
            totalAssessments: validAssessments.length || 0,
            completedReports: validAssessments.filter((a: any) => a?.status === "complete").length || 0,
            inProgress: validAssessments.filter((a: any) => a?.status === "in_progress").length || 0,
            timeSaved: validAssessments.length * 45 || 0,
          })
        }
      } catch (e) {
        console.error("Error loading stats:", e)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome back to ARIA</h1>
          <p className="text-gray-600 dark:text-gray-400">Your AI-powered ABA reporting assistant</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-teal-200 dark:border-teal-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileTextIcon className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reports</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedReports}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for review</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <ClockIcon className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Active assessments</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <ClockIcon className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.timeSaved} hrs</div>
              <p className="text-xs text-muted-foreground mt-1">Automated with AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your ABA reporting workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/assessment/new">
              <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700">
                <PlusIcon className="mr-2 h-5 w-5" />
                Create New Assessment
              </Button>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/assessments">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Assessments
                </Button>
              </Link>
              <Link href="/assessment/new">
                <Button variant="outline" className="w-full bg-transparent">
                  Generate Report
                </Button>
              </Link>
              <Link href="/assessment/new">
                <Button variant="outline" className="w-full bg-transparent">
                  Parent Training
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Welcome to ARIA, your AI-powered ABA reporting assistant. Create your first assessment to get started.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Complete client information</li>
              <li>Perform assessments and observations</li>
              <li>Generate comprehensive reports with AI assistance</li>
              <li>Track goals and monitor progress</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
