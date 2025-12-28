"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Settings } from "@/components/icons"
import { ChevronRight } from "@/components/icons"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  PlusIcon,
  CopyIcon,
  EyeIcon,
  ZapIcon,
  ShieldIcon,
  HandIcon,
  BrainIcon,
  HomeIcon,
} from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

// Types
type BehaviorFunction = "attention" | "escape" | "tangible" | "automatic"

interface TargetBehavior {
  id: string
  name: string
  function: BehaviorFunction
  operationalDefinition: string
}

interface Intervention {
  id: string
  name: string
  description: string
  selected: boolean
}

interface FunctionBasedPlan {
  function: BehaviorFunction
  behaviors: string[]
  preventiveStrategies: Intervention[]
  replacementSkills: Intervention[]
  consequenceStrategies: Intervention[]
  thinningSchedule: string
}

interface ThinningPhase {
  id: string
  phase: number
  reductionPercent: number
  schedule: string
  duration: string
  criteria: string
  status: "not-started" | "in-progress" | "completed"
}

// Default interventions by category
const DEFAULT_PREVENTIVE_STRATEGIES: Record<BehaviorFunction, Intervention[]> = {
  attention: [
    {
      id: "att-p1",
      name: "Scheduled attention",
      description: "Provide attention on a fixed time schedule (e.g., every 5 minutes) regardless of behavior",
      selected: false,
    },
    {
      id: "att-p2",
      name: "Non-contingent reinforcement (NCR)",
      description: "Deliver attention independent of behavior on a dense schedule, then thin",
      selected: false,
    },
    {
      id: "att-p3",
      name: "Functional communication training prompt",
      description: "Prompt appropriate requests for attention before problem behavior occurs",
      selected: false,
    },
    {
      id: "att-p4",
      name: "Environmental enrichment",
      description: "Ensure access to engaging activities and social interactions throughout the day",
      selected: false,
    },
    {
      id: "att-p5",
      name: "Visual schedule with attention breaks",
      description: "Clearly indicate when attention/interaction times will occur",
      selected: false,
    },
    {
      id: "att-p6",
      name: "Peer-mediated interaction",
      description: "Train peers to initiate and maintain appropriate social interactions",
      selected: false,
    },
  ],
  escape: [
    {
      id: "esc-p1",
      name: "Task modification",
      description: "Modify task difficulty, duration, or presentation to reduce aversiveness",
      selected: false,
    },
    {
      id: "esc-p2",
      name: "Demand fading",
      description: "Start with low demands and gradually increase as tolerance builds",
      selected: false,
    },
    {
      id: "esc-p3",
      name: "Choice making",
      description: "Provide choices within tasks (order, materials, location)",
      selected: false,
    },
    {
      id: "esc-p4",
      name: "Premack principle",
      description: "Pair non-preferred tasks with preferred activities (First-Then)",
      selected: false,
    },
    {
      id: "esc-p5",
      name: "Errorless teaching",
      description: "Use prompting strategies to ensure success and reduce frustration",
      selected: false,
    },
    {
      id: "esc-p6",
      name: "Scheduled breaks",
      description: "Provide breaks on a fixed schedule before problem behavior occurs",
      selected: false,
    },
  ],
  tangible: [
    {
      id: "tan-p1",
      name: "Scheduled access",
      description: "Provide access to preferred items on a predictable schedule",
      selected: false,
    },
    {
      id: "tan-p2",
      name: "Visual schedule for item availability",
      description: "Show when preferred items will be available",
      selected: false,
    },
    {
      id: "tan-p3",
      name: "Token economy",
      description: "Provide tokens for appropriate behavior exchangeable for preferred items",
      selected: false,
    },
    {
      id: "tan-p4",
      name: "Environmental arrangement",
      description: "Keep highly preferred items out of sight when not available",
      selected: false,
    },
    {
      id: "tan-p5",
      name: "Transition warnings",
      description: "Provide warnings before removing preferred items",
      selected: false,
    },
    {
      id: "tan-p6",
      name: "Item sharing training",
      description: "Teach appropriate sharing and turn-taking with preferred items",
      selected: false,
    },
  ],
  automatic: [
    {
      id: "aut-p1",
      name: "Sensory diet",
      description: "Provide regular sensory input through appropriate activities",
      selected: false,
    },
    {
      id: "aut-p2",
      name: "Environmental modification",
      description: "Modify environment to reduce triggers (lighting, noise, textures)",
      selected: false,
    },
    {
      id: "aut-p3",
      name: "Response interruption",
      description: "Interrupt behavior early and redirect to appropriate alternative",
      selected: false,
    },
    {
      id: "aut-p4",
      name: "Matched stimulation",
      description: "Provide access to items/activities that produce similar sensory input",
      selected: false,
    },
    {
      id: "aut-p5",
      name: "Physical activity",
      description: "Schedule regular physical activity to address sensory needs",
      selected: false,
    },
    {
      id: "aut-p6",
      name: "Protective equipment",
      description: "Use protective equipment if behavior poses safety risk",
      selected: false,
    },
  ],
}

