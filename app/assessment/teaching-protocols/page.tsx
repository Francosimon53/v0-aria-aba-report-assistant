"use client"

// BUILD: 2024-12-15-v5.0.0 - Complete rebuild - No language system
// CACHE_BUST: 1734220900000

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  SparklesIcon,
  GripVertical,
  X,
  Home,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

// Types
interface ProtocolStep {
  id: string
  order: number
  instruction: string
  promptLevel: string
  dataRecording: string
}

interface TeachingProtocol {
  id: string
  skillName: string
  domain: string
  targetBehavior: string
  materials: string[]
  setting: string
  prerequisiteSkills: string
  promptHierarchy: "MTL" | "LTM" // Most-to-Least or Least-to-Most
  promptLevels: string[]
  steps: ProtocolStep[]
  errorCorrection: string
  reinforcementSchedule: string
  masteryaCriteria: string
  generalizationPlan: string
  dataCollectionMethod: string
  notes: string
}

const PROMPT_LEVELS = {
  MTL: ["Full Physical (FP)", "Partial Physical (PP)", "Model (M)", "Gestural (G)", "Verbal (V)", "Independent (I)"],
  LTM: ["Independent (I)", "Verbal (V)", "Gestural (G)", "Model (M)", "Partial Physical (PP)", "Full Physical (FP)"],
}

const DOMAINS = [
  "Communication",
  "Social Skills",
  "Daily Living",
  "Academic",
  "Play & Leisure",
  "Motor Skills",
  "Self-Help",
  "Safety",
]

const DATA_METHODS = [
  "Trial-by-trial",
  "First trial",
  "Probe data",
  "Task analysis",
  "Duration recording",
  "Frequency count",
  "Interval recording",
]

const REINFORCEMENT_SCHEDULES = [
  "CRF (Continuous)",
  "FR (Fixed Ratio)",
  "VR (Variable Ratio)",
  "FI (Fixed Interval)",
  "VI (Variable Interval)",
  "DRO",
  "DRA",
]

const DEFAULT_PROTOCOL: Omit<TeachingProtocol, "id"> = {
  skillName: "",
  domain: "",
  targetBehavior: "",
  materials: [],
  setting: "",
  prerequisiteSkills: "",
  promptHierarchy: "MTL",
  promptLevels: PROMPT_LEVELS.MTL,
  steps: [
    { id: "1", order: 1, instruction: "Prepare materials and secure attention", promptLevel: "", dataRecording: "" },
    { id: "2", order: 2, instruction: "Present discriminative stimulus (SD)", promptLevel: "", dataRecording: "" },
    { id: "3", order: 3, instruction: "Wait 3-5 seconds for response", promptLevel: "", dataRecording: "" },
    { id: "4", order: 4, instruction: "Provide prompt if needed", promptLevel: "", dataRecording: "" },
    { id: "5", order: 5, instruction: "Reinforce correct response", promptLevel: "", dataRecording: "" },
    { id: "6", order: 6, instruction: "Implement error correction if incorrect", promptLevel: "", dataRecording: "" },
    { id: "7", order: 7, instruction: "Record data", promptLevel: "", dataRecording: "" },
  ],
  errorCorrection: "",
  reinforcementSchedule: "CRF (Continuous)",
  masteryaCriteria: "90% accuracy across 2 consecutive sessions with 2 different therapists",
  generalizationPlan: "",
  dataCollectionMethod: "Trial-by-trial",
  notes: "",
}

