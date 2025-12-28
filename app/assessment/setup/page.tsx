"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, HelpCircleIcon, XIcon, ChevronLeftIcon } from "@/components/icons"
import { cn } from "@/lib/utils"
import { safeSetJSON } from "@/lib/safe-storage"

type EvaluationType = "initial" | "reassessment" | null
type AgeProfile = "early" | "elementary" | "teen" | null
type PayerProfile = "aetna" | "medicaid" | "bcbs" | "other" | null

export default function QuickSetupPage() {
  const router = useRouter()
  const [showHelp, setShowHelp] = useState(false)
  const [evaluationType, setEvaluationType] = useState<EvaluationType>(null)
  const [ageProfile, setAgeProfile] = useState<AgeProfile>(null)
  const [payerProfile, setPayerProfile] = useState<PayerProfile>(null)
  const [showErrors, setShowErrors] = useState(false)

  const isValid = evaluationType !== null && ageProfile !== null && payerProfile !== null

  const handleContinue = () => {
    if (!isValid) {
      setShowErrors(true)
      return
    }

    // Save selections to safe storage for use in the main dashboard
    safeSetJSON("aria_setup_config", {
      evaluationType,
      ageProfile,
      payerProfile,
      completedAt: new Date().toISOString(),
    })

    // Navigate to the main dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 text-sm">
              Step 1 of 6 – Quick Setup
            </Badge>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircleIcon className="h-4 w-4" />
              Need help?
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[16.67%] transition-all duration-500 ease-out" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Welcome to ARIA</h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl text-pretty leading-relaxed">
            In 3 quick choices, we'll tailor this assessment to your client's age, payer, and evaluation type.
          </p>
        </div>

        {/* Section 1: Evaluation Type */}
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Evaluation Type</h2>
            <p className="text-sm text-muted-foreground">What type of assessment are you completing?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectionCard
              selected={evaluationType === "initial"}
              onClick={() => {
                setEvaluationType("initial")
                setShowErrors(false)
              }}
              title="Initial Assessment"
              description="First-time evaluation for a new client or new authorization."
            />
            <SelectionCard
              selected={evaluationType === "reassessment"}
              onClick={() => {
                setEvaluationType("reassessment")
                setShowErrors(false)
              }}
              title="Reassessment"
              description="Ongoing services, progress update or reauthorization evaluation."
            />
          </div>

          {showErrors && evaluationType === null && (
            <p className="mt-2 text-sm text-destructive">
              Select a type of assessment so ARIA can customize your workflow.
            </p>
          )}
        </div>

        {/* Section 2: Age Profile */}
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Age Profile</h2>
            <p className="text-sm text-muted-foreground">Select the age range that best fits your client.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectionCard
              selected={ageProfile === "early"}
              onClick={() => {
                setAgeProfile("early")
                setShowErrors(false)
              }}
              title="Early Learner"
              description="Ages 3–6 · Focus on foundational skills and early communication."
            />
            <SelectionCard
              selected={ageProfile === "elementary"}
              onClick={() => {
                setAgeProfile("elementary")
                setShowErrors(false)
              }}
              title="Elementary"
              description="Ages 7–11 · School-age skills, academics, social behavior."
            />
            <SelectionCard
              selected={ageProfile === "teen"}
              onClick={() => {
                setAgeProfile("teen")
                setShowErrors(false)
              }}
              title="Teen"
              description="Ages 12–17 · Independence, social skills, safety, and transitions."
            />
          </div>

          {showErrors && ageProfile === null && (
            <p className="mt-2 text-sm text-destructive">Select an age profile to tailor goals and examples.</p>
          )}
        </div>

        {/* Section 3: Payer Profile */}
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground mb-1">Payer Profile</h2>
            <p className="text-sm text-muted-foreground">Who will be reviewing this assessment?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectionCard
              selected={payerProfile === "aetna"}
              onClick={() => {
                setPayerProfile("aetna")
                setShowErrors(false)
              }}
              title="Aetna"
              description="Emphasis on measurable progress, clear functional goals."
            />
            <SelectionCard
              selected={payerProfile === "medicaid"}
              onClick={() => {
                setPayerProfile("medicaid")
                setShowErrors(false)
              }}
              title="Medicaid"
              description="Focus on functional needs, daily living and safety."
            />
            <SelectionCard
              selected={payerProfile === "bcbs"}
              onClick={() => {
                setPayerProfile("bcbs")
                setShowErrors(false)
              }}
              title="BCBS"
              description="Highlight risk reduction, supervision and clinical oversight."
            />
            <SelectionCard
              selected={payerProfile === "other"}
              onClick={() => {
                setPayerProfile("other")
                setShowErrors(false)
              }}
              title="Other / Self-Pay"
              description="Flexible language aligned with family priorities."
            />
          </div>

          {showErrors && payerProfile === null && (
            <p className="mt-2 text-sm text-destructive">
              Select who will review this report to align clinical language.
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")} size="lg" className="w-full sm:w-auto">
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            size="lg"
            className="w-full sm:w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Client Information
          </Button>
        </div>

        {!isValid && (
          <p className="text-sm text-muted-foreground text-center sm:text-right mt-4">
            Please complete all three selections to continue
          </p>
        )}
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Need help with this step?</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Initial vs Reassessment – what's the difference?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    An <strong>Initial Assessment</strong> is conducted when you're evaluating a client for the first
                    time or starting a new authorization period. It establishes baseline skills and identifies initial
                    treatment needs.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    A <strong>Reassessment</strong> is used for ongoing services to track progress toward existing goals
                    and determine if services should continue or be modified.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Which age profile should I choose?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Select the age range that best matches your client. ARIA will customize goal examples, assessment
                    language, and recommended interventions based on developmentally appropriate skills for that age
                    group. You can always adjust specific details later.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    I'm not sure who the payer is – what do I do?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If you're unsure, select <strong>Other / Self-Pay</strong> for now. ARIA will use neutral,
                    family-friendly language. You can also check with your billing department or the family to confirm
                    the insurance provider, then update this selection before finalizing your report.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Button onClick={() => setShowHelp(false)} className="w-full">
                  Got it, thanks!
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Selection Card Component
interface SelectionCardProps {
  selected: boolean
  onClick: () => void
  title: string
  description: string
}

function SelectionCard({ selected, onClick, title, description }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative text-left p-6 rounded-xl border-2 transition-all duration-200",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-primary/30",
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute top-4 right-4 animate-in zoom-in-50 duration-200">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
            <CheckIcon className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      )}

      <div className={cn("pr-8", selected && "pr-10")}>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </button>
  )
}
