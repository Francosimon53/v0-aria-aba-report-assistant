import { createClient as createBrowserClient } from "./supabase/client"

export async function createAssessment(userId: string, clientData: any) {
  const supabase = createBrowserClient()

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
  return data
}

export async function getAssessment(assessmentId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("assessments").select("*").eq("id", assessmentId).single()

  if (error) throw error
  return data
}

export async function getUserAssessments(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function updateAssessment(assessmentId: string, updates: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("assessments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", assessmentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAssessment(assessmentId: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.from("assessments").delete().eq("id", assessmentId)

  if (error) throw error
}

export async function saveParentTrainingProgress(assessmentId: string, moduleData: any) {
  const supabase = createBrowserClient()

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

export async function getParentTrainingProgress(assessmentId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("parent_training_progress").select("*").eq("assessment_id", assessmentId)

  if (error) throw error
  return data
}

export async function saveReportSection(assessmentId: string, section: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("report_sections")
    .upsert(
      {
        assessment_id: assessmentId,
        section_number: section.number,
        section_name: section.name,
        content: section.content,
        word_count: section.wordCount || 0,
        status: "complete",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assessment_id,section_number" },
    )
    .select()

  if (error) throw error
  return data
}

export async function getReportSections(assessmentId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("report_sections")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("section_number")

  if (error) throw error
  return data
}

export async function saveGoal(assessmentId: string, goal: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("assessment_goals")
    .insert({
      assessment_id: assessmentId,
      domain: goal.domain,
      goal_text: goal.text,
      baseline: goal.baseline,
      target: goal.target,
      status: goal.status || "active",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getGoals(assessmentId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("assessment_goals").select("*").eq("assessment_id", assessmentId)

  if (error) throw error
  return data
}

export async function saveIntervention(assessmentId: string, intervention: any) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("assessment_interventions")
    .insert({
      assessment_id: assessmentId,
      intervention_name: intervention.name || intervention.title,
      description: intervention.description,
      function: intervention.function,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInterventions(assessmentId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("assessment_interventions").select("*").eq("assessment_id", assessmentId)

  if (error) throw error
  return data
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}
