"use client"

export const dynamic = "force-dynamic"

import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"

interface ServiceLine {
  id: string
  cptCode: string
  description: string
  hoursPerWeek: number
  frequency: string
}

interface ScheduleSlot {
  id: string
  day: string
  startTime: string
  endTime: string
  serviceType: string
}

interface DischargePhase {
  id: string
  phase: string
  duration: string
  behaviorReduction: number
  skillAcquisition: number
  parentFidelity: number
  bcbaHours: number
  rbtHours: number
  criteria: string
}

const CPT_CODES = [
  { code: "97151", description: "Behavior Assessment (Initial)" },
  { code: "97152", description: "Behavior Assessment (Supporting)" },
  { code: "97153", description: "Adaptive Behavior Treatment (1:1)" },
  { code: "97154", description: "Group Adaptive Behavior Treatment" },
  { code: "97155", description: "Protocol Modification" },
  { code: "97156", description: "Family Training" },
  { code: "97157", description: "Multiple-Family Group" },
]

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const DEFAULT_DISCHARGE_PHASES: DischargePhase[] = [
  {
    id: "1",
    phase: "Phase 1 - Intensive",
    duration: "3 months",
    behaviorReduction: 60,
    skillAcquisition: 60,
    parentFidelity: 60,
    bcbaHours: 2,
    rbtHours: 17,
    criteria: "Client demonstrates initial response to treatment with reduction in target behaviors",
  },
  {
    id: "2",
    phase: "Phase 2 - Modification",
    duration: "3 months",
    behaviorReduction: 80,
    skillAcquisition: 80,
    parentFidelity: 70,
    bcbaHours: 1.5,
    rbtHours: 12,
    criteria: "Client shows consistent progress; generalization beginning across settings",
  },
  {
    id: "3",
    phase: "Phase 3 - Fading",
    duration: "3 months",
    behaviorReduction: 90,
    skillAcquisition: 90,
    parentFidelity: 90,
    bcbaHours: 1,
    rbtHours: 8,
    criteria: "Skills maintained with reduced support; caregiver implementing independently",
  },
  {
    id: "4",
    phase: "Phase 4 - Discharge",
    duration: "1 month",
    behaviorReduction: 95,
    skillAcquisition: 95,
    parentFidelity: 95,
    bcbaHours: 0.5,
    rbtHours: 2,
    criteria: "All discharge criteria met; transition to community supports",
  },
]

