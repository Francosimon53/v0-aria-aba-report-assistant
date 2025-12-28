"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function ParentTrainingStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Parent Training</h2>
        <p className="text-muted-foreground">Document parent training goals and caregiver involvement plans.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">Parent Training content coming soon...</p>
      </Card>
    </div>
  )
}
