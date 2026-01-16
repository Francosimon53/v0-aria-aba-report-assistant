"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { SparklesIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/icons"
import Link from "next/link"
import confetti from "canvas-confetti"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      getCheckoutSession(sessionId)
        .then((data) => {
          setSession(data)
          setLoading(false)
          // Trigger confetti on successful load
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488] mx-auto mb-4" />
          <p className="text-gray-500">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ARIA</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-12 text-center">
          {/* Success icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0D9488] to-[#06B6D4] rounded-full mx-auto flex items-center justify-center">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-2xl">🎉</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Welcome to ARIA!</h1>

          <p className="text-xl text-gray-500 mb-8">
            Your subscription is now active. Your 7-day free trial has started.
          </p>

          {session && (
            <div className="bg-[#0D9488]/5 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium text-[#0D9488]">Active (Trial)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trial ends</span>
                  <span className="font-medium text-gray-900">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{session.customer_email || "N/A"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/assessment/new")}
              className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white text-lg font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300 group"
            >
              Start Your First Assessment
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-sm text-gray-500">
              Need help getting started?{" "}
              <a href="/help" className="text-[#0D9488] hover:underline">
                Check our Help Center
              </a>
            </p>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Create Assessment",
              description: "Start building your first ABA assessment report",
              icon: "📋",
            },
            {
              title: "Import Client Data",
              description: "Upload existing client information easily",
              icon: "📁",
            },
            {
              title: "Generate Reports",
              description: "Use AI to create comprehensive reports",
              icon: "✨",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D9488]/5 via-white to-[#06B6D4]/5">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D9488]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
