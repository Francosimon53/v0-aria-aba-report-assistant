"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SparklesIcon, EyeIcon, ShieldIcon, ArrowRightIcon, CheckIcon } from "@/components/icons"

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          router.replace("/dashboard")
          return
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        localStorage.setItem("aria_user", JSON.stringify({ email: data.user.email, id: data.user.id }))
        window.location.href = "/dashboard"
      } else {
        setError("Login failed. Please check your credentials.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D9488] via-[#0891B2] to-[#06B6D4] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">ARIA</span>
          </div>

          {/* Main message */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Welcome back to your
            <br />
            <span className="text-teal-100">assessment assistant</span>
          </h1>

          <p className="text-xl text-teal-100 mb-12 max-w-md">
            Continue creating insurance-ready reports in minutes, not hours.
          </p>

          {/* Benefits list */}
          <div className="space-y-4">
            {[
              "AI-powered report generation",
              "Insurance template library",
              "Real-time compliance checking",
              "Secure & HIPAA compliant",
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-white/90 animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust indicator */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/40 backdrop-blur-sm"
                  />
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">2,847+ BCBAs trust ARIA</p>
                <p className="text-teal-200 text-sm">Join the growing community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ARIA</span>
          </div>

          <Card className="p-8 sm:p-10 bg-white border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
              <p className="text-gray-500">
                Don't have an account?{" "}
                <a href="/register" className="text-[#0D9488] hover:text-[#0F766E] font-semibold transition-colors">
                  Start free trial
                </a>
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-[#0D9488] hover:text-[#0F766E] font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-[#0D9488] data-[state=checked]:border-[#0D9488]"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            {/* Security badge */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <ShieldIcon className="h-4 w-4" />
                <span>Secured with 256-bit SSL encryption</span>
              </div>
            </div>
          </Card>

          {/* Footer links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="/terms" className="hover:text-gray-600 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="/support" className="hover:text-gray-600 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
