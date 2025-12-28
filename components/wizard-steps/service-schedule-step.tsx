"use client"

import type { StepComponentProps } from "@/lib/wizard-types"
import { Card } from "../ui/card"

export function ServiceScheduleStep({ data, onUpdate }: StepComponentProps) {
  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Service Schedule</h2>
        <p className="text-muted-foreground">Define recommended service hours and weekly schedule.</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground">Service Schedule content coming soon...</p>
      </Card>
    </div>
  )
}
