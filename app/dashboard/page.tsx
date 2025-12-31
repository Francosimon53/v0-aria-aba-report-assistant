"use client"
import { DashboardClient } from "@/components/dashboard-client"
import {
  getCurrentUser,
  getDashboardStats,
  getMonthlyAssessments,
  getStatusBreakdown,
  getRecentAssessments,
} from "@/lib/data"

interface Assessment {
  id: string
  clientName: string
  type: "Initial" | "Reassessment"
  status: "In Progress" | "Completed" | "Pending Review"
  date: string
  completionPercentage: number
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    window.location.href = "/login"
    return null
  }

  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Welcome back"
  const userEmail = user.email || ""

  const [stats, monthly, breakdown, recent] = await Promise.all([
    getDashboardStats(user.id),
    getMonthlyAssessments(user.id),
    getStatusBreakdown(user.id),
    getRecentAssessments(user.id, 5),
  ])

  return (
    <DashboardClient
      userName={displayName}
      userEmail={userEmail}
      stats={stats}
      monthlyData={monthly}
      statusBreakdown={breakdown}
      recentAssessments={recent}
    />
  )
}
