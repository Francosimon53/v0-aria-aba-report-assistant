"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  CheckIcon,
  CheckCircle2Icon,
  DownloadIcon,
  UsersIcon,
  BookOpenIcon,
  SparklesIcon,
  Loader2Icon,
  TargetIcon,
  ListOrderedIcon,
  HomeIcon,
  ClipboardCheckIcon,
  SaveIcon,
} from "@/components/icons"
import { saveParentTrainingProgress, getCurrentUser } from "@/lib/supabase-db"

interface TrainingModule {
  id: string
  name: string
  objectives: string[]
  duration: string
  prerequisites: string[]
  status: "not-started" | "in-progress" | "completed"
  fidelityScore: number
  dateCompleted: string
  notes: string
  videoLinks: string[]
  competencyCheck: boolean
  signature: string
  signatureDate: string
  consecutiveSessions: number
  fidelityHistory: number[]
}

const trainingProcedures = [
  { id: "live-modeling", name: "Live Modeling", description: "Demonstrate procedures in real-time" },
  { id: "video-modeling", name: "Video Modeling", description: "Watch video demonstrations" },
  { id: "written-instructions", name: "Written Instructions", description: "Review step-by-step guides" },
  { id: "role-play", name: "Role-Play & Rehearsal", description: "Practice skills with feedback" },
  { id: "guided-practice", name: "Guided Practice", description: "Implement with coaching" },
  { id: "visual-aids", name: "Visual Aids", description: "Use visual supports and checklists" },
  { id: "in-vivo-coaching", name: "In-Vivo Coaching", description: "Real-time coaching during implementation" },
  { id: "fidelity-checklists", name: "Fidelity Checklists", description: "Use standardized observation forms" },
  { id: "homework", name: "Homework Assignments", description: "Practice between sessions" },
]

const initialModules: TrainingModule[] = [
  {
    id: "module-1",
    name: "Introduction to ABA & Your Role",
    objectives: ["Understand basic ABA principles", "Identify your role in treatment", "Learn data collection basics"],
    duration: "2 hours",
    prerequisites: [],
    status: "completed",
    fidelityScore: 95,
    dateCompleted: "2024-01-15",
    notes: "Parent demonstrated excellent understanding",
    videoLinks: [],
    competencyCheck: true,
    signature: "John Smith",
    signatureDate: "2024-01-15",
    consecutiveSessions: 2,
    fidelityHistory: [92, 95],
  },
  {
    id: "module-2",
    name: "Reinforcement & Motivation",
    objectives: [
      "Identify effective reinforcers",
      "Implement reinforcement schedules",
      "Conduct preference assessments",
    ],
    duration: "3 hours",
    prerequisites: ["module-1"],
    status: "in-progress",
    fidelityScore: 85,
    dateCompleted: "",
    notes: "",
    videoLinks: [],
    competencyCheck: false,
    signature: "",
    signatureDate: "",
    consecutiveSessions: 1,
    fidelityHistory: [85],
  },
  {
    id: "module-3",
    name: "Prompting & Prompt Fading",
    objectives: [
      "Use prompting hierarchy effectively",
      "Implement prompt fading strategies",
      "Avoid prompt dependency",
    ],
    duration: "2.5 hours",
    prerequisites: ["module-1", "module-2"],
    status: "not-started",
    fidelityScore: 0,
    dateCompleted: "",
    notes: "",
    videoLinks: [],
    competencyCheck: false,
    signature: "",
    signatureDate: "",
    consecutiveSessions: 0,
    fidelityHistory: [],
  },
  {
    id: "module-4",
    name: "Managing Problem Behavior",
    objectives: [
      "Understand function of behavior",
      "Implement behavior reduction strategies",
      "Teach replacement behaviors",
    ],
    duration: "4 hours",
    prerequisites: ["module-2"],
    status: "not-started",
    fidelityScore: 0,
    dateCompleted: "",
    notes: "",
    videoLinks: [],
    competencyCheck: false,
    signature: "",
    signatureDate: "",
    consecutiveSessions: 0,
    fidelityHistory: [],
  },
  {
    id: "module-5",
    name: "Generalization & Maintenance",
    objectives: ["Promote skill generalization", "Plan for maintenance", "Implement natural environment teaching"],
    duration: "2 hours",
    prerequisites: ["module-3"],
    status: "not-started",
    fidelityScore: 0,
    dateCompleted: "",
    notes: "",
    videoLinks: [],
    competencyCheck: false,
    signature: "",
    signatureDate: "",
    consecutiveSessions: 0,
    fidelityHistory: [],
  },
]

