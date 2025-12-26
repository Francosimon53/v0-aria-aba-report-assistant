"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PlusIcon,
  XIcon,
  SaveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "@/components/icons"
import { useRAGSuggestions } from "@/hooks/useRAGSuggestions"
import { Sparkles, Loader2 } from "lucide-react"

interface ProtocolStep {
  id: string
  number: number
  description: string
  whatNotToDo: string
}

interface TeachingProtocol {
  id: string
  name: string
  operationalDefinition: string
  barriers: string
  measurementProcedures: string
  steps: ProtocolStep[]
  promptingHierarchy: string
  reinforcementSchedule: string
  masteryCriteria: string
  proceduralModifications: string
  teachingExamples: string
}

const PROTOCOL_TEMPLATES = {
  custom: {
    name: "Custom Protocol",
    operationalDefinition: "",
    barriers: "",
    measurementProcedures: "",
    steps: [],
    promptingHierarchy: "Most-to-Least",
    reinforcementSchedule: "",
    masteryCriteria: "",
    proceduralModifications: "",
    teachingExamples: "",
  },
  fct: {
    name: "Making Requests (FCT)",
    operationalDefinition:
      "The client will independently request preferred items or activities using appropriate communication (verbal, sign, or AAC device) when needed.",
    barriers:
      "• Limited expressive communication repertoire\n• History of challenging behavior to gain access to tangibles\n• Difficulty with motor planning for signs/speech\n• Limited understanding of communication function",
    measurementProcedures:
      "Data collected on frequency of independent requests across natural opportunities. Record type of communication used (verbal, sign, AAC) and context.",
    steps: [
      {
        id: "1",
        number: 1,
        description: "Present preferred item within view but out of reach. Wait 3 seconds for spontaneous request.",
        whatNotToDo: "Do not provide the item without a request. Avoid prompting immediately.",
      },
      {
        id: "2",
        number: 2,
        description:
          'If no response, model the request (e.g., "cookie") and immediately guide client to imitate or use AAC.',
        whatNotToDo: "Do not accept reaching or crying as a valid request form.",
      },
      {
        id: "3",
        number: 3,
        description: "Immediately provide the item when client produces the target request form.",
        whatNotToDo: "Do not delay reinforcement or provide partial amounts initially.",
      },
      {
        id: "4",
        number: 4,
        description: "Repeat across 5-10 trials within the session, gradually fading prompts.",
        whatNotToDo: "Do not move too quickly to independent responding without sufficient practice.",
      },
    ],
    promptingHierarchy: "Most-to-Least",
    reinforcementSchedule:
      "Continuous reinforcement (FR1) initially. Gradually thin to intermittent schedule once skill is fluent.",
    masteryCriteria: "80% independent correct responses across 3 consecutive sessions in natural environment.",
    proceduralModifications:
      "• For non-verbal clients: Accept any approximation of target communication initially\n• If client shows frustration: Reduce delay time and increase prompting temporarily",
    teachingExamples:
      "Example 1: During snack time, show cookie jar. Wait for request. Model 'cookie' if needed.\nExample 2: During play, hold preferred toy. Wait for sign or word before giving access.",
  },
  waiting: {
    name: "Waiting After Requests",
    operationalDefinition:
      "The client will wait calmly for 5-30 seconds after making a request without engaging in challenging behavior.",
    barriers:
      "• History of immediate access to tangibles\n• Low tolerance for denial\n• Difficulty with self-regulation\n• Limited understanding of time concepts",
    measurementProcedures: "Duration of calm waiting and frequency of challenging behaviors during wait time.",
    steps: [
      {
        id: "1",
        number: 1,
        description: "Client makes a request. Acknowledge request verbally: 'I heard you, you need to wait.'",
        whatNotToDo: "Do not ignore the request or provide the item immediately.",
      },
      {
        id: "2",
        number: 2,
        description: "Use visual timer or count down (e.g., 5 seconds initially). Provide verbal praise for waiting.",
        whatNotToDo: "Do not extend wait time if challenging behavior occurs.",
      },
      {
        id: "3",
        number: 3,
        description: "When timer ends, immediately provide the requested item and praise calm waiting.",
        whatNotToDo: "Do not lecture or delay delivery after successful waiting.",
      },
      {
        id: "4",
        number: 4,
        description: "Gradually increase wait duration across sessions (5s → 10s → 15s → 30s).",
        whatNotToDo: "Do not increase duration until current duration is mastered.",
      },
    ],
    promptingHierarchy: "Least-to-Most",
    reinforcementSchedule: "Access to requested item plus social praise for each successful wait trial.",
    masteryCriteria: "Client waits calmly for 30 seconds on 90% of opportunities across 3 sessions.",
    proceduralModifications:
      "• Start with highly preferred items to build tolerance\n• Use visual supports (timer, wait card) as needed\n• If challenging behavior: Reset timer and start over",
    teachingExamples:
      "Example 1: Client asks for iPad. Say 'Wait please' and set 5-second timer. Give iPad when timer ends.\nExample 2: During transitions, client requests specific toy. Acknowledge and use countdown.",
  },
  acceptingNo: {
    name: "Accepting 'No'",
    operationalDefinition:
      "The client will accept denial of a request without engaging in challenging behavior for 1 minute following the denial.",
    barriers:
      "• History of escape from demands via problem behavior\n• Low frustration tolerance\n• Limited coping skills\n• Difficulty with emotional regulation",
    measurementProcedures:
      "Frequency of calm acceptance vs. challenging behavior following denial. Duration of appropriate behavior maintained after 'no.'",
    steps: [
      {
        id: "1",
        number: 1,
        description:
          "Client makes request. Deliver clear 'no' with visual (crossed out picture) and brief explanation.",
        whatNotToDo: "Do not provide lengthy explanations or negotiate. Avoid saying 'maybe later' initially.",
      },
      {
        id: "2",
        number: 2,
        description: "Offer alternative acceptable activity or choice immediately after denial.",
        whatNotToDo: "Do not offer the original item as an alternative.",
      },
      {
        id: "3",
        number: 3,
        description: "Praise client for calm behavior. If problem behavior occurs, block and redirect neutrally.",
        whatNotToDo: "Do not provide attention for problem behavior or give in to the original request.",
      },
      {
        id: "4",
        number: 4,
        description: "After 1 minute of calm behavior, provide strong reinforcement (different preferred item).",
        whatNotToDo: "Do not withhold reinforcement if client is calm but not engaged in alternative.",
      },
    ],
    promptingHierarchy: "Least-to-Most",
    reinforcementSchedule: "Differential reinforcement for calm behavior following denial. FR1 initially.",
    masteryCriteria: "Client accepts denial calmly on 80% of opportunities across 3 consecutive sessions.",
    proceduralModifications:
      "• Start with low-preference items for denial\n• Gradually increase to higher-preference items\n• Use behavior momentum: Several 'yes' responses before 'no'",
    teachingExamples:
      "Example 1: Client asks for candy before dinner. Show 'no' card, offer apple or crackers instead.\nExample 2: Client wants to play outside during rain. Say 'no outside,' offer indoor sensory activity.",
  },
  following: {
    name: "Following Directions",
    operationalDefinition:
      "The client will comply with simple one-step directions within 5 seconds, completing the action fully.",
    barriers:
      "• Limited receptive language skills\n• History of escape via noncompliance\n• Attention difficulties\n• Competing motivations",
    measurementProcedures: "Percentage of directions followed within 5 seconds across opportunities.",
    steps: [
      {
        id: "1",
        number: 1,
        description: "Gain client attention (say name, position at eye level). Give clear, simple direction once.",
        whatNotToDo: "Do not repeat direction multiple times or give compound commands.",
      },
      {
        id: "2",
        number: 2,
        description: "Wait 5 seconds. If no response, physically prompt client through the action (hand-over-hand).",
        whatNotToDo: "Do not provide verbal reminders or accept partial compliance initially.",
      },
      {
        id: "3",
        number: 3,
        description: "Provide immediate praise and tangible reinforcement for compliance.",
        whatNotToDo: "Do not delay reinforcement or provide minimal acknowledgment.",
      },
      {
        id: "4",
        number: 4,
        description: "Gradually fade prompts across trials as client demonstrates independent compliance.",
        whatNotToDo: "Do not remove prompts too quickly before establishing pattern of compliance.",
      },
    ],
    promptingHierarchy: "Most-to-Least",
    reinforcementSchedule: "Dense reinforcement schedule initially (FR1). Thin to VR3-5 once skill is established.",
    masteryCriteria: "90% compliance with one-step directions across 3 consecutive sessions.",
    proceduralModifications:
      "• Start with easy, high-probability requests\n• Use behavior momentum (3 easy → 1 difficult)\n• If escape-maintained: Ensure task completion regardless of behavior",
    teachingExamples:
      "Example 1: 'Put the book on the table' - guide hand if needed, praise immediately.\nExample 2: 'Stand up' - physically prompt standing position, deliver preferred item.",
  },
  daily: {
    name: "Daily Living Skills",
    operationalDefinition:
      "The client will complete age-appropriate self-care tasks (e.g., hand washing, tooth brushing) with minimal assistance.",
    barriers:
      "• Limited motor planning skills\n• Dependence on adult assistance\n• Sensory sensitivities\n• Difficulty with task sequences",
    measurementProcedures:
      "Task analysis data collection. Record percentage of steps completed independently per routine.",
    steps: [
      {
        id: "1",
        number: 1,
        description: "Use task analysis (break skill into 5-10 small steps). Create visual schedule showing each step.",
        whatNotToDo: "Do not expect client to remember sequence without supports initially.",
      },
      {
        id: "2",
        number: 2,
        description: "Model the entire task slowly while narrating each step. Have client watch demonstration.",
        whatNotToDo: "Do not rush through demonstration or skip explanation of steps.",
      },
      {
        id: "3",
        number: 3,
        description: "Use backward chaining: Complete all steps except last one, prompt client to finish. Reinforce.",
        whatNotToDo: "Do not use forward chaining unless specifically indicated by client learning style.",
      },
      {
        id: "4",
        number: 4,
        description: "Gradually require client to complete more steps independently, working backward through chain.",
        whatNotToDo: "Do not move to next step until current step is mastered at 80% independence.",
      },
    ],
    promptingHierarchy: "Most-to-Least",
    reinforcementSchedule: "Reinforce completion of entire routine initially. Gradually thin to natural consequences.",
    masteryCriteria: "Client completes routine with 80% independence for 5 consecutive sessions.",
    proceduralModifications:
      "• Address sensory issues before teaching (temperature, texture)\n• Use preferred items related to task (character toothbrush)\n• Allow extra time initially",
    teachingExamples:
      "Example 1: Hand washing - complete first 4 steps, have client dry hands and turn off water.\nExample 2: Tooth brushing - put toothpaste on brush, have client brush and spit.",
  },
  listener: {
    name: "Listener Responses",
    operationalDefinition:
      "The client will identify common items, body parts, or actions when named, by pointing, touching, or selecting.",
    barriers:
      "• Limited receptive vocabulary\n• Attention difficulties\n• Competing visual stimuli\n• Motor planning challenges for responses",
    measurementProcedures: "Percentage correct identification across 10-20 targets. Record prompt level required.",
    steps: [
      {
        id: "1",
        number: 1,
        description: "Present 2-3 items on table. Give instruction 'Touch [item]' or 'Show me [item].' Wait 3 seconds.",
        whatNotToDo: "Do not present too many choices initially. Avoid using similar-looking items together.",
      },
      {
        id: "2",
        number: 2,
        description: "If no response, point to correct item. If client touches it, immediately reinforce.",
        whatNotToDo: "Do not accept responses to non-target items. Avoid repeated instructions.",
      },
      {
        id: "3",
        number: 3,
        description:
          "Rotate position of items and vary instruction slightly across trials ('Find the ___', 'Where is ___').",
        whatNotToDo: "Do not keep items in same position. Avoid teaching position discrimination.",
      },
      {
        id: "4",
        number: 4,
        description: "Gradually increase field size (3 items → 4-5 items) and fade prompts as accuracy improves.",
        whatNotToDo: "Do not increase complexity until 80% accuracy with current field size.",
      },
    ],
    promptingHierarchy: "Most-to-Least",
    reinforcementSchedule: "FR1 initially. Thin to VR2-3 once responding is fluent.",
    masteryCriteria: "80% independent correct responses across 20 targets for 3 sessions.",
    proceduralModifications:
      "• Start with highly discriminable items (ball vs. book)\n• Use real objects before pictures\n• Teach in generalized settings once mastered at table",
    teachingExamples:
      "Example 1: 'Touch ball' with ball, car, and cup on table. Point if needed, reinforce immediately.\nExample 2: 'Show me your nose' while doing morning routine. Guide hand if needed.",
  },
}