const DEFAULT_REPLACEMENT_SKILLS: Record<BehaviorFunction, Intervention[]> = {
  attention: [
    {
      id: "att-r1",
      name: "FCT: Request attention",
      description: "Teach to request attention using words, signs, or AAC (e.g., 'Play with me', 'Look')",
      selected: false,
    },
    {
      id: "att-r2",
      name: "Appropriate greetings",
      description: "Teach appropriate ways to initiate social interactions",
      selected: false,
    },
    {
      id: "att-r3",
      name: "Waiting skills",
      description: "Teach to wait appropriately when attention is not immediately available",
      selected: false,
    },
    {
      id: "att-r4",
      name: "Independent play skills",
      description: "Teach to engage in activities independently for increasing durations",
      selected: false,
    },
  ],
  escape: [
    {
      id: "esc-r1",
      name: "FCT: Request break",
      description: "Teach to request breaks using words, signs, or AAC (e.g., 'Break please', 'Help')",
      selected: false,
    },
    {
      id: "esc-r2",
      name: "Request help",
      description: "Teach to appropriately request assistance with difficult tasks",
      selected: false,
    },
    {
      id: "esc-r3",
      name: "Tolerance building",
      description: "Systematically increase tolerance for non-preferred activities",
      selected: false,
    },
    {
      id: "esc-r4",
      name: "Self-regulation strategies",
      description: "Teach calming strategies (deep breaths, counting, movement breaks)",
      selected: false,
    },
  ],
  tangible: [
    {
      id: "tan-r1",
      name: "FCT: Request item",
      description: "Teach to request items using words, signs, or AAC (e.g., 'I want ___', 'Can I have ___')",
      selected: false,
    },
    {
      id: "tan-r2",
      name: "Waiting for items",
      description: "Teach to wait appropriately when items are not immediately available",
      selected: false,
    },
    {
      id: "tan-r3",
      name: "Accepting 'no'",
      description: "Teach to accept denial of requests without problem behavior",
      selected: false,
    },
    {
      id: "tan-r4",
      name: "Trading/negotiating",
      description: "Teach appropriate negotiation and compromise skills",
      selected: false,
    },
  ],
  automatic: [
    {
      id: "aut-r1",
      name: "Appropriate sensory seeking",
      description: "Teach appropriate ways to meet sensory needs (fidgets, movement breaks)",
      selected: false,
    },
    {
      id: "aut-r2",
      name: "Self-monitoring",
      description: "Teach to recognize and respond to internal states/needs",
      selected: false,
    },
    {
      id: "aut-r3",
      name: "Request sensory input",
      description: "Teach to request specific sensory activities when needed",
      selected: false,
    },
    {
      id: "aut-r4",
      name: "Alternative behaviors",
      description: "Teach alternative behaviors that produce similar sensory input safely",
      selected: false,
    },
  ],
}

