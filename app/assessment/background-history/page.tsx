"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SaveIcon, PlusIcon, TrashIcon } from "@/components/icons"
import { toast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Baby, Heart, GraduationCap, Stethoscope, Users, FileText } from "lucide-react"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { INITIAL_ASSESSMENT_STEPS, REASSESSMENT_STEPS } from "@/lib/wizard-steps-config"
import { safeGetItem, safeSetItem, safeGetString } from "@/lib/safe-storage"

interface DevelopmentalMilestone {
  id: string
  milestone: string
  expectedAge: string
  actualAge: string
  status: "on-track" | "delayed" | "not-achieved" | "unknown"
  notes: string
}

interface PregnancyBirthHistory {
  pregnancyComplications: string[]
  birthType: "vaginal" | "cesarean" | "unknown"
  gestationalAge: string
  birthWeight: string
  apgarScores: string
  nicuStay: boolean
  nicuDuration: string
  birthComplications: string[]
  notes: string
}

interface FamilyMember {
  id: string
  relationship: string
  age: string
  livesWithClient: boolean
  diagnosesConditions: string[]
  notes: string
}

interface FamilyHistory {
  members: FamilyMember[]
  asdInFamily: boolean
  adhdInFamily: boolean
  intellectualDisabilityInFamily: boolean
  mentalHealthInFamily: boolean
  otherConditions: string
  familyStrengths: string
  familyChallenges: string
}

interface PreviousTreatment {
  id: string
  type: "ABA" | "Speech" | "OT" | "PT" | "Counseling" | "Psychiatry" | "Other"
  provider: string
  startDate: string
  endDate: string
  frequency: string
  outcomes: string
  reasonForDischarge: string
  contactInfo: string
}

interface MedicalInfo {
  primaryDiagnosis: string
  secondaryDiagnoses: string[]
  medications: { name: string; dosage: string; purpose: string; prescriber: string }[]
  allergies: string[]
  hospitalizations: string[]
  surgeries: string[]
  primaryCarePhysician: string
  specialists: { type: string; name: string; phone: string }[]
  lastPhysicalDate: string
  visionHearingStatus: string
  sleepPatterns: string
  dietaryRestrictions: string
}

interface BackgroundData {
  developmental: string
  medical: string
  educational: string
  previousServices: string
  milestones: DevelopmentalMilestone[]
  pregnancyBirth: PregnancyBirthHistory
  familyHistory: FamilyHistory
  previousTreatments: PreviousTreatment[]
  medicalInfo: MedicalInfo
}

const DEFAULT_MILESTONES: DevelopmentalMilestone[] = [
  { id: "m1", milestone: "First smiled", expectedAge: "2 months", actualAge: "", status: "unknown", notes: "" },
  { id: "m2", milestone: "Rolled over", expectedAge: "4-6 months", actualAge: "", status: "unknown", notes: "" },
  {
    id: "m3",
    milestone: "Sat without support",
    expectedAge: "6-8 months",
    actualAge: "",
    status: "unknown",
    notes: "",
  },
  { id: "m4", milestone: "Crawled", expectedAge: "7-10 months", actualAge: "", status: "unknown", notes: "" },
  { id: "m5", milestone: "First words", expectedAge: "12 months", actualAge: "", status: "unknown", notes: "" },
  {
    id: "m6",
    milestone: "Walked independently",
    expectedAge: "12-15 months",
    actualAge: "",
    status: "unknown",
    notes: "",
  },
  { id: "m7", milestone: "Two-word phrases", expectedAge: "18-24 months", actualAge: "", status: "unknown", notes: "" },
  {
    id: "m8",
    milestone: "Toilet trained (day)",
    expectedAge: "2-3 years",
    actualAge: "",
    status: "unknown",
    notes: "",
  },
  {
    id: "m9",
    milestone: "Toilet trained (night)",
    expectedAge: "3-4 years",
    actualAge: "",
    status: "unknown",
    notes: "",
  },
  { id: "m10", milestone: "Played with peers", expectedAge: "3-4 years", actualAge: "", status: "unknown", notes: "" },
]

const PREGNANCY_COMPLICATIONS = [
  "Gestational diabetes",
  "Preeclampsia",
  "Placenta previa",
  "Preterm labor",
  "Infections",
  "Substance exposure",
  "Medication use",
  "Trauma/injury",
  "Multiple gestation",
  "Advanced maternal age",
]