export default function ServicePlanPage() {
  const router = useRouter()
  const { navigateWithSave } = useSafeNavigation()

  const {
    value: servicePlan,
    setValue: setServicePlan,
    saveNow,
  } = useStepData<{
    weeklyHours: number
    recommendedFrequency: string
    sessionDuration: number
    serviceLocation: string
    parentTraining: boolean
    parentTrainingHours: number
    additionalServices: string[]
    specialConsiderations: string
    services: ServiceLine[]
    schedule: ScheduleSlot[]
    dischargePhases: DischargePhase[]
  }>("service-plan", {
    weeklyHours: 10,
    recommendedFrequency: "2-3 times per week",
    sessionDuration: 60,
    serviceLocation: "home",
    parentTraining: false,
    parentTrainingHours: 0,
    additionalServices: [],
    specialConsiderations: "",
    services: [
      {
        id: "1",
        cptCode: "97153",
        description: "Adaptive Behavior Treatment (1:1)",
        hoursPerWeek: 10,
        frequency: "5x/week",
      },
    ],
    schedule: [{ id: "1", day: "Monday", startTime: "09:00", endTime: "11:00", serviceType: "97153" }],
    dischargePhases: DEFAULT_DISCHARGE_PHASES,
  })

  const services = servicePlan.services
  const setServices = (newServices: ServiceLine[] | ((prev: ServiceLine[]) => ServiceLine[])) => {
    setServicePlan((prev) => ({
      ...prev,
      services: typeof newServices === "function" ? newServices(prev.services) : newServices,
    }))
  }

  const schedule = servicePlan.schedule
  const setSchedule = (newSchedule: ScheduleSlot[] | ((prev: ScheduleSlot[]) => ScheduleSlot[])) => {
    setServicePlan((prev) => ({
      ...prev,
      schedule: typeof newSchedule === "function" ? newSchedule(prev.schedule) : newSchedule,
    }))
  }

  const dischargePhases = servicePlan.dischargePhases
  const setDischargePhases = (newPhases: DischargePhase[] | ((prev: DischargePhase[]) => DischargePhase[])) => {
    setServicePlan((prev) => ({
      ...prev,
      dischargePhases: typeof newPhases === "function" ? newPhases(prev.dischargePhases) : newPhases,
    }))
  }

  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await saveNow()
    setIsSaving(false)
    toast({ title: "Saved", description: "Service plan saved successfully" })
  }

  const addService = () => {
    setServices((prev) => [
      ...prev,
      { id: Date.now().toString(), cptCode: "", description: "", hoursPerWeek: 0, frequency: "" },
    ])
  }

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const updateService = (id: string, field: keyof ServiceLine, value: string | number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (field === "cptCode") {
            const cpt = CPT_CODES.find((c) => c.code === value)
            return { ...s, cptCode: value as string, description: cpt?.description || "" }
          }
          return { ...s, [field]: value }
        }
        return s
      }),
    )
  }

  const addScheduleSlot = () => {
    setSchedule((prev) => [
      ...prev,
      { id: Date.now().toString(), day: "Monday", startTime: "09:00", endTime: "11:00", serviceType: "97153" },
    ])
  }

  const removeScheduleSlot = (id: string) => {
    if (schedule.length > 1) {
      setSchedule((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const updateScheduleSlot = (id: string, field: keyof ScheduleSlot, value: string) => {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const updateDischargePhase = (id: string, field: keyof DischargePhase, value: string | number) => {
    setDischargePhases((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const totalWeeklyHours = services.reduce((sum, s) => sum + s.hoursPerWeek, 0)

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-500" />
              Service Plan & Schedule
            </h1>
            <p className="text-sm text-slate-500">Step 12 of 18 - Define services and schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {totalWeeklyHours} hrs/week
            </Badge>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Requested Services Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Requested Services</CardTitle>
                    <CardDescription>CPT codes and hours requested</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-1" /> Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="grid grid-cols-5 gap-3 items-end border-b pb-4">
                    <div>
                      <Label>CPT Code</Label>
                      <Select value={service.cptCode} onValueChange={(v) => updateService(service.id, "cptCode", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {CPT_CODES.map((cpt) => (
                            <SelectItem key={cpt.code} value={cpt.code}>
                              {cpt.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input value={service.description} readOnly className="bg-slate-50" />
                    </div>
                    <div>
                      <Label>Hours/Week</Label>
                      <Input
                        type="number"
                        value={service.hoursPerWeek}
                        onChange={(e) => updateService(service.id, "hoursPerWeek", Number(e.target.value))}
                        min={0}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(service.id)}
                      disabled={services.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Schedule Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Proposed session times</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addScheduleSlot}>
                    <Plus className="h-4 w-4 mr-1" /> Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedule.map((slot) => (
                  <div key={slot.id} className="grid grid-cols-5 gap-3 items-end border-b pb-4">
                    <div>
                      <Label>Day</Label>
                      <Select value={slot.day} onValueChange={(v) => updateScheduleSlot(slot.id, "day", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateScheduleSlot(slot.id, "startTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateScheduleSlot(slot.id, "endTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Service</Label>
                      <Select
                        value={slot.serviceType}
                        onValueChange={(v) => updateScheduleSlot(slot.id, "serviceType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CPT_CODES.map((cpt) => (
                            <SelectItem key={cpt.code} value={cpt.code}>
                              {cpt.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeScheduleSlot(slot.id)}
                      disabled={schedule.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Discharge Criteria & Service Fading Plan
                      <Badge className="bg-amber-500 text-white">Required for Insurance</Badge>
                    </CardTitle>
                    <CardDescription>Define measurable criteria for reducing and terminating services</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="p-3 text-left font-medium rounded-tl-lg">Phase</th>
                        <th className="p-3 text-left font-medium">Duration</th>
                        <th className="p-3 text-center font-medium">Behavior Reduction</th>
                        <th className="p-3 text-center font-medium">Skill Acquisition</th>
                        <th className="p-3 text-center font-medium">Parent Fidelity</th>
                        <th className="p-3 text-center font-medium">BCBA hrs/wk</th>
                        <th className="p-3 text-center font-medium rounded-tr-lg">RBT hrs/wk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dischargePhases.map((phase, index) => (
                        <tr key={phase.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-3 border-b">
                            <div className="flex items-center gap-2">
                              {index === dischargePhases.length - 1 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              )}
                              <span className="font-medium text-sm">{phase.phase}</span>
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <Select
                              value={phase.duration}
                              onValueChange={(v) => updateDischargePhase(phase.id, "duration", v)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 month">1 month</SelectItem>
                                <SelectItem value="2 months">2 months</SelectItem>
                                <SelectItem value="3 months">3 months</SelectItem>
                                <SelectItem value="6 months">6 months</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3 border-b">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                value={phase.behaviorReduction}
                                onChange={(e) =>
                                  updateDischargePhase(phase.id, "behaviorReduction", Number(e.target.value))
                                }
                                className="w-16 text-center"
                                min={0}
                                max={100}
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                value={phase.skillAcquisition}
                                onChange={(e) =>
                                  updateDischargePhase(phase.id, "skillAcquisition", Number(e.target.value))
                                }
                                className="w-16 text-center"
                                min={0}
                                max={100}
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                value={phase.parentFidelity}
                                onChange={(e) =>
                                  updateDischargePhase(phase.id, "parentFidelity", Number(e.target.value))
                                }
                                className="w-16 text-center"
                                min={0}
                                max={100}
                              />
                              <span className="text-slate-500">%</span>
                            </div>
                          </td>
                          <td className="p-3 border-b">
                            <Input
                              type="number"
                              value={phase.bcbaHours}
                              onChange={(e) => updateDischargePhase(phase.id, "bcbaHours", Number(e.target.value))}
                              className="w-16 text-center mx-auto"
                              min={0}
                              step={0.5}
                            />
                          </td>
                          <td className="p-3 border-b">
                            <Input
                              type="number"
                              value={phase.rbtHours}
                              onChange={(e) => updateDischargePhase(phase.id, "rbtHours", Number(e.target.value))}
                              className="w-16 text-center mx-auto"
                              min={0}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Phase Criteria Details */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-slate-700">Phase Transition Criteria</h4>
                  {dischargePhases.map((phase, index) => (
                    <div key={phase.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-800">{phase.phase}</p>
                        <Input
                          value={phase.criteria}
                          onChange={(e) => updateDischargePhase(phase.id, "criteria", e.target.value)}
                          className="mt-1 text-sm"
                          placeholder="Enter criteria for transitioning to this phase..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual Progress Indicator */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="font-medium text-slate-700 mb-3">Service Reduction Timeline</h4>
                  <div className="flex items-center gap-2">
                    {dischargePhases.map((phase, index) => (
                      <div key={phase.id} className="flex-1">
                        <div className="relative">
                          <div
                            className={`h-3 rounded-full ${
                              index === 0
                                ? "bg-red-400"
                                : index === 1
                                  ? "bg-amber-400"
                                  : index === 2
                                    ? "bg-yellow-400"
                                    : "bg-green-400"
                            }`}
                          />
                          {index < dischargePhases.length - 1 && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full" />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-slate-600">{phase.rbtHours}h RBT</p>
                          <p className="text-xs text-slate-400">{phase.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex justify-between shrink-0">
          <Button variant="outline" onClick={() => navigateWithSave("/assessment/goals", saveNow)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back: Goals
          </Button>
          <Button
            onClick={() => navigateWithSave("/assessment/cpt-authorization", saveNow)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Next: CPT Authorization
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
