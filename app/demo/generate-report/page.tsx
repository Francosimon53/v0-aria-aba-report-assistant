"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AIReportGenerator } from "@/components/ai-report-generator"
import { loadDemoData, clearDemoData } from "@/lib/load-demo-data"
import { SparklesIcon, ArrowLeftIcon, RocketIcon, XIcon, AlertTriangleIcon } from "lucide-react"

export default function DemoGenerateReportPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    // Load demo data when page mounts
    loadDemoData()
    setIsLoading(false)
  }, [])

  const handleExitDemo = () => {
    clearDemoData()
    router.push("/")
  }

  const handleStartTrial = () => {
    // Keep demo data loaded so they can continue after signup
    router.push("/register")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading demo data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-1.5">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold">Demo Mode</span>
              <span className="hidden sm:inline text-amber-100 ml-2">
                - Viewing sample data for Marcus Johnson (Age 7)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowExitConfirm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Exit Demo
            </Button>
            <Button
              size="sm"
              onClick={handleStartTrial}
              className="bg-white text-amber-600 hover:bg-amber-50 font-semibold shadow-md"
            >
              <RocketIcon className="h-4 w-4 mr-1" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 rounded-full p-3">
                  <AlertTriangleIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">Exit Demo Mode?</h3>
                  <p className="text-slate-600 mt-1">
                    This will clear all demo data. You can always start a new demo from the homepage.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleExitDemo} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                      Exit Demo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)} className="text-slate-600">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-1.5">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">ARIA</span>
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">DEMO</span>
              </div>
            </div>
            <Button
              onClick={handleStartTrial}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-500/25"
            >
              <RocketIcon className="h-4 w-4 mr-2" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 mb-6">
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 rounded-full p-2 mt-0.5">
                <SparklesIcon className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-teal-900">You're viewing the AI Report Generator</h3>
                <p className="text-teal-700 text-sm mt-1">
                  This demo shows how ARIA generates comprehensive, insurance-ready ABA assessment reports. Click
                  "Generate All Sections" to see AI create a complete 21-section report in minutes. All data is
                  pre-populated with a realistic sample case.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Generator Component */}
        <AIReportGenerator />
      </div>

      {/* Bottom CTA */}
      <div className="border-t bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to save hours on every assessment?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Join thousands of BCBAs who use ARIA to generate insurance-ready reports in minutes instead of hours.
              Start your free trial today.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="lg" onClick={() => router.push("/#pricing")}>
                View Pricing
              </Button>
              <Button
                size="lg"
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-500/25"
              >
                <RocketIcon className="h-5 w-5 mr-2" />
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
