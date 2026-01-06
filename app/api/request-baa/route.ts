import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] BAA Request received:", JSON.stringify(body, null, 2))

    const {
      organizationName,
      contactName,
      email,
      phone,
      organizationType,
      numberOfBcbas,
      message,
      authorized,
      authorizedSigner,
    } = body

    // Accept either field name
    const isAuthorized = authorizedSigner ?? authorized

    console.log("[v0] Parsed fields:", {
      organizationName,
      contactName,
      email,
      organizationType,
      isAuthorized,
    })

    // Validate required fields
    if (!organizationName || !contactName || !email || !organizationType || !isAuthorized) {
      const missingFields = []
      if (!organizationName) missingFields.push("organizationName")
      if (!contactName) missingFields.push("contactName")
      if (!email) missingFields.push("email")
      if (!organizationType) missingFields.push("organizationType")
      if (!isAuthorized) missingFields.push("authorized/authorizedSigner")

      console.log("[v0] Missing required fields:", missingFields)
      return NextResponse.json({ error: "Missing required fields", missingFields }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[v0] Invalid email format:", email)
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create Supabase client with service role for inserting data
    const supabaseUrl = process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.ARIA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Supabase URL configured:", !!supabaseUrl)
    console.log("[v0] Supabase Service Key configured:", !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Supabase environment variables not configured")
      // Still return success - we'll log the request
      console.log("[v0] BAA Request (not saved to DB):", body)
      return NextResponse.json({ success: true, stored: false, reason: "DB not configured" })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const insertData = {
      organization_name: organizationName,
      contact_name: contactName,
      email: email,
      phone: phone || null,
      organization_type: organizationType,
      number_of_bcbas: numberOfBcbas || null,
      message: message || null,
      authorized: isAuthorized,
      status: "pending",
    }

    console.log("[v0] Inserting to Supabase:", JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase.from("baa_requests").insert(insertData).select("id").single()

    if (error) {
      console.error("[v0] Supabase insert error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      // Log the request anyway but return error info
      return NextResponse.json(
        {
          success: false,
          stored: false,
          error: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0] BAA request saved successfully, id:", data?.id)
    return NextResponse.json({ success: true, stored: true, id: data?.id })
  } catch (error) {
    console.error("[v0] BAA request error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
