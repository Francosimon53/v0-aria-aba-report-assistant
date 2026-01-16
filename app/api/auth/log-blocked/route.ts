import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, npi, reason } = await request.json()

    const supabase = await createClient()

    // Get IP address from headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown"

    await supabase.from("blocked_signups").insert({
      email,
      npi,
      reason,
      ip_address: ipAddress,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Log blocked error:", error)
    return NextResponse.json({ success: false })
  }
}
