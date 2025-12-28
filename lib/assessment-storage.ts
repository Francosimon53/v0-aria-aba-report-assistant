import { createClient } from "./supabase/client"
import type { Assessment, AssessmentStepKey } from "./types/assessment"
import { type EvaluationType, normalizeEvaluationType } from "./evaluation-type"
import { safeGetItem, safeSetItem, safeGetString, safeSetString } from "./safe-storage"

const STORAGE_KEYS = {
  ASSESSMENT_ID: "aria_current_assessment_id",
  EVALUATION_TYPE: "aria_evaluation_type",
  CACHE_PREFIX: "aria_cache_",
}

export class AssessmentStorage {
  private supabaseInstance: ReturnType<typeof createClient> | null = null

  private getSupabase() {
    if (!this.supabaseInstance) {
      this.supabaseInstance = createClient()
    }
    return this.supabaseInstance
  }

  async getOrCreateAssessment(evaluationType: EvaluationType): Promise<Assessment> {
    console.log("[v0] Initializing assessment session...")

    try {
      const cachedId = this.getCachedAssessmentId()
      const supabase = this.getSupabase()
      const { data: authData } = await supabase.auth.getUser()
      const isAuthenticated = !!authData?.user

      if (cachedId) {
        if (isAuthenticated) {
          const { data, error } = await supabase.from("assessments").select("*").eq("id", cachedId).single()

          if (data && !error) {
            const assessment = { ...data, evaluation_type: normalizeEvaluationType(data.evaluation_type) }
            this.cacheAssessment(assessment)
            return assessment
          }
        } else {
          const cachedAssessment = this.getCachedAssessment()
          if (cachedAssessment) {
            return cachedAssessment
          }
        }
      }

      return await this.createAssessment(evaluationType)
    } catch (error) {
      console.error("[v0] Error in getOrCreateAssessment:", error)
      throw error
    }
  }

  async createAssessment(evaluationType: EvaluationType): Promise<Assessment> {
    try {
      console.log("[v0] createAssessment called with type:", evaluationType)

      const supabase = this.getSupabase()
      const { data: authData, error: authError } = await supabase.auth.getUser()

      console.log("[v0] Auth check:", { hasUser: !!authData?.user, authError })

      if (authError || !authData?.user) {
        console.log("[v0] No user logged in, creating demo assessment in localStorage")
        return this.createDemoAssessment(evaluationType)
      }

      const user = authData.user

      const title = `${evaluationType} - ${new Date().toLocaleDateString()}`

      console.log("[v0] Inserting assessment into Supabase:", { title, evaluationType })

      const { data, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          evaluation_type: evaluationType,
          status: "draft",
          client_name: title,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Supabase insert error:", error)
        throw error
      }

      if (!data) {
        throw new Error("No data returned from Supabase")
      }

      console.log("[v0] Assessment created successfully:", data.id)

      const assessment = { ...data, evaluation_type: normalizeEvaluationType(data.evaluation_type) }

      this.setCachedAssessmentId(assessment.id)
      this.cacheAssessment(assessment)
      safeSetString(STORAGE_KEYS.EVALUATION_TYPE, evaluationType)

      await this.migrateFromLocalStorageToSupabase(assessment.id)

      return assessment
    } catch (error) {
      console.error("[v0] Error creating assessment:", error)
      throw error
    }
  }

  private createDemoAssessment(evaluationType: EvaluationType): Assessment {
    console.log("[v0] Creating demo assessment...")

    const id = `demo-${Date.now()}`
    const title = `${evaluationType} - ${new Date().toLocaleDateString()}`

    const demoAssessment: Assessment = {
      id,
      user_id: "demo",
      evaluation_type: evaluationType,
      status: "draft",
      client_name: title,
      title: title,
      data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Demo assessment created successfully:", demoAssessment.id)

    this.setCachedAssessmentId(id)
    this.cacheAssessment(demoAssessment)
    safeSetString(STORAGE_KEYS.EVALUATION_TYPE, evaluationType)
    this.addToDemoAssessmentsList(demoAssessment)

    return demoAssessment
  }

  async saveStep(assessmentId: string, stepKey: AssessmentStepKey, stepData: any): Promise<void> {
    try {
      if (assessmentId.startsWith("demo-")) {
        this.saveDemoStep(assessmentId, stepKey, stepData)
        return
      }

      const supabase = this.getSupabase()

      // Upsert into assessment_data table
      const { error } = await supabase.from("assessment_data").upsert(
        {
          assessment_id: assessmentId,
          step_key: stepKey,
          data: stepData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "assessment_id,step_key",
        },
      )

      if (error) {
        console.error("[v0] Error saving step:", error)
        throw error
      }

      // Update cache
      this.cacheStepData(stepKey, stepData)
    } catch (error) {
      console.error("[v0] Error in saveStep:", error)
      throw error
    }
  }

  private saveDemoStep(assessmentId: string, stepKey: AssessmentStepKey, stepData: any): void {
    this.cacheStepData(stepKey, stepData)

    const list: Assessment[] = safeGetItem("aria_demo_assessments", [])
    const assessment = list.find((a) => a.id === assessmentId)

    if (assessment) {
      if (!assessment.data) assessment.data = {}
      assessment.data[stepKey] = stepData
      assessment.updated_at = new Date().toISOString()
      safeSetItem("aria_demo_assessments", list)
    }
  }

  async getStepData(assessmentId: string, stepKey: AssessmentStepKey): Promise<any> {
    try {
      const cached = this.getCachedStepData(stepKey)
      if (cached) return cached

      if (assessmentId.startsWith("demo-")) {
        return this.getDemoStepData(assessmentId, stepKey)
      }

      const supabase = this.getSupabase()

      // Fetch from assessment_data table
      const { data, error } = await supabase
        .from("assessment_data")
        .select("data")
        .eq("assessment_id", assessmentId)
        .eq("step_key", stepKey)
        .single()

      if (error && error.code !== "PGRST116") {
        // Ignore "not found" error
        console.error("[v0] Error fetching step data:", error)
        throw error
      }

      const stepData = data?.data || {}
      this.cacheStepData(stepKey, stepData)

      return stepData
    } catch (error) {
      console.error("[v0] Error in getStepData:", error)
      return {}
    }
  }

  private getDemoStepData(assessmentId: string, stepKey: AssessmentStepKey): any {
    const list: Assessment[] = safeGetItem("aria_demo_assessments", [])
    const assessment = list.find((a) => a.id === assessmentId)

    return assessment?.data?.[stepKey] || {}
  }

  async listAssessments(): Promise<Assessment[]> {
    try {
      const supabase = this.getSupabase()
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user) {
        console.log("[v0] Demo mode: loading assessments from localStorage")
        return this.listDemoAssessments()
      }

      const { data, error } = await supabase.from("assessments").select("*").order("updated_at", { ascending: false })

      if (error) {
        console.error("[v0] Error listing assessments:", error)
        throw error
      }

      return (data || []).map((a) => ({ ...a, evaluation_type: normalizeEvaluationType(a.evaluation_type) }))
    } catch (error) {
      console.error("[v0] Error in listAssessments:", error)
      return []
    }
  }

