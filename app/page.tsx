"use client"

// ARIA v3.0.0-FINAL - Landing Page
// FORCE DEPLOY: 2024-12-09-REBUILD-COMPLETE
// This MUST show version 3.0.0-final in console

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ShieldIcon, SparklesIcon } from "@/components/icons"

const BUILD_VERSION = "3.0.0-final"
const BUILD_DATE = "2024-12-09"
const BUILD_ID = "rebuild-complete-18steps"

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 12, minutes: 34, seconds: 56 })

  useEffect(() => {
    console.log("=".repeat(50))
    console.log(`[ARIA] BUILD VERSION: ${BUILD_VERSION}`)
    console.log(`[ARIA] BUILD DATE: ${BUILD_DATE}`)
    console.log(`[ARIA] BUILD ID: ${BUILD_ID}`)
    console.log("[ARIA] WIZARD: 18 steps in 5 sections")
    console.log("[ARIA] FEATURES: ReactMarkdown, BehaviorReductionSTOs, DischargePhases")
    console.log("=".repeat(50))
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    router.push("/assessment/new")
  }, [router])

  const handleStartTrial = () => {
    router.push("/dashboard")
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/dashboard?email=${encodeURIComponent(email)}`)
  }

  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      role: "BCBA-D, Clinical Director",
      company: "Bright Futures ABA",
      quote:
        "ARIA reduced our assessment time from 15 hours to just 2. Our Medicaid approval rate jumped from 82% to 98% in the first 60 days.",
    },
    {
      name: "Michael Chen",
      role: "Lead BCBA",
      company: "Spectrum Care Services",
      quote:
        "The AI understands payer language better than any tool I've used. Our team stopped dreading reassessments.",
    },
    {
      name: "Jennifer Lopez",
      role: "Agency Owner",
      company: "ABA Excellence Center",
      quote: "We saved over $50,000 in the first year just from reduced administrative time. The ROI was immediate.",
    },
  ]

  const features = [
    {
      icon: SparklesIcon,
      title: "Write Reports 10x Faster",
      points: [
        "AI-generated narratives tailored to ABA",
        "Smart intake and reusable templates",
        "Auto-populated client and payer details",
      ],
    },
    {
      icon: CheckIcon,
      title: "Get Approved on First Submission",
      points: [
        "Insurance-optimized language for each payer",
        "Pre-configured structures for Aetna, Medicaid, BCBS and more",
        "Red-flag checks before submission to reduce denials",
      ],
    },
    {
      icon: ShieldIcon,
      title: "Stay Compliant Without the Headache",
      points: [
        "100% payer-aligned assessment structures",
        "Audit-ready documentation",
        "Parent training and goal tracking built-in",
      ],
    },
  ]

  return null
}
