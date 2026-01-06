import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] BAA request received:", JSON.stringify(body, null, 2))

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
      console.log("[v0] BAA Request (not saved to DB - missing env vars):", body)
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

    console.log("[v0] Inserting BAA request:", insertData)

    const { data, error } = await supabase.from("baa_requests").insert(insertData).select("id").single()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ success: false, stored: false, error: error.message }, { status: 500 })
    }

    console.log("[v0] BAA request saved with id:", data?.id)

    try {
      // Notify admin
      const adminEmailResult = await resend.emails.send({
        from: "ARIA <onboarding@resend.dev>",
        to: "francosimon@hotmail.com",
        subject: `Nueva solicitud BAA: ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Nueva Solicitud de BAA</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Organizacion:</strong> ${organizationName}</p>
              <p><strong>Tipo:</strong> ${organizationType}</p>
              <p><strong>Contacto:</strong> ${contactName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Telefono:</strong> ${phone || "No proporcionado"}</p>
              <p><strong>Numero de BCBAs:</strong> ${numberOfBcbas || "No especificado"}</p>
              ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ""}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Accede al panel admin de ARIA para procesar esta solicitud.
            </p>
          </div>
        `,
      })
      console.log("[v0] Admin notification email sent:", adminEmailResult)
    } catch (emailError) {
      console.error("[v0] Error sending admin email:", emailError)
    }

    // Send confirmation to requester
    try {
      const confirmEmailResult = await resend.emails.send({
        from: "ARIA <onboarding@resend.dev>",
        to: email,
        subject: "Solicitud de BAA Recibida - ARIA",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Hemos recibido tu solicitud</h2>
            <p>Hola ${contactName},</p>
            <p>Gracias por solicitar un Business Associate Agreement (BAA) con ARIA.</p>
            <p>Nuestro equipo revisara tu solicitud y te contactaremos dentro de las proximas 24-48 horas habiles.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Organizacion:</strong> ${organizationName}</p>
              <p><strong>Tipo:</strong> ${organizationType}</p>
            </div>
            <p>Si tienes alguna pregunta, responde a este email.</p>
            <p>Saludos,<br/>El equipo de ARIA</p>
          </div>
        `,
      })
      console.log("[v0] Confirmation email sent to:", email, confirmEmailResult)
    } catch (emailError) {
      console.error("[v0] Error sending confirmation email:", emailError)
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
