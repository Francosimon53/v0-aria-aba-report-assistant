"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Save, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { useStepData } from "@/lib/hooks/use-step-data"

export const dynamic = "force-dynamic"

interface DomainData {
  severity: "none" | "mild" | "moderate" | "severe" | ""
  observations: string
  strengths: string
  needs: string
}

interface DomainsFormData {
  communication: DomainData
  socialSkills: DomainData
  adaptiveBehavior: DomainData
  behaviorChallenges: DomainData
  cognitiveSkills: DomainData
  motorSkills: DomainData
  globalSummary: string
}

const DOMAINS = [
  { key: "communication", label: "Communication & Language", icon: "💬" },
  { key: "socialSkills", label: "Social Skills & Interaction", icon: "👥" },
  { key: "adaptiveBehavior", label: "Adaptive Behavior & Daily Living", icon: "🏠" },
  { key: "behaviorChallenges", label: "Behavior Challenges", icon: "⚠️" },
  { key: "cognitiveSkills", label: "Cognitive & Academic Skills", icon: "🧠" },
  { key: "motorSkills", label: "Motor Skills", icon: "🏃" },
]

const SEVERITY_OPTIONS = [
  { value: "none", label: "None/WNL", color: "bg-green-100 text-green-800" },
  { value: "mild", label: "Mild", color: "bg-yellow-100 text-yellow-800" },
  { value: "moderate", label: "Moderate", color: "bg-orange-100 text-orange-800" },
  { value: "severe", label: "Severe", color: "bg-red-100 text-red-800" },
]

const DEFAULT_DOMAIN: DomainData = {
  severity: "",
  observations: "",
  strengths: "",
  needs: "",
}

export default function DomainsPage() {
  const router = useRouter()

  const {
    value: formData,
    setValue: setFormData,
    status,
    saveNow,
  } = useStepData<DomainsFormData>(
    "domains",
    {
      communication: { ...DEFAULT_DOMAIN },
      socialSkills: { ...DEFAULT_DOMAIN },
      adaptiveBehavior: { ...DEFAULT_DOMAIN },
      behaviorChallenges: { ...DEFAULT_DOMAIN },
      cognitiveSkills: { ...DEFAULT_DOMAIN },
      motorSkills: { ...DEFAULT_DOMAIN },
      globalSummary: "",
    },
    ["aria-domains"],
  )

  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [openDomains, setOpenDomains] = useState<string[]>(["communication"])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await saveNow()
    setIsSaving(false)
    toast({ title: "Saved", description: "Domains data saved successfully" })
  }

  const toggleDomain = (key: string) => {
    setOpenDomains((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const updateDomain = (domainKey: string, field: keyof DomainData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [domainKey]: { ...prev[domainKey as keyof DomainsFormData], [field]: value },
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
            <h1 className="text-xl font-semibold text-slate-900">Domains & Functional Impact</h1>
            <p className="text-sm text-slate-500">Step 5 of 18 - Assess functional domains</p>
          </div>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {DOMAINS.map((domain) => {
              const domainData = formData[domain.key as keyof DomainsFormData] as DomainData
              const isOpen = openDomains.includes(domain.key)

              return (
                <Collapsible key={domain.key} open={isOpen} onOpenChange={() => toggleDomain(domain.key)}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{domain.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{domain.label}</CardTitle>
                              {domainData.severity && (
                                <Badge className={SEVERITY_OPTIONS.find((s) => s.value === domainData.severity)?.color}>
                                  {SEVERITY_OPTIONS.find((s) => s.value === domainData.severity)?.label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        <div>
                          <Label className="text-sm font-medium">Severity Level</Label>
                          <RadioGroup
                            value={domainData.severity}
                            onValueChange={(v) => updateDomain(domain.key, "severity", v)}
                            className="flex gap-4 mt-2"
                          >
                            {SEVERITY_OPTIONS.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`${domain.key}-${option.value}`} />
                                <Label htmlFor={`${domain.key}-${option.value}`} className="text-sm">
                                  {option.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                        <div>
                          <Label>Clinical Observations</Label>
                          <Textarea
                            value={domainData.observations}
                            onChange={(e) => updateDomain(domain.key, "observations", e.target.value)}
                            placeholder="Describe observed behaviors and abilities..."
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Strengths</Label>
                            <Textarea
                              value={domainData.strengths}
                              onChange={(e) => updateDomain(domain.key, "strengths", e.target.value)}
                              placeholder="Areas of strength..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Needs</Label>
                            <Textarea
                              value={domainData.needs}
                              onChange={(e) => updateDomain(domain.key, "needs", e.target.value)}
                              placeholder="Areas needing support..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}

            <Card>
              <CardHeader>
                <CardTitle>Global Functional Summary</CardTitle>
                <CardDescription>Overall summary across all domains</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.globalSummary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, globalSummary: e.target.value }))}
                  placeholder="Provide a comprehensive summary of functional abilities across domains..."
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => router.push("/assessment/assessment-data")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: Assessment Tools
          </Button>
          <Button onClick={() => router.push("/assessment/abc-observation")} className="bg-teal-600 hover:bg-teal-700">
            Next: ABC Observation
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
