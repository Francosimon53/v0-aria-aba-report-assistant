"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sparkles,
  Save,
  ClipboardList,
  Brain,
  Users,
  BarChart3,
  Target,
  Plus,
  Trash2,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react"
import { toast } from "sonner"

interface StandardizedAssessmentsProps {
  onSave?: () => void
}

// ABLLS-R Domains with max scores
const ABLLS_DOMAINS = [
  { id: "cooperation", name: "Cooperation/Reinforcer Effectiveness", max: 52 },
  { id: "visual", name: "Visual Performance", max: 97 },
  { id: "receptive", name: "Receptive Language", max: 182 },
  { id: "imitation", name: "Motor Imitation", max: 80 },
  { id: "mands", name: "Requests (Mands)", max: 74 },
  { id: "tacts", name: "Labeling (Tacts)", max: 154 },
  { id: "intraverbals", name: "Intraverbals", max: 184 },
  { id: "syntax", name: "Syntax and Grammar", max: 44 },
  { id: "play", name: "Play and Leisure", max: 56 },
  { id: "social", name: "Social Interactions", max: 97 },
  { id: "grossMotor", name: "Gross Motor", max: 30 },
  { id: "fineMotor", name: "Fine Motor", max: 28 },
]

// Vineland-3 Domains
const VINELAND_DOMAINS = [
  { id: "abc", name: "Adaptive Behavior Composite (ABC)" },
  { id: "communication", name: "Communication" },
  { id: "dailyLiving", name: "Daily Living Skills" },
  { id: "socialization", name: "Socialization" },
  { id: "motorSkills", name: "Motor Skills" },
]

// SRS-2 Subscales
const SRS2_SUBSCALES = [
  { id: "awareness", name: "Social Awareness" },
  { id: "cognition", name: "Social Cognition" },
  { id: "communication", name: "Social Communication" },
  { id: "motivation", name: "Social Motivation" },
  { id: "restrictedBehaviors", name: "Restricted Interests & Repetitive Behaviors" },
  { id: "total", name: "Total Score" },
]

const getVScaleInterpretation = (score: number): string => {
  if (score <= 17) return "Average"
  if (score <= 20) return "Elevated"
  return "Clinically Significant"
}

const getSRS2Interpretation = (tScore: number): string => {
  if (tScore <= 59) return "Within Normal Limits"
  if (tScore <= 65) return "Mild Range"
  if (tScore <= 75) return "Moderate Range"
  return "Severe Range"
}

function normalizeAbllsData(data: any): Record<string, { score: string; notes: string }> {
  if (!data || typeof data !== "object") return {}

  const normalized: Record<string, { score: string; notes: string }> = {}

  // Map from demo data keys to component keys
  const keyMap: Record<string, string> = {
    cooperation: "cooperation",
    visualPerformance: "visual",
    visual: "visual",
    receptiveLanguage: "receptive",
    receptive: "receptive",
    motorImitation: "imitation",
    imitation: "imitation",
    vocalImitation: "mands", // Map to mands as fallback
    requests: "mands",
    mands: "mands",
    labeling: "tacts",
    tacts: "tacts",
    intraverbals: "intraverbals",
    spontaneousVocalizations: "syntax",
    syntaxGrammar: "syntax",
    syntax: "syntax",
    playLeisure: "play",
    play: "play",
    socialInteraction: "social",
    social: "social",
    grossMotor: "grossMotor",
    fineMotor: "fineMotor",
  }

  for (const [key, value] of Object.entries(data)) {
    const mappedKey = keyMap[key] || key
    if (value && typeof value === "object") {
      const v = value as any
      normalized[mappedKey] = {
        score: String(v.score ?? v.standardScore ?? ""),
        notes: v.notes ?? "",
      }
    }
  }

  return normalized
}

