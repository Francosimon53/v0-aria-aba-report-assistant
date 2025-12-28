"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Save, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetItem, safeSetItem } from "@/lib/safe-storage"

interface DomainScore {
  name: string
  score: number
  ageEquivalent: string
  notes: string
}

interface AssessmentFormData {
  assessmentType: string
  assessmentDate: string
  domains: DomainScore[]
  strengths: string[]
  deficits: string[]
  overallSummary: string
}

const ASSESSMENT_TYPES = ["VB-MAPP", "ABLLS-R", "AFLS", "PEAK", "Vineland-3", "Other"]

const DEFAULT_VBMAPP_DOMAINS: DomainScore[] = [
  { name: "Mand", score: 0, ageEquivalent: "", notes: "" },
  { name: "Tact", score: 0, ageEquivalent: "", notes: "" },
  { name: "Listener Responding", score: 0, ageEquivalent: "", notes: "" },
  { name: "Visual Perceptual", score: 0, ageEquivalent: "", notes: "" },
  { name: "Play", score: 0, ageEquivalent: "", notes: "" },
  { name: "Social", score: 0, ageEquivalent: "", notes: "" },
  { name: "Imitation", score: 0, ageEquivalent: "", notes: "" },
  { name: "Echoic", score: 0, ageEquivalent: "", notes: "" },
  { name: "Intraverbal", score: 0, ageEquivalent: "", notes: "" },
]

export default function AssessmentDataPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<AssessmentFormData>({
    assessmentType: "VB-MAPP",
    assessmentDate: new Date().toISOString().split("T")[0],
    domains: DEFAULT_VBMAPP_DOMAINS,
    strengths: [""],
    deficits: [""],
    overallSummary: "",
  })

  useEffect(() => {
    setIsClient(true)
    const saved = safeGetItem("aria-assessment-data", null)
    if (saved) {
      setFormData(saved)
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    const timer = setTimeout(() => {
      safeSetItem("aria-assessment-data", formData)
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, isClient])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    safeSetItem("aria-assessment-data", formData)
    setIsSaving(false)
    toast({ title: "Saved", description: "Assessment data saved successfully" })
  }

  const updateDomain = (index: number, field: keyof DomainScore, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }))
  }

  const addItem = (field: "strengths" | "deficits") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }))
  }

  const removeItem = (field: "strengths" | "deficits", index: number) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
  }

  const updateItem = (field: "strengths" | "deficits", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Assessment Context & Tools</h1>
            <p className="text-sm text-slate-500">Step 4 of 18 - Record assessment scores</p>
          </div>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assessment Type</Label>
                  <Select
                    value={formData.assessmentType}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, assessmentType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSESSMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assessment Date</Label>
                  <Input
                    type="date"
                    value={formData.assessmentDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, assessmentDate: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Scores</CardTitle>
                <CardDescription>Record scores for each assessed domain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.domains.map((domain, index) => (
                  <div key={domain.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{domain.name}</h4>
                      <Badge variant="outline">{domain.score}/15</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label className="text-xs text-slate-500">Score (0-15)</Label>
                        <Slider
                          value={[domain.score]}
                          onValueChange={([v]) => updateDomain(index, "score", v)}
                          max={15}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Age Equivalent</Label>
                        <Input
                          value={domain.ageEquivalent}
                          onChange={(e) => updateDomain(index, "ageEquivalent", e.target.value)}
                          placeholder="e.g., 2y 6m"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs text-slate-500">Notes</Label>
                      <Textarea
                        value={domain.notes}
                        onChange={(e) => updateDomain(index, "notes", e.target.value)}
                        placeholder="Observations for this domain..."
                        className="mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.strengths.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateItem("strengths", index, e.target.value)}
                        placeholder="Enter a strength..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem("strengths", index)}
                        disabled={formData.strengths.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addItem("strengths")}>
                    <Plus className="h-4 w-4 mr-1" /> Add Strength
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Deficits/Areas of Need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.deficits.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateItem("deficits", index, e.target.value)}
                        placeholder="Enter a deficit..."
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem("deficits", index)}
                        disabled={formData.deficits.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addItem("deficits")}>
                    <Plus className="h-4 w-4 mr-1" /> Add Deficit
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Overall Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.overallSummary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, overallSummary: e.target.value }))}
                  placeholder="Provide an overall summary of assessment findings..."
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => router.push("/assessment/background-history")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: Background
          </Button>
          <Button onClick={() => router.push("/assessment/domains")} className="bg-teal-600 hover:bg-teal-700">
            Next: Domains
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
