"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ShieldIcon,
  FileTextIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  BarChartIcon,
} from "@/components/icons"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const [spotsLeft, setSpotsLeft] = useState(7)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // User is logged in - redirect to dashboard
          router.replace("/dashboard")
          return
        }

        const forceLanding = searchParams.get("landing") === "true"
        const isReturningUser = localStorage.getItem("aria-returning-user") === "true"

        if (isReturningUser && !forceLanding) {
          // Returning user - send directly to login
          router.replace("/login")
          return
        }
      } catch (error) {
        // If auth check fails, just show landing page
        console.error("Auth check failed:", error)
      }

      // Not logged in and not returning user - show landing page
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router, searchParams])

  useEffect(() => {
    if (isCheckingAuth) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isCheckingAuth])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      role: "BCBA-D, Clinical Director",
      company: "Bright Futures ABA",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "ARIA reduced our assessment time from 15 hours to just 2. All 21 sections generated automatically with insurance approval on first submission.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Lead BCBA",
      company: "Spectrum Care Services",
      image: "/placeholder.svg?height=80&width=80",
      quote:
        "The AI understands insurance requirements better than any tool I've used. Our approval rate jumped to 98%.",
      rating: 5,
    },
    {
      name: "Jennifer Lopez",
      role: "Agency Owner",
      company: "ABA Excellence Center",
      image: "/placeholder.svg?height=80&width=80",
      quote: "We saved $50,000 in the first year just from reduced administrative time. ROI was immediate.",
      rating: 5,
    },
  ]

  const logos = ["Aetna", "BCBS", "United", "Cigna", "Anthem", "Humana", "Optum", "Magellan"]

  const features = [
    {
      icon: FileTextIcon,
      title: "21-Section Professional Reports",
      desc: "Generate complete ABA assessment reports with all required sections for insurance approval, from Client Information to Crisis Plan.",
    },
    {
      icon: BarChartIcon,
      title: "Built-in Assessment Tools",
      desc: "Integrated scoring for ABLLS-R, Vineland-3 (Parent & Teacher), SRS-2, and MAS with automatic clinical interpretations.",
    },
    {
      icon: SparklesIcon,
      title: "AI-Generated Clinical Narratives",
      desc: "One-click generation of insurance-compliant narratives for every section, from Reason for Referral to Fade Plan.",
    },
    {
      icon: TargetIcon,
      title: "SMART Goals with STOs",
      desc: "Automatically generate measurable skill acquisition and behavior reduction goals with progressive short-term objectives.",
    },
    {
      icon: ShieldIcon,
      title: "Pre-Configured for All Major Payers",
      desc: "Templates and language optimized for Aetna, BCBS, United, Cigna, Anthem, Humana, Optum, and Magellan requirements.",
    },
    {
      icon: UsersIcon,
      title: "Caregiver Training Tracker",
      desc: "Built-in curriculum for parent training goals with progress monitoring and fidelity tracking.",
    },
  ]

  const howItWorksSteps = [
    {
      step: "1",
      title: "Enter Client Information",
      description: "Start with basic demographics, diagnosis, and referral information.",
    },
    {
      step: "2",
      title: "Complete Assessments",
      description: "Enter scores from standardized tools or let AI generate interpretations.",
    },
    {
      step: "3",
      title: "Generate Goals & Interventions",
      description: "AI suggests evidence-based goals, teaching procedures, and behavior plans.",
    },
    {
      step: "4",
      title: "Download Professional Report",
      description: "Export a complete 20+ page PDF ready for insurance submission.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      {/* Urgency Banner */}
      <div className="bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white py-3 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="animate-pulse inline-block w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="font-semibold">Limited Time Offer:</span>
            <span>50% OFF First 3 Months</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold">
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, "0")}</span>
          </div>
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">Only {spotsLeft} spots left</Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ARIA</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex font-medium"
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
              <Button
                onClick={() => router.push("/register")}
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-6 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 pb-20 sm:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold text-gray-900">2,847 BCBAs</span>{" "}
                <span className="hidden sm:inline">already saving time</span>
              </span>
              <div className="hidden sm:flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 text-balance">
              Stop Spending 15 Hours
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#06B6D4] bg-clip-text text-transparent">
                on Every Assessment
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 px-2 sm:px-0">
              AI-powered assessment reports that get{" "}
              <span className="font-semibold text-gray-900">approved on first submission</span>. Join thousands of BCBAs
              who reclaimed their evenings and weekends.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 px-4 sm:px-0">
              <Button
                onClick={() => router.push("/register")}
                size="lg"
                className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                Start Free Assessment
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg hover:bg-gray-50 transition-all duration-300 group bg-transparent"
              >
                <PlayIcon className="mr-2 h-5 w-5 text-[#0D9488]" />
                Watch 2-min Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms] px-4 sm:px-0">
              {[
                { value: "98%", label: "First-Submission Approval" },
                { value: "6-10hr", label: "Saved Per Assessment" },
                { value: "15,000+", label: "Reports Generated" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center py-4 sm:py-0 border-b sm:border-b-0 last:border-b-0 border-gray-100"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0D9488] mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Logos Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 mb-8">
            PRE-CONFIGURED FOR ALL MAJOR INSURANCE PROVIDERS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {logos.map((logo, i) => (
              <div
                key={i}
                className="text-xl font-bold text-gray-300 hover:text-gray-400 transition-colors cursor-default"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-50 text-[#0D9488] border-teal-200 mb-4">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <br />
              <span className="text-[#0D9488]">10x Your Productivity</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by BCBAs, for BCBAs. Every feature designed to eliminate busywork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card
                  key={i}
                  className="p-8 bg-white border-gray-100 hover:border-[#0D9488]/30 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl flex items-center justify-center mb-6 group-hover:from-[#0D9488] group-hover:to-[#0891B2] transition-all duration-300">
                    <Icon className="h-7 w-7 text-[#0D9488] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-50 text-[#0D9488] border-teal-200 mb-4">How It Works</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              From Data Entry to
              <br />
              <span className="text-[#0D9488]">Approved Report in 4 Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch how BCBAs complete assessments in under 2 hours
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((item, i) => (
                <div key={i} className="relative text-center group">
                  {/* Connector line */}
                  {i < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#0D9488] to-[#0891B2]/30" />
                  )}

                  {/* Step number */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Demo Preview */}
            <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">See ARIA in Action</h3>
                <p className="text-gray-600">Preview the report generation interface</p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Mock browser header */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-500 bg-white px-4 py-1 rounded-full">
                      ariaba.app/assessment/generate
                    </span>
                  </div>
                </div>

                {/* Mock app interface */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Generate Report</h4>
                      <p className="text-sm text-gray-500">21 sections ready for generation</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#0D9488]">100%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-gradient-to-r from-[#0D9488] to-[#0891B2] rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Section chips */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Client Info",
                      "Background",
                      "Assessments",
                      "Goals",
                      "Interventions",
                      "Fade Plan",
                      "+15 more",
                    ].map((section, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-teal-50 text-[#0D9488] text-sm font-medium rounded-full border border-teal-200"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    router.push("/demo/generate-report")
                  }}
                  className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-teal-500/25"
                >
                  Try Demo with Sample Data
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-teal-50 text-[#0D9488] border-teal-200 mb-4">Testimonials</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Trusted by <span className="text-[#0D9488]">2,847+ BCBAs</span>
            </h2>
            <p className="text-xl text-gray-600">See what clinical professionals are saying</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-8 bg-white border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <StarIcon key={j} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={t.image || "/placeholder.svg"}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                    <div className="text-sm text-[#0D9488] font-medium">{t.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-red-50 text-red-600 border-red-200 mb-4">Limited Time: 50% OFF</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="p-6 sm:p-8 bg-white border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-lg font-semibold text-gray-900 mb-2">Starter</div>
              <div className="text-sm text-gray-500 mb-6">For individual BCBAs</div>
              <div className="mb-6">
                <span className="text-sm text-gray-400 line-through">$99/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mb-6 border-2 bg-transparent"
                onClick={() => router.push("/checkout?plan=starter")}
              >
                Start Free Trial
              </Button>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "10 assessments/month",
                  "Initial Assessments only",
                  "21-section report generation",
                  "Basic AI narratives",
                  "PDF export",
                  "Email support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[#0D9488] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Professional - Featured */}
            <Card className="p-6 sm:p-8 bg-gradient-to-b from-[#0D9488] to-[#0F766E] text-white border-0 shadow-2xl shadow-teal-500/25 relative order-first md:order-none">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-400 text-yellow-900 font-semibold px-4">Most Popular</Badge>
              </div>
              <div className="text-lg font-semibold mb-2">Professional</div>
              <div className="text-sm text-teal-100 mb-6">For growing practices</div>
              <div className="mb-6">
                <span className="text-sm text-teal-200 line-through">$199/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold">$99</span>
                  <span className="text-teal-100">/month</span>
                </div>
              </div>
              <Button
                className="w-full mb-6 bg-white text-[#0D9488] hover:bg-gray-100 font-semibold"
                onClick={() => router.push("/checkout?plan=professional")}
              >
                Start Free Trial
              </Button>
              <ul className="space-y-3 text-sm text-teal-50">
                {[
                  "Unlimited assessments",
                  "Initial + Reassessments",
                  "All standardized assessments (ABLLS-R, Vineland, SRS-2, MAS)",
                  "Advanced AI with RAG knowledge base",
                  "Custom templates",
                  "Priority support",
                  "Team collaboration (up to 3 users)",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-teal-200 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Enterprise */}
            <Card className="p-6 sm:p-8 bg-white border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-lg font-semibold text-gray-900 mb-2">Enterprise</div>
              <div className="text-sm text-gray-500 mb-6">For large agencies</div>
              <div className="mb-6">
                <span className="text-sm text-gray-400 line-through">$499/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">$249</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mb-6 border-2 bg-transparent"
                onClick={() => router.push("/checkout?plan=enterprise")}
              >
                Start Free Trial
              </Button>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Everything in Professional",
                  "Unlimited team members",
                  "Custom branding on reports",
                  "API access",
                  "Dedicated success manager",
                  "HIPAA BAA included",
                  "Multi-location support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[#0D9488] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">Free for 14 Days</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Ready to Reclaim Your Time?</h2>
            <p className="text-xl text-teal-100 mb-10">
              Join 2,847+ BCBAs who stopped working evenings and weekends. Start your free trial today — no credit card
              required.
            </p>

            {submitted ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-8 w-8 text-[#0D9488]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-teal-100">Check your email to get started.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 px-6 bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-teal-200 focus:bg-white/20 focus:border-white/40"
                  required
                />
                <Button
                  onClick={() => router.push("/register")}
                  type="button"
                  className="h-14 px-8 bg-white text-[#0D9488] hover:bg-gray-100 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Get Started Free
                </Button>
              </form>
            )}

            <p className="text-sm text-teal-200 mt-6 flex items-center justify-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              HIPAA compliant. Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ARIA</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button onClick={() => router.push("/privacy")} className="hover:text-white transition-colors">
                Privacy
              </button>
              <button onClick={() => router.push("/terms")} className="hover:text-white transition-colors">
                Terms
              </button>
              <button onClick={() => router.push("/hipaa")} className="hover:text-white transition-colors">
                HIPAA Compliance
              </button>
              <button onClick={() => router.push("/docs")} className="hover:text-white transition-colors">
                Documentation
              </button>
              <button onClick={() => router.push("/help")} className="hover:text-white transition-colors">
                Support
              </button>
              <button onClick={() => router.push("/contact")} className="hover:text-white transition-colors">
                Contact
              </button>
            </div>
            <div className="text-sm">© 2025 ARIA. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