function normalizeVinelandData(data: any): {
  domains: Record<string, { standardScore: string; ciLow: string; ciHigh: string; percentile: string }>
  maladaptive: { internalizing: string; externalizing: string }
} {
  const defaultResult = {
    domains: {} as Record<string, { standardScore: string; ciLow: string; ciHigh: string; percentile: string }>,
    maladaptive: { internalizing: "", externalizing: "" },
  }

  if (!data || typeof data !== "object") return defaultResult

  // Check if it's already in the expected format with 'domains' property
  if (data.domains) {
    return {
      domains: data.domains,
      maladaptive: data.maladaptive || defaultResult.maladaptive,
    }
  }

  // Otherwise, it's demo data format - convert it
  const keyMap: Record<string, string> = {
    abc: "abc",
    communication: "communication",
    dailyLivingSkills: "dailyLiving",
    dailyLiving: "dailyLiving",
    socialization: "socialization",
    motorSkills: "motorSkills",
  }

  const domains: Record<string, { standardScore: string; ciLow: string; ciHigh: string; percentile: string }> = {}

  for (const [key, value] of Object.entries(data)) {
    if (key === "maladaptive") continue
    const mappedKey = keyMap[key] || key
    if (value && typeof value === "object") {
      const v = value as any
      // Parse confidence interval if present
      let ciLow = "",
        ciHigh = ""
      if (v.confidenceInterval) {
        const parts = v.confidenceInterval.split("-")
        ciLow = parts[0] || ""
        ciHigh = parts[1] || ""
      }
      domains[mappedKey] = {
        standardScore: String(v.standardScore ?? ""),
        ciLow: v.ciLow ?? ciLow,
        ciHigh: v.ciHigh ?? ciHigh,
        percentile: String(v.percentile ?? ""),
      }
    }
  }

  return { domains, maladaptive: data.maladaptive || defaultResult.maladaptive }
}

function normalizeSrs2Data(data: any): Record<string, string> {
  if (!data || typeof data !== "object") return {}

  const normalized: Record<string, string> = {}

  const keyMap: Record<string, string> = {
    socialAwareness: "awareness",
    awareness: "awareness",
    socialCognition: "cognition",
    cognition: "cognition",
    socialCommunication: "communication",
    communication: "communication",
    socialMotivation: "motivation",
    motivation: "motivation",
    restrictedInterests: "restrictedBehaviors",
    restrictedBehaviors: "restrictedBehaviors",
    totalScore: "total",
    total: "total",
  }

  for (const [key, value] of Object.entries(data)) {
    const mappedKey = keyMap[key] || key
    if (value && typeof value === "object") {
      const v = value as any
      normalized[mappedKey] = String(v.tScore ?? v.score ?? "")
    } else if (typeof value === "string" || typeof value === "number") {
      normalized[mappedKey] = String(value)
    }
  }

  return normalized
}

function normalizeMasData(
  data: any,
): Array<{ behavior: string; sensory: boolean; escape: boolean; attention: boolean; tangible: boolean }> {
  if (!data) return [{ behavior: "", sensory: false, escape: false, attention: false, tangible: false }]

  // If it's already an array, return it
  if (Array.isArray(data)) return data

  // If it's demo format (object with scores), convert to expected format
  if (typeof data === "object" && (data.sensory || data.escape || data.attention || data.tangible)) {
    return [
      {
        behavior: data.notes || data.primaryFunction || "Target behavior",
        sensory: (data.sensory?.score ?? data.sensory ?? 0) > 3,
        escape: (data.escape?.score ?? data.escape ?? 0) > 3,
        attention: (data.attention?.score ?? data.attention ?? 0) > 3,
        tangible: (data.tangible?.score ?? data.tangible ?? 0) > 3,
      },
    ]
  }

  return [{ behavior: "", sensory: false, escape: false, attention: false, tangible: false }]
}

