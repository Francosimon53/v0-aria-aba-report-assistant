"use client"

import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ClientForm } from "@/components/client-form"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import type { ClientData } from "@/lib/types"
import { assessmentStorage } from "@/lib/assessment-storage"
import { useToast } from "@/hooks/use-toast"
import { useAssessmentSession } from "@/components/assessment/AssessmentSessionProvider"
import { safeGetItem, safeSetItem } from "@/lib/safe-storage"
import { withAid } from "@/lib/navigation-helpers"
import { normalizeEvaluationType } from "@/lib/evaluation-type"
import { getAssessmentId, isValidAssessmentId } from "@/lib/assessment-id-resolver"

export const dynamic = "force-dynamic"

function ClientInfoPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { assessmentId, evaluationType, setEvaluationType } = useAssessmentSession()
  const [isClient, setIsClient] = useState(false)
  const [clientData, setClientData] = useState<ClientData | null>(null)

  useEffect(() => {
    setIsClient(true)

    const { id: resolvedId, source } = getAssessmentId(searchParams)

    // Guard rail: If no valid ID found, redirect to assessments page
    if (!resolvedId || !isValidAssessmentId(resolvedId)) {
      console.log("[v0] No valid assessment ID found, redirecting to assessments page")
      router.replace("/assessments")
      return
    }

    // Guard rail: If ID came from storage but not in URL, add it to URL
    if (source === "storage") {
      console.log("[v0] Assessment ID from storage, updating URL:", resolvedId)
      router.replace(withAid("/assessment/client-info", resolvedId))
      return
    }

    loadClientData()
  }, [])

  const loadClientData = async () => {
    try {
      if (!assessmentId) {
        console.log("[v0] No assessment ID available yet")
        return
      }

      // Load client info data
      const stepData = await assessmentStorage.getStepData(assessmentId, "clientInfo")

      // Also check legacy localStorage for backwards compatibility
      const parsedLegacy = safeGetItem("ariaClientInfo", null)

      const data = stepData || parsedLegacy || null

      if (data?.assessmentType) {
        const normalized = normalizeEvaluationType(data.assessmentType)
        setEvaluationType(normalized)
        // Update the data object with normalized value
        data.assessmentType = normalized
      }

      setClientData(data)
    } catch (error) {
      console.error("[v0] Failed to load client data:", error)
      toast({
        title: "Error",
        description: "Failed to load client information",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (data: ClientData) => {
    try {
      if (!assessmentId) {
        throw new Error("No assessment ID available")
      }

      const normalizedData = {
        ...data,
        assessmentType: normalizeEvaluationType(data.assessmentType),
      }

      // Save to Supabase
      await assessmentStorage.saveStep(assessmentId, "clientInfo", normalizedData)

      // Also save to legacy localStorage for backwards compatibility
      safeSetItem("ariaClientInfo", normalizedData)

      setClientData(normalizedData)
    } catch (error) {
      console.error("[v0] Failed to save client data:", error)
      toast({
        title: "Error",
        description: "Failed to save client information",
        variant: "destructive",
      })
    }
  }

  const handleNext = () => {
    router.push(withAid("/assessment/background-history", assessmentId))
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssessmentSidebar />
      <div className="flex-1">
        <ClientForm clientData={clientData} initialData={clientData} onSave={handleSave} onNext={handleNext} />
      </div>
    </div>
  )
}

export default function ClientInfoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <ClientInfoPageContent />
    </Suspense>
  )
}
