"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { ABCObservation } from "../abc-observation"

export function ABCObservationStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8">
      <ABCObservation onSave={() => {}} />
    </div>
  )
}
