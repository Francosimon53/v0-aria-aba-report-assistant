"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SparklesIcon, ShieldIcon, ArrowRightIcon, CheckIcon } from "@/components/icons"

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
      <path d="M7 11V7a5 5 0 0 1 8-8H9a5 5 0 0 1 8 8v4" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
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
      <path d="M19 21v-2a8 8 0 0 0-8-8H9a8 8 0 0 0-8 8v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

    console.log("[v0] Attempting registration with:", { email, fullName })
    console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_ARIA_SUPABASE_URL)

    // Validate inputs
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/assessment/new`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        // Handle specific Supabase errors
        console.error("[v0] Supabase auth error:", signUpError)

        if (signUpError.message.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.")
        } else if (signUpError.message.includes("valid email")) {
          setError("Please enter a valid email address.")
        } else if (signUpError.message.includes("password")) {
          setError("Password is too weak. Use at least 8 characters with numbers and symbols.")
        } else {
          setError(signUpError.message)
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("[v0] Registration successful:", data.user.id)
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
        router.push("/login?message=Check your email to verify your account")
      }
    } catch (err: any) {
      console.error("[v0] Registration error:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0D9488] via-[#0891B2] to-[#06B6D4] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">ARIA</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Start your
            <br />
            <span className="text-teal-100">free trial today</span>
          </h1>

          <p className="text-xl text-teal-100 mb-12 max-w-md">
            Join thousands of BCBAs creating better assessments faster.
          </p>

          <div className="space-y-4">
            {[
              "14-day free trial, no credit card",
              "Unlimited assessments during trial",
              "Full access to all features",
              "Cancel anytime",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-4 w-4 text-white" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ARIA</span>
          </div>

          <Card className="p-8 sm:p-10 bg-white border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-500">
                Already have an account?{" "}
                <a href="/login" className="text-[#0D9488] hover:text-[#0F766E] font-semibold transition-colors">
                  Sign in
                </a>
              </p>
            </div>

            {/* 
              TODO: Add OAuth providers when configured
              - Google: Requires Google Cloud Console setup
              - Microsoft: Requires Azure AD setup
              See Supabase Auth docs for configuration
            */}

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">
                  Full name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Dr. Jane Smith, BCBA"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 pl-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Work email
                </Label>
                <div className="relative">
                  <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {/* Placeholder for EyeIcon */}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-12 border-gray-200 focus:border-[#0D9488] focus:ring-[#0D9488]/20"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="border-gray-300 data-[state=checked]:bg-[#0D9488] data-[state=checked]:border-[#0D9488] mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <a href="/terms" className="text-[#0D9488] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-[#0D9488] hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password || !fullName || !agreeTerms}
                className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 group"
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
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Start free trial
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
