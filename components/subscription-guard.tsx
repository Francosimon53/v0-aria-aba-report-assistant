"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getSubscriptionStatus, type SubscriptionStatus } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"
import { TrialExpiredModal } from "@/components/trial-expired-modal"
import { Loader2 } from "lucide-react"

interface SubscriptionGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const subscriptionStatus = await getSubscriptionStatus(user.id)
        setStatus(subscriptionStatus)
      } catch (error) {
        console.error("Error checking subscription status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  // If trial expired and not paid, show expired modal and block content
  if (status?.isTrialExpired && !status?.isPaid) {
    return (
      <>
        <TrialExpiredModal forceOpen />
        {fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <p className="text-gray-500">Your trial has expired. Please upgrade to continue.</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
