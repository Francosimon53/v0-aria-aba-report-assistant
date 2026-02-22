"use server"

import { getStripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const session = await getStripe().checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "if_required",
    return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 7,
    },
  })

  return session.client_secret
}

export async function getCheckoutSession(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  })
  return session
}
