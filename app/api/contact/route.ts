import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, company, phone, subject, message } = await request.json()

    console.log("[v0] Contact form submission:", { name, email, subject })

    // Send email to admin
    await resend.emails.send({
      from: "ARIA Contact <onboarding@resend.dev>",
      to: "francosimon@hotmail.com",
      replyTo: email,
      subject: `[ARIA Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">New Contact Form Submission</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            <em>Reply directly to this email to respond to ${email}</em>
          </p>
        </div>
      `,
    })

    console.log("[v0] Contact form email sent successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