export function TeachingProtocolBuilder() {
  const [protocol, setProtocol] = useState<TeachingProtocol>({
    id: "1",
    ...PROTOCOL_TEMPLATES.custom,
  })
  const [selectedTemplate, setSelectedTemplate] = useState("custom")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    definition: true,
    barriers: false,
    measurement: false,
    steps: true,
    prompting: false,
    reinforcement: false,
    mastery: false,
    modifications: false,
    examples: false,
  })

  // RAG Integration
  const { suggestions, isLoading, error, fetchSuggestions } = useRAGSuggestions()

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    const template = PROTOCOL_TEMPLATES[templateKey as keyof typeof PROTOCOL_TEMPLATES]
    setProtocol({
      ...protocol,
      ...template,
      steps: template.steps.map((step) => ({
        ...step,
        id: Math.random().toString(36).substr(2, 9),
      })),
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const addStep = () => {
    const newStep: ProtocolStep = {
      id: Math.random().toString(36).substr(2, 9),
      number: protocol.steps.length + 1,
      description: "",
      whatNotToDo: "",
    }
    setProtocol({ ...protocol, steps: [...protocol.steps, newStep] })
  }

  const removeStep = (id: string) => {
    const updatedSteps = protocol.steps
      .filter((step) => step.id !== id)
      .map((step, index) => ({
        ...step,
        number: index + 1,
      }))
    setProtocol({ ...protocol, steps: updatedSteps })
  }

  const updateStep = (id: string, field: keyof ProtocolStep, value: string) => {
    const updatedSteps = protocol.steps.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    setProtocol({ ...protocol, steps: updatedSteps })
  }

  const handleSave = () => {
    const protocolData = JSON.stringify(protocol, null, 2)
    const blob = new Blob([protocolData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${protocol.name.replace(/\s+/g, "_")}_protocol.json`
    a.click()
  }

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {expandedSections[section] ? (
        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronRightIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0D9488] to-cyan-600 flex items-center justify-center">
              <FileTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teaching Protocol Builder</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create detailed, evidence-based teaching protocols for ABA programs
              </p>
            <Button variant="outline" size="sm" onClick={() => fetchSuggestions("teaching protocols ABA DTT")} disabled={isLoading}>{isLoading ? "Loading..." : "AI Ideas"}</Button>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <Card className="p-6 mb-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <div className="space-y-4">
            <div>
              <Label htmlFor="template" className="text-base font-semibold">
                Start with a Template
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Choose a pre-built protocol or start from scratch
              </p>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Protocol</SelectItem>
                  <SelectItem value="fct">Making Requests (FCT)</SelectItem>
                  <SelectItem value="waiting">Waiting After Requests</SelectItem>
                  <SelectItem value="acceptingNo">Accepting "No"</SelectItem>
                  <SelectItem value="following">Following Directions</SelectItem>
                  <SelectItem value="daily">Daily Living Skills</SelectItem>
                  <SelectItem value="listener">Listener Responses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="protocol-name" className="text-base font-semibold">
                Protocol Name
              </Label>
              <Input
                id="protocol-name"
                value={protocol.name}
                onChange={(e) => setProtocol({ ...protocol, name: e.target.value })}
                placeholder="Enter protocol name..."
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4 pr-4">
            {/* Operational Definition */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="1. Operational Definition" section="definition" />
              {expandedSections.definition && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.operationalDefinition}
                    onChange={(e) => setProtocol({ ...protocol, operationalDefinition: e.target.value })}
                    placeholder="Define the target behavior in clear, observable, and measurable terms..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Barriers */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="2. Barriers to Acquisition" section="barriers" />
              {expandedSections.barriers && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.barriers}
                    onChange={(e) => setProtocol({ ...protocol, barriers: e.target.value })}
                    placeholder="List potential barriers that may impede learning (e.g., limited prerequisites, sensory issues, competing behaviors)..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Measurement */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="3. Measurement Procedures" section="measurement" />
              {expandedSections.measurement && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.measurementProcedures}
                    onChange={(e) => setProtocol({ ...protocol, measurementProcedures: e.target.value })}
                    placeholder="Describe how progress will be measured (frequency, duration, trials-to-criterion, etc.)..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Teaching Steps */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="4. Teaching Procedure (Step-by-Step)" section="steps" />
              {expandedSections.steps && (
                <div className="px-6 pb-6 space-y-4">
                  {protocol.steps.map((step, index) => (
                    <div key={step.id} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                          {step.number}
                        </div>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateStep(step.id, "description", e.target.value)}
                            placeholder="Describe this teaching step in detail..."
                            className="min-h-[80px]"
                          />

                          {/* What NOT to do callout */}
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                              <Label className="text-sm font-semibold text-red-900 dark:text-red-100">
                                What NOT to do
                              </Label>
                            </div>
                            <Textarea
                              value={step.whatNotToDo}
                              onChange={(e) => updateStep(step.id, "whatNotToDo", e.target.value)}
                              placeholder="List common mistakes to avoid in this step..."
                              className="min-h-[60px] bg-white dark:bg-gray-900"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button onClick={addStep} className="w-full bg-[#0D9488] hover:bg-[#0F766E]">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              )}
            </Card>

            {/* Prompting Hierarchy */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="5. Prompting Hierarchy" section="prompting" />
              {expandedSections.prompting && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <Label className="mb-2">Prompt Fading Strategy</Label>
                    <Select
                      value={protocol.promptingHierarchy}
                      onValueChange={(value) => setProtocol({ ...protocol, promptingHierarchy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Most-to-Least">Most-to-Least Prompting</SelectItem>
                        <SelectItem value="Least-to-Most">Least-to-Most Prompting</SelectItem>
                        <SelectItem value="Graduated Guidance">Graduated Guidance</SelectItem>
                        <SelectItem value="Time Delay">Progressive Time Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Most-to-Least:</strong> Start with full physical prompt, fade to gesture, then independent
                      <br />
                      <strong>Least-to-Most:</strong> Start with no prompt, increase support as needed
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Reinforcement Schedule */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="6. Reinforcement Schedule" section="reinforcement" />
              {expandedSections.reinforcement && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.reinforcementSchedule}
                    onChange={(e) => setProtocol({ ...protocol, reinforcementSchedule: e.target.value })}
                    placeholder="Describe the reinforcement schedule (FR1, VR3, token system, etc.) and how it will be thinned..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Mastery Criteria */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="7. Mastery Criteria" section="mastery" />
              {expandedSections.mastery && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.masteryCriteria}
                    onChange={(e) => setProtocol({ ...protocol, masteryCriteria: e.target.value })}
                    placeholder="Define when skill is considered mastered (e.g., 80% accuracy across 3 sessions, generalization to 3 people)..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Procedural Modifications */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="8. Procedural Modifications" section="modifications" />
              {expandedSections.modifications && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.proceduralModifications}
                    onChange={(e) => setProtocol({ ...protocol, proceduralModifications: e.target.value })}
                    placeholder="List modifications for specific client needs or common challenges..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>

            {/* Teaching Examples */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
              <SectionHeader title="9. Teaching Examples" section="examples" />
              {expandedSections.examples && (
                <div className="px-6 pb-6">
                  <Textarea
                    value={protocol.teachingExamples}
                    onChange={(e) => setProtocol({ ...protocol, teachingExamples: e.target.value })}
                    placeholder="Provide concrete examples of how to implement this protocol in natural contexts..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </Card>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {protocol.steps.length} Steps
            </Badge>
            {protocol.name && <Badge className="text-sm bg-[#0D9488]">Protocol Ready</Badge>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => handleTemplateChange("custom")}>
              Reset
            </Button>
            <Button onClick={handleSave} className="bg-[#0D9488] hover:bg-[#0F766E]">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Protocol
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