export function StandardizedAssessments({ onSave }: StandardizedAssessmentsProps) {
  const [activeTab, setActiveTab] = useState("ablls-r")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // ABLLS-R State
  const [abllsData, setAbllsData] = useState<Record<string, { score: string; notes: string }>>({})

  // Vineland Parent State
  const [vinelandParent, setVinelandParent] = useState<
    Record<string, { standardScore: string; ciLow: string; ciHigh: string; percentile: string }>
  >({})
  const [vinelandParentMaladaptive, setVinelandParentMaladaptive] = useState({
    internalizing: "",
    externalizing: "",
  })

  // Vineland Teacher State
  const [vinelandTeacher, setVinelandTeacher] = useState<
    Record<string, { standardScore: string; ciLow: string; ciHigh: string; percentile: string }>
  >({})
  const [vinelandTeacherMaladaptive, setVinelandTeacherMaladaptive] = useState({
    internalizing: "",
    externalizing: "",
  })

  // SRS-2 State
  const [srs2Data, setSrs2Data] = useState<Record<string, string>>({})

  // MAS State
  const [masData, setMasData] = useState<
    Array<{ behavior: string; sensory: boolean; escape: boolean; attention: boolean; tangible: boolean }>
  >([{ behavior: "", sensory: false, escape: false, attention: false, tangible: false }])

  useEffect(() => {
    try {
      // Check if we're in demo mode
      const demoMode = localStorage.getItem("aria-demo-mode") === "true"
      setIsDemoMode(demoMode)

      const ablls = localStorage.getItem("aria-ablls-r")
      if (ablls) {
        const parsed = JSON.parse(ablls)
        setAbllsData(normalizeAbllsData(parsed))
      }

      const vParent = localStorage.getItem("aria-vineland-parent")
      if (vParent) {
        const parsed = JSON.parse(vParent)
        const normalized = normalizeVinelandData(parsed)
        setVinelandParent(normalized.domains)
        setVinelandParentMaladaptive(normalized.maladaptive)
      }

      const vTeacher = localStorage.getItem("aria-vineland-teacher")
      if (vTeacher) {
        const parsed = JSON.parse(vTeacher)
        const normalized = normalizeVinelandData(parsed)
        setVinelandTeacher(normalized.domains)
        setVinelandTeacherMaladaptive(normalized.maladaptive)
      }

      const srs2 = localStorage.getItem("aria-srs2")
      if (srs2) {
        const parsed = JSON.parse(srs2)
        setSrs2Data(normalizeSrs2Data(parsed))
      }

      const mas = localStorage.getItem("aria-mas")
      if (mas) {
        const parsed = JSON.parse(mas)
        setMasData(normalizeMasData(parsed))
      }

      const generated = localStorage.getItem("aria-standardized-generated")
      if (generated) setGeneratedContent(JSON.parse(generated))
    } catch (e) {
      console.error("Error loading assessment data:", e)
    }
  }, [])

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Save demo mode status
      localStorage.setItem("aria-demo-mode", JSON.stringify(isDemoMode))
      localStorage.setItem("aria-ablls-r", JSON.stringify(abllsData))
      localStorage.setItem(
        "aria-vineland-parent",
        JSON.stringify({ domains: vinelandParent, maladaptive: vinelandParentMaladaptive }),
      )
      localStorage.setItem(
        "aria-vineland-teacher",
        JSON.stringify({ domains: vinelandTeacher, maladaptive: vinelandTeacherMaladaptive }),
      )
      localStorage.setItem("aria-srs2", JSON.stringify(srs2Data))
      localStorage.setItem("aria-mas", JSON.stringify(masData))
      localStorage.setItem("aria-standardized-generated", JSON.stringify(generatedContent))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [
    abllsData,
    vinelandParent,
    vinelandParentMaladaptive,
    vinelandTeacher,
    vinelandTeacherMaladaptive,
    srs2Data,
    masData,
    generatedContent,
    isDemoMode, // Include isDemoMode in dependencies
  ])

  const handleAIGenerate = async (type: string) => {
    setIsGenerating(type)
    try {
      let requestData: any = {}
      let apiType = ""

      switch (type) {
        case "ablls-narrative":
          apiType = "abllsNarrative"
          requestData = { domains: abllsData }
          break
        case "vineland-parent":
          apiType = "vinelandInterpretation"
          requestData = {
            domains: vinelandParent,
            maladaptive: vinelandParentMaladaptive,
            formType: "parent",
          }
          break
        case "vineland-teacher":
          apiType = "vinelandInterpretation"
          requestData = {
            domains: vinelandTeacher,
            maladaptive: vinelandTeacherMaladaptive,
            formType: "teacher",
          }
          break
        case "srs2-summary":
          apiType = "srs2Summary"
          requestData = { subscales: srs2Data }
          break
        default:
          throw new Error("Unknown generation type")
      }

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: apiType,
          data: requestData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate content")
      }

      const data = await response.json()

      // Save generated content
      setGeneratedContent((prev) => ({
        ...prev,
        [type]: data.content,
      }))

      // Auto-expand the section
      setExpandedSections((prev) => ({
        ...prev,
        [type]: true,
      }))

      toast.success("Content generated successfully")
    } catch (error) {
      console.error("AI Generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate. Please try again.")
    } finally {
      setIsGenerating(null)
    }
  }

  const handleCopy = async (type: string) => {
    const content = generatedContent[type]
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopiedSection(type)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedSection(null), 2000)
    }
  }

  const GeneratedContentSection = ({ type, title }: { type: string; title: string }) => {
    const content = generatedContent[type]
    const isExpanded = expandedSections[type]

    if (!content) return null

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={(open) => setExpandedSections((prev) => ({ ...prev, [type]: open }))}
      >
        <Card className="mt-4 border-2 border-purple-200 bg-purple-50/50">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-purple-100/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-sm font-medium text-purple-900">AI Generated: {title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopy(type)
                    }}
                    className="h-8 px-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                  >
                    {copiedSection === type ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-600" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("aria-ablls-r", JSON.stringify(abllsData))
      localStorage.setItem(
        "aria-vineland-parent",
        JSON.stringify({ domains: vinelandParent, maladaptive: vinelandParentMaladaptive }),
      )
      localStorage.setItem(
        "aria-vineland-teacher",
        JSON.stringify({ domains: vinelandTeacher, maladaptive: vinelandTeacherMaladaptive }),
      )
      localStorage.setItem("aria-srs2", JSON.stringify(srs2Data))
      localStorage.setItem("aria-mas", JSON.stringify(masData))
      localStorage.setItem("aria-standardized-generated", JSON.stringify(generatedContent))
      // Save demo mode status on save
      localStorage.setItem("aria-demo-mode", JSON.stringify(isDemoMode))
      toast.success("All assessments saved successfully")
      onSave?.()
    } catch (error) {
      toast.error("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const addMasBehavior = () => {
    setMasData((prev) => [...prev, { behavior: "", sensory: false, escape: false, attention: false, tangible: false }])
  }

  const removeMasBehavior = (index: number) => {
    setMasData((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Standardized Assessments</h2>
            <p className="text-sm text-gray-500">Enter scores from formal assessment tools</p>
          </div>
        </div>
        {/* Add demo mode toggle button */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save All"}
          </Button>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="demo-mode"
              checked={isDemoMode}
              onCheckedChange={(checked) => setIsDemoMode(checked as boolean)}
            />
            <label
              htmlFor="demo-mode"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Demo Mode
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="ablls-r" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">ABLLS-R</span>
          </TabsTrigger>
          <TabsTrigger value="vineland-parent" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Vineland Parent</span>
          </TabsTrigger>
          <TabsTrigger value="vineland-teacher" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Vineland Teacher</span>
          </TabsTrigger>
          <TabsTrigger value="srs2" className="flex items-center gap-2 data-[state=active]:bg-white">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">SRS-2</span>
          </TabsTrigger>
          <TabsTrigger value="mas" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Target className="h-4 w-4" />
            <span className="hidden md:inline">MAS</span>
          </TabsTrigger>
        </TabsList>

        {/* ABLLS-R Tab */}
        <TabsContent value="ablls-r" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ABLLS-R Assessment</CardTitle>
                  <CardDescription>Assessment of Basic Language and Learning Skills - Revised</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("ablls-narrative")}
                  disabled={isGenerating === "ablls-narrative" || isDemoMode}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
                >
                  {isGenerating === "ablls-narrative" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating === "ablls-narrative" ? "Generating..." : "AI Generate Narrative"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Domain</TableHead>
                      <TableHead className="w-[100px]">Score</TableHead>
                      <TableHead className="w-[80px]">Max</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ABLLS_DOMAINS.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={domain.max}
                            value={abllsData[domain.id]?.score || ""}
                            onChange={(e) =>
                              setAbllsData((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], score: e.target.value },
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell className="text-gray-500">/{domain.max}</TableCell>
                        <TableCell>
                          <Textarea
                            value={abllsData[domain.id]?.notes || ""}
                            onChange={(e) =>
                              setAbllsData((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], notes: e.target.value },
                              }))
                            }
                            placeholder="Notes..."
                            className="min-h-[60px] resize-none"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <GeneratedContentSection type="ablls-narrative" title="ABLLS-R Narrative" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vineland Parent Tab */}
        <TabsContent value="vineland-parent" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vineland-3 Parent/Caregiver Form</CardTitle>
                  <CardDescription>Adaptive Behavior Assessment</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("vineland-parent")}
                  disabled={isGenerating === "vineland-parent" || isDemoMode}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
                >
                  {isGenerating === "vineland-parent" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating === "vineland-parent" ? "Generating..." : "AI Generate Interpretation"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Standard Score</TableHead>
                      <TableHead>Confidence Interval</TableHead>
                      <TableHead>Percentile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VINELAND_DOMAINS.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={vinelandParent[domain.id]?.standardScore || ""}
                            onChange={(e) =>
                              setVinelandParent((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], standardScore: e.target.value },
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={vinelandParent[domain.id]?.ciLow || ""}
                              onChange={(e) =>
                                setVinelandParent((prev) => ({
                                  ...prev,
                                  [domain.id]: { ...prev[domain.id], ciLow: e.target.value },
                                }))
                              }
                              className="w-16"
                              disabled={isDemoMode}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              value={vinelandParent[domain.id]?.ciHigh || ""}
                              onChange={(e) =>
                                setVinelandParent((prev) => ({
                                  ...prev,
                                  [domain.id]: { ...prev[domain.id], ciHigh: e.target.value },
                                }))
                              }
                              className="w-16"
                              disabled={isDemoMode}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={vinelandParent[domain.id]?.percentile || ""}
                            onChange={(e) =>
                              setVinelandParent((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], percentile: e.target.value },
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Maladaptive Behavior */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Maladaptive Behavior</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scale</TableHead>
                      <TableHead>V-Scale Score</TableHead>
                      <TableHead>Interpretation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Internalizing</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vinelandParentMaladaptive.internalizing}
                          onChange={(e) =>
                            setVinelandParentMaladaptive((prev) => ({ ...prev, internalizing: e.target.value }))
                          }
                          className="w-20"
                          disabled={isDemoMode}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            vinelandParentMaladaptive.internalizing
                              ? getVScaleInterpretation(Number(vinelandParentMaladaptive.internalizing)) === "Average"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : getVScaleInterpretation(Number(vinelandParentMaladaptive.internalizing)) ===
                                    "Elevated"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              : ""
                          }
                        >
                          {vinelandParentMaladaptive.internalizing
                            ? getVScaleInterpretation(Number(vinelandParentMaladaptive.internalizing))
                            : "Enter score"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Externalizing</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vinelandParentMaladaptive.externalizing}
                          onChange={(e) =>
                            setVinelandParentMaladaptive((prev) => ({ ...prev, externalizing: e.target.value }))
                          }
                          className="w-20"
                          disabled={isDemoMode}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            vinelandParentMaladaptive.externalizing
                              ? getVScaleInterpretation(Number(vinelandParentMaladaptive.externalizing)) === "Average"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : getVScaleInterpretation(Number(vinelandParentMaladaptive.externalizing)) ===
                                    "Elevated"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              : ""
                          }
                        >
                          {vinelandParentMaladaptive.externalizing
                            ? getVScaleInterpretation(Number(vinelandParentMaladaptive.externalizing))
                            : "Enter score"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <GeneratedContentSection type="vineland-parent" title="Vineland-3 Parent Interpretation" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vineland Teacher Tab */}
        <TabsContent value="vineland-teacher" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vineland-3 Teacher Form</CardTitle>
                  <CardDescription>Teacher Rating of Adaptive Behavior</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("vineland-teacher")}
                  disabled={isGenerating === "vineland-teacher" || isDemoMode}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
                >
                  {isGenerating === "vineland-teacher" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating === "vineland-teacher" ? "Generating..." : "AI Generate Interpretation"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain</TableHead>
                      <TableHead>Standard Score</TableHead>
                      <TableHead>Confidence Interval</TableHead>
                      <TableHead>Percentile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VINELAND_DOMAINS.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={vinelandTeacher[domain.id]?.standardScore || ""}
                            onChange={(e) =>
                              setVinelandTeacher((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], standardScore: e.target.value },
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={vinelandTeacher[domain.id]?.ciLow || ""}
                              onChange={(e) =>
                                setVinelandTeacher((prev) => ({
                                  ...prev,
                                  [domain.id]: { ...prev[domain.id], ciLow: e.target.value },
                                }))
                              }
                              className="w-16"
                              disabled={isDemoMode}
                            />
                            <span>-</span>
                            <Input
                              type="number"
                              value={vinelandTeacher[domain.id]?.ciHigh || ""}
                              onChange={(e) =>
                                setVinelandTeacher((prev) => ({
                                  ...prev,
                                  [domain.id]: { ...prev[domain.id], ciHigh: e.target.value },
                                }))
                              }
                              className="w-16"
                              disabled={isDemoMode}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={vinelandTeacher[domain.id]?.percentile || ""}
                            onChange={(e) =>
                              setVinelandTeacher((prev) => ({
                                ...prev,
                                [domain.id]: { ...prev[domain.id], percentile: e.target.value },
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Maladaptive Behavior */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Maladaptive Behavior</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scale</TableHead>
                      <TableHead>V-Scale Score</TableHead>
                      <TableHead>Interpretation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Internalizing</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vinelandTeacherMaladaptive.internalizing}
                          onChange={(e) =>
                            setVinelandTeacherMaladaptive((prev) => ({ ...prev, internalizing: e.target.value }))
                          }
                          className="w-20"
                          disabled={isDemoMode}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            vinelandTeacherMaladaptive.internalizing
                              ? getVScaleInterpretation(Number(vinelandTeacherMaladaptive.internalizing)) === "Average"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : getVScaleInterpretation(Number(vinelandTeacherMaladaptive.internalizing)) ===
                                    "Elevated"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              : ""
                          }
                        >
                          {vinelandTeacherMaladaptive.internalizing
                            ? getVScaleInterpretation(Number(vinelandTeacherMaladaptive.internalizing))
                            : "Enter score"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Externalizing</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={vinelandTeacherMaladaptive.externalizing}
                          onChange={(e) =>
                            setVinelandTeacherMaladaptive((prev) => ({ ...prev, externalizing: e.target.value }))
                          }
                          className="w-20"
                          disabled={isDemoMode}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            vinelandTeacherMaladaptive.externalizing
                              ? getVScaleInterpretation(Number(vinelandTeacherMaladaptive.externalizing)) === "Average"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : getVScaleInterpretation(Number(vinelandTeacherMaladaptive.externalizing)) ===
                                    "Elevated"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              : ""
                          }
                        >
                          {vinelandTeacherMaladaptive.externalizing
                            ? getVScaleInterpretation(Number(vinelandTeacherMaladaptive.externalizing))
                            : "Enter score"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <GeneratedContentSection type="vineland-teacher" title="Vineland-3 Teacher Interpretation" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SRS-2 Tab */}
        <TabsContent value="srs2" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SRS-2 Social Responsiveness Scale</CardTitle>
                  <CardDescription>Assessment of social communication and interaction</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("srs2-summary")}
                  disabled={isGenerating === "srs2-summary" || isDemoMode}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
                >
                  {isGenerating === "srs2-summary" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating === "srs2-summary" ? "Generating..." : "AI Generate Clinical Summary"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscale</TableHead>
                      <TableHead>T-Score</TableHead>
                      <TableHead>Interpretation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SRS2_SUBSCALES.map((subscale) => (
                      <TableRow key={subscale.id}>
                        <TableCell className="font-medium">{subscale.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={srs2Data[subscale.id] || ""}
                            onChange={(e) =>
                              setSrs2Data((prev) => ({
                                ...prev,
                                [subscale.id]: e.target.value,
                              }))
                            }
                            className="w-20"
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              srs2Data[subscale.id]
                                ? getSRS2Interpretation(Number(srs2Data[subscale.id])) === "Within Normal Limits"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : getSRS2Interpretation(Number(srs2Data[subscale.id])) === "Mild Range"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : getSRS2Interpretation(Number(srs2Data[subscale.id])) === "Moderate Range"
                                      ? "bg-orange-50 text-orange-700 border-orange-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                : ""
                            }
                          >
                            {srs2Data[subscale.id]
                              ? getSRS2Interpretation(Number(srs2Data[subscale.id]))
                              : "Enter score"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <GeneratedContentSection type="srs2-summary" title="SRS-2 Clinical Summary" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAS Tab */}
        <TabsContent value="mas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Motivation Assessment Scale (MAS)</CardTitle>
                  <CardDescription>Identify function of behavior for treatment planning</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Target Behavior</TableHead>
                      <TableHead className="text-center">Sensory</TableHead>
                      <TableHead className="text-center">Escape</TableHead>
                      <TableHead className="text-center">Attention</TableHead>
                      <TableHead className="text-center">Tangible</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.behavior}
                            onChange={(e) => {
                              const newData = [...masData]
                              newData[index].behavior = e.target.value
                              setMasData(newData)
                            }}
                            placeholder="Describe behavior..."
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.sensory}
                            onCheckedChange={(checked) => {
                              const newData = [...masData]
                              newData[index].sensory = checked as boolean
                              setMasData(newData)
                            }}
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.escape}
                            onCheckedChange={(checked) => {
                              const newData = [...masData]
                              newData[index].escape = checked as boolean
                              setMasData(newData)
                            }}
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.attention}
                            onCheckedChange={(checked) => {
                              const newData = [...masData]
                              newData[index].attention = checked as boolean
                              setMasData(newData)
                            }}
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.tangible}
                            onCheckedChange={(checked) => {
                              const newData = [...masData]
                              newData[index].tangible = checked as boolean
                              setMasData(newData)
                            }}
                            disabled={isDemoMode}
                          />
                        </TableCell>
                        <TableCell>
                          {masData.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMasBehavior(index)}
                              disabled={isDemoMode}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addMasBehavior}
                className="mt-4 bg-transparent"
                disabled={isDemoMode}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Behavior
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
