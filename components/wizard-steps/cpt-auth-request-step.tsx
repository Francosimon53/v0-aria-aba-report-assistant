"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function CPTAuthRequestStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">CPT Auth Request</h2>
        <p className="text-muted-foreground">Generate insurance authorization request with CPT codes.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">CPT Auth Request content coming soon...</p>
      </Card>
    </div>
  )
}
