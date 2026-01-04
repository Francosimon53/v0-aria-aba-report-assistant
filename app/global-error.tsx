"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We've been notified and are working on it. Your data has been auto-saved.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} className="bg-teal-600 hover:bg-teal-700">
                Try again
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
            {error.digest && <p className="text-xs text-gray-400 mt-4">Error ID: {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  )
}
