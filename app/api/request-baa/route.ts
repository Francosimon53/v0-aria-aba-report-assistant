import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
      const missingFields = []
      if (!organizationName) missingFields.push("organizationName")
      if (!contactName) missingFields.push("contactName")
      if (!email) missingFields.push("email")
      if (!organizationType) missingFields.push("organizationType")
      if (!isAuthorized) missingFields.push("authorized/authorizedSigner")

      return NextResponse.json({ error: "Missing required fields", missingFields }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.ARIA_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
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

    const { data, error } = await supabase.from("baa_requests").insert(insertData).select("id").single()

    if (error) {
      console.error("[v0] Supabase insert error:", error.message)
      return NextResponse.json({ success: false, stored: false, error: error.message }, { status: 500 })
    }

    if (resend) {
      try {
        // Notify admin
        await resend.emails.send({
          from: "ARIA <notifications@ariaba.app>",
          to: "simon@ariaba.app",
          subject: `New BAA Request: ${organizationName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">New BAA Request</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Organization:</strong> ${organizationName}</p>
                <p><strong>Type:</strong> ${organizationType}</p>
                <p><strong>Contact:</strong> ${contactName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
                <p><strong>Number of BCBAs:</strong> ${numberOfBcbas || "Not specified"}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Review this request at <a href="https://ariaba.app/admin/baa">ARIA Admin Panel</a>
              </p>
            </div>
          `,
        })

        // Send confirmation to requester
        await resend.emails.send({
          from: "ARIA <notifications@ariaba.app>",
          to: email,
          subject: "BAA Request Received - ARIA",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">We've Received Your Request</h2>
              <p>Hello ${contactName},</p>
              <p>Thank you for requesting a Business Associate Agreement (BAA) with ARIA.</p>
              <p>Our team will review your request and contact you within 24-48 business hours.</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Organization:</strong> ${organizationName}</p>
                <p><strong>Type:</strong> ${organizationType}</p>
              </div>
              <p>If you have any questions, please reply to this email.</p>
              <p>Best regards,<br/>The ARIA Team</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("[v0] Failed to send email notifications:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, stored: true, id: data?.id })
  } catch (error) {
    console.error("[v0] BAA request error:", error)
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
