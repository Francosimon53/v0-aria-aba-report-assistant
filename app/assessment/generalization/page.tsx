"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Layers,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Users,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

interface GeneralizationSetting {
  id: string
  name: string
  selected: boolean
  notes: string
}

interface GeneralizationPerson {
  id: string
  name: string
  role: string
  selected: boolean
  trainingStatus: "not-started" | "in-progress" | "trained"
}

interface GeneralizationMaterial {
  id: string
  name: string
  selected: boolean
}

interface FadingStep {
  id: string
  phase: number
  description: string
  criteria: string
  status: "not-started" | "in-progress" | "completed"
}

interface GeneralizationPlan {
  id: string
  skillName: string
  targetBehavior: string
  settings: GeneralizationSetting[]
  people: GeneralizationPerson[]
  materials: GeneralizationMaterial[]
  fadingSchedule: FadingStep[]
  maintenanceSchedule: string
  dataCollection: string
  notes: string
}

const DEFAULT_SETTINGS: GeneralizationSetting[] = [
  { id: "home", name: "Home", selected: false, notes: "" },
  { id: "school", name: "School/Classroom", selected: false, notes: "" },
  { id: "clinic", name: "Clinic/Therapy Room", selected: false, notes: "" },
  { id: "community", name: "Community Settings", selected: false, notes: "" },
  { id: "playground", name: "Playground", selected: false, notes: "" },
  { id: "grocery", name: "Grocery Store", selected: false, notes: "" },
  { id: "restaurant", name: "Restaurant", selected: false, notes: "" },
  { id: "relatives", name: "Relatives' Homes", selected: false, notes: "" },
]

const DEFAULT_PEOPLE: GeneralizationPerson[] = [
  {
    id: "parent1",
    name: "Parent/Caregiver 1",
    role: "Primary Caregiver",
    selected: false,
    trainingStatus: "not-started",
  },
  {
    id: "parent2",
    name: "Parent/Caregiver 2",
    role: "Secondary Caregiver",
    selected: false,
    trainingStatus: "not-started",
  },
  { id: "sibling", name: "Sibling(s)", role: "Family Member", selected: false, trainingStatus: "not-started" },
  { id: "teacher", name: "Teacher", role: "School Staff", selected: false, trainingStatus: "not-started" },
  { id: "aide", name: "Paraprofessional/Aide", role: "School Staff", selected: false, trainingStatus: "not-started" },
  { id: "peer", name: "Peer(s)", role: "Same-age Peer", selected: false, trainingStatus: "not-started" },
  {
    id: "therapist",
    name: "Other Therapist (SLP/OT)",
    role: "Related Service",
    selected: false,
    trainingStatus: "not-started",
  },
  { id: "babysitter", name: "Babysitter/Nanny", role: "Caregiver", selected: false, trainingStatus: "not-started" },
]

const DEFAULT_FADING_SCHEDULE: FadingStep[] = [
  {
    id: "phase1",
    phase: 1,
    description: "Skill demonstrated with full prompts from trained therapist in clinic setting",
    criteria: "80% accuracy with full prompts for 3 consecutive sessions",
    status: "not-started",
  },
  {
    id: "phase2",
    phase: 2,
    description: "Skill demonstrated with partial prompts from trained therapist in clinic setting",
    criteria: "80% accuracy with partial prompts for 3 consecutive sessions",
    status: "not-started",
  },
  {
    id: "phase3",
    phase: 3,
    description: "Skill demonstrated independently in clinic setting with therapist present",
    criteria: "90% accuracy independently for 3 consecutive sessions",
    status: "not-started",
  },
  {
    id: "phase4",
    phase: 4,
    description: "Skill demonstrated with trained caregiver in clinic setting",
    criteria: "90% accuracy with caregiver for 3 consecutive sessions",
    status: "not-started",
  },
  {
    id: "phase5",
    phase: 5,
    description: "Skill demonstrated with caregiver in home setting",
    criteria: "90% accuracy in home for 3 consecutive sessions",
    status: "not-started",
  },
  {
    id: "phase6",
    phase: 6,
    description: "Skill demonstrated across multiple settings and people",
    criteria: "90% accuracy across 3 different settings and 3 different people",
    status: "not-started",
  },
  {
    id: "phase7",
    phase: 7,
    description: "Skill maintained with natural reinforcement schedule",
    criteria: "90% accuracy for 4 consecutive weeks with natural reinforcement",
    status: "not-started",
  },
]

