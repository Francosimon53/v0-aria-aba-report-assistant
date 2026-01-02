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
import { Sparkles, Save, ClipboardList, Brain, Users, BarChart3, Target, Plus, Trash2 } from "lucide-react"
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

export function StandardizedAssessments({ onSave }: StandardizedAssessmentsProps) {
  const [activeTab, setActiveTab] = useState("ablls-r")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

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

  // Load data from localStorage
  useEffect(() => {
    try {
      const ablls = localStorage.getItem("aria-ablls-r")
      if (ablls) setAbllsData(JSON.parse(ablls))

      const vParent = localStorage.getItem("aria-vineland-parent")
      if (vParent) {
        const data = JSON.parse(vParent)
        setVinelandParent(data.domains || {})
        setVinelandParentMaladaptive(data.maladaptive || { internalizing: "", externalizing: "" })
      }

      const vTeacher = localStorage.getItem("aria-vineland-teacher")
      if (vTeacher) {
        const data = JSON.parse(vTeacher)
        setVinelandTeacher(data.domains || {})
        setVinelandTeacherMaladaptive(data.maladaptive || { internalizing: "", externalizing: "" })
      }

      const srs2 = localStorage.getItem("aria-srs2")
      if (srs2) setSrs2Data(JSON.parse(srs2))

      const mas = localStorage.getItem("aria-mas")
      if (mas) setMasData(JSON.parse(mas))
    } catch (e) {
      console.error("Error loading assessment data:", e)
    }
  }, [])

  // Auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
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
  ])

  const handleAIGenerate = async (type: string) => {
    setIsGenerating(type)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: `assessment-${type}`,
          data: {
            ablls: abllsData,
            vinelandParent,
            vinelandTeacher,
            srs2: srs2Data,
            mas: masData,
          },
        }),
      })

      if (response.ok) {
        toast.success(`${type} narrative generated successfully`)
      }
    } catch (error) {
      toast.error("Failed to generate. Please try again.")
    } finally {
      setIsGenerating(null)
    }
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
        <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save All"}
        </Button>
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
                  disabled={isGenerating === "ablls-narrative"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
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
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                  onClick={() => handleAIGenerate("vineland-interpretation")}
                  disabled={isGenerating === "vineland-interpretation"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate Interpretation
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vineland Teacher Tab - Similar structure */}
        <TabsContent value="vineland-teacher" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vineland-3 Teacher Form</CardTitle>
                  <CardDescription>Teacher-reported Adaptive Behavior Assessment</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("vineland-teacher-interpretation")}
                  disabled={isGenerating === "vineland-teacher-interpretation"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate Interpretation
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* SRS-2 Tab */}
        <TabsContent value="srs2" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SRS-2 (Social Responsiveness Scale)</CardTitle>
                  <CardDescription>Measures social deficits in autism spectrum conditions</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("srs2-summary")}
                  disabled={isGenerating === "srs2-summary"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate Clinical Summary
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
                    <TableRow key={subscale.id} className={subscale.id === "total" ? "bg-gray-50 font-semibold" : ""}>
                      <TableCell className="font-medium">{subscale.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={srs2Data[subscale.id] || ""}
                          onChange={(e) => setSrs2Data((prev) => ({ ...prev, [subscale.id]: e.target.value }))}
                          className="w-20"
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
                          {srs2Data[subscale.id] ? getSRS2Interpretation(Number(srs2Data[subscale.id])) : "Enter score"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAS Tab */}
        <TabsContent value="mas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>MAS (Motivation Assessment Scale)</CardTitle>
                  <CardDescription>Identify maintaining functions of target behaviors</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIGenerate("mas-analysis")}
                  disabled={isGenerating === "mas-analysis"}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Analyze Functions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Target Behavior</TableHead>
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
                          onChange={(e) =>
                            setMasData((prev) =>
                              prev.map((m, i) => (i === index ? { ...m, behavior: e.target.value } : m)),
                            )
                          }
                          placeholder="Enter target behavior..."
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.sensory}
                          onCheckedChange={(checked) =>
                            setMasData((prev) =>
                              prev.map((m, i) => (i === index ? { ...m, sensory: checked as boolean } : m)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.escape}
                          onCheckedChange={(checked) =>
                            setMasData((prev) =>
                              prev.map((m, i) => (i === index ? { ...m, escape: checked as boolean } : m)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.attention}
                          onCheckedChange={(checked) =>
                            setMasData((prev) =>
                              prev.map((m, i) => (i === index ? { ...m, attention: checked as boolean } : m)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.tangible}
                          onCheckedChange={(checked) =>
                            setMasData((prev) =>
                              prev.map((m, i) => (i === index ? { ...m, tangible: checked as boolean } : m)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {masData.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeMasBehavior(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" size="sm" onClick={addMasBehavior} className="mt-4 bg-transparent">
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
