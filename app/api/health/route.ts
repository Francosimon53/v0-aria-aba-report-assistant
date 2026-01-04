import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "healthy" as "healthy" | "degraded" | "down",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      supabase: { status: "unknown", latencyMs: 0 },
      ai: { status: "unknown", latencyMs: 0 },
      storage: { status: "unknown", documentCount: 0 },
    },
  }

  // Check Supabase connection
  try {
    const start = Date.now()
    const supabase = await createClient()
    const { error } = await supabase.from("assessments").select("id").limit(1)
    checks.services.supabase = {
      status: error ? "error" : "healthy",
      latencyMs: Date.now() - start,
    }
  } catch (e) {
    checks.services.supabase = { status: "error", latencyMs: 0 }
  }

  // Check AI API (using Vercel AI Gateway)
  try {
    const start = Date.now()
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    checks.services.ai = {
      status: response.ok ? "healthy" : "error",
      latencyMs: Date.now() - start,
    }
  } catch (e) {
    checks.services.ai = { status: "error", latencyMs: 0 }
  }

  // Check storage/embeddings
  try {
    const supabase = await createClient()
    const { count, error } = await supabase.from("rag_embeddings").select("*", { count: "exact", head: true })

    checks.services.storage = {
      status: error ? "warning" : count && count > 0 ? "healthy" : "warning",
      documentCount: count || 0,
    }
  } catch (e) {
    // RAG table may not exist yet - this is OK
    checks.services.storage = { status: "warning", documentCount: 0 }
  }

  // Calculate overall status
  const statuses = Object.values(checks.services).map((s) => s.status)
  if (statuses.includes("error")) {
    checks.status = "degraded"
  }
  if (statuses.filter((s) => s === "error").length >= 2) {
    checks.status = "down"
  }

  return NextResponse.json(checks, {
    status: checks.status === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
