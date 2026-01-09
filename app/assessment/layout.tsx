import type React from "react"
import { AssessmentProvider } from "@/contexts/assessment-context"
import { Suspense } from "react"

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessmentProvider>{children}</AssessmentProvider>
    </Suspense>
  )
}
