"use client"

import { Dashboard } from "@/components/dashboard"
import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "@/components/icons"

class AssessmentErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    console.error("[v0] Error boundary caught error:", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Assessment page error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 space-y-4 border border-border">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangleIcon className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              The assessment page encountered an error. Your data has been auto-saved and will be restored when you
              reload.
            </p>
            {this.state.error && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Error:</strong> {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="flex-1"
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

export default function AssessmentPage() {
  return (
    <AssessmentErrorBoundary>
      <Dashboard />
    </AssessmentErrorBoundary>
  )
}
