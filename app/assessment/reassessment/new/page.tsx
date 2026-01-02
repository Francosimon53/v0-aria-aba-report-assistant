"use client"

import { ReassessmentDashboard } from "@/components/reassessment-dashboard"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "@/components/icons"

class AssessmentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Reassessment page error:", error)
    console.error("[v0] Error message:", error.message)
    console.error("[v0] Error stack:", error.stack)
    console.error("[v0] Component stack:", errorInfo?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-4 border border-orange-200">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangleIcon className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-sm text-gray-600">
              The reassessment page encountered an error. Your data has been auto-saved.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-50 rounded text-xs text-red-700 font-mono overflow-auto max-h-40">
                <p className="font-semibold mb-1">Error: {this.state.error.message}</p>
                <p className="text-red-500 whitespace-pre-wrap">{this.state.error.stack}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Reload Page
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")} className="flex-1">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function ReassessmentPage() {
  console.log("[v0] ReassessmentPage rendering")
  return (
    <AssessmentErrorBoundary>
      <ReassessmentDashboard />
    </AssessmentErrorBoundary>
  )
}
