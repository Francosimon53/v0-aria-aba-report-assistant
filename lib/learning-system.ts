import { createClient } from "@/lib/supabase/client"

// Calculate how much the BCBA edited the AI content
export function calculateEditPercentage(original: string, edited: string): number {
  if (!original || !edited) return 0

  const originalWords = original
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)
  const editedWords = edited
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)

  if (originalWords.length === 0 || editedWords.length === 0) return 0

  let matches = 0
  editedWords.forEach((word) => {
    if (originalWords.includes(word)) matches++
  })

  const similarity = matches / Math.max(originalWords.length, editedWords.length)
  return Math.round((1 - similarity) * 100)
}

// Get age range category
export function getAgeRange(ageYears: number): string {
  if (ageYears < 3) return "0-3"
  if (ageYears < 6) return "3-6"
  if (ageYears < 12) return "6-12"
  if (ageYears < 18) return "12-18"
  return "18+"
}

// Save approved content to database for learning
export async function saveApprovedContent({
  assessmentId,
  clientInfo,
  sections,
}: {
  assessmentId: string
  clientInfo: {
    diagnosis: string
    severityLevel: string
    age: number
    insurance: string
  }
  sections: {
    sectionType: string
    aiGenerated: string
    approved: string
  }[]
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const ageRange = getAgeRange(clientInfo.age)
  const results = []

  for (const section of sections) {
    if (!section.approved || section.approved.length < 50) continue

    const editPercentage = calculateEditPercentage(section.aiGenerated, section.approved)

    // Generate embedding for semantic search (optional - gracefully fails)
    let embedding = null
    try {
      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: section.approved.slice(0, 8000) }),
      })
      if (response.ok) {
        const data = await response.json()
        embedding = data.embedding
      }
    } catch (e) {
      console.log("[v0] Embedding generation skipped:", e)
    }

    const { error } = await supabase.from("approved_content").insert({
      user_id: user.id,
      assessment_id: assessmentId,
      diagnosis: clientInfo.diagnosis,
      severity_level: clientInfo.severityLevel,
      age_years: clientInfo.age,
      age_range: ageRange,
      insurance_provider: clientInfo.insurance,
      section_type: section.sectionType,
      ai_generated_content: section.aiGenerated,
      bcba_approved_content: section.approved,
      content_embedding: embedding,
      was_edited: editPercentage > 5,
      edit_percentage: editPercentage,
    })

    if (error) {
      console.error("[v0] Failed to save section:", section.sectionType, error)
    } else {
      results.push({ sectionType: section.sectionType, editPercentage })
    }
  }

  // Update BCBA preferences with learning data
  if (results.length > 0) {
    const avgEditPercentage = results.reduce((sum, r) => sum + r.editPercentage, 0) / results.length

    // Upsert preferences
    const { data: existingPrefs } = await supabase.from("bcba_preferences").select("*").eq("user_id", user.id).single()

    if (existingPrefs) {
      await supabase
        .from("bcba_preferences")
        .update({
          total_assessments: (existingPrefs.total_assessments || 0) + 1,
          total_sections_approved: (existingPrefs.total_sections_approved || 0) + results.length,
          avg_edit_percentage:
            ((existingPrefs.avg_edit_percentage || 0) * (existingPrefs.total_sections_approved || 0) +
              avgEditPercentage * results.length) /
            ((existingPrefs.total_sections_approved || 0) + results.length),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
    } else {
      await supabase.from("bcba_preferences").insert({
        user_id: user.id,
        total_assessments: 1,
        total_sections_approved: results.length,
        avg_edit_percentage: avgEditPercentage,
      })
    }
  }

  return { success: true, savedSections: results.length }
}

// Collect sections from localStorage for saving
export function collectSectionsFromStorage(): {
  sectionType: string
  aiGenerated: string
  approved: string
}[] {
  const sectionMappings = [
    { key: "aria-reason-for-referral", type: "reason_for_referral", field: "currentProblemAreas" },
    { key: "aria-background", type: "background_information", field: "content" },
    { key: "aria-abc-observation", type: "abc_observations", field: "summary" },
    { key: "aria-risk-assessment", type: "risk_assessment", field: "crisisPlan" },
    { key: "aria-goals-tracker", type: "skill_acquisition_goals", field: "goals" },
    { key: "aria-behavior-reduction", type: "behavior_reduction_goals", field: "goals" },
    { key: "aria-interventions", type: "interventions", field: "selected" },
    { key: "aria-teaching-protocols", type: "teaching_procedures", field: "protocols" },
    { key: "aria-parent-training", type: "parent_training", field: "content" },
    { key: "aria-medical-necessity", type: "medical_necessity", field: "statement" },
    { key: "aria-fade-plan", type: "fade_plan", field: "narrative" },
    { key: "aria-barriers", type: "barriers_to_treatment", field: "howAddressed" },
    { key: "aria-generalization", type: "generalization_maintenance", field: "narrative" },
  ]

  const sections: { sectionType: string; aiGenerated: string; approved: string }[] = []

  for (const { key, type, field } of sectionMappings) {
    try {
      const rawData = localStorage.getItem(key)
      if (!rawData) continue

      const data = JSON.parse(rawData)
      let content = ""

      if (typeof data === "string") {
        content = data
      } else if (data && typeof data === "object") {
        content = data[field] || JSON.stringify(data)
      }

      if (content && content.length > 50) {
        // Try to get the original AI-generated version
        const aiGeneratedKey = `${key}-ai-generated`
        const aiGenerated = localStorage.getItem(aiGeneratedKey) || content

        sections.push({
          sectionType: type,
          aiGenerated: aiGenerated,
          approved: content,
        })
      }
    } catch (e) {
      console.log("[v0] Error parsing section:", key, e)
    }
  }

  return sections
}

// Get client info from localStorage
export function getClientInfoFromStorage(): {
  diagnosis: string
  severityLevel: string
  age: number
  insurance: string
} {
  try {
    const clientInfo = JSON.parse(localStorage.getItem("aria-client-info") || "{}")
    const reasonForReferral = JSON.parse(localStorage.getItem("aria-reason-for-referral") || "{}")

    return {
      diagnosis: clientInfo.diagnosis || "Autism Spectrum Disorder",
      severityLevel: reasonForReferral.dsm5Level || "Level 2",
      age: Number.parseInt(clientInfo.age) || 5,
      insurance: clientInfo.insuranceProvider || "Unknown",
    }
  } catch {
    return {
      diagnosis: "Autism Spectrum Disorder",
      severityLevel: "Level 2",
      age: 5,
      insurance: "Unknown",
    }
  }
}

// Main function to save all content for learning
export async function saveContentForLearning(): Promise<{ success: boolean; savedSections?: number; error?: string }> {
  try {
    const clientInfo = getClientInfoFromStorage()
    const sections = collectSectionsFromStorage()

    if (sections.length === 0) {
      return { success: false, error: "No content to save" }
    }

    const result = await saveApprovedContent({
      assessmentId: crypto.randomUUID(),
      clientInfo,
      sections,
    })

    return result.error
      ? { success: false, error: result.error }
      : { success: true, savedSections: result.savedSections }
  } catch (error) {
    console.error("[v0] Learning system error:", error)
    return { success: false, error: "Failed to save content" }
  }
}

export async function searchSimilarContent({
  sectionType,
  diagnosis,
  severityLevel,
  ageRange,
  queryText,
  limit = 2,
}: {
  sectionType: string
  diagnosis?: string
  severityLevel?: string
  ageRange?: string
  queryText: string
  limit?: number
}): Promise<
  Array<{
    diagnosis: string
    severity_level: string
    age_years: number
    bcba_approved_content: string
    similarity: number
  }>
> {
  try {
    // Generate embedding for the query
    const response = await fetch("/api/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: queryText.slice(0, 2000) }),
    })

    if (!response.ok) {
      console.log("[v0] Embedding generation failed, falling back to text search")
      return await fallbackTextSearch({ sectionType, diagnosis, severityLevel, limit })
    }

    const { embedding } = await response.json()

    if (!embedding) {
      return await fallbackTextSearch({ sectionType, diagnosis, severityLevel, limit })
    }

    const supabase = createClient()

    // Try vector similarity search first
    const { data, error } = await supabase.rpc("search_similar_content", {
      query_embedding: embedding,
      p_diagnosis: diagnosis || null,
      p_severity_level: severityLevel || null,
      p_age_range: ageRange || null,
      p_section_type: sectionType,
      p_insurance: null,
      p_limit: limit,
    })

    if (error) {
      console.log("[v0] Vector search failed, falling back to text search:", error.message)
      return await fallbackTextSearch({ sectionType, diagnosis, severityLevel, limit })
    }

    return data || []
  } catch (error) {
    console.log("[v0] Search error, using fallback:", error)
    return await fallbackTextSearch({ sectionType, diagnosis, severityLevel, limit })
  }
}

