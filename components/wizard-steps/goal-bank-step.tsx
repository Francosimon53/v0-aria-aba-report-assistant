"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function GoalBankStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Goal Bank</h2>
        <p className="text-muted-foreground">Select and customize treatment goals from the standardized goal bank.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">Goal Bank content coming soon...</p>
      </Card>
    </div>
  )
}
