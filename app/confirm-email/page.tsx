"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ConfirmEmailPage() {
  const [isResending, setIsResending] = useState(false)

  const resendEmail = async () => {
    setIsResending(true)
    const supabase = createClient()
    const email = localStorage.getItem("pendingEmail") || ""

    if (!email) {
      toast.error("No email found. Please register again.")
      setIsResending(false)
      return
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    })

    if (error) {
      toast.error("Failed to resend email. Please try again.")
    } else {
      toast.success("Confirmation email sent! Check your inbox.")
    }

    setIsResending(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-600">
            We've sent a confirmation link to your email address. Please click the link to verify your account and start
            using ARIA.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Don't see the email?</strong> Check your spam folder or click below to resend.
            </p>
          </div>

          <Button onClick={resendEmail} variant="outline" className="w-full bg-transparent" disabled={isResending}>
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend confirmation email
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <Link href="/login" className="text-sm text-gray-500 hover:text-teal-600 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
