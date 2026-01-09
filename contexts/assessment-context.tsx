"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AssessmentData {
  id?: string
  user_id?: string
  // Client Info
  client_first_name: string
  client_last_name: string
  date_of_birth: string
  age: number | null
  gender: string
  address: string
  // Provider Info
  provider_name: string
  phone_number: string
  fax_number: string
  email: string
  npi: string
  // Insurance
  insurance_provider: string
  policy_number: string
  authorization_number: string
  // Diagnosis
  primary_diagnosis: string
  icd10_code: string
  secondary_diagnoses: string[]
  // Background & History
  background_history: any
  daily_schedule: any[]
  // Reason for Referral
  reason_for_referral: string
  family_goals: string
  // Assessment Data
  standardized_assessments: any[]
  assessment_data: any
  // ABC Observations
  abc_observations: any[]
  // Risk Assessment
  risk_assessment: any
  // Goals & Interventions
  selected_goals: any[]
  selected_interventions: any[]
  // Service Plan
  service_plan: any
  // Medical Necessity
  medical_necessity: any
  // Report
  report_sections: any[]
  report_generated: boolean
  // Meta
  status: "draft" | "in_progress" | "complete"
  progress: number
  created_at?: string
  updated_at?: string
}

const DEFAULT_ASSESSMENT: AssessmentData = {
  client_first_name: "",
  client_last_name: "",
  date_of_birth: "",
  age: null,
  gender: "",
  address: "",
  provider_name: "",
  phone_number: "",
  fax_number: "",
  email: "",
  npi: "",
  insurance_provider: "",
  policy_number: "",
  authorization_number: "",
  primary_diagnosis: "",
  icd10_code: "",
  secondary_diagnoses: [],
  background_history: {},
  daily_schedule: [],
  reason_for_referral: "",
  family_goals: "",
  standardized_assessments: [],
  assessment_data: {},
  abc_observations: [],
  risk_assessment: {},
  selected_goals: [],
  selected_interventions: [],
  service_plan: {},
  medical_necessity: {},
  report_sections: [],
  report_generated: false,
  status: "draft",
  progress: 0,
}

interface AssessmentContextType {
  assessment: AssessmentData
  assessmentId: string | null
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved: Date | null
  // Actions
  updateField: (field: keyof AssessmentData, value: any) => void
  updateMultipleFields: (fields: Partial<AssessmentData>) => void
  saveAssessment: () => Promise<void>
  loadAssessment: (id: string) => Promise<void>
  createNewAssessment: () => Promise<string | null>
  calculateProgress: () => number
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [assessment, setAssessment] = useState<AssessmentData>(DEFAULT_ASSESSMENT)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Load assessment on mount if ID exists in URL
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      loadAssessment(id)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  // Auto-save every 60 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || !assessmentId) return

