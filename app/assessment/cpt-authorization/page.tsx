"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { PlusIcon, AlertCircleIcon, SaveIcon } from "@/components/icons"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { toast } from "@/hooks/use-toast"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { safeGetString } from "@/lib/safe-storage"

interface CPTRequest {
  id: string
  code: string
  description: string
  unitsRequested: number
  frequency: string
  justification: string
}

const CPT_CODES = [
  { code: "97151", description: "Behavior Assessment (BCBA)", units: 1 },
  { code: "97152", description: "Behavior Assessment (Supporting)", units: 1 },
  { code: "97153", description: "Direct Treatment (1:1)", units: 1 },
  { code: "97154", description: "Group Treatment", units: 1 },
  { code: "97155", description: "Protocol Modification (BCBA)", units: 1 },
  { code: "97156", description: "Caregiver Training", units: 1 },
  { code: "97157", description: "Multiple-Family Group Training", units: 1 },
]

export default function CPTAuthorizationPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [evaluationType, setEvaluationType] = useState<string>("Initial Assessment")
  const [isSaving, setIsSaving] = useState(false) // Declare isSaving variable

  const {
    value: cptRequests,
    setValue: setCptRequests,
    status,
    saveNow,
  } = useStepData<CPTRequest[]>("cpt-authorization", [
    {
      id: "1",
      code: "97153",
      description: "Direct Treatment (1:1)",
      unitsRequested: 40,
      frequency: "Weekly",
      justification: "",
    },
  ])

  const { navigateWithSave } = useSafeNavigation(saveNow)

  useEffect(() => {
    setIsClient(true)
    const savedType = safeGetString("aria_evaluation_type", null)
    if (savedType) {
      setEvaluationType(savedType)
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true) // Set isSaving to true before saving
    const success = await saveNow()
    setIsSaving(false) // Set isSaving to false after saving
    if (success) {
      toast({ title: "Saved", description: "CPT authorization saved successfully" })
    }
  }

  const addRequest = () => {
    setCptRequests((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        code: "",
        description: "",
        unitsRequested: 0,
        frequency: "Weekly",
        justification: "",
      },
    ])
  }

  const removeRequest = (id: string) => {
    if (cptRequests.length > 1) {
      setCptRequests((prev) => prev.filter((r) => r.id !== id))
    }
  }

  const updateRequest = (id: string, field: keyof CPTRequest, value: string | number) => {
    setCptRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (field === "code") {
            const cpt = CPT_CODES.find((c) => c.code === value)
            return { ...r, code: value as string, description: cpt?.description || "" }
          }
          return { ...r, [field]: value }
        }
        return r
      }),
    )
  }

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/cpt-authorization")
  const stepNumber = currentStepIndex + 1
  const totalSteps = allSteps.length

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
            <h1 className="text-xl font-semibold text-slate-900">CPT Code Authorization Request</h1>
            <p className="text-sm text-slate-500">
              Step {stepNumber} of {totalSteps} - Request authorization for services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addRequest}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add CPT
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <Card className="border-2 border-teal-200 bg-teal-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-teal-600" />
                  Authorization Request Summary
                </CardTitle>
                <CardDescription>
                  Complete CPT code requests with justification for insurance authorization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-slate-500 mb-1">Total CPT Codes</p>
                    <p className="text-2xl font-bold text-slate-900">{cptRequests.length}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-slate-500 mb-1">Direct Treatment Units</p>
                    <p className="text-2xl font-bold text-teal-600">
                      {cptRequests.filter((r) => r.code === "97153").reduce((sum, r) => sum + r.unitsRequested, 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-slate-500 mb-1">Supervision Units</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {cptRequests.filter((r) => r.code === "97155").reduce((sum, r) => sum + r.unitsRequested, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPT Code Requests</CardTitle>
                <CardDescription>Add and configure CPT codes for authorization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {cptRequests.map((request, index) => (
                  <Card key={request.id} className="border-l-4 border-l-teal-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            #{index + 1}
                          </Badge>
                          <div>
                            <CardTitle className="text-base">{request.code || "Select CPT Code"}</CardTitle>
                            <CardDescription className="text-xs">{request.description}</CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequest(request.id)}
                          disabled={cptRequests.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>CPT Code</Label>
                          <Select value={request.code} onValueChange={(v) => updateRequest(request.id, "code", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select code" />
                            </SelectTrigger>
                            <SelectContent>
                              {CPT_CODES.map((cpt) => (
                                <SelectItem key={cpt.code} value={cpt.code}>
                                  {cpt.code} - {cpt.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Units Requested</Label>
                          <input
                            type="number"
                            value={request.unitsRequested}
                            onChange={(e) =>
                              updateRequest(request.id, "unitsRequested", Number.parseInt(e.target.value) || 0)
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            min={0}
                          />
                        </div>
                        <div>
                          <Label>Frequency</Label>
                          <Select
                            value={request.frequency}
                            onValueChange={(v) => updateRequest(request.id, "frequency", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Medical Necessity Justification</Label>
                        <Textarea
                          value={request.justification}
                          onChange={(e) => updateRequest(request.id, "justification", e.target.value)}
                          placeholder="Provide clinical justification for this CPT code and unit request..."
                          className="min-h-[100px] mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => navigateWithSave("/assessment/service-plan")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: Service Plan
          </Button>
          <Button
            onClick={() => navigateWithSave("/assessment/medical-necessity")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Next: Medical Necessity
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
