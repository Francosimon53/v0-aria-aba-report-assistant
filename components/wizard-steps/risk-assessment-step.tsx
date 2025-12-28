"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { RiskAssessment } from "../risk-assessment"

export function RiskAssessmentStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8">
      <RiskAssessment onSave={() => {}} />
    </div>
  )
}