const DEFAULT_CONSEQUENCE_STRATEGIES: Record<BehaviorFunction, Intervention[]> = {
  attention: [
    {
      id: "att-c1",
      name: "DRA: Reinforce requests",
      description: "Provide immediate attention for appropriate requests",
      selected: false,
    },
    {
      id: "att-c2",
      name: "Planned ignoring (extinction)",
      description: "Withhold attention following problem behavior",
      selected: false,
    },
    {
      id: "att-c3",
      name: "Redirect to appropriate behavior",
      description: "Prompt appropriate request and reinforce",
      selected: false,
    },
  ],
  escape: [
    {
      id: "esc-c1",
      name: "DRA: Reinforce break requests",
      description: "Provide immediate break for appropriate requests",
      selected: false,
    },
    {
      id: "esc-c2",
      name: "Escape extinction",
      description: "Continue with demand following problem behavior (with safety)",
      selected: false,
    },
    {
      id: "esc-c3",
      name: "Guided compliance",
      description: "Provide physical guidance to complete task if needed",
      selected: false,
    },
  ],
  tangible: [
    {
      id: "tan-c1",
      name: "DRA: Reinforce item requests",
      description: "Provide immediate access for appropriate requests",
      selected: false,
    },
    {
      id: "tan-c2",
      name: "Tangible extinction",
      description: "Withhold item following problem behavior",
      selected: false,
    },
    {
      id: "tan-c3",
      name: "Response cost",
      description: "Remove access to item contingent on problem behavior",
      selected: false,
    },
  ],
  automatic: [
    {
      id: "aut-c1",
      name: "Response blocking",
      description: "Block behavior to reduce sensory reinforcement",
      selected: false,
    },
    {
      id: "aut-c2",
      name: "Redirect to alternative",
      description: "Redirect to appropriate sensory activity",
      selected: false,
    },
    {
      id: "aut-c3",
      name: "Provide matched stimulation",
      description: "Offer appropriate alternative that meets sensory need",
      selected: false,
    },
  ],
}

const FUNCTION_INFO: Record<
  BehaviorFunction,
  { label: string; color: string; icon: typeof EyeIcon; description: string }
> = {
  attention: {
    label: "Attention",
    color: "bg-blue-500",
    icon: EyeIcon,
    description: "Behaviors maintained by access to social attention from others",
  },
  escape: {
    label: "Escape/Avoidance",
    color: "bg-orange-500",
    icon: ShieldIcon,
    description: "Behaviors maintained by removal or avoidance of demands/tasks",
  },
  tangible: {
    label: "Tangible/Access",
    color: "bg-green-500",
    icon: HandIcon,
    description: "Behaviors maintained by access to preferred items or activities",
  },
  automatic: {
    label: "Automatic/Sensory",
    color: "bg-purple-500",
    icon: BrainIcon,
    description: "Behaviors maintained by internal sensory stimulation",
  },
}

const THINNING_SCHEDULE_TEMPLATES = [
  {
    id: "graduated",
    name: "Graduated Thinning",
    description: "Systematic reduction based on behavior percentage",
    schedule:
      "25% reduction → FI 15 min; 50% reduction → FI 30 min; 75% reduction → VI 30 min; 90% reduction → Natural environment schedule",
  },
  {
    id: "ncr-fading",
    name: "NCR Fading",
    description: "Non-contingent reinforcement with time-based fading",
    schedule: "Dense NCR (FT 2 min) → FT 5 min → FT 10 min → FT 15 min → Natural schedule",
  },
  {
    id: "variable-ratio",
    name: "Variable Ratio Thinning",
    description: "Decreasing reinforcement probability",
    schedule: "100% reinforcement → VR 2 (75%) → VR 3 (50%) → VR 4 (25%) → Natural schedule",
  },
  {
    id: "delay-tolerance",
    name: "Delay Tolerance Building",
    description: "Increasing delay between response and reinforcement",
    schedule:
      "Immediate reinforcement → 30 sec delay → 1 min delay → 2 min delay → 5 min delay → Natural delay tolerance",
  },
  {
    id: "schedule-thinning",
    name: "Schedule Thinning (FCT)",
    description: "For functional communication training",
    schedule: "FR1 (100%) → FR2 (50%) → VR3 (33%) → VR5 (20%) → Natural communication opportunities",
  },
]

