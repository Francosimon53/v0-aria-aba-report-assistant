"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function MedicalNecessityStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Medical Necessity</h2>
        <p className="text-muted-foreground">Document medical necessity justification for insurance approval.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">Medical Necessity content coming soon...</p>
      </Card>
    </div>
  )
}
