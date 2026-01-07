"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Clock, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSubscriptionStatus, formatDaysRemaining, type SubscriptionStatus } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"

export function TrialBanner() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const subscriptionStatus = await getSubscriptionStatus(user.id)
          setStatus(subscriptionStatus)
        }
      } catch (error) {
        console.error("Error checking subscription status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  // Don't show banner if loading, dismissed, paid user, or no status
  if (loading || dismissed || !status || status.isPaid) {
    return null
  }

  // Trial expired - show urgent banner
  if (status.isTrialExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Your free trial has ended</p>
              <p className="text-sm text-red-100">Subscribe now to continue using ARIA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button className="bg-white text-red-600 hover:bg-red-50 font-semibold shadow-md">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Trial active - show countdown banner
  if (status.isTrialActive && status.daysRemaining <= 3) {
    const isUrgent = status.daysRemaining <= 1

    return (
      <div
        className={`${isUrgent ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-teal-600 to-cyan-600"} text-white px-4 py-2.5`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4" />
            <p className="text-sm font-medium">
              {isUrgent ? (
                <>Trial ends {status.daysRemaining === 0 ? "today" : "tomorrow"}! Upgrade to keep your data.</>
              ) : (
                <>{formatDaysRemaining(status.daysRemaining)} left in your free trial</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                View Plans
              </Button>
            </Link>
            <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
