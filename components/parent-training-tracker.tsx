"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import {
  CheckIcon,
  CheckCircle2Icon,
  PlayIcon,
  DownloadIcon,
  UsersIcon,
  BookOpenIcon,
  VideoIcon,
} from "@/components/icons"
import { useRAGSuggestions } from "@/hooks/useRAGSuggestions"
import { Sparkles, Loader2 } from "lucide-react"

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

  // RAG Integration
  const { suggestions, isLoading, error, fetchSuggestions } = useRAGSuggestions()

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
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
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
          <Button
            className="bg-[#0D9488] hover:bg-[#0F766E] transition-colors duration-300"
            onClick={handleExportReport}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export Report
          </Button>
            <Button variant="outline" size="sm" onClick={() => fetchSuggestions("parent training ABA curriculum caregiver")} disabled={isLoading} className="ml-2">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isLoading ? "Loading..." : "AI Ideas"}
            </Button>
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

                        {/* Completion Check */}
                        {module.status === "completed" && (
                          <CheckCircle2Icon className="h-6 w-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-6 pb-6 space-y-4">
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

                        {/* Video Resources */}
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <VideoIcon className="h-4 w-4 text-[#0D9488]" />
                            Video Resources
                          </h5>
                          <Button variant="outline" size="sm">
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Watch Training Video
                          </Button>
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
      </div>
    </div>
  )
}