const BIRTH_COMPLICATIONS = [
  "Prolonged labor",
  "Cord around neck",
  "Meconium aspiration",
  "Low Apgar scores",
  "Respiratory distress",
  "Jaundice requiring treatment",
  "Feeding difficulties",
  "Hypoglycemia",
  "Seizures",
]

const TREATMENT_TYPES = ["ABA", "Speech", "OT", "PT", "Counseling", "Psychiatry", "Other"] as const

export default function BackgroundHistoryPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("developmental")

  const [evaluationType, setEvaluationType] = useState<"Initial Assessment" | "Reassessment">("Initial Assessment")

  const [smartPasteOpen, setSmartPasteOpen] = useState(false)
  const [smartPasteSection, setSmartPasteSection] = useState<string | null>(null)
  const [smartPasteText, setSmartPasteText] = useState("")

  const [formData, setFormData] = useState<BackgroundData>({
    developmental: "",
    medical: "",
    educational: "",
    previousServices: "",
    milestones: DEFAULT_MILESTONES,
    pregnancyBirth: {
      pregnancyComplications: [],
      birthType: "unknown",
      gestationalAge: "",
      birthWeight: "",
      apgarScores: "",
      nicuStay: false,
      nicuDuration: "",
      birthComplications: [],
      notes: "",
    },
    familyHistory: {
      members: [],
      asdInFamily: false,
      adhdInFamily: false,
      intellectualDisabilityInFamily: false,
      mentalHealthInFamily: false,
      otherConditions: "",
      familyStrengths: "",
      familyChallenges: "",
    },
    previousTreatments: [],
    medicalInfo: {
      primaryDiagnosis: "",
      secondaryDiagnoses: [],
      medications: [],
      allergies: [],
      hospitalizations: [],
      surgeries: [],
      primaryCarePhysician: "",
      specialists: [],
      lastPhysicalDate: "",
      visionHearingStatus: "",
      sleepPatterns: "",
      dietaryRestrictions: "",
    },
  })

  useEffect(() => {
    setIsClient(true)
    const parsed = safeGetItem("aria-background-history", {})
    setFormData({ ...formData, ...parsed })

    const savedType = safeGetString("aria_evaluation_type", null)
    if (savedType === "Reassessment") {
      setEvaluationType("Reassessment")
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    const timer = setTimeout(() => {
      safeSetItem("aria-background-history", formData)
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, isClient])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    safeSetItem("aria-background-history", formData)
    setLastSaved(new Date())
    setIsSaving(false)
    toast({ title: "Saved", description: "Background & History saved successfully" })
  }

  // Milestone functions
  const updateMilestone = (id: string, field: keyof DevelopmentalMilestone, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }))
  }

  // Family member functions
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: `fm-${Date.now()}`,
      relationship: "",
      age: "",
      livesWithClient: false,
      diagnosesConditions: [],
      notes: "",
    }
    setFormData((prev) => ({
      ...prev,
      familyHistory: { ...prev.familyHistory, members: [...prev.familyHistory.members, newMember] },
    }))
  }

  const removeFamilyMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      familyHistory: { ...prev.familyHistory, members: prev.familyHistory.members.filter((m) => m.id !== id) },
    }))
  }

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      familyHistory: {
        ...prev.familyHistory,
        members: prev.familyHistory.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      },
    }))
  }

  // Previous treatment functions
  const addTreatment = () => {
    const newTreatment: PreviousTreatment = {
      id: `tx-${Date.now()}`,
      type: "ABA",
      provider: "",
      startDate: "",
      endDate: "",
      frequency: "",
      outcomes: "",
      reasonForDischarge: "",
      contactInfo: "",
    }
    setFormData((prev) => ({
      ...prev,
      previousTreatments: [...prev.previousTreatments, newTreatment],
    }))
  }

  const removeTreatment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      previousTreatments: prev.previousTreatments.filter((t) => t.id !== id),
    }))
  }

  const updateTreatment = (id: string, field: keyof PreviousTreatment, value: string) => {
    setFormData((prev) => ({
      ...prev,
      previousTreatments: prev.previousTreatments.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }))
  }

  // Calculate completion
  const completedMilestones = formData.milestones.filter((m) => m.status !== "unknown").length
  const totalMilestones = formData.milestones.length

  const allSteps = evaluationType === "Reassessment" ? REASSESSMENT_STEPS : INITIAL_ASSESSMENT_STEPS
  const currentStepIndex = allSteps.findIndex((s) => s.route === "/assessment/background-history")
  const stepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 2
  const totalSteps = allSteps.length

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Background & History</h1>
            <p className="text-sm text-slate-500">
              Step {stepNumber} of {totalSteps} - Comprehensive client history
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-xs text-slate-400">Last saved {lastSaved.toLocaleTimeString()}</span>}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="developmental" className="flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  Developmental
                </TabsTrigger>
                <TabsTrigger value="family" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Family
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="educational" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Educational
                </TabsTrigger>
                <TabsTrigger value="treatments" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Treatments
                </TabsTrigger>
              </TabsList>

              {/* DEVELOPMENTAL TAB */}
              <TabsContent value="developmental" className="space-y-6">
                {/* Pregnancy & Birth History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Baby className="h-5 w-5 text-pink-500" />
                      Pregnancy & Birth History
                    </CardTitle>
                    <CardDescription>Document prenatal and perinatal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Gestational Age at Birth</Label>
                        <Input
                          value={formData.pregnancyBirth.gestationalAge}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pregnancyBirth: { ...prev.pregnancyBirth, gestationalAge: e.target.value },
                            }))
                          }
                          placeholder="e.g., 38 weeks"
                        />
                      </div>
                      <div>
                        <Label>Birth Weight</Label>
                        <Input
                          value={formData.pregnancyBirth.birthWeight}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pregnancyBirth: { ...prev.pregnancyBirth, birthWeight: e.target.value },
                            }))
                          }
                          placeholder="e.g., 7 lbs 4 oz"
                        />
                      </div>
                      <div>
                        <Label>Type of Delivery</Label>
                        <Select
                          value={formData.pregnancyBirth.birthType}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              pregnancyBirth: {
                                ...prev.pregnancyBirth,
                                birthType: v as "vaginal" | "cesarean" | "unknown",
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vaginal">Vaginal</SelectItem>
                            <SelectItem value="cesarean">Cesarean (C-Section)</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>APGAR Scores (if known)</Label>
                        <Input
                          value={formData.pregnancyBirth.apgarScores}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pregnancyBirth: { ...prev.pregnancyBirth, apgarScores: e.target.value },
                            }))
                          }
                          placeholder="e.g., 8/9 at 1 and 5 minutes"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.pregnancyBirth.nicuStay}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                pregnancyBirth: { ...prev.pregnancyBirth, nicuStay: checked as boolean },
                              }))
                            }
                          />
                          <Label>NICU Stay Required</Label>
                        </div>
                        {formData.pregnancyBirth.nicuStay && (
                          <Input
                            value={formData.pregnancyBirth.nicuDuration}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                pregnancyBirth: { ...prev.pregnancyBirth, nicuDuration: e.target.value },
                              }))
                            }
                            placeholder="Duration (e.g., 3 days)"
                            className="w-48"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Pregnancy Complications (select all that apply)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {PREGNANCY_COMPLICATIONS.map((comp) => (
                          <div key={comp} className="flex items-center gap-2">
                            <Checkbox
                              checked={formData.pregnancyBirth.pregnancyComplications.includes(comp)}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  pregnancyBirth: {
                                    ...prev.pregnancyBirth,
                                    pregnancyComplications: checked
                                      ? [...prev.pregnancyBirth.pregnancyComplications, comp]
                                      : prev.pregnancyBirth.pregnancyComplications.filter((c) => c !== comp),
                                  },
                                }))
                              }}
                            />
                            <Label className="font-normal text-sm">{comp}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Birth Complications (select all that apply)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {BIRTH_COMPLICATIONS.map((comp) => (
                          <div key={comp} className="flex items-center gap-2">
                            <Checkbox
                              checked={formData.pregnancyBirth.birthComplications.includes(comp)}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  pregnancyBirth: {
                                    ...prev.pregnancyBirth,
                                    birthComplications: checked
                                      ? [...prev.pregnancyBirth.birthComplications, comp]
                                      : prev.pregnancyBirth.birthComplications.filter((c) => c !== comp),
                                  },
                                }))
                              }}
                            />
                            <Label className="font-normal text-sm">{comp}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={formData.pregnancyBirth.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pregnancyBirth: { ...prev.pregnancyBirth, notes: e.target.value },
                          }))
                        }
                        placeholder="Any other relevant pregnancy or birth information..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Developmental Milestones */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Developmental Milestones
                        </CardTitle>
                        <CardDescription>Track milestone achievement ages</CardDescription>
                      </div>
                      <Badge variant="outline">
                        {completedMilestones}/{totalMilestones} documented
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`p-3 rounded-lg border ${
                            milestone.status === "on-track"
                              ? "bg-green-50 border-green-200"
                              : milestone.status === "delayed"
                                ? "bg-amber-50 border-amber-200"
                                : milestone.status === "not-achieved"
                                  ? "bg-red-50 border-red-200"
                                  : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                              <p className="font-medium text-sm">{milestone.milestone}</p>
                              <p className="text-xs text-slate-500">Expected: {milestone.expectedAge}</p>
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={milestone.actualAge}
                                onChange={(e) => updateMilestone(milestone.id, "actualAge", e.target.value)}
                                placeholder="Actual age"
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Select
                                value={milestone.status}
                                onValueChange={(v) => updateMilestone(milestone.id, "status", v)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="on-track">On Track</SelectItem>
                                  <SelectItem value="delayed">Delayed</SelectItem>
                                  <SelectItem value="not-achieved">Not Achieved</SelectItem>
                                  <SelectItem value="unknown">Unknown</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-5">
                              <Input
                                value={milestone.notes}
                                onChange={(e) => updateMilestone(milestone.id, "notes", e.target.value)}
                                placeholder="Notes"
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Narrative Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Developmental History Narrative</CardTitle>
                    <CardDescription>Summarize developmental history in narrative form</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.developmental}
                      onChange={(e) => setFormData((prev) => ({ ...prev, developmental: e.target.value }))}
                      placeholder="Describe developmental history, including early concerns, when delays were first noticed, and progression over time..."
                      className="min-h-[150px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FAMILY TAB */}
              <TabsContent value="family" className="space-y-6">
                {/* Family Composition */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          Family Composition
                        </CardTitle>
                        <CardDescription>Document family members and living situation</CardDescription>
                      </div>
                      <Button onClick={addFamilyMember} size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Family Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.familyHistory.members.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No family members added yet</p>
                        <Button onClick={addFamilyMember} variant="outline" className="mt-2 bg-transparent">
                          Add First Family Member
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.familyHistory.members.map((member) => (
                          <div key={member.id} className="p-4 border rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">{member.relationship || "Family Member"}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => removeFamilyMember(member.id)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <Label>Relationship</Label>
                                <Input
                                  value={member.relationship}
                                  onChange={(e) => updateFamilyMember(member.id, "relationship", e.target.value)}
                                  placeholder="e.g., Mother, Father, Sibling"
                                />
                              </div>
                              <div>
                                <Label>Age</Label>
                                <Input
                                  value={member.age}
                                  onChange={(e) => updateFamilyMember(member.id, "age", e.target.value)}
                                  placeholder="Age"
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <Checkbox
                                  checked={member.livesWithClient}
                                  onCheckedChange={(checked) =>
                                    updateFamilyMember(member.id, "livesWithClient", checked)
                                  }
                                />
                                <Label>Lives with client</Label>
                              </div>
                              <div>
                                <Label>Diagnoses/Conditions</Label>
                                <Input
                                  value={member.diagnosesConditions.join(", ")}
                                  onChange={(e) =>
                                    updateFamilyMember(
                                      member.id,
                                      "diagnosesConditions",
                                      e.target.value.split(",").map((s) => s.trim()),
                                    )
                                  }
                                  placeholder="e.g., ASD, ADHD"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <Label>Notes</Label>
                              <Textarea
                                value={member.notes}
                                onChange={(e) => updateFamilyMember(member.id, "notes", e.target.value)}
                                placeholder="Additional information about this family member..."
                                className="mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Family Medical History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Family Medical History</CardTitle>
                    <CardDescription>Document relevant diagnoses in the family</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.familyHistory.asdInFamily}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: { ...prev.familyHistory, asdInFamily: checked as boolean },
                            }))
                          }
                        />
                        <div>
                          <Label>ASD in Family</Label>
                          <p className="text-xs text-slate-500">Autism Spectrum Disorder</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.familyHistory.adhdInFamily}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: { ...prev.familyHistory, adhdInFamily: checked as boolean },
                            }))
                          }
                        />
                        <div>
                          <Label>ADHD in Family</Label>
                          <p className="text-xs text-slate-500">Attention Deficit Hyperactivity Disorder</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.familyHistory.intellectualDisabilityInFamily}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: {
                                ...prev.familyHistory,
                                intellectualDisabilityInFamily: checked as boolean,
                              },
                            }))
                          }
                        />
                        <div>
                          <Label>Intellectual Disability</Label>
                          <p className="text-xs text-slate-500">ID or developmental delays</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.familyHistory.mentalHealthInFamily}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: { ...prev.familyHistory, mentalHealthInFamily: checked as boolean },
                            }))
                          }
                        />
                        <div>
                          <Label>Mental Health Conditions</Label>
                          <p className="text-xs text-slate-500">Depression, anxiety, etc.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Other Conditions in Family</Label>
                      <Textarea
                        value={formData.familyHistory.otherConditions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            familyHistory: { ...prev.familyHistory, otherConditions: e.target.value },
                          }))
                        }
                        placeholder="Document any other relevant conditions in the family..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Family Strengths</Label>
                        <Textarea
                          value={formData.familyHistory.familyStrengths}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: { ...prev.familyHistory, familyStrengths: e.target.value },
                            }))
                          }
                          placeholder="e.g., Supportive extended family, consistent routines, strong advocacy..."
                        />
                      </div>
                      <div>
                        <Label>Family Challenges</Label>
                        <Textarea
                          value={formData.familyHistory.familyChallenges}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              familyHistory: { ...prev.familyHistory, familyChallenges: e.target.value },
                            }))
                          }
                          placeholder="e.g., Limited transportation, language barriers, work schedules..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MEDICAL TAB */}
              <TabsContent value="medical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Medical Information
                    </CardTitle>
                    <CardDescription>Document diagnoses, medications, and medical history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Diagnosis</Label>
                        <Input
                          value={formData.medicalInfo.primaryDiagnosis}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: { ...prev.medicalInfo, primaryDiagnosis: e.target.value },
                            }))
                          }
                          placeholder="e.g., Autism Spectrum Disorder (F84.0)"
                        />
                      </div>
                      <div>
                        <Label>Primary Care Physician</Label>
                        <Input
                          value={formData.medicalInfo.primaryCarePhysician}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: { ...prev.medicalInfo, primaryCarePhysician: e.target.value },
                            }))
                          }
                          placeholder="Dr. Name, Phone"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Secondary Diagnoses</Label>
                      <Textarea
                        value={formData.medicalInfo.secondaryDiagnoses.join("\n")}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            medicalInfo: {
                              ...prev.medicalInfo,
                              secondaryDiagnoses: e.target.value.split("\n").filter((s) => s.trim()),
                            },
                          }))
                        }
                        placeholder="Enter each diagnosis on a new line..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Allergies</Label>
                        <Textarea
                          value={formData.medicalInfo.allergies.join("\n")}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: {
                                ...prev.medicalInfo,
                                allergies: e.target.value.split("\n").filter((s) => s.trim()),
                              },
                            }))
                          }
                          placeholder="Enter each allergy on a new line..."
                        />
                      </div>
                      <div>
                        <Label>Vision/Hearing Status</Label>
                        <Textarea
                          value={formData.medicalInfo.visionHearingStatus}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: { ...prev.medicalInfo, visionHearingStatus: e.target.value },
                            }))
                          }
                          placeholder="e.g., Vision and hearing within normal limits per last screening..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Sleep Patterns</Label>
                        <Textarea
                          value={formData.medicalInfo.sleepPatterns}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: { ...prev.medicalInfo, sleepPatterns: e.target.value },
                            }))
                          }
                          placeholder="e.g., Difficulty falling asleep, 8 hours average, frequent night waking..."
                        />
                      </div>
                      <div>
                        <Label>Dietary Restrictions</Label>
                        <Textarea
                          value={formData.medicalInfo.dietaryRestrictions}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              medicalInfo: { ...prev.medicalInfo, dietaryRestrictions: e.target.value },
                            }))
                          }
                          placeholder="e.g., Gluten-free, sensory-based food selectivity..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical Narrative */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medical History Narrative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.medical}
                      onChange={(e) => setFormData((prev) => ({ ...prev, medical: e.target.value }))}
                      placeholder="Summarize relevant medical history..."
                      className="min-h-[150px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* EDUCATIONAL TAB */}
              <TabsContent value="educational" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      Educational History
                    </CardTitle>
                    <CardDescription>Document school placement and educational services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.educational}
                      onChange={(e) => setFormData((prev) => ({ ...prev, educational: e.target.value }))}
                      placeholder="Describe current school placement, grade level, IEP or 504 plan status, classroom setting (general education, resource, self-contained), academic strengths and challenges, relationship with teachers and peers..."
                      className="min-h-[300px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PREVIOUS TREATMENTS TAB */}
              <TabsContent value="treatments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5 text-green-500" />
                          Previous Treatments & Services
                        </CardTitle>
                        <CardDescription>Document prior therapy services and outcomes</CardDescription>
                      </div>
                      <Button onClick={addTreatment} size="sm">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Treatment
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {formData.previousTreatments.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No previous treatments documented</p>
                        <Button onClick={addTreatment} variant="outline" className="mt-2 bg-transparent">
                          Add First Treatment
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.previousTreatments.map((treatment, index) => (
                          <Card key={treatment.id} className="border-l-4 border-l-teal-500">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge>{treatment.type} Therapy</Badge>
                                <Button variant="ghost" size="sm" onClick={() => removeTreatment(treatment.id)}>
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <Label>Type</Label>
                                  <Select
                                    value={treatment.type}
                                    onValueChange={(v) => updateTreatment(treatment.id, "type", v)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TREATMENT_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                          {t}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Provider/Agency</Label>
                                  <Input
                                    value={treatment.provider}
                                    onChange={(e) => updateTreatment(treatment.id, "provider", e.target.value)}
                                    placeholder="Provider name"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="date"
                                    value={treatment.startDate}
                                    onChange={(e) => updateTreatment(treatment.id, "startDate", e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    value={treatment.endDate}
                                    onChange={(e) => updateTreatment(treatment.id, "endDate", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Frequency</Label>
                                  <Input
                                    value={treatment.frequency}
                                    onChange={(e) => updateTreatment(treatment.id, "frequency", e.target.value)}
                                    placeholder="e.g., 2x/week for 45 min"
                                  />
                                </div>
                                <div>
                                  <Label>Contact Info</Label>
                                  <Input
                                    value={treatment.contactInfo}
                                    onChange={(e) => updateTreatment(treatment.id, "contactInfo", e.target.value)}
                                    placeholder="Phone/email for records"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Outcomes & Progress</Label>
                                <Textarea
                                  value={treatment.outcomes}
                                  onChange={(e) => updateTreatment(treatment.id, "outcomes", e.target.value)}
                                  placeholder="Describe goals addressed and progress made..."
                                />
                              </div>
                              <div>
                                <Label>Reason for Discharge</Label>
                                <Textarea
                                  value={treatment.reasonForDischarge}
                                  onChange={(e) => updateTreatment(treatment.id, "reasonForDischarge", e.target.value)}
                                  placeholder="e.g., Goals met, moved, insurance change, family decision..."
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Services Narrative */}
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Services Narrative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.previousServices}
                      onChange={(e) => setFormData((prev) => ({ ...prev, previousServices: e.target.value }))}
                      placeholder="Summarize previous services and their impact..."
                      className="min-h-[150px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Footer Navigation */}
        <footer className="bg-white border-t px-6 py-4 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={() => router.push("/assessment/client-info")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous: Client Info
          </Button>
          <Button
            onClick={() => {
              const evaluationType = safeGetString("aria_evaluation_type", null)
              const nextRoute =
                evaluationType === "Reassessment" ? "/assessment/progress-dashboard" : "/assessment/evaluation"
              router.push(nextRoute)
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Next: {safeGetString("aria_evaluation_type", null) === "Reassessment" ? "Progress Dashboard" : "Evaluation"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
