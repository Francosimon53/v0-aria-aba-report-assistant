export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  originalPriceInCents?: number
  features: string[]
  popular?: boolean
  stripePriceId: string
}

export const PRODUCTS: Product[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individual BCBAs",
    priceInCents: 4900, // $49/month
    originalPriceInCents: 9900,
    stripePriceId: "price_1Sa6qVAfewEJgiDX3CUpU7dP",
    features: ["Up to 10 assessments/month", "Basic report templates", "Email support", "Goal bank access"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing practices",
    priceInCents: 9900, // $99/month
    originalPriceInCents: 19900,
    stripePriceId: "price_1Sa6qkAfewEJgiDXSa8OKgES",
    features: [
      "Unlimited assessments",
      "All report templates",
      "Priority support",
      "Full goal bank",
      "Team collaboration",
      "Custom branding",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large agencies",
    priceInCents: 24900, // $249/month
    originalPriceInCents: 49900,
    stripePriceId: "price_1Sa6qyAfewEJgiDXpX8O3J3x",
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Training sessions",
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductByPriceId(priceId: string): Product | undefined {
  return PRODUCTS.find((p) => p.stripePriceId === priceId)
}