export default function GeneralizationPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedPlans, setExpandedPlans] = useState<string[]>([])

  const [plans, setPlans] = useState<GeneralizationPlan[]>([
    {
      id: "1",
      skillName: "",
      targetBehavior: "",
      settings: [...DEFAULT_SETTINGS],
      people: [...DEFAULT_PEOPLE],
      materials: [],
      fadingSchedule: [...DEFAULT_FADING_SCHEDULE],
      maintenanceSchedule: "Monthly probes for 6 months post-mastery",
      dataCollection: "Probe data collected across settings weekly",
      notes: "",
    },
  ])

  useEffect(() => {
    setIsClient(true)
    const saved = safeGetJSON("aria-generalization", null)
    if (saved) {
      setPlans(saved)
    }

    const goalsData = safeGetJSON("aria-goals", null)
    if (goalsData && plans[0].skillName === "") {
      if (goalsData.length > 0 && goalsData[0].longTerm) {
        // Auto-populate first plan with first goal
      }
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    const timer = setTimeout(() => {
      safeSetJSON("aria-generalization", plans)
    }, 1000)
    return () => clearTimeout(timer)
  }, [plans, isClient])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    safeSetJSON("aria-generalization", plans)
    setIsSaving(false)
    toast({ title: "Saved", description: "Generalization plans saved successfully" })
  }

  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        skillName: "",
        targetBehavior: "",
        settings: [...DEFAULT_SETTINGS],
        people: [...DEFAULT_PEOPLE],
        materials: [],
        fadingSchedule: [...DEFAULT_FADING_SCHEDULE],
        maintenanceSchedule: "Monthly probes for 6 months post-mastery",
        dataCollection: "Probe data collected across settings weekly",
        notes: "",
      },
    ])
  }

  const removePlan = (id: string) => {
    if (plans.length > 1) {
      setPlans((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const updatePlan = (id: string, field: keyof GeneralizationPlan, value: unknown) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const toggleSetting = (planId: string, settingId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const settings = p.settings.map((s) => (s.id === settingId ? { ...s, selected: !s.selected } : s))
          return { ...p, settings }
        }
        return p
      }),
    )
  }

  const togglePerson = (planId: string, personId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const people = p.people.map((per) => (per.id === personId ? { ...per, selected: !per.selected } : per))
          return { ...p, people }
        }
        return p
      }),
    )
  }

  const updatePersonTrainingStatus = (
    planId: string,
    personId: string,
    status: "not-started" | "in-progress" | "trained",
  ) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const people = p.people.map((per) => (per.id === personId ? { ...per, trainingStatus: status } : per))
          return { ...p, people }
        }
        return p
      }),
    )
  }

  const updateFadingStatus = (planId: string, stepId: string, status: "not-started" | "in-progress" | "completed") => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const fadingSchedule = p.fadingSchedule.map((f) => (f.id === stepId ? { ...f, status } : f))
          return { ...p, fadingSchedule }
        }
        return p
      }),
    )
  }

  const addMaterial = (planId: string, name: string) => {
    if (!name.trim()) return
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            materials: [...p.materials, { id: Date.now().toString(), name, selected: true }],
          }
        }
        return p
      }),
    )
  }

  const toggleExpanded = (id: string) => {
    setExpandedPlans((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "trained":
        return "bg-green-100 text-green-800 border-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-slate-100 text-slate-600 border-slate-300"
    }
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
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-500" />
              Generalization & Maintenance Plan
            </h1>
            <p className="text-sm text-slate-500">Plan for skill transfer across settings, people, and materials</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Info Banner */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                  <Layers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-900">Generalization Planning</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    For each skill, define where (settings), with whom (people), and with what (materials) the skill
                    should be demonstrated. Include a fading schedule to transition from clinic to natural environment.
                  </p>
                </div>
              </div>
            </div>

            {plans.map((plan, index) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpanded(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-base">{plan.skillName || "New Generalization Plan"}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {plan.settings.filter((s) => s.selected).length} settings •{" "}
                          {plan.people.filter((p) => p.selected).length} people •{" "}
                          {plan.fadingSchedule.filter((f) => f.status === "completed").length}/
                          {plan.fadingSchedule.length} phases completed
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        removePlan(plan.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {expandedPlans.includes(plan.id) && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Skill Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Skill/Goal Name</Label>
                        <Input
                          value={plan.skillName}
                          onChange={(e) => updatePlan(plan.id, "skillName", e.target.value)}
                          placeholder="e.g., Requesting items using 2-word phrases"
                        />
                      </div>
                      <div>
                        <Label>Target Behavior</Label>
                        <Input
                          value={plan.targetBehavior}
                          onChange={(e) => updatePlan(plan.id, "targetBehavior", e.target.value)}
                          placeholder="e.g., Independently request using 'I want [item]'"
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <Label className="font-medium text-blue-900">Settings (Where)</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {plan.settings.map((setting) => (
                          <div
                            key={setting.id}
                            onClick={() => toggleSetting(plan.id, setting.id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              setting.selected
                                ? "border-blue-500 bg-blue-100"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={setting.selected} />
                              <span className="text-sm font-medium">{setting.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* People */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-green-600" />
                        <Label className="font-medium text-green-900">People (With Whom)</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {plan.people.map((person) => (
                          <div
                            key={person.id}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              person.selected ? "border-green-500 bg-green-100" : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className="flex items-center gap-2 cursor-pointer flex-1"
                                onClick={() => togglePerson(plan.id, person.id)}
                              >
                                <Checkbox checked={person.selected} />
                                <div>
                                  <span className="text-sm font-medium">{person.name}</span>
                                  <p className="text-xs text-slate-500">{person.role}</p>
                                </div>
                              </div>
                              {person.selected && (
                                <Select
                                  value={person.trainingStatus}
                                  onValueChange={(v) =>
                                    updatePersonTrainingStatus(
                                      plan.id,
                                      person.id,
                                      v as "not-started" | "in-progress" | "trained",
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-28 h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-started">Not Started</SelectItem>
                                    <SelectItem value="in-progress">Training</SelectItem>
                                    <SelectItem value="trained">Trained</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-orange-600" />
                        <Label className="font-medium text-orange-900">Materials (With What)</Label>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {plan.materials.map((material) => (
                          <Badge
                            key={material.id}
                            variant="outline"
                            className="bg-orange-100 text-orange-800 border-orange-300"
                          >
                            {material.name}
                            <button
                              onClick={() =>
                                updatePlan(
                                  plan.id,
                                  "materials",
                                  plan.materials.filter((m) => m.id !== material.id),
                                )
                              }
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add material (e.g., different toys, books, foods)"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addMaterial(plan.id, e.currentTarget.value)
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement
                            addMaterial(plan.id, input.value)
                            input.value = ""
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Fading Schedule */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <Label className="font-medium text-purple-900">Fading Schedule (7 Phases)</Label>
                      </div>
                      <div className="space-y-2">
                        {plan.fadingSchedule.map((step) => (
                          <div
                            key={step.id}
                            className={`p-3 rounded-lg border ${
                              step.status === "completed"
                                ? "border-green-300 bg-green-50"
                                : step.status === "in-progress"
                                  ? "border-purple-400 bg-purple-100"
                                  : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                                    step.status === "completed"
                                      ? "bg-green-500 text-white"
                                      : step.status === "in-progress"
                                        ? "bg-purple-500 text-white"
                                        : "bg-slate-200 text-slate-600"
                                  }`}
                                >
                                  {step.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : step.phase}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Phase {step.phase}</p>
                                  <p className="text-xs text-slate-600">{step.description}</p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    <strong>Criteria:</strong> {step.criteria}
                                  </p>
                                </div>
                              </div>
                              <Select
                                value={step.status}
                                onValueChange={(v) =>
                                  updateFadingStatus(plan.id, step.id, v as "not-started" | "in-progress" | "completed")
                                }
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not-started">Not Started</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maintenance & Data Collection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Maintenance Schedule</Label>
                        <Textarea
                          value={plan.maintenanceSchedule}
                          onChange={(e) => updatePlan(plan.id, "maintenanceSchedule", e.target.value)}
                          placeholder="e.g., Monthly probes for 6 months post-mastery"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Data Collection Method</Label>
                        <Textarea
                          value={plan.dataCollection}
                          onChange={(e) => updatePlan(plan.id, "dataCollection", e.target.value)}
                          placeholder="e.g., Probe data collected across settings weekly"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={plan.notes}
                        onChange={(e) => updatePlan(plan.id, "notes", e.target.value)}
                        placeholder="Any additional considerations for generalization..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => router.push("/assessment/goals")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Button>
              <Button onClick={() => router.push("/assessment/service-plan")}>
                Continue to Service Plan
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
