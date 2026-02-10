"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function extractClientName(clientData: any): string {
  // Handle nested data structure: { data: { firstName: ... } } or direct { firstName: ... }
  const data = clientData?.data || clientData || {}

  const firstName = data.firstName || data.first_name || data.client_first_name || ""
  const lastName = data.lastName || data.last_name || data.client_last_name || ""

  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || "Unnamed Client"
}

export async function createAssessment(userId: string, clientData: any) {
  const supabase = await createClient()

  const clientName = extractClientName(clientData)
  const assessmentType = clientData?.assessmentType || clientData?.evaluation_type || "Initial Assessment"

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      title: `${clientName} - ${assessmentType}`,
      evaluation_type: assessmentType,
      status: "draft",
      data: clientData,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/dashboard")
  revalidatePath("/assessments")

  return data
}

export async function getAssessment(assessmentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("assessments").select("*").eq("id", assessmentId).maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Assessment not found")

  return data
}

export async function getUserAssessments(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateAssessment(assessmentId: string, updates: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("assessments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assessmentId)
    .select()
    .single()
  if (error) throw error

  revalidatePath("/dashboard")
  revalidatePath("/assessments")

  return data
}

export async function deleteAssessment(assessmentId: string) {
  const supabase = await createClient()

  // Verify the current user owns this assessment before deleting
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessmentId)
    .eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/dashboard")
  revalidatePath("/assessments")
}

export async function saveParentTrainingProgress(assessmentId: string, moduleData: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("parent_training_progress")
    .upsert(
      {
        assessment_id: assessmentId,
        module_name: moduleData.moduleName,
        status: moduleData.status,
        fidelity_score: moduleData.fidelityScore,
        session_notes: moduleData.sessionNotes,
        ai_generated_content: moduleData.aiContent,
        completed_at: moduleData.status === "complete" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assessment_id,module_name" },
    )
    .select()
  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  try {
    const { data: assessments, error: assessError } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)

    if (assessError) throw assessError

    const totalAssessments = assessments?.length || 0
    const completedReports = assessments?.filter((a) => a.status === "complete").length || 0
    const timeSaved = completedReports * 6
    const complianceRate = totalAssessments > 0 ? Math.round((completedReports / totalAssessments) * 100) : 0

    return { totalAssessments, completedReports, timeSaved, complianceRate }
  } catch (error) {
    return { totalAssessments: 0, completedReports: 0, timeSaved: 0, complianceRate: 0 }
  }
}

export async function saveCurrentAssessment(userId: string, assessmentId: string | null, allData: any) {
  const supabase = await createClient()
  try {
    const clientInfoRaw = allData?.client_info || allData?.clientData || {}
    const clientInfoData = clientInfoRaw.data || clientInfoRaw
    const firstName = clientInfoData.firstName || clientInfoData.first_name || ""
    const lastName = clientInfoData.lastName || clientInfoData.last_name || ""
    const clientName = `${firstName} ${lastName}`.trim() || allData.clientData?.name || allData.name || "Unnamed Client"
    const assessmentType = allData.assessmentType || allData.evaluation_type || "Initial Assessment"

    if (assessmentId) {
      const { data, error } = await supabase
        .from("assessments")
        .update({
          data: allData,
          title: `${clientName} - ${assessmentType}`, // Update title with client name
          status: allData.status || "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)
        .select()
        .single()

      if (error) throw error
      revalidatePath("/dashboard")
      return { success: true, assessmentId, data }
    } else {
      const { data, error } = await supabase
        .from("assessments")
        .insert({
          user_id: userId,
          title: `${clientName} - ${assessmentType}`,
          evaluation_type: assessmentType,
          status: "draft",
          data: allData,
        })
        .select()
        .single()

      if (error) throw error
      revalidatePath("/dashboard")
      return { success: true, assessmentId: data.id, data }
    }
  } catch (error) {
    return { success: false, error }
  }
}

export async function getMonthlyAssessments(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) throw error

    // Group by month
    const monthlyData: { [key: string]: number } = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    data?.forEach((assessment) => {
      const date = new Date(assessment.created_at)
      const monthKey = months[date.getMonth()]
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    // Get last 6 months
    const now = new Date()
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = months[d.getMonth()]
      result.push({ month: monthKey, value: monthlyData[monthKey] || 0 })
    }

    return result
  } catch (error) {
    return []
  }
}

export async function getStatusBreakdown(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from("assessments").select("status").eq("user_id", userId)

    if (error) throw error

    const total = data?.length || 0
    if (total === 0) return []

    const statusCounts: { [key: string]: number } = {}
    data?.forEach((assessment) => {
      const status = assessment.status || "draft"
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    return [
      {
        label: "Completed",
        value: statusCounts["complete"] || 0,
        percentage: Math.round(((statusCounts["complete"] || 0) / total) * 100),
      },
      {
        label: "In Progress",
        value: statusCounts["draft"] || 0,
        percentage: Math.round(((statusCounts["draft"] || 0) / total) * 100),
      },
      {
        label: "Pending Review",
        value: statusCounts["review"] || 0,
        percentage: Math.round(((statusCounts["review"] || 0) / total) * 100),
      },
    ]
  } catch (error) {
    return []
  }
}

export async function getRecentAssessments(userId: string, limit = 5) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return (
      data?.map((assessment) => ({
        id: assessment.id,
        clientName: assessment.title || "Unnamed Client",
        type: assessment.evaluation_type === "Reassessment" ? "Reassessment" : "Initial",
        status:
          assessment.status === "complete"
            ? "Completed"
            : assessment.status === "review"
              ? "Pending Review"
              : "In Progress",
        date: assessment.created_at,
        completionPercentage: calculateCompletionPercentage(assessment.data),
      })) || []
    )
  } catch (error) {
    return []
  }
}

function calculateCompletionPercentage(data: any): number {
  if (!data) return 0

  const sections = [
    "clientData",
    "backgroundHistory",
    "assessmentData",
    "behaviorReduction",
    "abcObservations",
    "riskAssessment",
    "interventions",
    "goals",
  ]

  const completed = sections.filter((section) => {
    const sectionData = data[section]
    if (!sectionData) return false
    if (typeof sectionData === "object") {
      return Object.keys(sectionData).length > 0
    }
    return Boolean(sectionData)
  }).length

  return Math.round((completed / sections.length) * 100)
}
