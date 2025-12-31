"use server"

import {
  getCurrentUser,
  getDashboardStats,
  getMonthlyAssessments,
  getStatusBreakdown,
  getRecentAssessments,
} from "@/app/actions/assessment-actions"

// Re-export all functions from assessment-actions
// This provides a cleaner import path for components
export { getCurrentUser, getDashboardStats, getMonthlyAssessments, getStatusBreakdown, getRecentAssessments }
