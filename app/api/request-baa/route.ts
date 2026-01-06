import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

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

    // Validate required fields
    if (!organizationName || !contactName || !email || !organizationType || !isAuthorized) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create Supabase client with service role for inserting data
    const supabaseUrl = process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.ARIA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase environment variables not configured")
      // Still return success - we'll log the request
      console.log("BAA Request (not saved to DB):", body)
      return NextResponse.json({ success: true, stored: false })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from("baa_requests")
      .insert({
        organization_name: organizationName,
        contact_name: contactName,
        email: email,
        phone: phone || null,
        organization_type: organizationType,
        number_of_bcbas: numberOfBcbas || null,
        message: message || null,
        authorized_signer: isAuthorized,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error inserting BAA request:", error)
      // Log the request anyway
      console.log("BAA Request (DB error, logged):", body)
      return NextResponse.json({ success: true, stored: false })
    }

    return NextResponse.json({ success: true, stored: true, id: data?.id })
  } catch (error) {
    console.error("BAA request error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
