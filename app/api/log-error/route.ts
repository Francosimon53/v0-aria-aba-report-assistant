import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { type, details, timestamp } = await req.json()
    const supabase = await createClient()

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("error_logs").insert({
      error_type: type,
      details: details,
      user_id: user?.id || null,
      created_at: timestamp || new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Failed to log to Supabase:", error)
      // Still return success to not break the client - we'll log to console as fallback
      console.error(`[ERROR_LOG_FALLBACK] ${timestamp} - ${type}:`, JSON.stringify(details, null, 2))
      return NextResponse.json({ logged: true, storage: "console" })
    }

    return NextResponse.json({ logged: true, storage: "supabase" })
  } catch (error) {
    console.error("[v0] Error logging failed:", error)
    return NextResponse.json({ logged: false }, { status: 500 })
  }
}
