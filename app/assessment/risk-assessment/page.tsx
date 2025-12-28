"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Save, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { safeGetString } from "@/lib/safe-storage"

interface CrisisContact {
  name: string
  relationship: string
  phone: string
}

interface RiskData {
  overallRisk: string
  selfInjury: boolean
  selfInjuryNotes: string
  aggression: boolean
  aggressionNotes: string
  elopement: boolean
  elopementNotes: string
  pica: boolean
  picaNotes: string
  propertyDestruction: boolean
  propertyDestructionNotes: string
  safetyPlan: string
  crisisContacts: CrisisContact[]
  additionalNotes: string
}

export default function RiskAssessmentPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [evaluationType, setEvaluationType] = useState<string>("Initial Assessment")

  const {
    value: formData,
    setValue: setFormData,
    status,
    saveNow,
  } = useStepData<RiskData>("risk", {
    overallRisk: "",
    selfInjury: false,
    selfInjuryNotes: "",
    aggression: false,
    aggressionNotes: "",
    elopement: false,
    elopementNotes: "",
    pica: false,
    picaNotes: "",
    propertyDestruction: false,
    propertyDestructionNotes: "",
    safetyPlan: "",
    crisisContacts: [{ name: "", relationship: "", phone: "" }],
    additionalNotes: "",
  })

  const { navigateWithSave } = useSafeNavigation(saveNow)

  useEffect(() => {
    setIsClient(true)
    const savedType = safeGetString("aria_evaluation_type", null)
    if (savedType) {
      setEvaluationType(savedType)
    }
  }, [])

  const handleSave = async () => {
    const success = await saveNow()
    if (success) {
      toast({ title: "Saved", description: "Risk assessment saved successfully" })
    }
  }

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      crisisContacts: [...prev.crisisContacts, { name: "", relationship: "", phone: "" }],
    }))
  }

  const removeContact = (index: number) => {
    if (formData.crisisContacts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        crisisContacts: prev.crisisContacts.filter((_, i) => i !== index),
      }))
    }
  }

  const updateContact = (index: number, field: keyof CrisisContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      crisisContacts: prev.crisisContacts.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }))
  }

  const riskBehaviors = [
    { key: "selfInjury", label: "Self-Injurious Behavior (SIB)", notesKey: "selfInjuryNotes" },
    { key: "aggression", label: "Physical Aggression", notesKey: "aggressionNotes" },
    { key: "elopement", label: "Elopement/Running", notesKey: "elopementNotes" },
    { key: "pica", label: "Pica", notesKey: "picaNotes" },
    { key: "propertyDestruction", label: "Property Destruction", notesKey: "propertyDestructionNotes" },
  ]

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/risk-assessment")
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
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Risk Assessment
            </h1>
            <p className="text-sm text-slate-500">
              Step {stepNumber} of {totalSteps} - Identify safety concerns
            </p>
          </div>
          <Button variant="outline" onClick={handleSave} disabled={status === "saving"}>
            <Save className="h-4 w-4 mr-2" />
            {status === "saving" ? "Saving..." : "Save"}
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.overallRisk}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, overallRisk: v }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">
                      <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">
                      <Badge className="bg-red-100 text-red-800">High</Badge>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Behaviors</CardTitle>
                <CardDescription>Check all that apply and provide details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskBehaviors.map((behavior) => (
                  <div key={behavior.key} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox
                        id={behavior.key}
                        checked={formData[behavior.key as keyof RiskData] as boolean}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, [behavior.key]: checked }))}
                      />
                      <Label htmlFor={behavior.key} className="font-medium">
                        {behavior.label}
                      </Label>
                    </div>
                    {formData[behavior.key as keyof RiskData] && (
                      <Textarea
                        value={formData[behavior.notesKey as keyof RiskData] as string}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [behavior.notesKey]: e.target.value }))}
                        placeholder="Describe frequency, intensity, and any patterns observed..."
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.safetyPlan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, safetyPlan: e.target.value }))}
                  placeholder="Outline safety precautions, supervision requirements, and intervention strategies..."
                  className="min-h-[150px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crisis Contacts</CardTitle>
                  <Button variant="outline" size="sm" onClick={addContact}>
                    <Plus className="h-4 w-4 mr-1" /> Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.crisisContacts.map((contact, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => updateContact(index, "name", e.target.value)}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <Input
                        value={contact.relationship}
                        onChange={(e) => updateContact(index, "relationship", e.target.value)}
                        placeholder="e.g., Parent"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => updateContact(index, "phone", e.target.value)}
                        placeholder="(xxx) xxx-xxxx"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContact(index)}
                      disabled={formData.crisisContacts.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))}
                  placeholder="Any additional risk factors or safety considerations..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => navigateWithSave("/assessment/abc-observation")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: ABC Observation
          </Button>
          <Button onClick={() => navigateWithSave("/assessment/goals")} className="bg-teal-600 hover:bg-teal-700">
            Next: Initial Goals
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
