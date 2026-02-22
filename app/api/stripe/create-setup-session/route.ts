import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: "Missing email or userId" }, { status: 400 })
    }

    // Create or get Stripe customer
    const customers = await getStripe().customers.list({ email, limit: 1 })
    let customer = customers.data[0]

    if (!customer) {
      customer = await getStripe().customers.create({
        email,
        metadata: { userId },
      })
    }

    // Save Stripe customer ID to profile
    const supabase = await createClient()
    await supabase.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId)

    // Calculate trial end date (7 days from now)
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Create setup session (captures card without charging)
    const session = await getStripe().checkout.sessions.create({
      customer: customer.id,
      mode: "setup",
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?setup=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?setup=canceled`,
      metadata: {
        userId,
        trial_end: trialEnd.toISOString(),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe setup error:", error)
    return NextResponse.json({ error: "Failed to create setup session" }, { status: 500 })
  }
}
