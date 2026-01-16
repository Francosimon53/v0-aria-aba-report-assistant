import { createClient } from "@/lib/supabase/client"

export interface SubscriptionStatus {
  isActive: boolean
  isTrialActive: boolean
  isTrialExpired: boolean
  isPaid: boolean
  daysRemaining: number
  trialEndsAt: Date | null
  subscriptionStatus: string
  canAccess: boolean
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = createClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("trial_started_at, trial_ends_at, trial_used, subscription_status")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    return {
      isActive: false,
      isTrialActive: false,
      isTrialExpired: true,
      isPaid: false,
      daysRemaining: 0,
      trialEndsAt: null,
      subscriptionStatus: "unknown",
      canAccess: false,
    }
  }

  const now = new Date()
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const subscriptionStatus = profile.subscription_status || "trialing"

  // Check if user has an active paid subscription
  const isPaid = ["active", "paid", "subscribed"].includes(subscriptionStatus)

  // Check trial status
  const isTrialExpired = trialEndsAt ? now > trialEndsAt : false
  const isTrialActive = trialEndsAt ? now <= trialEndsAt && !isPaid : false

  // Calculate days remaining
  let daysRemaining = 0
  if (trialEndsAt && !isPaid) {
    const timeDiff = trialEndsAt.getTime() - now.getTime()
    daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
  }

  // User can access if trial is active OR they have a paid subscription
  const canAccess = isTrialActive || isPaid

  return {
    isActive: canAccess,
    isTrialActive,
    isTrialExpired: isTrialExpired && !isPaid,
    isPaid,
    daysRemaining,
    trialEndsAt,
    subscriptionStatus,
    canAccess,
  }
}

export function formatDaysRemaining(days: number): string {
  if (days === 0) return "Today"
  if (days === 1) return "1 day"
  return `${days} days`
}