  private listDemoAssessments(): Assessment[] {
    if (typeof window === "undefined") return []

    const list: Assessment[] = safeGetItem("aria_demo_assessments", [])
    return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  async updateStatus(assessmentId: string, status: Assessment["status"]): Promise<void> {
    try {
      if (assessmentId.startsWith("demo-")) {
        this.updateDemoStatus(assessmentId, status)
        return
      }

      const supabase = this.getSupabase()
      const { error } = await supabase.from("assessments").update({ status }).eq("id", assessmentId)

      if (error) {
        console.error("[v0] Error updating status:", error)
        throw error
      }
    } catch (error) {
      console.error("[v0] Error in updateStatus:", error)
      throw error
    }
  }

  private updateDemoStatus(assessmentId: string, status: Assessment["status"]): void {
    const list: Assessment[] = safeGetItem("aria_demo_assessments", [])
    const assessment = list.find((a) => a.id === assessmentId)

    if (assessment) {
      assessment.status = status
      assessment.updated_at = new Date().toISOString()
      safeSetItem("aria_demo_assessments", list)
    }
  }

  // ========== PRIVATE: Cache Management ==========

  private getCachedAssessmentId(): string | null {
    if (typeof window === "undefined") return null
    return safeGetString(STORAGE_KEYS.ASSESSMENT_ID, null)
  }

  private setCachedAssessmentId(id: string): void {
    if (typeof window === "undefined") return
    safeSetString(STORAGE_KEYS.ASSESSMENT_ID, id)
  }

  private cacheAssessment(assessment: Assessment): void {
    if (typeof window === "undefined") return
    safeSetItem(`${STORAGE_KEYS.CACHE_PREFIX}assessment`, assessment)
  }

  private getCachedAssessment(): Assessment | null {
    if (typeof window === "undefined") return null
    return safeGetItem(`${STORAGE_KEYS.CACHE_PREFIX}assessment`, null)
  }

  private cacheStepData(stepKey: string, data: any): void {
    if (typeof window === "undefined") return
    safeSetItem(`${STORAGE_KEYS.CACHE_PREFIX}${stepKey}`, data)
  }

  private getCachedStepData(stepKey: string): any | null {
    if (typeof window === "undefined") return null
    return safeGetItem(`${STORAGE_KEYS.CACHE_PREFIX}${stepKey}`, null)
  }

  private addToDemoAssessmentsList(assessment: Assessment): void {
    const list: Assessment[] = safeGetItem("aria_demo_assessments", [])
    list.push(assessment)
    safeSetItem("aria_demo_assessments", list)
  }

  private async migrateFromLocalStorageToSupabase(assessmentId: string): Promise<void> {
    if (typeof window === "undefined") return

    const legacyKeys: Record<string, AssessmentStepKey> = {
      ariaClientInfo: "clientInfo",
      "aria-background-history": "backgroundHistory",
      "aria-assessment-data": "evaluation",
      "aria-domains": "domains",
      "aria-abc-observation": "abcObservation",
      "aria-risk-assessment": "riskAssessment",
      "aria-goals": "goals",
      "aria-service-plan": "servicePlan",
      aria_cpt_authorization: "cptAuthorization",
      aria_medical_necessity: "medicalNecessity",
    }

    const migrationPromises: Promise<any>[] = []

    Object.entries(legacyKeys).forEach(([oldKey, newKey]) => {
      const parsed = safeGetItem(oldKey, null)
      if (parsed) {
        migrationPromises.push(this.saveStep(assessmentId, newKey, parsed))
      }
    })

    if (migrationPromises.length > 0) {
      await Promise.all(migrationPromises)
      console.log("[v0] Migrated", migrationPromises.length, "steps from localStorage")
    }
  }
}

export const assessmentStorage = new AssessmentStorage()
