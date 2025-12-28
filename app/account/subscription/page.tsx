"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeftIcon,
  CreditCardIcon,
  CheckIcon,
  AlertTriangleIcon,
  LoaderIcon,
  CalendarIcon,
  RefreshCwIcon,
} from "@/components/icons"
import { getCustomerSubscriptions, cancelSubscription } from "@/app/actions/stripe"
import { createBrowserClient } from "@supabase/ssr"

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        // if (!user?.email) {
        //   router.push("/login")
        //   return
        // }

        // Use test email if no user logged in
        const email = user?.email || "test@example.com"
        setUserEmail(email)

        try {
          const result = await getCustomerSubscriptions(email)
          setSubscriptions(result.subscriptions)
        } catch (err) {
          // Silently handle if no subscriptions found
          setSubscriptions([])
        }
      } catch (err) {
        console.error("Error loading subscriptions:", err)
        setError("Failed to load subscription information")
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [router, supabase.auth])

  const handleCancelSubscription = async (subscriptionId: string) => {
    setCancelling(true)
    setError(null)

    try {
      const result = await cancelSubscription(subscriptionId)

      if (result.success) {
        setSuccessMessage("Your subscription has been cancelled successfully.")
        // Refresh subscriptions
        if (userEmail) {
          const updated = await getCustomerSubscriptions(userEmail)
          setSubscriptions(updated.subscriptions)
        }
      } else {
        setError(result.error || "Failed to cancel subscription")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case "canceled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case "past_due":
        return <Badge className="bg-red-100 text-red-800">Past Due</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-teal-600">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span>Loading subscription...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600">Manage your ARIA subscription and billing</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckIcon className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* No Subscriptions */}
        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-6">
                You don't have an active subscription. Subscribe to ARIA to unlock all features.
              </p>
              <Button onClick={() => router.push("/pricing")} className="bg-teal-600 hover:bg-teal-700">
                View Plans
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Subscription Cards */
          <div className="space-y-6">
            {subscriptions.map((sub) => {
              const product = sub.items?.data?.[0]?.price?.product
              const price = sub.items?.data?.[0]?.price

              return (
                <Card key={sub.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {typeof product === "object" ? product.name : "ARIA Subscription"}
                        </CardTitle>
                        <CardDescription className="text-teal-100">
                          {typeof product === "object" ? product.description : ""}
                        </CardDescription>
                      </div>
                      {getStatusBadge(sub.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Billing Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Billing Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount</span>
                            <span className="font-medium">
                              ${(price?.unit_amount || 0) / 100}/{price?.recurring?.interval || "month"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Started</span>
                            <span className="font-medium">{formatDate(sub.created)}</span>
                          </div>
                          {sub.current_period_end && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {sub.cancel_at_period_end ? "Ends on" : "Next billing"}
                              </span>
                              <span className="font-medium">{formatDate(sub.current_period_end)}</span>
                            </div>
                          )}
                          {sub.trial_end && sub.status === "trialing" && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Trial ends</span>
                              <span className="font-medium text-blue-600">{formatDate(sub.trial_end)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Included Features</h4>
                        <ul className="space-y-2 text-sm">
                          {["Unlimited Reports", "AI Assistant", "Priority Support", "Team Collaboration"].map(
                            (feature) => (
                              <li key={feature} className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-teal-600" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                      {sub.status === "active" || sub.status === "trialing" ? (
                        <>
                          {sub.cancel_at_period_end ? (
                            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                              <CalendarIcon className="h-4 w-4" />
                              <span className="text-sm">
                                Subscription will end on {formatDate(sub.current_period_end)}
                              </span>
                            </div>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={cancelling}>
                                  {cancelling ? (
                                    <>
                                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                                      Cancelling...
                                    </>
                                  ) : (
                                    "Cancel Subscription"
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your subscription? You'll continue to have access
                                    until {formatDate(sub.current_period_end)}, after which your account will be
                                    downgraded.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelSubscription(sub.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <Button variant="outline" onClick={() => router.push("/pricing")}>
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Change Plan
                          </Button>
                        </>
                      ) : sub.status === "canceled" ? (
                        <Button onClick={() => router.push("/pricing")} className="bg-teal-600 hover:bg-teal-700">
                          Resubscribe
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-teal-100">
                <AlertTriangleIcon className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you have questions about your subscription or billing, our support team is here to help.
                </p>
                <Button variant="link" className="p-0 h-auto text-teal-600" onClick={() => router.push("/support")}>
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
