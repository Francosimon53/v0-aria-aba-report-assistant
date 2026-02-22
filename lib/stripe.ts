import "server-only"

import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable")
    }
    _stripe = new Stripe(stripeSecretKey)
  }
  return _stripe
}
