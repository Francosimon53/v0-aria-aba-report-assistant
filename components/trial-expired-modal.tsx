"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Sparkles, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getSubscriptionStatus, type SubscriptionStatus } from "@/lib/subscription"
import { createClient } from "@/lib/supabase/client"

interface TrialExpiredModalProps {
  forceOpen?: boolean
}

export function TrialExpiredModal({ forceOpen = false }: TrialExpiredModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)

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

          // Open modal if trial is expired and user is not paid
          if (subscriptionStatus.isTrialExpired && !subscriptionStatus.isPaid) {
            setOpen(true)
          }
        }
      } catch (error) {
        console.error("Error checking subscription status:", error)
      }
    }

    checkStatus()
  }, [])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
    }
  }, [forceOpen])

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!status?.isTrialExpired || status?.isPaid) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">Your Trial Has Ended</DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Your 7-day free trial has expired. Subscribe to continue using ARIA and access all your saved assessments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* What you get */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900 mb-3">With ARIA Pro you get:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                Unlimited AI-powered assessments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                Export to PDF and DOCX
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                Insurance-compliant reports
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                HIPAA-compliant data storage
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Pro - $99/month
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent">
              Sign Out
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            Questions? Contact{" "}
            <a href="mailto:support@ariaba.app" className="text-teal-600 hover:underline">
              support@ariaba.app
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