// Fallback to simple text-based search when embeddings aren't available
async function fallbackTextSearch({
  sectionType,
  diagnosis,
  severityLevel,
  limit = 2,
}: {
  sectionType: string
  diagnosis?: string
  severityLevel?: string
  limit?: number
}): Promise<
  Array<{
    diagnosis: string
    severity_level: string
    age_years: number
    bcba_approved_content: string
    similarity: number
  }>
> {
  try {
    const supabase = createClient()

    let query = supabase
      .from("approved_content")
      .select("diagnosis, severity_level, age_years, bcba_approved_content")
      .eq("section_type", sectionType)
      .not("bcba_approved_content", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit * 2) // Get more to filter

    if (diagnosis) {
      query = query.eq("diagnosis", diagnosis)
    }
    if (severityLevel) {
      query = query.eq("severity_level", severityLevel)
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    // Return top results with mock similarity score
    return data.slice(0, limit).map((item) => ({
      ...item,
      similarity: 0.8, // Default similarity for fallback
    }))
  } catch {
    return []
  }
}

export async function buildEnhancedPrompt({
  basePrompt,
  sectionType,
  clientInfo,
}: {
  basePrompt: string
  sectionType: string
  clientInfo: {
    diagnosis?: string
    severityLevel?: string
    age?: number
  }
}): Promise<{ enhancedPrompt: string; exampleCount: number }> {
  const ageRange = clientInfo.age ? getAgeRange(clientInfo.age) : undefined

  try {
    const examples = await searchSimilarContent({
      sectionType,
      diagnosis: clientInfo.diagnosis,
      severityLevel: clientInfo.severityLevel,
      ageRange,
      queryText: basePrompt,
      limit: 2,
    })

    if (examples.length === 0) {
      return { enhancedPrompt: basePrompt, exampleCount: 0 }
    }

    const examplesText = examples
      .map(
        (ex, i) => `
EXAMPLE ${i + 1} (${ex.diagnosis || "ASD"}, ${ex.severity_level || "Level 2"}, Age ${ex.age_years || "N/A"}):
${ex.bcba_approved_content.slice(0, 1500)}
`,
      )
      .join("\n")

    const enhancedPrompt = `${basePrompt}

Here are examples of previously approved content for similar cases. Use these as style and quality references:

${examplesText}

Generate new content following a similar professional style and level of detail, customized for this specific client. Do not copy the examples directly - create original content.`

    return { enhancedPrompt, exampleCount: examples.length }
  } catch (error) {
    console.log("[v0] Failed to enhance prompt with examples:", error)
    return { enhancedPrompt: basePrompt, exampleCount: 0 }
  }
}
