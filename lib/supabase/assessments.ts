import { createClient } from "./client"

export interface AssessmentRecord {
  id?: string
  client_data: Record<string, any>
  assessment_data: Record<string, any>
  selected_goals: any[]
  status?: "draft" | "completed" | "submitted"
}

// Save or update assessment (upsert)
export async function saveAssessment(
  data: {
    clientData: Record<string, any>
    assessmentData: Record<string, any>
    selectedGoals: any[]
  },
  assessmentId?: string
): Promise<{ id: string; error: Error | null }> {
  const supabase = createClient()
  
  const record: AssessmentRecord = {
    client_data: data.clientData,
    assessment_data: data.assessmentData,
    selected_goals: data.selectedGoals,
    status: "draft",
  }

  if (assessmentId) {
    // Update existing
    const { error } = await supabase
      .from("assessments")
      .update({ ...record, updated_at: new Date().toISOString() })
      .eq("id", assessmentId)

    return { id: assessmentId, error }
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from("assessments")
      .insert(record)
      .select("id")
      .single()

    return { id: inserted?.id || "", error }
  }
}

// Load assessment by ID
export async function loadAssessment(assessmentId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    clientData: data.client_data,
    assessmentData: data.assessment_data,
    selectedGoals: data.selected_goals,
    status: data.status,
  }
}
