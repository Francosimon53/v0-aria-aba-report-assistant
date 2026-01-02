"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles, Save, AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface BarriersGeneralizationProps {
  onSave?: () => void
}

const BARRIERS = [
  { id: "limited-availability", label: "Limited family availability" },
  { id: "work-conflicts", label: "Work schedule conflicts" },
  { id: "transportation", label: "Transportation issues" },
  { id: "cultural", label: "Cultural/spiritual considerations" },
  { id: "language", label: "Language barriers" },
  { id: "insurance", label: "Insurance limitations" },
  { id: "school-conflicts", label: "School schedule conflicts" },
]

const GENERALIZATION_STRATEGIES = [
  { id: "training-loosely", label: "Training loosely" },
  { id: "multiple-exemplars", label: "Using multiple exemplars" },
  { id: "fading-cues", label: "Fading cues and prompts" },
  { id: "variable-reinforcement", label: "Variable reinforcement schedule" },
  { id: "natural-environment", label: "Natural environment training" },
  { id: "community-based", label: "Community-based training" },
  { id: "parent-training", label: "Parent training for generalization" },
]

export function BarriersGeneralization({ onSave }: BarriersGeneralizationProps) {
  const [isGeneratingBarriers, setIsGeneratingBarriers] = useState(false)
  const [isGeneratingGeneralization, setIsGeneratingGeneralization] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    barriers: [] as string[],
    otherBarrier: "",
    barriersAddressed: "",
    strategies: [] as string[],
    otherStrategy: "",
    generalizationPlan: "",
  })

  // Load data from localStorage
  useEffect(() => {
    const savedBarriers = localStorage.getItem("aria-barriers")
    const savedGeneralization = localStorage.getItem("aria-generalization")

    if (savedBarriers) {
      try {
        const data = JSON.parse(savedBarriers)
        setFormData((prev) => ({
          ...prev,
          barriers: data.barriers || [],
          otherBarrier: data.otherBarrier || "",
          barriersAddressed: data.barriersAddressed || "",
        }))
      } catch (e) {
        console.error("Error loading barriers data:", e)
      }
    }

    if (savedGeneralization) {
      try {
        const data = JSON.parse(savedGeneralization)
        setFormData((prev) => ({
          ...prev,
          strategies: data.strategies || [],
          otherStrategy: data.otherStrategy || "",
          generalizationPlan: data.generalizationPlan || "",
        }))
      } catch (e) {
        console.error("Error loading generalization data:", e)
      }
    }
  }, [])

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        "aria-barriers",
        JSON.stringify({
          barriers: formData.barriers,
          otherBarrier: formData.otherBarrier,
          barriersAddressed: formData.barriersAddressed,
        }),
      )
      localStorage.setItem(
        "aria-generalization",
        JSON.stringify({
          strategies: formData.strategies,
          otherStrategy: formData.otherStrategy,
          generalizationPlan: formData.generalizationPlan,
        }),
      )
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleBarrierToggle = (barrierId: string) => {
    setFormData((prev) => ({
      ...prev,
      barriers: prev.barriers.includes(barrierId)
        ? prev.barriers.filter((id) => id !== barrierId)
        : [...prev.barriers, barrierId],
    }))
  }

  const handleStrategyToggle = (strategyId: string) => {
    setFormData((prev) => ({
      ...prev,
      strategies: prev.strategies.includes(strategyId)
        ? prev.strategies.filter((id) => id !== strategyId)
        : [...prev.strategies, strategyId],
    }))
  }

  const handleAIGenerateBarriers = async () => {
    setIsGeneratingBarriers(true)
    try {
      const selectedBarriers = formData.barriers.map((id) => BARRIERS.find((b) => b.id === id)?.label || id)

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "barriersSection",
          data: {
            barriers: selectedBarriers,
            otherBarrier: formData.otherBarrier,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, barriersAddressed: data.content }))
        toast.success("Barriers section generated")
      }
    } catch (error) {
      toast.error("Failed to generate")
    } finally {
      setIsGeneratingBarriers(false)
    }
  }

  const handleAIGenerateGeneralization = async () => {
    setIsGeneratingGeneralization(true)
    try {
      const selectedStrategies = formData.strategies.map(
        (id) => GENERALIZATION_STRATEGIES.find((s) => s.id === id)?.label || id,
      )

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generalizationPlan",
          data: {
            strategies: selectedStrategies,
            otherStrategy: formData.otherStrategy,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, generalizationPlan: data.content }))
        toast.success("Generalization plan generated")
      }
    } catch (error) {
      toast.error("Failed to generate")
    } finally {
      setIsGeneratingGeneralization(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(
        "aria-barriers",
        JSON.stringify({
          barriers: formData.barriers,
          otherBarrier: formData.otherBarrier,
          barriersAddressed: formData.barriersAddressed,
        }),
      )
      localStorage.setItem(
        "aria-generalization",
        JSON.stringify({
          strategies: formData.strategies,
          otherStrategy: formData.otherStrategy,
          generalizationPlan: formData.generalizationPlan,
        }),
      )
      toast.success("Barriers & Generalization saved")
      onSave?.()
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Barriers & Generalization</h2>
            <p className="text-sm text-gray-500">Document treatment barriers and generalization strategies</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save All"}
        </Button>
      </div>

      {/* Section A: Barriers to Treatment */}
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Section A: Barriers to Treatment</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIGenerateBarriers}
              disabled={isGeneratingBarriers}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingBarriers ? "Generating..." : "AI Generate Section"}
            </Button>
          </div>
          <CardDescription>Identify potential barriers that may impact treatment delivery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barriers Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BARRIERS.map((barrier) => (
              <div
                key={barrier.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.barriers.includes(barrier.id)
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleBarrierToggle(barrier.id)}
              >
                <Checkbox
                  id={barrier.id}
                  checked={formData.barriers.includes(barrier.id)}
                  onCheckedChange={() => handleBarrierToggle(barrier.id)}
                />
                <Label htmlFor={barrier.id} className="cursor-pointer flex-1 text-sm font-medium">
                  {barrier.label}
                </Label>
              </div>
            ))}
            {/* Other barrier input */}
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200">
              <Checkbox
                id="other-barrier"
                checked={formData.otherBarrier.length > 0}
                onCheckedChange={() => {}}
                disabled
              />
              <Input
                value={formData.otherBarrier}
                onChange={(e) => setFormData((prev) => ({ ...prev, otherBarrier: e.target.value }))}
                placeholder="Other barrier..."
                className="flex-1"
              />
            </div>
          </div>

          {/* How barriers will be addressed */}
          <div className="pt-4">
            <Label className="text-sm font-medium text-gray-700">How barriers will be addressed</Label>
            <Textarea
              value={formData.barriersAddressed}
              onChange={(e) => setFormData((prev) => ({ ...prev, barriersAddressed: e.target.value }))}
              placeholder="Describe how each identified barrier will be addressed in the treatment plan..."
              className="mt-2 min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section B: Generalization & Maintenance */}
      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Section B: Generalization & Maintenance</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIGenerateGeneralization}
              disabled={isGeneratingGeneralization}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingGeneralization ? "Generating..." : "AI Generate Plan"}
            </Button>
          </div>
          <CardDescription>Select strategies for skill generalization and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategies Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GENERALIZATION_STRATEGIES.map((strategy) => (
              <div
                key={strategy.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.strategies.includes(strategy.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleStrategyToggle(strategy.id)}
              >
                <Checkbox
                  id={strategy.id}
                  checked={formData.strategies.includes(strategy.id)}
                  onCheckedChange={() => handleStrategyToggle(strategy.id)}
                />
                <Label htmlFor={strategy.id} className="cursor-pointer flex-1 text-sm font-medium">
                  {strategy.label}
                </Label>
              </div>
            ))}
            {/* Other strategy input */}
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200">
              <Checkbox
                id="other-strategy"
                checked={formData.otherStrategy.length > 0}
                onCheckedChange={() => {}}
                disabled
              />
              <Input
                value={formData.otherStrategy}
                onChange={(e) => setFormData((prev) => ({ ...prev, otherStrategy: e.target.value }))}
                placeholder="Other strategy..."
                className="flex-1"
              />
            </div>
          </div>

          {/* Generalization plan narrative */}
          <div className="pt-4">
            <Label className="text-sm font-medium text-gray-700">Generalization Plan Narrative</Label>
            <Textarea
              value={formData.generalizationPlan}
              onChange={(e) => setFormData((prev) => ({ ...prev, generalizationPlan: e.target.value }))}
              placeholder="Describe how skills will be generalized across settings, people, and materials..."
              className="mt-2 min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
