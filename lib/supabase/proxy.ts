import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.ARIA_SUPABASE_URL || process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL
  const supabaseKey = process.env.ARIA_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[v0] Supabase environment variables not configured. Auth is disabled.")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect assessment routes - require authentication
  if (
    (request.nextUrl.pathname.startsWith("/assessment") || request.nextUrl.pathname.startsWith("/dashboard")) &&
    !user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (
    user &&
    (request.nextUrl.pathname.startsWith("/assessment") || request.nextUrl.pathname.startsWith("/dashboard"))
  ) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status, trial_ends_at")
        .eq("id", user.id)
        .single()

      if (profile) {
        const now = new Date()
        const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null
        const isTrialExpired = trialEndsAt ? now > trialEndsAt : false
        const isPaid = ["active", "paid", "subscribed"].includes(profile.subscription_status || "")

        // If trial is expired and user is not paid, redirect to dashboard
        // Dashboard will show the blocking modal
        if (isTrialExpired && !isPaid && request.nextUrl.pathname !== "/dashboard") {
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error("[v0] Error checking subscription status:", error)
    }
  }

  return supabaseResponse
}
