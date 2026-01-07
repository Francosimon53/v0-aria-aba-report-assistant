"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, TrendingUp, Users, CreditCard, ArrowUpRight, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface RevenueStats {
  mrr: number
  mrrChange: number
  totalRevenue: number
  activeSubscriptions: number
  trialConversions: number
  churnRate: number
}

interface SubscriptionByPlan {
  plan: string
  count: number
  revenue: number
}

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats>({
    mrr: 0,
    mrrChange: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    trialConversions: 0,
    churnRate: 0,
  })
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number; subscriptions: number }[]>([])
  const [planBreakdown, setPlanBreakdown] = useState<SubscriptionByPlan[]>([])
  const [recentSubscriptions, setRecentSubscriptions] = useState<
    { email: string; plan: string; status: string; created: string }[]
  >([])
  const [timeRange, setTimeRange] = useState("6months")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange])

  const fetchRevenueData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch subscription data from profiles
    const { data: profiles } = await supabase.from("profiles").select("*")

    const activeProfiles = profiles?.filter((p) => p.subscription_status === "active") || []
    const trialProfiles =
      profiles?.filter((p) => p.trial_ends_at && new Date(p.trial_ends_at) > new Date() && !p.subscription_status) || []
    const expiredTrials = profiles?.filter((p) => p.trial_used && p.subscription_status === "active")?.length || 0

    // Calculate MRR (assuming $99/month for Professional plan)
    const PRICE_PER_USER = 99
    const mrr = activeProfiles.length * PRICE_PER_USER

    // Calculate trial conversion rate
    const totalTrialsUsed = profiles?.filter((p) => p.trial_used).length || 0
    const conversionRate = totalTrialsUsed > 0 ? Math.round((expiredTrials / totalTrialsUsed) * 100) : 0

    setStats({
      mrr,
      mrrChange: 12, // Placeholder
      totalRevenue: mrr * 6, // Estimate based on 6 months
      activeSubscriptions: activeProfiles.length,
      trialConversions: conversionRate,
      churnRate: 2, // Placeholder
    })

    // Generate monthly revenue data
    const months = timeRange === "12months" ? 12 : 6
    const monthlyData: { month: string; revenue: number; subscriptions: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      // Simulate growth pattern
      const baseSubscriptions = Math.max(1, activeProfiles.length - (months - 1 - i) * 2)
      monthlyData.push({
        month: monthName,
        revenue: baseSubscriptions * PRICE_PER_USER,
        subscriptions: baseSubscriptions,
      })
    }

    setMonthlyRevenue(monthlyData)

    // Plan breakdown
    setPlanBreakdown([
      { plan: "Professional", count: activeProfiles.length, revenue: mrr },
      { plan: "Trial", count: trialProfiles.length, revenue: 0 },
    ])

    // Recent subscriptions
    const recentSubs = activeProfiles
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((p) => ({
        email: p.email || "Unknown",
        plan: "Professional",
        status: p.subscription_status || "active",
        created: p.created_at,
      }))

    setRecentSubscriptions(recentSubs)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Revenue & Subscriptions</h1>
          <p className="text-muted-foreground">Loading revenue data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Revenue & Subscriptions</h1>
          <p className="text-muted-foreground">Track revenue metrics and subscription performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
            className="bg-transparent"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Stripe
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold mt-1">${stats.mrr.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-sm">+{stats.mrrChange}% from last month</span>
                </div>
              </div>
              <DollarSign className="h-10 w-10 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold mt-1">{stats.activeSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-1">$99/month each</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Trial Conversion</p>
                <p className="text-2xl font-bold mt-1">{stats.trialConversions}%</p>
                <p className="text-xs text-muted-foreground mt-1">Trials to paid</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Churn Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.churnRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Monthly</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: number) => [`$${value}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#0d9488" fill="#0d948833" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="subscriptions" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown & Recent Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planBreakdown.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${plan.plan === "Professional" ? "bg-teal-500" : "bg-blue-500"}`}
                    />
                    <div>
                      <p className="font-medium">{plan.plan}</p>
                      <p className="text-sm text-muted-foreground">{plan.count} users</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${plan.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubscriptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subscriptions yet</p>
            ) : (
              <div className="space-y-4">
                {recentSubscriptions.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{sub.email}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sub.created).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{sub.plan}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