export function ParentTrainingTracker() {
  const [modules, setModules] = useState<TrainingModule[]>(initialModules)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [newFidelityScores, setNewFidelityScores] = useState<Record<string, string>>({})

  const [moduleContent, setModuleContent] = useState<Record<string, any>>({})
  const [generatingModule, setGeneratingModule] = useState<string | null>(null)
  const [savedInterventions, setSavedInterventions] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("aria-parent-training-data")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (parsed.modules) setModules(parsed.modules)
        if (parsed.moduleContent) setModuleContent(parsed.moduleContent)
        if (parsed.newFidelityScores) setNewFidelityScores(parsed.newFidelityScores)
        if (parsed.selectedModule) setSelectedModule(parsed.selectedModule)
        console.log("[v0] Loaded parent training data from localStorage")
      }
    } catch (e) {
      console.error("[v0] Error loading parent training data:", e)
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aria-assessment-selected-interventions")
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log("[v0] Loaded interventions from localStorage:", parsed)
        setSavedInterventions(parsed.data || parsed || [])
      }
    } catch (e) {
      console.error("[v0] Error loading interventions:", e)
    }
  }, [])

  const handleSaveAll = useCallback(
    async (silent = false) => {
      console.log("[v0] Save All clicked", { silent, isSaving })

      if (isSaving) {
        console.log("[v0] Already saving, skipping...")
        return
      }

      setIsSaving(true)

      try {
        const dataToSave = {
          modules,
          moduleContent,
          newFidelityScores,
          selectedModule,
          lastSaved: new Date().toISOString(),
        }

        console.log("[v0] Data to save:", {
          modulesCount: modules.length,
          contentKeys: Object.keys(moduleContent),
          fidelityScores: newFidelityScores,
        })

        // Save to localStorage as backup/cache
        localStorage.setItem("aria-parent-training-data", JSON.stringify(dataToSave))
        console.log("[v0] Saved to localStorage")

        // Save to Supabase cloud
        let cloudSaveSuccess = false
        try {
          const user = await getCurrentUser()
          console.log("[v0] Current user:", user ? "Found" : "Not found")

          if (user) {
            // Get or create assessment ID from URL or localStorage
            const urlParams = new URLSearchParams(window.location.search)
            const assessmentId = urlParams.get("assessmentId") || localStorage.getItem("aria-current-assessment-id")
            console.log("[v0] Assessment ID:", assessmentId)

            if (assessmentId) {
              // Save each module's progress to Supabase
              for (const module of modules) {
                await saveParentTrainingProgress(assessmentId, {
                  moduleName: module.name,
                  status: module.status,
                  fidelityScore: module.fidelityScore,
                  sessionNotes: module.notes || "",
                  aiContent: moduleContent[module.name] || null,
                })
              }

              cloudSaveSuccess = true
              console.log("[v0] Parent training data saved to Supabase successfully")
            } else {
              console.log("[v0] No assessment ID found")
            }
          }
        } catch (dbError) {
          console.error("[v0] Supabase save failed, data saved to localStorage only:", dbError)
          // Continue - we still have localStorage backup
        }

        if (!silent) {
          setSaveSuccess(true)
          toast({
            title: "Saved Successfully",
            description: cloudSaveSuccess
              ? "All parent training data has been saved to cloud ☁️"
              : "Data saved locally (cloud sync unavailable)",
          })

          setTimeout(() => {
            setSaveSuccess(false)
          }, 2000)
        }

        console.log("[v0] Parent training data saved successfully")
      } catch (e) {
        console.error("[v0] Error saving parent training data:", e)
        if (!silent) {
          toast({
            title: "Save Failed",
            description: e instanceof Error ? e.message : "There was an error saving your data.",
            variant: "destructive",
          })
        }
      } finally {
        setIsSaving(false)
      }
    },
    [modules, moduleContent, newFidelityScores, selectedModule, isSaving, toast],
  )

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSaveAll(true) // true = silent save (no toast)
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [handleSaveAll])

  const handleGenerateModuleContent = async (moduleName: string) => {
    console.log("[v0] Starting generation for:", moduleName)
    console.log("[v0] Saved interventions:", savedInterventions)
    console.log("[v0] Number of interventions:", savedInterventions.length)

    setGeneratingModule(moduleName)

    try {
      const response = await fetch("/api/generate-parent-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName,
          interventions: savedInterventions,
        }),
      })

      const data = await response.json()
      console.log("[v0] API Response:", data)
      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setModuleContent((prev) => ({
        ...prev,
        [moduleName]: data,
      }))

      toast({
        title: "Content Generated",
        description: `Training content for "${moduleName}" created successfully.`,
      })
    } catch (error) {
      console.error("[v0] Error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate content",
        variant: "destructive",
      })
    } finally {
      setGeneratingModule(null)
    }
  }

  const updateModule = (id: string, updates: Partial<TrainingModule>) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }

  const addFidelityScore = (moduleId: string) => {
    const scoreStr = newFidelityScores[moduleId]
    const score = Number.parseInt(scoreStr, 10)

    if (isNaN(score) || score < 0 || score > 100) {
      alert("Please enter a valid score between 0 and 100")
      return
    }

    setModules(
      modules.map((m) => {
        if (m.id === moduleId) {
          const newHistory = [...m.fidelityHistory, score]
          const consecutiveAbove90 = newHistory.slice(-2).every((s) => s >= 90)
            ? m.consecutiveSessions >= 1
              ? 2
              : 1
            : 0

          return {
            ...m,
            fidelityScore: score,
            fidelityHistory: newHistory,
            consecutiveSessions: consecutiveAbove90,
            status: m.status === "not-started" ? "in-progress" : m.status,
          }
        }
        return m
      }),
    )

    setNewFidelityScores({ ...newFidelityScores, [moduleId]: "" })
  }

  const handleExportReport = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      overallProgress: Math.round((modules.filter((m) => m.status === "completed").length / modules.length) * 100),
      modules: modules.map((m) => ({
        name: m.name,
        status: m.status,
        fidelityScore: m.fidelityScore,
        fidelityHistory: m.fidelityHistory,
        dateCompleted: m.dateCompleted,
        notes: m.notes,
      })),
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "parent_training_report.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const calculateMasteryProgress = (module: TrainingModule) => {
    if (module.fidelityHistory.length < 2) return 0
    const lastTwo = module.fidelityHistory.slice(-2)
    const bothAbove90 = lastTwo.every((score) => score >= 90)
    return bothAbove90 ? 100 : (lastTwo.reduce((a, b) => a + b, 0) / (lastTwo.length * 90)) * 100
  }

  const getStatusColor = (status: TrainingModule["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300"
      case "in-progress":
        return "bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/30"
      case "not-started":
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  const completedCount = modules.filter((m) => m.status === "completed").length
  const overallProgress = (completedCount / modules.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-cyan-50/30 to-blue-50/30 p-6 space-y-6">
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#0F766E] flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              Parent Training Curriculum
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track parent competency and fidelity of implementation
            </p>
          </div>
          {/* Save All button with visual feedback */}
          <div className="flex gap-3">
            <Button
              className={`transition-all duration-300 cursor-pointer hover:shadow-lg active:scale-95 ${
                saveSuccess
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0D9488] hover:bg-[#0F766E] text-white"
              }`}
              onClick={() => {
                console.log("Save All clicked")
                handleSaveAll()
              }}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2Icon className="h-4 w-4 mr-2" />
                  Saved ☁️
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-[#0D9488]/30 hover:bg-[#0D9488]/5 bg-transparent"
              onClick={handleExportReport}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overall Progress Card */}
        <Card className="p-6 bg-gradient-to-br from-[#0D9488]/10 via-cyan-50/50 to-blue-50/50 border-[#0D9488]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <p className="text-sm text-gray-600">
                {completedCount} of {modules.length} modules completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#0D9488]">{Math.round(overallProgress)}%</div>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </Card>

        {/* Training Procedures Reference */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-[#0D9488]" />
            Training Procedures Used
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {trainingProcedures.map((procedure) => (
              <div
                key={procedure.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-[#0D9488] transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{procedure.name}</div>
                <div className="text-xs text-gray-500 mt-1">{procedure.description}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Progress Stepper */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Module Sequence</h3>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
            <div
              className="absolute top-6 left-0 h-0.5 bg-[#0D9488] transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
            <div className="relative flex justify-between">
              {modules.map((module, index) => (
                <div key={module.id} className="flex flex-col items-center">
                  <div
                    className={`h-12 w-12 rounded-full border-4 flex items-center justify-center font-bold transition-all duration-300 ${
                      module.status === "completed"
                        ? "bg-[#0D9488] border-[#0D9488] text-white"
                        : module.status === "in-progress"
                          ? "bg-white border-[#0D9488] text-[#0D9488]"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {module.status === "completed" ? <CheckIcon className="h-6 w-6" /> : index + 1}
                  </div>
                  <div className="text-xs text-center mt-2 max-w-[80px]">
                    <div className="font-medium text-gray-900">{module.name.split(" ")[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Module Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Training Modules</h3>
          <Accordion type="single" collapsible className="space-y-3">
            {modules.map((module) => {
              const masteryProgress = calculateMasteryProgress(module)
              const isMastered = masteryProgress === 100

              return (
                <AccordionItem key={module.id} value={module.id} className="border-none">
                  <Card
                    className={`overflow-hidden transition-all duration-300 ${module.status === "in-progress" ? "ring-2 ring-[#0D9488]" : ""}`}
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        {/* Fidelity Circle */}
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <svg className="transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke={module.fidelityScore >= 90 ? "#0D9488" : "#3b82f6"}
                              strokeWidth="3"
                              strokeDasharray={`${module.fidelityScore * 1.005}, 100.5`}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-900">{module.fidelityScore}%</span>
                          </div>
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{module.name}</h4>
                            <Badge className={getStatusColor(module.status)}>
                              {module.status === "not-started"
                                ? "Not Started"
                                : module.status === "in-progress"
                                  ? "In Progress"
                                  : "Completed"}
                            </Badge>
                            {isMastered && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2Icon className="h-3 w-3 mr-1" />
                                Mastered
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">Duration: {module.duration}</div>
                        </div>

                        {/* AI Generate Content button */}
                        <div className="flex items-center gap-2 mr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGenerateModuleContent(module.name)
                            }}
                            disabled={generatingModule === module.name}
                            className="gap-1.5 border-[#0D9488]/30 hover:bg-[#0D9488]/5"
                          >
                            {generatingModule === module.name ? (
                              <>
                                <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <SparklesIcon className="h-3.5 w-3.5 text-[#0D9488]" />
                                AI Generate Content
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Completion Check */}
                        {module.status === "completed" && (
                          <CheckCircle2Icon className="h-6 w-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-6 pb-6 space-y-4">
                        {moduleContent[module.name] && (
                          <div className="mb-6 space-y-6 border-t pt-6">
                            {/* Learning Objectives */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <TargetIcon className="h-4 w-4" />
                                Learning Objectives
                              </h4>
                              <ul className="space-y-2">
                                {moduleContent[module.name].learningObjectives?.map((obj: string, i: number) => (
                                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                    <CheckCircle2Icon className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Key Concepts */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <BookOpenIcon className="h-4 w-4 text-[#0D9488]" />
                                Key Concepts
                              </h4>
                              <div className="grid gap-3">
                                {moduleContent[module.name].keyConceptsSection?.concepts?.map(
                                  (concept: any, i: number) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                      <p className="font-medium text-gray-900 mb-1">{concept.term}</p>
                                      <p className="text-sm text-gray-600 mb-2">{concept.definition}</p>
                                      <p className="text-sm text-[#0D9488] italic">💡 Example: {concept.example}</p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {/* Procedure Steps */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <ListOrderedIcon className="h-4 w-4 text-[#0D9488]" />
                                Procedure Steps
                              </h4>
                              <div className="space-y-3">
                                {moduleContent[module.name].procedureSteps?.map((step: any, i: number) => (
                                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-[#0D9488] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        {step.step}
                                      </span>
                                      <span className="font-medium text-gray-900">{step.title}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 ml-9">{step.description}</p>
                                    {step.tips?.length > 0 && (
                                      <div className="bg-green-50 rounded p-3 mt-2 ml-9 border border-green-200">
                                        <p className="text-xs font-medium text-green-800 mb-1">💡 Tips:</p>
                                        <ul className="text-xs text-green-700 space-y-1">
                                          {step.tips.map((tip: string, j: number) => (
                                            <li key={j}>• {tip}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {step.commonMistakes?.length > 0 && (
                                      <div className="bg-red-50 rounded p-3 mt-2 ml-9 border border-red-200">
                                        <p className="text-xs font-medium text-red-800 mb-1">⚠️ Avoid:</p>
                                        <ul className="text-xs text-red-700 space-y-1">
                                          {step.commonMistakes.map((mistake: string, j: number) => (
                                            <li key={j}>• {mistake}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Practice Scenarios */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <UsersIcon className="h-4 w-4 text-[#0D9488]" />
                                Practice Scenarios
                              </h4>
                              <div className="space-y-3">
                                {moduleContent[module.name].practiceScenarios?.map((scenario: any, i: number) => (
                                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-900 mb-3">📋 {scenario.scenario}</p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                      <div className="bg-green-50 rounded p-3 border border-green-200">
                                        <p className="text-xs font-medium text-green-800 mb-1">✅ Correct Response:</p>
                                        <p className="text-xs text-green-700">{scenario.correctResponse}</p>
                                      </div>
                                      <div className="bg-red-50 rounded p-3 border border-red-200">
                                        <p className="text-xs font-medium text-red-800 mb-1">❌ Avoid:</p>
                                        <p className="text-xs text-red-700">{scenario.incorrectResponse}</p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2 italic">{scenario.rationale}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Home Activities */}
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                <HomeIcon className="h-4 w-4" />
                                Home Practice Activities
                              </h4>
                              <div className="space-y-3">
                                {moduleContent[module.name].homeActivities?.map((activity: any, i: number) => (
                                  <div key={i} className="bg-white rounded p-3 border border-amber-200">
                                    <p className="font-medium text-sm text-gray-900">{activity.activity}</p>
                                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <p className="text-xs text-amber-700 font-medium">📅 {activity.frequency}</p>
                                      {activity.materials?.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          Materials: {activity.materials.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Fidelity Checklist */}
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                <ClipboardCheckIcon className="h-4 w-4" />
                                Fidelity Checklist
                              </h4>
                              <div className="space-y-2">
                                {moduleContent[module.name].fidelityChecklist?.map((item: string, i: number) => (
                                  <label
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-purple-800 cursor-pointer"
                                  >
                                    <input type="checkbox" className="rounded border-purple-300 text-purple-600" />
                                    {item}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Quiz Questions */}
                            {moduleContent[module.name].quizQuestions?.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <CheckCircle2Icon className="h-4 w-4 text-[#0D9488]" />
                                  Knowledge Check
                                </h4>
                                <div className="space-y-4">
                                  {moduleContent[module.name].quizQuestions?.map((q: any, i: number) => (
                                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                                      <p className="font-medium text-sm text-gray-900 mb-3">
                                        {i + 1}. {q.question}
                                      </p>
                                      <div className="space-y-2 mb-3">
                                        {q.options?.map((option: string, j: number) => (
                                          <label
                                            key={j}
                                            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                          >
                                            <input
                                              type="radio"
                                              name={`quiz-${module.id}-${i}`}
                                              className="text-[#0D9488]"
                                            />
                                            {option}
                                          </label>
                                        ))}
                                      </div>
                                      <details className="text-xs text-gray-600">
                                        <summary className="cursor-pointer font-medium text-[#0D9488]">
                                          Show answer
                                        </summary>
                                        <p className="mt-2 bg-green-50 p-2 rounded border border-green-200">
                                          <span className="font-medium">Correct: {q.correctAnswer}</span>
                                          <br />
                                          {q.explanation}
                                        </p>
                                      </details>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Original module content */}
                        {/* Learning Objectives */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Learning Objectives</h5>
                          <ul className="space-y-1">
                            {module.objectives.map((obj, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckIcon className="h-4 w-4 text-[#0D9488] flex-shrink-0 mt-0.5" />
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Prerequisites */}
                        {module.prerequisites.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm text-gray-700 mb-2">Prerequisites</h5>
                            <div className="flex gap-2 flex-wrap">
                              {module.prerequisites.map((prereq) => (
                                <Badge key={prereq} variant="outline" className="text-xs">
                                  {modules.find((m) => m.id === prereq)?.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mastery Progress */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm text-gray-700">Progress to Mastery</h5>
                            <span className="text-xs text-gray-500">
                              {module.consecutiveSessions} consecutive session
                              {module.consecutiveSessions !== 1 ? "s" : ""}
                              at 90%+
                            </span>
                          </div>
                          <Progress value={masteryProgress} className="h-2 mb-2" />
                          <p className="text-xs text-gray-600">
                            Mastery requires 90% fidelity across 2 consecutive sessions
                          </p>
                        </div>

                        {/* Fidelity Checklist */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Update Fidelity Score</h5>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Enter score (0-100)"
                              className="flex-1"
                              value={newFidelityScores[module.id] || ""}
                              onChange={(e) =>
                                setNewFidelityScores({
                                  ...newFidelityScores,
                                  [module.id]: e.target.value,
                                })
                              }
                            />
                            <Button
                              onClick={() => addFidelityScore(module.id)}
                              className="bg-[#0D9488] hover:bg-[#0F766E]"
                              disabled={!newFidelityScores[module.id]}
                            >
                              Add Score
                            </Button>
                          </div>
                          {module.fidelityHistory.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              History: {module.fidelityHistory.join("%, ")}%
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Session Notes</h5>
                          <Textarea
                            value={module.notes}
                            onChange={(e) => updateModule(module.id, { notes: e.target.value })}
                            placeholder="Add notes about this training session..."
                            className="min-h-[80px]"
                          />
                        </div>

                        {/* Competency Check & Signature */}
                        {module.status === "in-progress" && (
                          <div className="border-t pt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={module.competencyCheck}
                                onChange={(e) => updateModule(module.id, { competencyCheck: e.target.checked })}
                                className="h-4 w-4 text-[#0D9488]"
                              />
                              <label className="text-sm font-medium text-gray-700">Competency check passed</label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                placeholder="Parent signature"
                                value={module.signature}
                                onChange={(e) => updateModule(module.id, { signature: e.target.value })}
                              />
                              <Input
                                type="date"
                                value={module.signatureDate}
                                onChange={(e) => updateModule(module.id, { signatureDate: e.target.value })}
                              />
                            </div>
                            <Button
                              onClick={() => updateModule(module.id, { status: "completed" })}
                              className="w-full bg-[#0D9488] hover:bg-[#0F766E]"
                              disabled={!module.competencyCheck || !module.signature}
                            >
                              <CheckCircle2Icon className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </Button>
                          </div>
                        )}

                        {/* Completed Info */}
                        {module.status === "completed" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Module Completed</span>
                            </div>
                            <div className="text-sm text-green-700">
                              <div>Completed: {module.dateCompleted}</div>
                              <div>Signed by: {module.signature}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </Card>
    </div>
  )
}
