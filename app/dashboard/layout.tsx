import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AriaMCPProvider } from "@/components/aria-mcp-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at, subscription_status")
    .eq("id", user.id)
    .single()

  const now = new Date()
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const subscriptionStatus = profile?.subscription_status || "trialing"
  const isPaid = ["active", "paid", "subscribed"].includes(subscriptionStatus)
  const isTrialExpired = trialEndsAt ? now > trialEndsAt : false

  // If trial expired and not paid, allow access to dashboard but modal will block actions
  // This allows users to see their data and upgrade

  return (
    <AriaMCPProvider>
      {children}
    </AriaMCPProvider>
  )
}
