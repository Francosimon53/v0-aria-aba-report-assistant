"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAssessment(userId: string, clientData: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      title: `${clientData.name} - ${clientData.diagnosis}`,
      evaluation_type: clientData.assessmentType || "Initial Assessment",
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
  const { data, error } = await supabase.from("assessments").select("*").eq("id", assessmentId).single()
  if (error) throw error
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
  const { error } = await supabase.from("assessments").delete().eq("id", assessmentId)
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
    if (assessmentId) {
      const { data, error } = await supabase
        .from("assessments")
        .update({
          data: allData,
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
      const clientName = allData.clientData?.name || allData.name || "Unnamed Client"
      const { data, error } = await supabase
        .from("assessments")
        .insert({
          user_id: userId,
          title: clientName,
          evaluation_type: allData.assessmentType || "Initial Assessment",
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
