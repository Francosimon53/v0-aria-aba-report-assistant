"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ShieldIcon,
  FileTextIcon,
  SparklesIcon,
  TargetIcon,
  ClockIcon,
  AwardIcon,
  UsersIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@/components/icons"

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const [spotsLeft, setSpotsLeft] = useState(7)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
      quote: "ARIA reduced our assessment time from 15 hours to just 2. Our approval rate jumped to 98%.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Lead BCBA",
      company: "Spectrum Care Services",
      image: "/placeholder.svg?height=80&width=80",
      quote: "The AI understands insurance requirements better than any tool I've used. Game changer.",
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
    { icon: FileTextIcon, title: "AI-Generated Narratives", desc: "Insurance-optimized language" },
    { icon: TargetIcon, title: "SMART Goals", desc: "Auto-generated treatment objectives" },
    { icon: ShieldIcon, title: "100% Compliant", desc: "All major payers supported" },
    { icon: ClockIcon, title: "12hr Time Savings", desc: "Per assessment average" },
    { icon: AwardIcon, title: "95% Approval Rate", desc: "First-submission success" },
    { icon: UsersIcon, title: "Parent Training", desc: "Built-in curriculum tracker" },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden">
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

      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">2,847 BCBAs</span> already saving time
              </span>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Stop Spending 15 Hours
              <br />
              <span className="bg-gradient-to-r from-[#0D9488] via-[#0891B2] to-[#06B6D4] bg-clip-text text-transparent">
                on Every Assessment
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              AI-powered assessment reports that get{" "}
              <span className="font-semibold text-gray-900">approved on first submission</span>. Join thousands of BCBAs
              who reclaimed their evenings and weekends.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                onClick={() => router.push("/register")}
                size="lg"
                className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold px-8 py-7 text-lg shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                Start Free Assessment
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-7 text-lg hover:bg-gray-50 transition-all duration-300 group bg-transparent"
              >
                <PlayIcon className="mr-2 h-5 w-5 text-[#0D9488]" />
                Watch 2-min Demo
              </Button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[400ms]">
              {[
                { value: "95%", label: "Approval Rate" },
                { value: "12hr", label: "Time Saved" },
                { value: "$4,200", label: "Monthly Savings" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#0D9488] mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      <section id="testimonials" className="py-24 bg-white">
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
              <Card
                key={i}
                className="p-8 bg-gradient-to-b from-white to-gray-50/50 border-gray-100 hover:shadow-xl transition-all duration-300"
              >
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

      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-red-50 text-red-600 border-red-200 mb-4">Limited Time: 50% OFF</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Cancel anytime. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="p-8 bg-white border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-lg font-semibold text-gray-900 mb-2">Starter</div>
              <div className="text-sm text-gray-500 mb-6">For individual BCBAs</div>
              <div className="mb-6">
                <span className="text-sm text-gray-400 line-through">$99/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">$49</span>
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
                {["10 assessments/month", "All insurance templates", "Email support", "Basic analytics"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[#0D9488]" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Professional - Featured */}
            <Card className="p-8 bg-gradient-to-b from-[#0D9488] to-[#0F766E] text-white border-0 shadow-2xl shadow-teal-500/25 scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-400 text-yellow-900 font-semibold px-4">Most Popular</Badge>
              </div>
              <div className="text-lg font-semibold mb-2">Professional</div>
              <div className="text-sm text-teal-100 mb-6">For growing practices</div>
              <div className="mb-6">
                <span className="text-sm text-teal-200 line-through">$199/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">$99</span>
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
                  "Priority support",
                  "Advanced analytics",
                  "Team collaboration",
                  "Custom templates",
                  "API access",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-teal-200" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Enterprise */}
            <Card className="p-8 bg-white border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="text-lg font-semibold text-gray-900 mb-2">Enterprise</div>
              <div className="text-sm text-gray-500 mb-6">For large agencies</div>
              <div className="mb-6">
                <span className="text-sm text-gray-400 line-through">$499/mo</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">$249</span>
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
                  "Everything in Pro",
                  "Dedicated success manager",
                  "Custom integrations",
                  "SLA guarantee",
                  "On-premise option",
                  "Training & onboarding",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-[#0D9488]" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#0D9488] to-[#0891B2] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">Free for 14 Days</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Reclaim Your Time?</h2>
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
            <div className="flex items-center gap-8 text-sm">
              <button onClick={() => router.push("/privacy")} className="hover:text-white transition-colors">
                Privacy
              </button>
              <button onClick={() => router.push("/terms")} className="hover:text-white transition-colors">
                Terms
              </button>
              <button onClick={() => router.push("/support")} className="hover:text-white transition-colors">
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
