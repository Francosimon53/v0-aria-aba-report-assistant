"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClipboardListIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlusIcon,
  XIcon,
  SaveIcon,
  AlertTriangleIcon,
  SearchIcon,
  CheckIcon,
  Sparkles, // Added for AI generation
  Loader2, // Added for AI generation
  Loader2Icon, // Added for AI generation
  SparklesIcon, // Added for AI generation
} from "@/components/icons"
import type { AssessmentData, DomainScore, BehaviorReduction } from "@/lib/types"
import { assessmentTypes } from "@/lib/data/assessment-types"
import { behaviorLibrary, behaviorCategories } from "@/lib/data/behavior-library"
import { useToast } from "@/hooks/use-toast"
import { ImportDialog } from "./import-dialog"
import { parseAssessmentDataFile } from "@/lib/import-parsers"
import { AITextarea } from "@/components/ui/ai-textarea"

interface AssessmentFormProps {
  clientId?: string
  assessmentData: AssessmentData | null
  onSave: (data: AssessmentData) => void
  onNext?: () => void
  onBack?: () => void
}

export function AssessmentForm({ clientId, assessmentData, onSave, onNext, onBack }: AssessmentFormProps) {
  const { toast } = useToast()

  // State for tracking the active tab
  const [activeTab, setActiveTab] = useState("assessment")

  const [formData, setFormData] = useState<Partial<AssessmentData>>(
    assessmentData || {
      clientId: clientId || "", // Ensure clientId is not undefined
      assessmentType: "vbmapp",
      assessmentDate: new Date().toISOString().split("T")[0],
      domains: [],
      strengths: [""],
      deficits: [""],
      barriers: [""],
      recommendations: [""],
      hoursRecommended: 25,
      hoursJustification: "",
    },
  )

  const [customDomains, setCustomDomains] = useState<string[]>([])

  const [behaviorReductions, setBehaviorReductions] = useState<BehaviorReduction[]>([])

  const [showBehaviorLibrary, setShowBehaviorLibrary] = useState(false)
  const [behaviorSearchQuery, setSearchBehaviorQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const [showCustomBehaviorForm, setShowCustomBehaviorForm] = useState(false)
  const [customBehaviorData, setCustomBehaviorData] = useState({
    name: "",
    category: "aggression" as const,
    description: "",
    operationalDefinition: "",
    function: "unknown" as const,
    severity: "moderate" as const,
  })

  // State for tracking which domain is generating notes
  const [isGeneratingNotes, setIsGeneratingNotes] = useState<string | null>(null)

  const [isAutoFilling, setIsAutoFilling] = useState(false)

  const [isGeneratingJustification, setIsGeneratingJustification] = useState(false)

  const [isSuggestingBehaviors, setIsSuggestingBehaviors] = useState(false)
  const [suggestedBehaviors, setSuggestedBehaviors] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredBehaviors = behaviorLibrary.filter((behavior) => {
    const matchesSearch =
      behaviorSearchQuery === "" ||
      behavior.name.toLowerCase().includes(behaviorSearchQuery.toLowerCase()) ||
      behavior.description.toLowerCase().includes(behaviorSearchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || behavior.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addBehaviorFromTemplate = (templateId: string) => {
    const template = behaviorLibrary.find((b) => b.id === templateId)
    if (!template) return

    const newBehavior: BehaviorReduction = {
      id: `behavior-${Date.now()}`,
      behaviorName: template.name,
      operationalDefinition: template.operationalDefinition,
      function: template.commonFunctions[0] || "unknown",
      severity: template.safetyRisk === "high" ? "severe" : template.safetyRisk === "medium" ? "moderate" : "mild",
      frequency: "",
      duration: "",
      intensity: "",
      antecedents: template.commonAntecedents.length > 0 ? template.commonAntecedents : [""],
      consequences: [""],
      replacementBehavior: template.replacementBehaviors[0] || "",
      interventionStrategies: template.typicalInterventions.length > 0 ? template.typicalInterventions : [""],
      dataCollectionMethod: "",
      measurementType: "frequency",
      baselineData: "",
      targetCriteria: "",
      safetyConsiderations: template.safetyRisk === "high" ? "High safety risk - requires safety plan" : "",
      notes: template.description,
    }
    setBehaviorReductions((prev) => [...prev, newBehavior])
    setShowBehaviorLibrary(false)
    toast({ title: "Behavior Added", description: `${template.name} has been added to the assessment` })
  }

  const selectedAssessment = assessmentTypes.find((a) => a.id === formData.assessmentType)

  const handleAddItem = (field: "strengths" | "deficits" | "barriers" | "recommendations") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }))
  }

  const handleRemoveItem = (field: "strengths" | "deficits" | "barriers" | "recommendations", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }))
  }

  const handleItemChange = (
    field: "strengths" | "deficits" | "barriers" | "recommendations",
    index: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => (i === index ? value : item)),
    }))
  }

  const handleDomainChange = (domain: string, score: number, notes: string) => {
    setFormData((prev) => {
      const domains = prev.domains || []
      const existingIndex = domains.findIndex((d) => d.domain === domain)
      const newDomain: DomainScore = {
        domain,
        score,
        maxScore: 100,
        notes,
      }

      if (existingIndex >= 0) {
        domains[existingIndex] = newDomain
      } else {
        domains.push(newDomain)
      }

      return { ...prev, domains }
    })
  }

  const handleGenerateDomainNotes = async (domainName: string, score: number) => {
    setIsGeneratingNotes(domainName)

    try {
      const selectedAssessmentType = assessmentTypes.find((a) => a.id === formData.assessmentType)

      console.log("[v0] Generating notes for:", domainName, "Score:", score)

      const response = await fetch("/api/generate-domain-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentType: selectedAssessmentType?.name || formData.assessmentType,
          domainName: domainName,
          score: score,
          maxScore: 100,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API Response:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.notes) {
        // Update the notes for this domain
        handleDomainChange(domainName, score, data.notes)

        toast({
          title: "Notes Generated",
          description: `Clinical notes for ${domainName} have been generated.`,
        })
      } else {
        throw new Error("No notes returned from API")
      }
    } catch (error) {
      console.error("[v0] Error generating notes:", error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Could not generate notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingNotes(null)
    }
  }

  const handleAutoFillAll = async () => {
    setIsAutoFilling(true)

    try {
      const response = await fetch("/api/autofill-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentType: selectedAssessment.abbreviation,
          domains: selectedAssessment.domains,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to auto-fill assessment")
      }

      const data = await response.json()

      if (data.results) {
        // Update all domain scores and notes
        data.results.forEach((result: any) => {
          handleDomainChange(result.domain, result.score, result.notes)
        })

        // Also fill strengths, deficits, and barriers if provided
        setFormData((prev) => ({
          ...prev,
          strengths: data.strengths || prev.strengths,
          deficits: data.deficits || prev.deficits,
          barriers: data.barriers || prev.barriers,
        }))

        toast({
          title: "Assessment Auto-filled",
          description: `AI generated data for ${data.results.length} domains with clinical observations.`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Auto-fill failed",
        description: "Failed to generate assessment data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAutoFilling(false)
    }
  }

  const handleAddCustomDomain = () => {
    const domainName = `Custom Domain ${customDomains.length + 1}`
    setCustomDomains((prev) => [...prev, domainName])
  }

  const handleRemoveCustomDomain = (domainName: string) => {
    setCustomDomains((prev) => prev.filter((d) => d !== domainName))
    // Also remove from form data
    setFormData((prev) => ({
      ...prev,
      domains: (prev.domains || []).filter((d) => d.domain !== domainName),
    }))
  }

  const handleUpdateCustomDomainName = (oldName: string, newName: string) => {
    setCustomDomains((prev) => prev.map((d) => (d === oldName ? newName : d)))
    // Update in form data as well
    setFormData((prev) => ({
      ...prev,
      domains: (prev.domains || []).map((d) => (d.domain === oldName ? { ...d, domain: newName } : d)),
    }))
  }

  const addNewBehavior = () => {
    const newBehavior: BehaviorReduction = {
      id: `behavior-${Date.now()}`,
      behaviorName: "",
      operationalDefinition: "",
      function: "unknown",
      severity: "moderate",
      frequency: "",
      duration: "",
      intensity: "",
      antecedents: [""],
      consequences: [""],
      replacementBehavior: "",
      interventionStrategies: [""],
      dataCollectionMethod: "",
      measurementType: "frequency",
      baselineData: "",
      targetCriteria: "",
      safetyConsiderations: "",
      notes: "",
    }
    setBehaviorReductions((prev) => [...prev, newBehavior])
  }

  const removeBehavior = (id: string) => {
    setBehaviorReductions((prev) => prev.filter((b) => b.id !== id))
  }

  const updateBehavior = (id: string, updates: Partial<BehaviorReduction>) => {
    setBehaviorReductions((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
  }

  const addArrayItem = (behaviorId: string, field: "antecedents" | "consequences" | "interventionStrategies") => {
    setBehaviorReductions((prev) => prev.map((b) => (b.id === behaviorId ? { ...b, [field]: [...b[field], ""] } : b)))
  }

  const removeArrayItem = (
    behaviorId: string,
    field: "antecedents" | "consequences" | "interventionStrategies",
    index: number,
  ) => {
    setBehaviorReductions((prev) =>
      prev.map((b) => (b.id === behaviorId ? { ...b, [field]: b[field].filter((_, i) => i !== index) } : b)),
    )
  }

  const updateArrayItem = (
    behaviorId: string,
    field: "antecedents" | "consequences" | "interventionStrategies",
    index: number,
    value: string,
  ) => {
    setBehaviorReductions((prev) =>
      prev.map((b) =>
        b.id === behaviorId ? { ...b, [field]: b[field].map((item, i) => (i === index ? value : item)) } : b,
      ),
    )
  }

  const handleSave = () => {
    onSave(formData as AssessmentData)
    toast({ title: "Success", description: "Assessment data saved" })
  }

  const handleSaveAndNext = () => {
    handleSave()
    onNext?.() // Use optional chaining for safety
  }

  const handleImportAssessmentData = (importedData: Partial<AssessmentData>) => {
    setFormData((prev) => ({
      ...prev,
      ...importedData,
    }))
    toast({
      title: "Success",
      description: "Assessment data imported successfully. Please review domain scores and adjust as needed.",
    })
  }

  const addCustomBehavior = () => {
    const newBehavior: BehaviorReduction = {
      id: `behavior-${Date.now()}`,
      behaviorName: customBehaviorData.name,
      operationalDefinition: customBehaviorData.operationalDefinition,
      function: customBehaviorData.function,
      severity: customBehaviorData.severity,
      frequency: "",
      duration: "",
      intensity: "",
      antecedents: [""],
      consequences: [""],
      replacementBehavior: "",
      interventionStrategies: [""],
      dataCollectionMethod: "",
      measurementType: "frequency",
      baselineData: "",
      targetCriteria: "",
      safetyConsiderations: "",
      notes: customBehaviorData.description,
    }
    setBehaviorReductions((prev) => [...prev, newBehavior])
    setShowCustomBehaviorForm(false)
    setCustomBehaviorData({
      name: "",
      category: "aggression",
      description: "",
      operationalDefinition: "",
      function: "unknown",
      severity: "moderate",
    })
    toast({
      title: "Custom Behavior Added",
      description: `${customBehaviorData.name} has been added to the assessment`,
    })
  }

  // Function to generate hours justification using AI
  const handleGenerateHoursJustification = async () => {
    setIsGeneratingJustification(true)

    try {
      const response = await fetch("/api/generate-hours-justification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentType: formData.assessmentType,
          // Pass relevant data like domains, strengths, deficits, etc.
          domains: formData.domains,
          strengths: formData.strengths,
          deficits: formData.deficits,
          barriers: formData.barriers,
          recommendations: formData.recommendations,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.justification) {
        setFormData((prev) => ({ ...prev, hoursJustification: data.justification }))
        toast({
          title: "Justification Generated",
          description: "Clinical justification for recommended hours has been generated.",
        })
      } else {
        throw new Error("No justification returned from API")
      }
    } catch (error) {
      console.error("Error generating justification:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate justification. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingJustification(false)
    }
  }

  const handleSuggestBehaviors = async () => {
    setIsSuggestingBehaviors(true)

    try {
      // Get assessment data from formData
      const deficits = formData.deficits || []
      const domainScores = formData.domains.map((d) => ({ name: d.domain, score: d.score })) // Corrected to use domain property

      const response = await fetch("/api/suggest-behaviors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deficits,
          domainScores,
          availableBehaviors: behaviorLibrary.map((b) => b.name),
        }),
      })

      const data = await response.json()

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestedBehaviors(data.suggestions)
        setShowSuggestions(true)
        toast({
          title: "Behaviors Suggested",
          description: `AI identified ${data.suggestions.length} likely problem behaviors based on assessment.`,
        })
      } else {
        toast({
          title: "No Suggestions",
          description: "Could not generate behavior suggestions. Try adding assessment data first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Suggestion failed",
        description: "Could not analyze assessment data.",
        variant: "destructive",
      })
    } finally {
      setIsSuggestingBehaviors(false)
    }
  }

  const addBehaviorFromSuggestion = (suggestion: any) => {
    const template = behaviorLibrary.find((b) => b.name === suggestion.name)
    if (template) {
      const newBehavior: BehaviorReduction = {
        id: `behavior-${Date.now()}`,
        behaviorName: template.name,
        operationalDefinition: template.operationalDefinition,
        function: suggestion.function || template.commonFunctions[0],
        antecedents: template.commonAntecedents.length > 0 ? template.commonAntecedents : [""],
        consequences: [""],
        replacementBehavior: template.replacementBehaviors[0] || "",
        interventionStrategies: template.typicalInterventions.length > 0 ? template.typicalInterventions : [""],
        dataCollectionMethod: "",
        measurementType: "frequency",
        baselineData: "",
        targetCriteria: "",
        safetyConsiderations: template.safetyRisk === "high" ? "High safety risk - requires safety plan" : "",
        notes: `${template.description}\n\nAI Suggestion: ${suggestion.reason}`,
      }
      setBehaviorReductions((prev) => [...prev, newBehavior])
      toast({
        title: "Behavior Added",
        description: `${template.name} has been added from AI suggestions`,
      })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ClipboardListIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Assessment Data</h2>
            <p className="text-sm text-muted-foreground">Enter assessment results and clinical findings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ImportDialog
            title="Import Assessment Data"
            description="Import VB-MAPP, ABLLS-R, or other assessment scores from previous reports or test results. Supported formats: JSON, CSV"
            acceptedFormats={[".json", ".csv"]}
            onImport={handleImportAssessmentData}
            parseFunction={parseAssessmentDataFile}
          />
          <Button
            onClick={handleAutoFillAll}
            disabled={isAutoFilling}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isAutoFilling ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Auto-filling...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Auto-fill All
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onBack} disabled={!onBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleSaveAndNext} disabled={!onNext}>
            Continue
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Use activeTab state and Tabs component */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="assessment">Assessment & Domains</TabsTrigger>
                  <TabsTrigger value="behaviors" className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-4 w-4" />
                    Behavior Reduction ({behaviorReductions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assessment" className="space-y-6 mt-6">
                  {/* Assessment Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Instrument</CardTitle>
                      <CardDescription>Select the primary assessment tool used</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Assessment Type</Label>
                        <Select
                          value={formData.assessmentType}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, assessmentType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assessment" />
                          </SelectTrigger>
                          <SelectContent>
                            {assessmentTypes.map((assessment) => (
                              <SelectItem key={assessment.id} value={assessment.id}>
                                {assessment.abbreviation} - {assessment.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedAssessment && (
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                          <p className="text-sm">{selectedAssessment.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary">Age Range: {selectedAssessment.ageRange}</Badge>
                            <Badge variant="secondary">Scoring: {selectedAssessment.scoringType}</Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Domain Scores */}
                  {selectedAssessment && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Domain Scores</CardTitle>
                        <CardDescription>Enter scores for each assessment domain</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {selectedAssessment.domains.slice(0, 8).map((domain) => {
                          const domainData = formData.domains?.find((d) => d.domain === domain)
                          return (
                            <div key={domain} className="space-y-3 p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Label className="font-medium">{domain}</Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleGenerateDomainNotes(domain, domainData?.score || 0)}
                                    disabled={isGeneratingNotes === domain}
                                    className="h-6 px-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                                    title="Generate clinical notes with AI"
                                  >
                                    {isGeneratingNotes === domain ? (
                                      <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        <span className="text-xs">Generating...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        <span className="text-xs">AI Generate</span>
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <span className="text-sm text-muted-foreground">Score: {domainData?.score || 0}%</span>
                              </div>
                              <Slider
                                value={[domainData?.score || 0]}
                                onValueChange={([value]) => handleDomainChange(domain, value, domainData?.notes || "")}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <Textarea
                                placeholder={`Notes for ${domain}...`}
                                value={domainData?.notes || ""}
                                onChange={(e) => handleDomainChange(domain, domainData?.score || 0, e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
                            </div>
                          )
                        })}

                        {customDomains.map((domain) => {
                          const domainData = formData.domains?.find((d) => d.domain === domain)
                          return (
                            <div key={domain} className="space-y-3 p-4 border-2 border-dashed rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={domain}
                                  onChange={(e) => handleUpdateCustomDomainName(domain, e.target.value)}
                                  placeholder="Domain name..."
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveCustomDomain(domain)}
                                  className="shrink-0"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-sm text-muted-foreground">Score</Label>
                                <span className="text-sm text-muted-foreground">
                                  {domainData?.score || 0}/{domainData?.maxScore || 100}
                                </span>
                              </div>
                              <Slider
                                value={[domainData?.score || 0]}
                                onValueChange={([value]) => handleDomainChange(domain, value, domainData?.notes || "")}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <AITextarea
                                placeholder={`Notes for ${domain}...`}
                                value={domainData?.notes || ""}
                                onChange={(e) => handleDomainChange(domain, domainData?.score || 0, e.target.value)}
                                className="text-sm"
                                rows={2}
                                fieldName={`${domain} Notes`}
                              />
                            </div>
                          )
                        })}

                        <Button variant="outline" className="w-full bg-transparent" onClick={handleAddCustomDomain}>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Custom Domain
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths & Deficits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Strengths</CardTitle>
                        <CardDescription>Areas where the client demonstrates competence</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(formData.strengths || []).map((strength, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={strength}
                              onChange={(e) => handleItemChange("strengths", index, e.target.value)}
                              placeholder="Enter strength..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem("strengths", index)}>
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddItem("strengths")}>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Strength
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-destructive">Deficits</CardTitle>
                        <CardDescription>Areas requiring intervention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(formData.deficits || []).map((deficit, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={deficit}
                              onChange={(e) => handleItemChange("deficits", index, e.target.value)}
                              placeholder="Enter deficit..."
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem("deficits", index)}>
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddItem("deficits")}>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Deficit
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Barriers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Barriers</CardTitle>
                      <CardDescription>Factors that may impede skill acquisition</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(formData.barriers || []).map((barrier, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={barrier}
                            onChange={(e) => handleItemChange("barriers", index, e.target.value)}
                            placeholder="Enter barrier..."
                          />
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem("barriers", index)}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => handleAddItem("barriers")}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Barrier
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Service Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Recommendations</CardTitle>
                      <CardDescription>Recommended hours and justification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Recommended Hours per Week</Label>
                          <span className="text-2xl font-bold text-primary">{formData.hoursRecommended} hrs/week</span>
                        </div>
                        <Slider
                          value={[formData.hoursRecommended || 25]}
                          onValueChange={([value]) => setFormData((prev) => ({ ...prev, hoursRecommended: value }))}
                          min={5}
                          max={40}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5 hrs (Targeted)</span>
                          <span>20 hrs (Focused)</span>
                          <span>40 hrs (Comprehensive)</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Hours Justification</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateHoursJustification}
                            disabled={isGeneratingJustification}
                            className="text-teal-600 hover:text-teal-700"
                          >
                            {isGeneratingJustification ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                <span className="text-xs">AI Generate</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={formData.hoursJustification}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              hoursJustification: e.target.value,
                            }))
                          }
                          placeholder="Provide clinical justification for the recommended service hours..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="behaviors" className="space-y-6 mt-6">
                  {showBehaviorLibrary ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Behavior Library</CardTitle>
                            <CardDescription>Select a behavior template or create a custom behavior</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={showCustomBehaviorForm ? "default" : "outline"}
                              onClick={() => setShowCustomBehaviorForm(!showCustomBehaviorForm)}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              {showCustomBehaviorForm ? "View Templates" : "Create Custom"}
                            </Button>
                            <Button variant="outline" onClick={() => setShowBehaviorLibrary(false)}>
                              <XIcon className="h-4 w-4 mr-2" />
                              Close Library
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {showCustomBehaviorForm ? (
                          <div className="space-y-4 p-6 border rounded-lg bg-blue-50/50">
                            <div className="space-y-2">
                              <Label htmlFor="custom-behavior-name">Behavior Name *</Label>
                              <Input
                                id="custom-behavior-name"
                                placeholder="e.g., Throwing iPad"
                                value={customBehaviorData.name}
                                onChange={(e) => setCustomBehaviorData({ ...customBehaviorData, name: e.target.value })}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="custom-behavior-category">Category *</Label>
                                <select
                                  id="custom-behavior-category"
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  value={customBehaviorData.category}
                                  onChange={(e) =>
                                    setCustomBehaviorData({ ...customBehaviorData, category: e.target.value as any })
                                  }
                                >
                                  <option value="aggression">Aggression</option>
                                  <option value="self-injury">Self-Injury</option>
                                  <option value="property-destruction">Property Destruction</option>
                                  <option value="elopement">Elopement</option>
                                  <option value="non-compliance">Non-Compliance</option>
                                  <option value="tantrum">Tantrum</option>
                                  <option value="stereotypy">Stereotypy</option>
                                  <option value="vocal-disruption">Vocal Disruption</option>
                                  <option value="social-avoidance">Social Avoidance</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="custom-behavior-function">Function *</Label>
                                <select
                                  id="custom-behavior-function"
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                  value={customBehaviorData.function}
                                  onChange={(e) =>
                                    setCustomBehaviorData({ ...customBehaviorData, function: e.target.value as any })
                                  }
                                >
                                  <option value="unknown">Unknown</option>
                                  <option value="attention">Attention</option>
                                  <option value="escape">Escape</option>
                                  <option value="tangible">Tangible</option>
                                  <option value="sensory">Sensory</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="custom-behavior-severity">Severity Level *</Label>
                              <select
                                id="custom-behavior-severity"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={customBehaviorData.severity}
                                onChange={(e) =>
                                  setCustomBehaviorData({ ...customBehaviorData, severity: e.target.value as any })
                                }
                              >
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="custom-behavior-description">Description</Label>
                              <AITextarea
                                id="custom-behavior-description"
                                placeholder="Brief description of the behavior..."
                                value={customBehaviorData.description}
                                onChange={(e) =>
                                  setCustomBehaviorData({ ...customBehaviorData, description: e.target.value })
                                }
                                rows={2}
                                fieldName="Behavior Description"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="custom-behavior-definition">Operational Definition *</Label>
                              <AITextarea
                                id="custom-behavior-definition"
                                placeholder="Clear, measurable definition of the behavior (e.g., 'Any instance of...')"
                                value={customBehaviorData.operationalDefinition}
                                onChange={(e) =>
                                  setCustomBehaviorData({
                                    ...customBehaviorData,
                                    operationalDefinition: e.target.value,
                                  })
                                }
                                rows={3}
                                fieldName="Operational Definition"
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={addCustomBehavior}
                                disabled={!customBehaviorData.name || !customBehaviorData.operationalDefinition}
                                className="flex-1"
                              >
                                <CheckIcon className="h-4 w-4 mr-2" />
                                Add Custom Behavior
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowCustomBehaviorForm(false)
                                  setCustomBehaviorData({
                                    name: "",
                                    category: "aggression",
                                    description: "",
                                    operationalDefinition: "",
                                    function: "unknown",
                                    severity: "moderate",
                                  })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Search */}
                            <div className="relative">
                              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search behaviors..."
                                value={behaviorSearchQuery}
                                onChange={(e) => setSearchBehaviorQuery(e.target.value)}
                                className="pl-10"
                              />
                            </div>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-2">
                              {behaviorCategories.map((cat) => (
                                <Badge
                                  key={cat.id}
                                  variant={selectedCategory === cat.id ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => setSelectedCategory(cat.id)}
                                >
                                  {cat.name} ({cat.count})
                                </Badge>
                              ))}
                            </div>

                            {/* Behavior List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                              {filteredBehaviors.map((behavior) => (
                                <Card
                                  key={behavior.id}
                                  className="cursor-pointer hover:border-primary transition-colors"
                                  onClick={() => addBehaviorFromTemplate(behavior.id)}
                                >
                                  <CardHeader className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                      <CardTitle className="text-base">{behavior.name}</CardTitle>
                                      <Badge
                                        variant={
                                          behavior.safetyRisk === "high"
                                            ? "destructive"
                                            : behavior.safetyRisk === "medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                        className="shrink-0"
                                      >
                                        {behavior.safetyRisk} risk
                                      </Badge>
                                    </div>
                                    <CardDescription className="text-xs mt-1">{behavior.description}</CardDescription>
                                  </CardHeader>
                                </Card>
                              ))}
                            </div>

                            {filteredBehaviors.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                No behaviors found matching your search
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button onClick={() => setShowBehaviorLibrary(true)} className="bg-teal-600 hover:bg-teal-700">
                          <SearchIcon className="h-4 w-4 mr-2" />
                          Browse Behavior Library ({behaviorLibrary.length} templates)
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleSuggestBehaviors}
                          disabled={isSuggestingBehaviors || !formData.deficits || formData.deficits.length === 0}
                          className="border-teal-600 text-teal-600 hover:bg-teal-50 bg-transparent"
                        >
                          {isSuggestingBehaviors ? (
                            <>
                              <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-4 w-4 mr-2" />
                              AI Suggest Behaviors
                            </>
                          )}
                        </Button>

                        <Button onClick={addNewBehavior} variant="outline">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Custom Behavior
                        </Button>
                      </div>

                      {showSuggestions && suggestedBehaviors.length > 0 && (
                        <Card className="mb-4 border-teal-200 bg-teal-50">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-teal-600" />
                                <CardTitle className="text-lg text-teal-800">AI Suggested Behaviors</CardTitle>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(false)}>
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-teal-700">Based on identified deficits and assessment scores</p>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {suggestedBehaviors.map((behavior, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-100"
                                >
                                  <div className="flex-1 mr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{behavior.name}</p>
                                      <Badge
                                        variant={
                                          behavior.risk === "high"
                                            ? "destructive"
                                            : behavior.risk === "medium"
                                              ? "default"
                                              : "secondary"
                                        }
                                      >
                                        {behavior.risk} risk
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{behavior.reason}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addBehaviorFromSuggestion(behavior)}
                                  >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Existing Behaviors List */}
                      {behaviorReductions.length === 0 ? (
                        <Card>
                          <CardContent className="py-12 text-center">
                            <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Behaviors Added</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Add problem behaviors to document and plan interventions
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {behaviorReductions.map((behavior, index) => (
                            <Card key={behavior.id} className="border-2">
                              <CardHeader className="bg-muted/30">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <AlertTriangleIcon className="h-5 w-5 text-destructive" />
                                      Target Behavior #{index + 1}
                                    </CardTitle>
                                    <CardDescription>Define the problem behavior and intervention plan</CardDescription>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeBehavior(behavior.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6 space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Behavior Name *</Label>
                                    <Input
                                      value={behavior.behaviorName}
                                      onChange={(e) => updateBehavior(behavior.id, { behaviorName: e.target.value })}
                                      placeholder="e.g., Physical Aggression, Self-Injury..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Severity</Label>
                                    <Select
                                      value={behavior.severity}
                                      onValueChange={(value) =>
                                        updateBehavior(behavior.id, {
                                          severity: value as BehaviorReduction["severity"],
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="mild">Mild</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="severe">Severe</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Operational Definition */}
                                <div className="space-y-2">
                                  <Label>Operational Definition *</Label>
                                  <AITextarea
                                    value={behavior.operationalDefinition}
                                    onChange={(e) =>
                                      updateBehavior(behavior.id, { operationalDefinition: e.target.value })
                                    }
                                    placeholder="Clearly define the behavior in observable and measurable terms..."
                                    rows={3}
                                    fieldName="Operational Definition"
                                  />
                                </div>

                                {/* Function & Measurement */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Behavior Function</Label>
                                    <Select
                                      value={behavior.function}
                                      onValueChange={(value) =>
                                        updateBehavior(behavior.id, {
                                          function: value as BehaviorReduction["function"],
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="attention">Attention</SelectItem>
                                        <SelectItem value="escape">Escape/Avoidance</SelectItem>
                                        <SelectItem value="tangible">Tangible</SelectItem>
                                        <SelectItem value="sensory">Sensory/Automatic</SelectItem>
                                        <SelectItem value="multiple">Multiple Functions</SelectItem>
                                        <SelectItem value="unknown">Unknown/Undetermined</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Measurement Type</Label>
                                    <Select
                                      value={behavior.measurementType}
                                      onValueChange={(value) =>
                                        updateBehavior(behavior.id, {
                                          measurementType: value as BehaviorReduction["measurementType"],
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="frequency">Frequency</SelectItem>
                                        <SelectItem value="duration">Duration</SelectItem>
                                        <SelectItem value="interval">Interval</SelectItem>
                                        <SelectItem value="latency">Latency</SelectItem>
                                        <SelectItem value="intensity">Intensity</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Data Collection Method</Label>
                                    <Input
                                      value={behavior.dataCollectionMethod}
                                      onChange={(e) =>
                                        updateBehavior(behavior.id, { dataCollectionMethod: e.target.value })
                                      }
                                      placeholder="e.g., ABC data, scatterplot..."
                                    />
                                  </div>
                                </div>

                                {/* Current Data */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Input
                                      value={behavior.frequency}
                                      onChange={(e) => updateBehavior(behavior.id, { frequency: e.target.value })}
                                      placeholder="e.g., 10x/day"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <Input
                                      value={behavior.duration}
                                      onChange={(e) => updateBehavior(behavior.id, { duration: e.target.value })}
                                      placeholder="e.g., 2-5 minutes"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Intensity</Label>
                                    <Input
                                      value={behavior.intensity}
                                      onChange={(e) => updateBehavior(behavior.id, { intensity: e.target.value })}
                                      placeholder="e.g., Low, Medium, High"
                                    />
                                  </div>
                                </div>

                                {/* Antecedents */}
                                <div className="space-y-3">
                                  <Label>Common Antecedents</Label>
                                  {behavior.antecedents.map((antecedent, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Input
                                        value={antecedent}
                                        onChange={(e) =>
                                          updateArrayItem(behavior.id, "antecedents", idx, e.target.value)
                                        }
                                        placeholder="What happens before the behavior..."
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeArrayItem(behavior.id, "antecedents", idx)}
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem(behavior.id, "antecedents")}
                                  >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Antecedent
                                  </Button>
                                </div>

                                {/* Consequences */}
                                <div className="space-y-3">
                                  <Label>Current Consequences</Label>
                                  {behavior.consequences.map((consequence, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Input
                                        value={consequence}
                                        onChange={(e) =>
                                          updateArrayItem(behavior.id, "consequences", idx, e.target.value)
                                        }
                                        placeholder="What happens after the behavior..."
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeArrayItem(behavior.id, "consequences", idx)}
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem(behavior.id, "consequences")}
                                  >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Consequence
                                  </Button>
                                </div>

                                {/* Replacement Behavior */}
                                <div className="space-y-2">
                                  <Label>Replacement/Alternative Behavior *</Label>
                                  <Textarea
                                    value={behavior.replacementBehavior}
                                    onChange={(e) =>
                                      updateBehavior(behavior.id, { replacementBehavior: e.target.value })
                                    }
                                    placeholder="What appropriate behavior should replace this one? (Same function)..."
                                    rows={3}
                                  />
                                </div>

                                {/* Intervention Strategies */}
                                <div className="space-y-3">
                                  <Label>Intervention Strategies</Label>
                                  {behavior.interventionStrategies.map((strategy, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Input
                                        value={strategy}
                                        onChange={(e) =>
                                          updateArrayItem(behavior.id, "interventionStrategies", idx, e.target.value)
                                        }
                                        placeholder="Specific intervention or strategy..."
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeArrayItem(behavior.id, "interventionStrategies", idx)}
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addArrayItem(behavior.id, "interventionStrategies")}
                                  >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Strategy
                                  </Button>
                                </div>

                                {/* Baseline & Target */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Baseline Data</Label>
                                    <Textarea
                                      value={behavior.baselineData}
                                      onChange={(e) => updateBehavior(behavior.id, { baselineData: e.target.value })}
                                      placeholder="Current baseline measurements..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Target Criteria</Label>
                                    <Textarea
                                      value={behavior.targetCriteria}
                                      onChange={(e) => updateBehavior(behavior.id, { targetCriteria: e.target.value })}
                                      placeholder="Reduction goal/criteria for success..."
                                      rows={3}
                                    />
                                  </div>
                                </div>

                                {/* Safety & Notes */}
                                <div className="space-y-2">
                                  <Label>Safety Considerations</Label>
                                  <Textarea
                                    value={behavior.safetyConsiderations}
                                    onChange={(e) =>
                                      updateBehavior(behavior.id, { safetyConsiderations: e.target.value })
                                    }
                                    placeholder="Any safety concerns or crisis protocols..."
                                    rows={2}
                                    className="border-destructive/50"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Additional Notes</Label>
                                  <Textarea
                                    value={behavior.notes}
                                    onChange={(e) => updateBehavior(behavior.id, { notes: e.target.value })}
                                    placeholder="Any additional relevant information..."
                                    rows={2}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
