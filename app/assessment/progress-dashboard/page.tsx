import { Suspense } from "react"
import ProgressDashboardClient from "./ProgressDashboardClient"
import { Loader2 } from "lucide-react"

export default function ProgressDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProgressDashboardClient />
    </Suspense>
  )
}