export default function InterventionsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [behaviors, setBehaviors] = useState<TargetBehavior[]>([])
  const [functionPlans, setFunctionPlans] = useState<Record<BehaviorFunction, FunctionBasedPlan>>({
    attention: {
      function: "attention",
      behaviors: [],
      preventiveStrategies: DEFAULT_PREVENTIVE_STRATEGIES.attention,
      replacementSkills: DEFAULT_REPLACEMENT_SKILLS.attention,
      consequenceStrategies: DEFAULT_CONSEQUENCE_STRATEGIES.attention,
      thinningSchedule: THINNING_SCHEDULE_TEMPLATES[0].schedule,
    },
    escape: {
      function: "escape",
      behaviors: [],
      preventiveStrategies: DEFAULT_PREVENTIVE_STRATEGIES.escape,
      replacementSkills: DEFAULT_REPLACEMENT_SKILLS.escape,
      consequenceStrategies: DEFAULT_CONSEQUENCE_STRATEGIES.escape,
      thinningSchedule: THINNING_SCHEDULE_TEMPLATES[0].schedule,
    },
    tangible: {
      function: "tangible",
      behaviors: [],
      preventiveStrategies: DEFAULT_PREVENTIVE_STRATEGIES.tangible,
      replacementSkills: DEFAULT_REPLACEMENT_SKILLS.tangible,
      consequenceStrategies: DEFAULT_CONSEQUENCE_STRATEGIES.tangible,
      thinningSchedule: THINNING_SCHEDULE_TEMPLATES[0].schedule,
    },
    automatic: {
      function: "automatic",
      behaviors: [],
      preventiveStrategies: DEFAULT_PREVENTIVE_STRATEGIES.automatic,
      replacementSkills: DEFAULT_REPLACEMENT_SKILLS.automatic,
      consequenceStrategies: DEFAULT_CONSEQUENCE_STRATEGIES.automatic,
      thinningSchedule: THINNING_SCHEDULE_TEMPLATES[0].schedule,
    },
  })

  const [activeFunction, setActiveFunction] = useState<BehaviorFunction>("attention")
  const [showAddBehavior, setShowAddBehavior] = useState(false)
  const [newBehavior, setNewBehavior] = useState({
    name: "",
    function: "attention" as BehaviorFunction,
    operationalDefinition: "",
  })

  // Load saved data
  useEffect(() => {
    const saved = safeGetJSON("aria_interventions_data", null)
    if (saved) {
      if (saved.behaviors) setBehaviors(saved.behaviors)
      if (saved.functionPlans) setFunctionPlans(saved.functionPlans)
    }

    // Load behaviors from ABC observation
    const abcData = safeGetJSON("aria_abc_observation_data", null)
    if (abcData) {
      if (abcData.behaviors && abcData.behaviors.length > 0) {
        const importedBehaviors = abcData.behaviors.map((b: any, i: number) => ({
          id: `imported-${i}`,
          name: b.name,
          function: b.hypothesizedFunction || "attention",
          operationalDefinition: b.operationalDefinition || "",
        }))
        setBehaviors((prev) => {
          const existingNames = prev.map((b) => b.name)
          const newBehaviors = importedBehaviors.filter((b: TargetBehavior) => !existingNames.includes(b.name))
          return [...prev, ...newBehaviors]
        })
      }
    }
  }, [])

  // Save data
  useEffect(() => {
    safeSetJSON("aria_interventions_data", { behaviors, functionPlans })
  }, [behaviors, functionPlans])

  // Update function plans when behaviors change
  useEffect(() => {
    const newPlans = { ...functionPlans }
    const functions: BehaviorFunction[] = ["attention", "escape", "tangible", "automatic"]
    functions.forEach((func) => {
      newPlans[func].behaviors = behaviors.filter((b) => b.function === func).map((b) => b.name)
    })
    setFunctionPlans(newPlans)
  }, [behaviors])

  const addBehavior = () => {
    if (!newBehavior.name.trim()) return

    const behavior: TargetBehavior = {
      id: `behavior-${Date.now()}`,
      ...newBehavior,
    }
    setBehaviors([...behaviors, behavior])
    setNewBehavior({ name: "", function: "attention", operationalDefinition: "" })
    setShowAddBehavior(false)
    toast({
      title: "Behavior added",
      description: `"${behavior.name}" assigned to ${FUNCTION_INFO[behavior.function].label} function`,
    })
  }

  const removeBehavior = (id: string) => {
    setBehaviors(behaviors.filter((b) => b.id !== id))
  }

  const toggleIntervention = (
    func: BehaviorFunction,
    category: "preventiveStrategies" | "replacementSkills" | "consequenceStrategies",
    id: string,
  ) => {
    setFunctionPlans((prev) => ({
      ...prev,
      [func]: {
        ...prev[func],
        [category]: prev[func][category].map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)),
      },
    }))
  }

  const updateThinningSchedule = (func: BehaviorFunction, schedule: string) => {
    setFunctionPlans((prev) => ({
      ...prev,
      [func]: { ...prev[func], thinningSchedule: schedule },
    }))
  }

  const getProgress = () => {
    const totalBehaviors = behaviors.length
    const totalInterventions = Object.values(functionPlans).reduce((acc, plan) => {
      return (
        acc +
        plan.preventiveStrategies.filter((i) => i.selected).length +
        plan.replacementSkills.filter((i) => i.selected).length +
        plan.consequenceStrategies.filter((i) => i.selected).length
      )
    }, 0)

    if (totalBehaviors === 0) return 0
    return Math.min(100, Math.round((totalInterventions / (totalBehaviors * 3)) * 100))
  }

  const copyPlanToClipboard = (func: BehaviorFunction) => {
    const plan = functionPlans[func]
    const info = FUNCTION_INFO[func]

    let text = `## ${info.label}-Maintained Behaviors\n\n`
    text += `### Target Behaviors\n`
    plan.behaviors.forEach((b) => {
      text += `- ${b}\n`
    })

    text += `\n### Preventive Strategies\n`
    plan.preventiveStrategies
      .filter((i) => i.selected)
      .forEach((i) => {
        text += `- **${i.name}**: ${i.description}\n`
      })

    text += `\n### Replacement Skills\n`
    plan.replacementSkills
      .filter((i) => i.selected)
      .forEach((i) => {
        text += `- **${i.name}**: ${i.description}\n`
      })

    text += `\n### Consequence Strategies\n`
    plan.consequenceStrategies
      .filter((i) => i.selected)
      .forEach((i) => {
        text += `- **${i.name}**: ${i.description}\n`
      })

    text += `\n### Thinning Schedule\n${plan.thinningSchedule}\n`

    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: `${info.label} plan copied to clipboard` })
  }

  const generateAIPlan = async (func: BehaviorFunction) => {
    const info = FUNCTION_INFO[func]
    toast({ title: "Generating...", description: `AI is creating ${info.label} intervention plan` })

    // Simulate AI generation with realistic interventions
    setTimeout(() => {
      setFunctionPlans((prev) => {
        const updatedPlan = { ...prev[func] }

        // Auto-select recommended interventions based on function
        updatedPlan.preventiveStrategies = updatedPlan.preventiveStrategies.map((strategy, idx) => ({
          ...strategy,
          selected: idx < 3, // Select first 3 preventive strategies
        }))

        updatedPlan.replacementSkills = updatedPlan.replacementSkills.map((skill, idx) => ({
          ...skill,
          selected: idx < 2, // Select first 2 replacement skills
        }))

        updatedPlan.consequenceStrategies = updatedPlan.consequenceStrategies.map((strategy, idx) => ({
          ...strategy,
          selected: idx < 2, // Select first 2 consequence strategies
        }))

        return { ...prev, [func]: updatedPlan }
      })

      toast({
        title: "Plan generated",
        description: "Review and customize the suggested interventions",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex">
      <AssessmentSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="lg:hidden">
                <HomeIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/assessment/abc-observation")}
                className="lg:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Interventions by Function</h1>
                <p className="text-sm text-muted-foreground">Step 9 of 18 - Hypothesis-Based Treatment Planning</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 hidden sm:flex">
                <Progress value={getProgress()} className="w-32 h-2" />
                <span className="text-sm font-medium">{getProgress()}%</span>
              </div>
              <Button onClick={() => router.push("/assessment/teaching-protocols")}>
                Continue <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          {/* Behaviors Summary */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-primary" />
                  Target Behaviors
                </h2>
                <p className="text-sm text-muted-foreground">Assign behaviors to their hypothesized function</p>
              </div>
              <Button onClick={() => setShowAddBehavior(true)}>
                <PlusIcon className="h-4 w-4 mr-2" /> Add Behavior
              </Button>
            </div>

            {behaviors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BrainIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No behaviors added yet</p>
                <p className="text-sm">Import from ABC Observation or add manually</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["attention", "escape", "tangible", "automatic"] as BehaviorFunction[]).map((func) => {
                  const info = FUNCTION_INFO[func]
                  const funcBehaviors = behaviors.filter((b) => b.function === func)
                  const Icon = info.icon

                  return (
                    <div
                      key={func}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        activeFunction === func ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => setActiveFunction(func)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-full ${info.color} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{info.label}</span>
                      </div>
                      <div className="text-2xl font-bold">{funcBehaviors.length}</div>
                      <div className="text-xs text-muted-foreground">behaviors</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {funcBehaviors.slice(0, 3).map((b) => (
                          <Badge key={b.id} variant="secondary" className="text-xs">
                            {b.name}
                          </Badge>
                        ))}
                        {funcBehaviors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{funcBehaviors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Function-Based Intervention Plan */}
          <Tabs
            value={activeFunction}
            onValueChange={(v) => setActiveFunction(v as BehaviorFunction)}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-4 w-full">
              {(["attention", "escape", "tangible", "automatic"] as BehaviorFunction[]).map((func) => {
                const info = FUNCTION_INFO[func]
                return (
                  <TabsTrigger key={func} value={func} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${info.color}`} />
                    {info.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {(["attention", "escape", "tangible", "automatic"] as BehaviorFunction[]).map((func) => {
              const info = FUNCTION_INFO[func]
              const plan = functionPlans[func]

              return (
                <TabsContent key={func} value={func} className="space-y-6">
                  {/* Function Header */}
                  <Card className={`p-6 border-l-4 ${info.color.replace("bg-", "border-")}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">{info.label}-Maintained Behaviors</h3>
                        <p className="text-muted-foreground mt-1">{info.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {plan.behaviors.length === 0 ? (
                            <span className="text-sm text-muted-foreground italic">
                              No behaviors assigned to this function
                            </span>
                          ) : (
                            plan.behaviors.map((name) => (
                              <Badge key={name} variant="default">
                                {name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyPlanToClipboard(func)}>
                          <CopyIcon className="h-4 w-4 mr-1" /> Copy
                        </Button>
                        <Button size="sm" onClick={() => generateAIPlan(func)}>
                          <SparklesIcon className="h-4 w-4 mr-1" /> AI Generate
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Preventive Strategies */}
                  <Card className="p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <ShieldIcon className="h-5 w-5 text-blue-500" />
                      Preventive Strategies
                      <Badge variant="secondary">
                        {plan.preventiveStrategies.filter((i) => i.selected).length} selected
                      </Badge>
                    </h4>
                    <div className="grid gap-3">
                      {plan.preventiveStrategies.map((intervention) => (
                        <div
                          key={intervention.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            intervention.selected
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30"
                          }`}
                          onClick={() => toggleIntervention(func, "preventiveStrategies", intervention.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={intervention.selected} />
                            <div className="flex-1">
                              <div className="font-medium">{intervention.name}</div>
                              <p className="text-sm text-muted-foreground">{intervention.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Replacement Skills */}
                  <Card className="p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <HandIcon className="h-5 w-5 text-green-500" />
                      Replacement Skills / FCT
                      <Badge variant="secondary">
                        {plan.replacementSkills.filter((i) => i.selected).length} selected
                      </Badge>
                    </h4>
                    <div className="grid gap-3">
                      {plan.replacementSkills.map((intervention) => (
                        <div
                          key={intervention.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            intervention.selected
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30"
                          }`}
                          onClick={() => toggleIntervention(func, "replacementSkills", intervention.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={intervention.selected} />
                            <div className="flex-1">
                              <div className="font-medium">{intervention.name}</div>
                              <p className="text-sm text-muted-foreground">{intervention.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Consequence Strategies */}
                  <Card className="p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <ZapIcon className="h-5 w-5 text-orange-500" />
                      Consequence Strategies
                      <Badge variant="secondary">
                        {plan.consequenceStrategies.filter((i) => i.selected).length} selected
                      </Badge>
                    </h4>
                    <div className="grid gap-3">
                      {plan.consequenceStrategies.map((intervention) => (
                        <div
                          key={intervention.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            intervention.selected
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/30"
                          }`}
                          onClick={() => toggleIntervention(func, "consequenceStrategies", intervention.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox checked={intervention.selected} />
                            <div className="flex-1">
                              <div className="font-medium">{intervention.name}</div>
                              <p className="text-sm text-muted-foreground">{intervention.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Thinning Schedule */}
                  <Card className="p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <BrainIcon className="h-5 w-5 text-purple-500" />
                      Reinforcement Thinning Schedule
                    </h4>
                    <div className="space-y-4">
                      <Textarea
                        value={plan.thinningSchedule}
                        onChange={(e) => updateThinningSchedule(func, e.target.value)}
                        rows={3}
                        placeholder="Describe the schedule for thinning reinforcement..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">Templates:</span>
                        {THINNING_SCHEDULE_TEMPLATES.map((template, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => updateThinningSchedule(func, template.schedule)}
                          >
                            Template {i + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Enhanced Thinning Schedule Section */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-amber-600" />
                        <Label className="font-medium text-amber-900">Reinforcement Thinning Schedule</Label>
                      </div>
                      <Select
                        value={functionPlans[activeFunction].thinningSchedule}
                        onValueChange={(v) => {
                          setFunctionPlans((prev) => ({
                            ...prev,
                            [activeFunction]: { ...prev[activeFunction], thinningSchedule: v },
                          }))
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {THINNING_SCHEDULE_TEMPLATES.map((template) => (
                            <SelectItem key={template.id} value={template.schedule}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template Info */}
                    <div className="mb-3">
                      {THINNING_SCHEDULE_TEMPLATES.map(
                        (template) =>
                          template.schedule === functionPlans[activeFunction].thinningSchedule && (
                            <div key={template.id} className="text-xs text-amber-700 mb-2">
                              <strong>{template.name}:</strong> {template.description}
                            </div>
                          ),
                      )}
                    </div>

                    {/* Editable Schedule */}
                    <Textarea
                      value={functionPlans[activeFunction].thinningSchedule}
                      onChange={(e) => {
                        setFunctionPlans((prev) => ({
                          ...prev,
                          [activeFunction]: { ...prev[activeFunction], thinningSchedule: e.target.value },
                        }))
                      }}
                      placeholder="Define your thinning schedule..."
                      rows={3}
                      className="bg-white"
                    />

                    {/* Visual Timeline */}
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
                      {functionPlans[activeFunction].thinningSchedule.split("→").map((phase, idx, arr) => (
                        <div key={idx} className="flex items-center">
                          <div className="px-3 py-1.5 bg-amber-100 rounded-lg text-xs font-medium text-amber-800 whitespace-nowrap">
                            {phase.trim()}
                          </div>
                          {idx < arr.length - 1 && <ChevronRight className="h-4 w-4 text-amber-400 mx-1 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )
            })}
          </Tabs>
        </main>
      </div>

      <Dialog open={showAddBehavior} onOpenChange={setShowAddBehavior}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ZapIcon className="h-5 w-5 text-teal-600" />
              Add Target Behavior
            </DialogTitle>
            <DialogDescription>Add a new target behavior and assign it to a hypothesized function.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="behavior-name">Behavior Name *</Label>
              <Input
                id="behavior-name"
                placeholder="e.g., Physical aggression, Elopement, Self-injury"
                value={newBehavior.name}
                onChange={(e) => setNewBehavior({ ...newBehavior, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="behavior-function">Hypothesized Function *</Label>
              <Select
                value={newBehavior.function}
                onValueChange={(v: BehaviorFunction) => setNewBehavior({ ...newBehavior, function: v })}
              >
                <SelectTrigger id="behavior-function">
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FUNCTION_INFO) as BehaviorFunction[]).map((func) => {
                    const info = FUNCTION_INFO[func]
                    return (
                      <SelectItem key={func} value={func}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${info.color}`} />
                          {info.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="behavior-definition">Operational Definition</Label>
              <Textarea
                id="behavior-definition"
                placeholder="Observable and measurable definition of the behavior..."
                value={newBehavior.operationalDefinition}
                onChange={(e) => setNewBehavior({ ...newBehavior, operationalDefinition: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBehavior(false)}>
              Cancel
            </Button>
            <Button onClick={addBehavior} disabled={!newBehavior.name.trim()} className="bg-teal-600 hover:bg-teal-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Behavior
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
