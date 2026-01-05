"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Save, FileText, AlertCircle, Target, Users, Brain } from "lucide-react"
import { toast } from "sonner"
import { buildEnhancedPrompt } from "@/lib/learning-system"

interface ReasonForReferralProps {
  onSave?: () => void
}

const AREAS_OF_CONCERN = [
  { id: "functional-communication", label: "Functional communication" },
  { id: "social-emotional-reciprocity", label: "Social-emotional reciprocity" },
  { id: "transitioning", label: "Transitioning between activities" },
  { id: "following-instructions", label: "Following instructions" },
  { id: "social-interactions-peers", label: "Social interactions with peers" },
  { id: "restricted-repetitive", label: "Restricted/repetitive behaviors" },
  { id: "developing-relationships", label: "Developing relationships" },
]

const DSM5_LEVELS = [
  { value: "level-1", label: "Level 1 - Requiring Support" },
  { value: "level-2", label: "Level 2 - Requiring Substantial Support" },
  { value: "level-3", label: "Level 3 - Requiring Very Substantial Support" },
]

export function ReasonForReferral({ onSave }: ReasonForReferralProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [usedHistoricalExamples, setUsedHistoricalExamples] = useState(0)

  const [formData, setFormData] = useState({
    currentProblemAreas: "",
    familyGoals: "",
    dsm5Level: "",
    areasOfConcern: [] as string[],
  })

  useEffect(() => {
    const saved = localStorage.getItem("aria-reason-for-referral")
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading reason for referral data:", e)
      }
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("aria-reason-for-referral", JSON.stringify(formData))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleAreaOfConcernToggle = (areaId: string) => {
    setFormData((prev) => ({
      ...prev,
      areasOfConcern: prev.areasOfConcern.includes(areaId)
        ? prev.areasOfConcern.filter((id) => id !== areaId)
        : [...prev.areasOfConcern, areaId],
    }))
  }

  const handleAIGenerate = async () => {
    if (formData.areasOfConcern.length === 0) {
      toast.error("Please select at least one area of concern before generating")
      return
    }

    setIsGenerating(true)
    setUsedHistoricalExamples(0)

    try {
      const clientData = localStorage.getItem("aria-client-info")
      const backgroundData = localStorage.getItem("aria-background-history")
      const parsedClientInfo = clientData ? JSON.parse(clientData) : {}

      const basePromptContext = `
Client Information:
- Diagnosis: ${parsedClientInfo.diagnosis || "Autism Spectrum Disorder"}
- Age: ${parsedClientInfo.age || "Not specified"}
- DSM-5 Level: ${formData.dsm5Level || "Not specified"}
- Areas of Concern: ${formData.areasOfConcern.map((id) => AREAS_OF_CONCERN.find((a) => a.id === id)?.label || id).join(", ")}

Generate a professional "Reason for Referral" narrative for an ABA assessment.
`

      const { enhancedPrompt, exampleCount } = await buildEnhancedPrompt({
        basePrompt: basePromptContext,
        sectionType: "reason_for_referral",
        clientInfo: {
          diagnosis: parsedClientInfo.diagnosis,
          severityLevel: formData.dsm5Level,
          age: Number.parseInt(parsedClientInfo.age) || undefined,
        },
      })

      setUsedHistoricalExamples(exampleCount)

      const requestBody = {
        type: "reasonForReferral",
        data: {
          clientInfo: parsedClientInfo,
          background: backgroundData ? JSON.parse(backgroundData) : {},
          areasOfConcern: formData.areasOfConcern.map((id) => AREAS_OF_CONCERN.find((a) => a.id === id)?.label || id),
          dsm5Level: formData.dsm5Level,
          enhancedContext: exampleCount > 0 ? enhancedPrompt : undefined,
        },
      }

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok && data.content) {
        localStorage.setItem("aria-reason-for-referral-ai-generated", data.content)
        setFormData((prev) => ({ ...prev, currentProblemAreas: data.content }))
        toast.success(
          exampleCount > 0 ? `Generated with ${exampleCount} similar examples` : "Problem areas generated successfully",
        )
      } else {
        throw new Error(data.error || data.message || "Failed to generate content")
      }
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate content. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("aria-reason-for-referral", JSON.stringify(formData))
      toast.success("Reason for referral saved")
      onSave?.()
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const completedFields = [
    formData.currentProblemAreas.length > 0,
    formData.familyGoals.length > 0,
    formData.dsm5Level.length > 0,
    formData.areasOfConcern.length > 0,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reason for Referral</h2>
            <p className="text-sm text-gray-500">Document the client's presenting concerns and family goals</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">
            {completedFields}/4 sections complete
          </Badge>
          <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">DSM-5 Autism Severity Level</CardTitle>
          </div>
          <CardDescription>Select the client's diagnosed autism severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.dsm5Level}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, dsm5Level: value }))}
          >
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Select DSM-5 Level" />
            </SelectTrigger>
            <SelectContent>
              {DSM5_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Areas of Concern</CardTitle>
          </div>
          <CardDescription>Select all areas that apply to this client</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AREAS_OF_CONCERN.map((area) => (
              <div
                key={area.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.areasOfConcern.includes(area.id)
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleAreaOfConcernToggle(area.id)}
              >
                <Checkbox
                  id={area.id}
                  checked={formData.areasOfConcern.includes(area.id)}
                  onCheckedChange={() => handleAreaOfConcernToggle(area.id)}
                />
                <Label htmlFor={area.id} className="cursor-pointer flex-1 text-sm font-medium">
                  {area.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Current Problem Areas</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
          <CardDescription>Describe the specific behavioral and developmental concerns</CardDescription>
          {usedHistoricalExamples > 0 && (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-2 w-fit">
              <Brain className="h-3 w-3" />
              <span>
                Enhanced with {usedHistoricalExamples} similar approved assessment
                {usedHistoricalExamples > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.currentProblemAreas}
            onChange={(e) => setFormData((prev) => ({ ...prev, currentProblemAreas: e.target.value }))}
            placeholder="Describe the client's current problem areas, including frequency, intensity, and impact on daily functioning..."
            className="min-h-[150px] resize-none"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{formData.currentProblemAreas.split(/\s+/).filter(Boolean).length} words</span>
            <span>Aim for 100-200 words</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Family's Goals for Treatment</CardTitle>
          </div>
          <CardDescription>What outcomes does the family hope to achieve?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.familyGoals}
            onChange={(e) => setFormData((prev) => ({ ...prev, familyGoals: e.target.value }))}
            placeholder="Describe the family's priorities and goals for ABA treatment, including specific skills they want the client to develop..."
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}
