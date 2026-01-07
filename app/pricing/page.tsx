"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PRODUCTS } from "@/lib/products"
import { CheckIcon, SparklesIcon, ArrowRightIcon, ShieldIcon } from "@/components/icons"

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectPlan = (productId: string) => {
    setSelectedPlan(productId)
    setIsLoading(true)
    router.push(`/checkout?plan=${productId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ARIA</span>
            </a>
            <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign in
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-full text-[#0D9488] text-sm font-medium mb-6">
            <SparklesIcon className="h-4 w-4" />
            50% off for early adopters
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Choose the plan that fits your practice. All plans include a 7-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className={`relative p-8 bg-white border-2 transition-all duration-300 hover:shadow-xl ${
                product.popular
                  ? "border-[#0D9488] shadow-lg shadow-teal-500/10"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-[#0D9488] to-[#0891B2] rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-500 text-sm">{product.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2">
                  {product.originalPriceInCents && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${(product.originalPriceInCents / 100).toFixed(0)}
                    </span>
                  )}
                  <span className="text-5xl font-bold text-gray-900">${(product.priceInCents / 100).toFixed(0)}</span>
                </div>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="h-3 w-3 text-[#0D9488]" />
                    </div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(product.id)}
                disabled={isLoading && selectedPlan === product.id}
                className={`w-full h-12 font-semibold transition-all duration-300 group ${
                  product.popular
                    ? "bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-lg shadow-teal-500/25 hover:shadow-xl"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {isLoading && selectedPlan === product.id ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Start free trial
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldIcon className="h-5 w-5 text-[#0D9488]" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldIcon className="h-5 w-5 text-[#0D9488]" />
              <span className="text-sm font-medium">SOC 2 Certified</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldIcon className="h-5 w-5 text-[#0D9488]" />
              <span className="text-sm font-medium">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