    const timer = setTimeout(() => {
      console.log("[v0] Auto-saving assessment...")
      saveAssessment()
    }, 60000)

    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, assessmentId])

  const loadAssessment = useCallback(
    async (id: string) => {
      console.log("[v0] Loading assessment:", id)
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("assessments").select("*").eq("id", id).single()

        if (error) throw error

        if (data) {
          setAssessment({
            ...DEFAULT_ASSESSMENT,
            ...data,
            // Parse JSON fields if they're strings
            background_history:
              typeof data.background_history === "string"
                ? JSON.parse(data.background_history)
                : data.background_history || {},
            daily_schedule:
              typeof data.daily_schedule === "string" ? JSON.parse(data.daily_schedule) : data.daily_schedule || [],
            standardized_assessments:
              typeof data.standardized_assessments === "string"
                ? JSON.parse(data.standardized_assessments)
                : data.standardized_assessments || [],
            abc_observations:
              typeof data.abc_observations === "string"
                ? JSON.parse(data.abc_observations)
                : data.abc_observations || [],
            selected_goals:
              typeof data.selected_goals === "string" ? JSON.parse(data.selected_goals) : data.selected_goals || [],
            selected_interventions:
              typeof data.selected_interventions === "string"
                ? JSON.parse(data.selected_interventions)
                : data.selected_interventions || [],
            report_sections:
              typeof data.report_sections === "string" ? JSON.parse(data.report_sections) : data.report_sections || [],
            secondary_diagnoses:
              typeof data.secondary_diagnoses === "string"
                ? JSON.parse(data.secondary_diagnoses)
                : data.secondary_diagnoses || [],
          })
          setAssessmentId(id)
          setHasUnsavedChanges(false)
          console.log("[v0] Assessment loaded successfully")
        }
      } catch (error) {
        console.error("[v0] Error loading assessment:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, toast],
  )

  const createNewAssessment = useCallback(async (): Promise<string | null> => {
    console.log("[v0] Creating new assessment...")
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return null
      }

      const { data, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          status: "draft",
          progress: 0,
        })
        .select()
        .single()

      if (error) throw error

      setAssessmentId(data.id)
      setAssessment({ ...DEFAULT_ASSESSMENT, id: data.id, user_id: user.id })

      // Update URL with new assessment ID
      const currentPath = window.location.pathname
      router.push(`${currentPath}?id=${data.id}`)

      console.log("[v0] Created new assessment:", data.id)
      return data.id
    } catch (error) {
      console.error("[v0] Error creating assessment:", error)
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      })
      return null
    }
  }, [supabase, router, toast])

  const saveAssessment = useCallback(async () => {
    if (!assessmentId) {
      console.log("[v0] No assessment ID, creating new assessment...")
      const newId = await createNewAssessment()
      if (!newId) return
    }

    console.log("[v0] Saving assessment:", assessmentId)
    setIsSaving(true)
    try {
      const progress = calculateProgress()

      const { error } = await supabase
        .from("assessments")
        .update({
          ...assessment,
          progress,
          status: progress === 100 ? "complete" : assessment.progress > 0 ? "in_progress" : "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      if (error) throw error

      setHasUnsavedChanges(false)
      setLastSaved(new Date())

      toast({
        title: "Saved",
        description: "Assessment saved successfully",
      })

      console.log("[v0] Assessment saved successfully")
    } catch (error) {
      console.error("[v0] Error saving assessment:", error)
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [assessmentId, assessment, supabase, toast, createNewAssessment])

  const updateField = useCallback((field: keyof AssessmentData, value: any) => {
    console.log("[v0] Updating field:", field)
    setAssessment((prev) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }, [])

  const updateMultipleFields = useCallback((fields: Partial<AssessmentData>) => {
    console.log("[v0] Updating multiple fields:", Object.keys(fields))
    setAssessment((prev) => ({ ...prev, ...fields }))
    setHasUnsavedChanges(true)
  }, [])

  const calculateProgress = useCallback(() => {
    const sections = [
      { complete: !!(assessment.client_first_name && assessment.client_last_name) },
      { complete: !!assessment.date_of_birth },
      { complete: !!assessment.provider_name },
      { complete: !!assessment.primary_diagnosis },
      { complete: Object.keys(assessment.background_history || {}).length > 0 },
      { complete: !!assessment.reason_for_referral },
      { complete: (assessment.standardized_assessments?.length || 0) > 0 },
      { complete: (assessment.abc_observations?.length || 0) > 0 },
      { complete: Object.keys(assessment.risk_assessment || {}).length > 0 },
      { complete: (assessment.selected_goals?.length || 0) > 0 },
      { complete: (assessment.selected_interventions?.length || 0) > 0 },
      { complete: Object.keys(assessment.service_plan || {}).length > 0 },
      { complete: assessment.report_generated },
    ]

    const completed = sections.filter((s) => s.complete).length
    return Math.round((completed / sections.length) * 100)
  }, [assessment])

  return (
    <AssessmentContext.Provider
      value={{
        assessment,
        assessmentId,
        isLoading,
        isSaving,
        hasUnsavedChanges,
        lastSaved,
        updateField,
        updateMultipleFields,
        saveAssessment,
        loadAssessment,
        createNewAssessment,
        calculateProgress,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error("useAssessment must be used within AssessmentProvider")
  }
  return context
}