const PROTOCOL_TEMPLATES = [
  {
    name: "Mand Training",
    domain: "Communication",
    targetBehavior: "Client will independently mand for preferred items/activities using [vocal/sign/PECS/AAC]",
    steps: [
      { instruction: "Contrive motivation (withhold preferred item briefly)", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Present preferred item within sight but out of reach", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Wait 3 seconds for spontaneous mand", promptLevel: "", dataRecording: "" },
      { instruction: "If no response, provide echoic/model prompt", promptLevel: "Model", dataRecording: "" },
      { instruction: "Immediately deliver item upon correct response", promptLevel: "", dataRecording: "+" },
      {
        instruction: "If incorrect, use error correction (model, wait, re-present)",
        promptLevel: "",
        dataRecording: "-",
      },
      { instruction: "Record response and prompt level used", promptLevel: "", dataRecording: "" },
    ],
    errorCorrection:
      "Model correct response, wait 2 seconds, re-present SD, provide immediate prompt if needed, reinforce prompted response with lower-value reinforcer",
    masteryaCriteria: "90% independent mands for target item across 3 consecutive sessions",
  },
  {
    name: "Receptive Identification",
    domain: "Communication",
    targetBehavior: "Client will receptively identify [target items] by pointing/touching when asked 'Show me [item]'",
    steps: [
      { instruction: "Place 3 items/pictures on table in random positions", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Secure attention: '[Name], look'", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Present SD: 'Show me [target]'", promptLevel: "", dataRecording: "" },
      { instruction: "Wait 5 seconds for response", promptLevel: "", dataRecording: "" },
      { instruction: "If correct, provide specific praise and reinforcer", promptLevel: "", dataRecording: "+" },
      {
        instruction: "If incorrect/no response, use physical prompt to guide",
        promptLevel: "PP/FP",
        dataRecording: "-",
      },
      { instruction: "Rotate positions and repeat", promptLevel: "", dataRecording: "" },
    ],
    errorCorrection:
      "Physically guide to correct item, praise, re-present with distractor moved, fade physical prompt across trials",
    masteryaCriteria: "90% accuracy across 3 sessions with varied field sizes and positions",
  },
  {
    name: "Tacting",
    domain: "Communication",
    targetBehavior:
      "Client will label [target items/actions/attributes] when asked 'What is this?' or non-verbally presented",
    steps: [
      { instruction: "Present item/picture and secure attention", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Ask 'What is this?' or present non-verbally", promptLevel: "", dataRecording: "" },
      { instruction: "Wait 5 seconds for vocal response", promptLevel: "", dataRecording: "" },
      { instruction: "If correct, provide enthusiastic praise + reinforcer", promptLevel: "", dataRecording: "+" },
      {
        instruction: "If incorrect, provide echoic prompt: 'It's a [item]'",
        promptLevel: "Echoic",
        dataRecording: "-",
      },
      { instruction: "Have client repeat, provide reinforcer", promptLevel: "", dataRecording: "" },
      { instruction: "Re-present after 2-3 other trials (transfer trial)", promptLevel: "", dataRecording: "" },
    ],
    errorCorrection:
      "Provide echoic, wait for imitation, praise, present distractor trial, re-present target with time delay",
    masteryaCriteria: "90% independent tacts across 2 sessions with varied exemplars",
  },
  {
    name: "Intraverbal Responding",
    domain: "Communication",
    targetBehavior: "Client will answer [WH-questions/fill-ins/categories] without visual supports",
    steps: [
      { instruction: "Remove all visual cues from environment", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Secure attention", promptLevel: "N/A", dataRecording: "" },
      { instruction: "Present verbal SD: '[Question/fill-in]'", promptLevel: "", dataRecording: "" },
      { instruction: "Wait 5 seconds for response", promptLevel: "", dataRecording: "" },
      { instruction: "If correct, provide specific praise describing response", promptLevel: "", dataRecording: "+" },
      { instruction: "If incorrect, provide echoic/partial echoic prompt", promptLevel: "Echoic", dataRecording: "-" },
      { instruction: "Intersperse with mastered intraverbals", promptLevel: "", dataRecording: "" },
    ],
    errorCorrection: "Echoic prompt, fade to partial echoic (first sound), then time delay",
    masteryaCriteria: "90% accuracy for target intraverbals across 2 sessions without prompts",
  },
  {
    name: "Daily Living Skill - Hand Washing",
    domain: "Daily Living",
    targetBehavior: "Client will independently complete all steps of hand washing routine",
    steps: [
      { instruction: "Approach sink and turn on water", promptLevel: "", dataRecording: "" },
      { instruction: "Wet both hands under water", promptLevel: "", dataRecording: "" },
      { instruction: "Apply soap to hands", promptLevel: "", dataRecording: "" },
      { instruction: "Rub hands together for 20 seconds", promptLevel: "", dataRecording: "" },
      { instruction: "Rinse hands under water", promptLevel: "", dataRecording: "" },
      { instruction: "Turn off water", promptLevel: "", dataRecording: "" },
      { instruction: "Dry hands with towel", promptLevel: "", dataRecording: "" },
    ],
    errorCorrection:
      "Backward chaining: Complete all steps with full physical prompt, fade prompts from last step first",
    masteryaCriteria: "100% independence across all steps for 5 consecutive opportunities",
  },
]

export default function TeachingProtocolsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [protocols, setProtocols] = useState<TeachingProtocol[]>([])
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [newMaterial, setNewMaterial] = useState("")

  // Load from safe storage
  useEffect(() => {
    const saved = safeGetJSON<TeachingProtocol[]>("aria_teaching_protocols", [])
    if (saved.length > 0) {
      setProtocols(saved)
    }
  }, [])

  // Save to safe storage
  useEffect(() => {
    if (protocols.length > 0) {
      safeSetJSON("aria_teaching_protocols", protocols)
    }
  }, [protocols])

  const addProtocol = (template?: (typeof PROTOCOL_TEMPLATES)[0]) => {
    const newProtocol: TeachingProtocol = {
      ...DEFAULT_PROTOCOL,
      id: Date.now().toString(),
      ...(template && {
        skillName: template.name,
        domain: template.domain,
        targetBehavior: template.targetBehavior,
        steps: template.steps.map((s, i) => ({
          id: (i + 1).toString(),
          order: i + 1,
          ...s,
        })),
        errorCorrection: template.errorCorrection,
        masteryaCriteria: template.masteryaCriteria,
      }),
    }
    setProtocols([...protocols, newProtocol])
    setActiveProtocol(newProtocol.id)
    setShowTemplates(false)
    toast({ title: template ? "Template Applied" : "Protocol Created", description: "New teaching protocol added" })
  }

  const updateProtocol = (id: string, updates: Partial<TeachingProtocol>) => {
    setProtocols(protocols.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProtocol = (id: string) => {
    setProtocols(protocols.filter((p) => p.id !== id))
    if (activeProtocol === id) setActiveProtocol(null)
    toast({ title: "Protocol Deleted" })
  }

  const addStep = (protocolId: string) => {
    const protocol = protocols.find((p) => p.id === protocolId)
    if (!protocol) return
    const newStep: ProtocolStep = {
      id: Date.now().toString(),
      order: protocol.steps.length + 1,
      instruction: "",
      promptLevel: "",
      dataRecording: "",
    }
    updateProtocol(protocolId, { steps: [...protocol.steps, newStep] })
  }

  const updateStep = (protocolId: string, stepId: string, updates: Partial<ProtocolStep>) => {
    const protocol = protocols.find((p) => p.id === protocolId)
    if (!protocol) return
    updateProtocol(protocolId, {
      steps: protocol.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    })
  }

  const deleteStep = (protocolId: string, stepId: string) => {
    const protocol = protocols.find((p) => p.id === protocolId)
    if (!protocol) return
    updateProtocol(protocolId, {
      steps: protocol.steps.filter((s) => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })),
    })
  }

  const copyProtocol = (protocol: TeachingProtocol) => {
    const text = `
TEACHING PROTOCOL: ${protocol.skillName}
${"=".repeat(50)}

DOMAIN: ${protocol.domain}
TARGET BEHAVIOR: ${protocol.targetBehavior}

MATERIALS: ${protocol.materials.join(", ") || "N/A"}
SETTING: ${protocol.setting || "N/A"}
PREREQUISITE SKILLS: ${protocol.prerequisiteSkills || "N/A"}

PROMPT HIERARCHY: ${protocol.promptHierarchy === "MTL" ? "Most-to-Least" : "Least-to-Most"}
${protocol.promptLevels.join(" → ")}

TEACHING STEPS:
${protocol.steps.map((s) => `${s.order}. ${s.instruction}${s.promptLevel ? ` [${s.promptLevel}]` : ""}`).join("\n")}

ERROR CORRECTION PROCEDURE:
${protocol.errorCorrection || "N/A"}

REINFORCEMENT SCHEDULE: ${protocol.reinforcementSchedule}
DATA COLLECTION METHOD: ${protocol.dataCollectionMethod}
MASTERY CRITERIA: ${protocol.masteryaCriteria}

GENERALIZATION PLAN:
${protocol.generalizationPlan || "N/A"}

NOTES:
${protocol.notes || "N/A"}
`.trim()

    navigator.clipboard.writeText(text)
    toast({ title: "Protocol Copied", description: "Teaching protocol copied to clipboard" })
  }

  const currentProtocol = protocols.find((p) => p.id === activeProtocol)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* AssessmentSidebar */}
      <AssessmentSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="lg:hidden">
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/assessment/interventions")}
                className="lg:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Teaching Protocols</h1>
                <p className="text-sm text-muted-foreground">Step 10 of 18 - Step-by-step teaching procedures</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 hidden sm:flex">
                {protocols.length} Protocol{protocols.length !== 1 ? "s" : ""}
              </Badge>
              <Button onClick={() => router.push("/assessment/generalization")}>
                Continue
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Protocol List */}
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Protocols</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      Templates
                    </Button>
                    <Button size="sm" onClick={() => addProtocol()}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </div>
                </div>

                {protocols.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No protocols yet.</p>
                    <p className="text-sm">Click Templates or New to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {protocols.map((protocol) => (
                      <div
                        key={protocol.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeProtocol === protocol.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setActiveProtocol(protocol.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{protocol.skillName || "Untitled Protocol"}</p>
                            <p className="text-sm text-muted-foreground">{protocol.domain || "No domain"}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {protocol.steps.length} steps
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Templates Panel */}
              {showTemplates && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Protocol Templates</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {PROTOCOL_TEMPLATES.map((template, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => addProtocol(template)}
                      >
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.domain}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Protocol Editor */}
            <div className="lg:col-span-2">
              {currentProtocol ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Edit Protocol</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyProtocol(currentProtocol)}>
                        <CopyIcon className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProtocol(currentProtocol.id)}>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <Accordion type="multiple" defaultValue={["basic", "steps"]} className="space-y-4">
                    {/* Basic Info */}
                    <AccordionItem value="basic" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-semibold">Basic Information</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Skill Name</Label>
                            <Input
                              value={currentProtocol.skillName}
                              onChange={(e) => updateProtocol(currentProtocol.id, { skillName: e.target.value })}
                              placeholder="e.g., Mand Training"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Domain</Label>
                            <Select
                              value={currentProtocol.domain}
                              onValueChange={(v) => updateProtocol(currentProtocol.id, { domain: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                              <SelectContent>
                                {DOMAINS.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Target Behavior (Operational Definition)</Label>
                          <Textarea
                            value={currentProtocol.targetBehavior}
                            onChange={(e) => updateProtocol(currentProtocol.id, { targetBehavior: e.target.value })}
                            placeholder="Client will independently..."
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Setting</Label>
                            <Input
                              value={currentProtocol.setting}
                              onChange={(e) => updateProtocol(currentProtocol.id, { setting: e.target.value })}
                              placeholder="e.g., Table-top, Natural environment"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Prerequisite Skills</Label>
                            <Input
                              value={currentProtocol.prerequisiteSkills}
                              onChange={(e) =>
                                updateProtocol(currentProtocol.id, { prerequisiteSkills: e.target.value })
                              }
                              placeholder="e.g., Sitting, Eye contact"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Materials</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newMaterial}
                              onChange={(e) => setNewMaterial(e.target.value)}
                              placeholder="Add material..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newMaterial.trim()) {
                                  updateProtocol(currentProtocol.id, {
                                    materials: [...currentProtocol.materials, newMaterial.trim()],
                                  })
                                  setNewMaterial("")
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (newMaterial.trim()) {
                                  updateProtocol(currentProtocol.id, {
                                    materials: [...currentProtocol.materials, newMaterial.trim()],
                                  })
                                  setNewMaterial("")
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentProtocol.materials.map((m, i) => (
                              <Badge key={i} variant="secondary" className="gap-1">
                                {m}
                                <button
                                  onClick={() =>
                                    updateProtocol(currentProtocol.id, {
                                      materials: currentProtocol.materials.filter((_, j) => j !== i),
                                    })
                                  }
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Prompt Hierarchy */}
                    <AccordionItem value="prompts" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-semibold">Prompt Hierarchy</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Prompting Strategy</Label>
                          <Select
                            value={currentProtocol.promptHierarchy}
                            onValueChange={(v: "MTL" | "LTM") =>
                              updateProtocol(currentProtocol.id, {
                                promptHierarchy: v,
                                promptLevels: PROMPT_LEVELS[v],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MTL">Most-to-Least (MTL)</SelectItem>
                              <SelectItem value="LTM">Least-to-Most (LTM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">Prompt Fading Sequence:</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {currentProtocol.promptLevels.map((level, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Badge variant="outline">{level}</Badge>
                                {i < currentProtocol.promptLevels.length - 1 && (
                                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Teaching Steps */}
                    <AccordionItem value="steps" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Teaching Steps</span>
                          <Badge>{currentProtocol.steps.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-3">
                        {currentProtocol.steps.map((step, i) => (
                          <div key={step.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                                {step.order}
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <Input
                                value={step.instruction}
                                onChange={(e) =>
                                  updateStep(currentProtocol.id, step.id, { instruction: e.target.value })
                                }
                                placeholder="Step instruction..."
                                className="font-medium"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  value={step.promptLevel}
                                  onValueChange={(v) => updateStep(currentProtocol.id, step.id, { promptLevel: v })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Prompt level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="N/A">N/A</SelectItem>
                                    {currentProtocol.promptLevels.map((p) => (
                                      <SelectItem key={p} value={p}>
                                        {p}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={step.dataRecording}
                                  onValueChange={(v) => updateStep(currentProtocol.id, step.id, { dataRecording: v })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Data recording" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="+">+ (Correct)</SelectItem>
                                    <SelectItem value="-">- (Incorrect)</SelectItem>
                                    <SelectItem value="P">P (Prompted)</SelectItem>
                                    <SelectItem value="NR">NR (No Response)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteStep(currentProtocol.id, step.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => addStep(currentProtocol.id)}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Step
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Error Correction & Reinforcement */}
                    <AccordionItem value="procedures" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-semibold">Procedures & Criteria</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Error Correction Procedure</Label>
                          <Textarea
                            value={currentProtocol.errorCorrection}
                            onChange={(e) => updateProtocol(currentProtocol.id, { errorCorrection: e.target.value })}
                            placeholder="Describe the error correction procedure..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Reinforcement Schedule</Label>
                            <Select
                              value={currentProtocol.reinforcementSchedule}
                              onValueChange={(v) => updateProtocol(currentProtocol.id, { reinforcementSchedule: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {REINFORCEMENT_SCHEDULES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data Collection Method</Label>
                            <Select
                              value={currentProtocol.dataCollectionMethod}
                              onValueChange={(v) => updateProtocol(currentProtocol.id, { dataCollectionMethod: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DATA_METHODS.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Mastery Criteria</Label>
                          <Input
                            value={currentProtocol.masteryaCriteria}
                            onChange={(e) => updateProtocol(currentProtocol.id, { masteryaCriteria: e.target.value })}
                            placeholder="e.g., 90% accuracy across 2 consecutive sessions"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Generalization Plan</Label>
                          <Textarea
                            value={currentProtocol.generalizationPlan}
                            onChange={(e) => updateProtocol(currentProtocol.id, { generalizationPlan: e.target.value })}
                            placeholder="Describe how skill will be generalized across settings, people, materials..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Additional Notes</Label>
                          <Textarea
                            value={currentProtocol.notes}
                            onChange={(e) => updateProtocol(currentProtocol.id, { notes: e.target.value })}
                            placeholder="Any additional notes or considerations..."
                            rows={2}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <SparklesIcon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Protocol Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Select an existing protocol or create a new one to define step-by-step teaching procedures.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setShowTemplates(true)}>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button onClick={() => addProtocol()}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Blank
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
