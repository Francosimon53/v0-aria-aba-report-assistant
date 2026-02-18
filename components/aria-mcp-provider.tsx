"use client"

import { useEffect } from "react"
import { initializeWebModelContext } from "@mcp-b/global"
import { useWebMCP, useWebMCPContext, useWebMCPResource } from "@mcp-b/react-webmcp"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"

// Initialize Web MCP once on mount
function WebMCPInit() {
  useEffect(() => {
    initializeWebModelContext()
  }, [])
  return null
}

// Expose current user profile as read-only context
function UserProfileContext() {
  useWebMCPContext(
    "aria_user_profile",
    "Get the current authenticated user's profile including subscription status, trial info, and NPI",
    () => {
      const supabase = createClient()
      return supabase.auth.getUser().then(({ data: { user } }: { data: { user: { id: string; email?: string } | null } }) => {
        if (!user) return { authenticated: false }
        return supabase
          .from("profiles")
          .select("id, email, full_name, subscription_status, trial_ends_at, trial_started_at, trial_used, stripe_customer_id, npi, created_at")
          .eq("id", user.id)
          .single()
          .then(({ data }: { data: Record<string, unknown> | null }) => ({
            authenticated: true,
            userId: user.id,
            email: user.email,
            ...data,
          }))
      })
    }
  )
  return null
}

// Tool: list assessments for the current user
function ListAssessmentsTool() {
  useWebMCP({
    name: "aria_list_assessments",
    description: "List all assessments for the current user, with status and evaluation type",
    outputSchema: {
      assessments: z.array(
        z.object({
          id: z.string(),
          title: z.string().nullable(),
          status: z.string().nullable(),
          evaluation_type: z.string().nullable(),
          created_at: z.string().nullable(),
          updated_at: z.string().nullable(),
        })
      ).describe("Array of assessment summaries"),
    },
    handler: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("assessments")
        .select("id, title, status, evaluation_type, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw new Error(error.message)
      return { assessments: data ?? [] }
    },
  })
  return null
}

// Tool: get a single assessment by ID (includes full data JSONB)
function GetAssessmentTool() {
  useWebMCP({
    name: "aria_get_assessment",
    description: "Get a specific assessment by ID, including full structured data (client info, observations, goals, etc.)",
    inputSchema: {
      assessmentId: z.string().uuid().describe("The assessment UUID"),
    },
    outputSchema: {
      id: z.string(),
      user_id: z.string(),
      title: z.string().nullable(),
      status: z.string().nullable(),
      evaluation_type: z.string().nullable(),
      data: z.any().describe("Full assessment JSONB data (client_info, assessment_data, abc_observations, goals, interventions, etc.)"),
      created_at: z.string().nullable(),
      updated_at: z.string().nullable(),
    },
    handler: async ({ assessmentId }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("assessments")
        .select("id, user_id, title, status, evaluation_type, data, created_at, updated_at")
        .eq("id", assessmentId)
        .eq("user_id", user.id)
        .single()

      if (error) throw new Error(error.message)
      if (!data) throw new Error("Assessment not found")
      return data
    },
  })
  return null
}

// Tool: get dashboard stats
function DashboardStatsTool() {
  useWebMCP({
    name: "aria_dashboard_stats",
    description: "Get summary statistics for the current user's dashboard: total assessments, completed, in progress, and estimated time saved",
    outputSchema: {
      totalAssessments: z.number(),
      completedReports: z.number(),
      inProgress: z.number(),
      drafts: z.number(),
      timeSavedMinutes: z.number().describe("Estimated minutes saved (45 min per assessment)"),
    },
    handler: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("assessments")
        .select("status")
        .eq("user_id", user.id)

      if (error) throw new Error(error.message)
      const assessments: { status: string | null }[] = data ?? []
      return {
        totalAssessments: assessments.length,
        completedReports: assessments.filter((a) => a.status === "complete").length,
        inProgress: assessments.filter((a) => a.status === "in_progress").length,
        drafts: assessments.filter((a) => a.status === "draft").length,
        timeSavedMinutes: assessments.length * 45,
      }
    },
  })
  return null
}

// Tool: update assessment status
function UpdateAssessmentStatusTool() {
  useWebMCP({
    name: "aria_update_assessment_status",
    description: "Update the status of an assessment (draft, in_progress, or complete)",
    inputSchema: {
      assessmentId: z.string().uuid().describe("The assessment UUID"),
      status: z.enum(["draft", "in_progress", "complete"]).describe("New status"),
    },
    outputSchema: {
      success: z.boolean(),
      id: z.string(),
      status: z.string(),
    },
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
    },
    handler: async ({ assessmentId, status }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("assessments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", assessmentId)
        .eq("user_id", user.id)

      if (error) throw new Error(error.message)
      return { success: true, id: assessmentId, status }
    },
  })
  return null
}

// Resource: user's assessment list as a browsable resource
function AssessmentsResource() {
  useWebMCPResource({
    uri: "aria://assessments",
    name: "User Assessments",
    description: "List of all assessments belonging to the current user",
    mimeType: "application/json",
    read: async (uri) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { contents: [{ uri: uri.href, text: JSON.stringify({ error: "Not authenticated" }) }] }
      }

      const { data, error } = await supabase
        .from("assessments")
        .select("id, title, status, evaluation_type, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(error ? { error: error.message } : { assessments: data ?? [] }),
        }],
      }
    },
  })
  return null
}

// Resource: individual assessment by ID
function AssessmentByIdResource() {
  useWebMCPResource({
    uri: "aria://assessments/{assessmentId}",
    name: "Assessment Detail",
    description: "Full assessment data by ID, including client info, observations, goals, and interventions",
    mimeType: "application/json",
    read: async (uri, params) => {
      const assessmentId = params?.assessmentId ?? ""
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { contents: [{ uri: uri.href, text: JSON.stringify({ error: "Not authenticated" }) }] }
      }

      const { data, error } = await supabase
        .from("assessments")
        .select("id, user_id, title, status, evaluation_type, data, created_at, updated_at")
        .eq("id", assessmentId)
        .eq("user_id", user.id)
        .single()

      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(error ? { error: error.message } : data),
        }],
      }
    },
  })
  return null
}

export function AriaMCPProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebMCPInit />
      <UserProfileContext />
      <ListAssessmentsTool />
      <GetAssessmentTool />
      <DashboardStatsTool />
      <UpdateAssessmentStatusTool />
      <AssessmentsResource />
      <AssessmentByIdResource />
      {children}
    </>
  )
}
