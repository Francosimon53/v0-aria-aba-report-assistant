"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function TeachingProtocolsStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Teaching Protocols</h2>
        <p className="text-muted-foreground">Create detailed teaching protocols for selected goals.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">Teaching Protocols content coming soon...</p>
      </Card>
    </div>
  )
}
