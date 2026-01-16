"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Checkout from "@/components/checkout"
import { PRODUCTS } from "@/lib/products"
import { SparklesIcon, ArrowLeftIcon, ShieldIcon, CheckIcon } from "@/components/icons"
import Link from "next/link"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "professional"
  const product = PRODUCTS.find((p) => p.id === planId) || PRODUCTS[1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/pricing"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to pricing</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ARIA</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order summary */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete your order</h1>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{product.name} Plan</h3>
                  <p className="text-gray-500 text-sm">{product.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">${(product.priceInCents / 100).toFixed(0)}</div>
                  <div className="text-gray-500 text-sm">/month</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <ul className="space-y-2">
                  {product.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckIcon className="h-4 w-4 text-[#0D9488]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-teal-50 rounded-2xl border border-teal-100 p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#0D9488]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldIcon className="h-5 w-5 text-[#0D9488]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">7-day free trial included</h4>
                  <p className="text-sm text-gray-600">
                    You won't be charged until your trial ends. Cancel anytime during the trial period.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe checkout */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Payment details</h2>
            <Checkout productId={planId} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488]" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
