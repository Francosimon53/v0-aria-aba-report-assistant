"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"
import { Button } from "../ui/button"

export function GenerateReportStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Generate Report</h2>
        <p className="text-muted-foreground">Review all assessment data and generate your final ABA report.</p>
      </div>

      <Card className="p-8 text-center space-y-4">
        <p className="text-lg">You've completed all 13 steps of the assessment wizard!</p>
        <p className="text-muted-foreground">Click below to generate your comprehensive ABA assessment report.</p>
        <Button size="lg" className="mt-4">
          Generate Final Report
        </Button>
      </Card>
    </div>
  )
}
