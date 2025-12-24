"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SparklesIcon, AlertCircleIcon, ArrowLeftIcon } from "@/components/icons"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "An authentication error occurred"

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-white border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ARIA</span>
          </div>

          {/* Error icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircleIcon className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-500 mb-6">{error}</p>

          <div className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full h-12 border-gray-200 bg-transparent">
                Go to Homepage
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            If this problem persists, please contact{" "}
            <a href="mailto:support@aria-aba.com" className="text-[#0D9488] hover:underline">
              support
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
