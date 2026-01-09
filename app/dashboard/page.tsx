"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TargetIcon,
  FileCheckIcon,
  UserPlusIcon,
  SparklesIcon,
} from "@/components/icons"
import { loadDemoData } from "@/lib/load-demo-data"
import { TrialBanner } from "@/components/trial-banner"
import { TrialExpiredModal } from "@/components/trial-expired-modal"
import { clearAssessmentCache } from "@/lib/assessment-storage"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalAssessments: 0,
    completedReports: 0,
    inProgress: 0,
    timeSaved: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setStats({
            totalAssessments: 0,
            completedReports: 0,
            inProgress: 0,
            timeSaved: 0,
          })
          return
        }

        const { data, error } = await supabase.from("assessments").select("status").eq("user_id", user.id)

        if (error) {
          console.error("[v0] Error loading stats:", error)
          return
        }

        const assessments = data || []
        setStats({
          totalAssessments: assessments.length,
          completedReports: assessments.filter((a) => a.status === "complete").length,
          inProgress: assessments.filter((a) => a.status === "in_progress").length,
          timeSaved: assessments.length * 45,
        })
      } catch (e) {
        console.error("[v0] Error loading stats:", e)
      }
    }

    loadStats()
  }, [])

  const handleTryDemo = () => {
    loadDemoData()
    router.push("/assessment/initial/new")
  }

  const handleNewInitialAssessment = () => {
    clearAssessmentCache()
    console.log("[v0] Starting new initial assessment with clean slate")
    router.push("/assessment/initial/new")
  }

  const handleNewReassessment = () => {
    clearAssessmentCache()
    console.log("[v0] Starting new reassessment with clean slate")
    router.push("/assessment/reassessment/new")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <TrialBanner />
      <TrialExpiredModal />

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

        {/* Try Demo Card for new users */}
        {stats.totalAssessments === 0 && (
          <div className="mb-8">
            <Card className="border-2 border-dashed border-teal-200 bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <SparklesIcon className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-teal-800 mb-1">New to ARIA?</h3>
                    <p className="text-teal-600">
                      See a complete assessment with sample data for Marcus Johnson. Experience how ARIA generates
                      professional 21-section reports in minutes.
                    </p>
                  </div>
                  <Button
                    onClick={handleTryDemo}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-5 shadow-lg shadow-teal-500/25 whitespace-nowrap"
                  >
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Try Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Start New Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Initial Assessment Card */}
            <Card
              onClick={handleNewInitialAssessment}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-teal-500 hover:scale-[1.02] h-full"
            >
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <UserPlusIcon className="h-7 w-7 text-teal-600" />
                </div>
                <CardTitle className="text-xl text-teal-700">Initial Assessment</CardTitle>
                <CardDescription className="text-base">
                  Comprehensive first-time evaluation for new clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-3 w-3 text-teal-600" />
                    </div>
                    Complete diagnostic evaluation
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-3 w-3 text-teal-600" />
                    </div>
                    Baseline skill assessment
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                      <CheckCircleIcon className="h-3 w-3 text-teal-600" />
                    </div>
                    Initial treatment plan
                  </li>
                </ul>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-teal-100">
                  <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">NEW CLIENT</span>
                  <span className="text-sm font-semibold text-teal-600 flex items-center gap-1">
                    First Evaluation
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Reassessment Card */}
            <Card
              onClick={handleNewReassessment}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-orange-500 hover:scale-[1.02] h-full"
            >
              <CardHeader>
                <div className="h-14 w-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <RefreshCwIcon className="h-7 w-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-orange-600">Reassessment</CardTitle>
                <CardDescription className="text-base">
                  Periodic review to measure progress and update treatment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <TrendingUpIcon className="h-3 w-3 text-orange-600" />
                    </div>
                    Progress analysis & comparison
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <TargetIcon className="h-3 w-3 text-orange-600" />
                    </div>
                    Goal achievement review
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                      <FileCheckIcon className="h-3 w-3 text-orange-600" />
                    </div>
                    Authorization renewal
                  </li>
                </ul>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-orange-100">
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    EXISTING CLIENT
                  </span>
                  <span className="text-sm font-semibold text-orange-600 flex items-center gap-1">
                    6-Month Review
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your recent work</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/assessments">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Assessments
                </Button>
              </Link>
              <Link href="/assessment/initial/new">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  Continue Initial
                </Button>
              </Link>
              <Link href="/assessment/reassessment/new">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Continue Reassessment
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
              Welcome to ARIA, your AI-powered ABA reporting assistant. Choose an assessment type above to get started.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Initial Assessment:</strong> For new clients requiring comprehensive evaluation
              </li>
              <li>
                <strong>Reassessment:</strong> For existing clients at 6-month review periods
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
