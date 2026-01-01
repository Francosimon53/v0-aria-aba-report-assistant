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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  SaveIcon,
  AlertCircleIcon,
  ClipboardListIcon,
  Sparkles,
} from "@/components/icons"
import type { ReassessmentData, AssessmentData, ClientData } from "@/lib/types"
import { assessmentTypes } from "@/lib/data/assessment-types"
import { useToast } from "@/hooks/use-toast"
import { ImportDataModal } from "./import-data-modal"
import { parseReassessmentDataFile } from "@/lib/import-parsers"

interface ReassessmentFormProps {
  clientData: ClientData | null
  previousAssessment: AssessmentData | null
  reassessmentData: ReassessmentData | null
  onSave: (data: ReassessmentData) => void
  onNext: () => void
  onBack: () => void
}

export function ReassessmentForm({
  clientData,
  previousAssessment,
  reassessmentData,
  onSave,
  onNext,
  onBack,
}: ReassessmentFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ReassessmentData>>(
    reassessmentData || {
      id: crypto.randomUUID(),
      clientId: clientData?.id || "",
      reassessmentDate: new Date().toISOString().split("T")[0],
      reassessmentType: "",
      previousAssessmentId: "",
      domains: [],
      progressSummary: "",
      goalsMetCount: 0,
      goalsContinuedCount: 0,
      newGoalsCount: 0,
      revisedHoursRecommended: previousAssessment?.hoursRecommended || 0,
      hoursJustification: "",
      recommendationChanges: [],
    },
  )

  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>(reassessmentData?.reassessmentType || "")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importType, setImportType] = useState<"scores" | "progress" | "graphs">("scores")

  const handleSave = () => {
    if (!formData.reassessmentDate || !formData.reassessmentType) {
      toast({
        title: "Missing Information",
        description: "Please fill in the reassessment date and type.",
        variant: "destructive",
      })
      return
    }

    onSave(formData as ReassessmentData)
    toast({
      title: "Reassessment Saved",
      description: "Your reassessment data has been saved successfully.",
    })
  }

  const handleNext = () => {
    handleSave()
    onNext()
  }

  const updateDomain = (index: number, field: string, value: any) => {
    const newDomains = [...(formData.domains || [])]
    newDomains[index] = { ...newDomains[index], [field]: value }
    setFormData({ ...formData, domains: newDomains })
  }

  const currentAssessmentType = assessmentTypes.find((t) => t.id === selectedAssessmentType)

  const handleImport = async (file: File) => {
    try {
      const importedData = await parseReassessmentDataFile(file, importType)

      setFormData({
        ...formData,
        ...importedData,
      })

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importType} data from ${file.name}`,
      })

      setIsImportModalOpen(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import data",
        variant: "destructive",
      })
    }
  }

  const handleAIDataExtracted = (extractedData: any) => {
    if (extractedData.reassessmentData) {
      setFormData({
        ...formData,
        ...extractedData.reassessmentData,
      })
      toast({
        title: "Data Imported",
        description: "Reassessment data has been imported successfully.",
      })
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reassessment</h2>
            <p className="text-sm text-muted-foreground mt-1">Track progress and update treatment recommendations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Import Data
            </Button>
            {previousAssessment && (
              <Badge variant="secondary" className="text-xs">
                Last assessed: {new Date(previousAssessment.assessmentDate).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            {!previousAssessment && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">No Previous Assessment</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Complete an initial assessment before conducting a reassessment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="progress">Progress Review</TabsTrigger>
                <TabsTrigger value="domains">Domain Scores</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reassessment Information</CardTitle>
                    <CardDescription>Enter the basic details of this reassessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reassessmentDate">Reassessment Date</Label>
                        <Input
                          id="reassessmentDate"
                          type="date"
                          value={formData.reassessmentDate}
                          onChange={(e) => setFormData({ ...formData, reassessmentDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assessmentType">Assessment Type</Label>
                        <Select
                          value={selectedAssessmentType}
                          onValueChange={(value) => {
                            setSelectedAssessmentType(value)
                            setFormData({
                              ...formData,
                              reassessmentType: value,
                              domains:
                                assessmentTypes
                                  .find((t) => t.id === value)
                                  ?.domains.map((d) => ({
                                    domain: d,
                                    score: 0,
                                    maxScore: 100,
                                    notes: "",
                                  })) || [],
                            })
                          }}
                        >
                          <SelectTrigger id="assessmentType">
                            <SelectValue placeholder="Select assessment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {assessmentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="revisedHours">Revised Hours Recommended (per week)</Label>
                      <Input
                        id="revisedHours"
                        type="number"
                        min="0"
                        max="40"
                        value={formData.revisedHoursRecommended}
                        onChange={(e) => setFormData({ ...formData, revisedHoursRecommended: Number(e.target.value) })}
                      />
                      {previousAssessment && (
                        <p className="text-xs text-muted-foreground">
                          Previous recommendation: {previousAssessment.hoursRecommended} hours/week
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hoursJustification">Hours Justification</Label>
                      <Textarea
                        id="hoursJustification"
                        placeholder="Explain any changes to recommended hours..."
                        value={formData.hoursJustification}
                        onChange={(e) => setFormData({ ...formData, hoursJustification: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Goal Progress Summary</CardTitle>
                    <CardDescription>Document progress on treatment goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="goalsMet">Goals Met</Label>
                        <Input
                          id="goalsMet"
                          type="number"
                          min="0"
                          value={formData.goalsMetCount}
                          onChange={(e) => setFormData({ ...formData, goalsMetCount: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goalsContinued">Goals Continued</Label>
                        <Input
                          id="goalsContinued"
                          type="number"
                          min="0"
                          value={formData.goalsContinuedCount}
                          onChange={(e) => setFormData({ ...formData, goalsContinuedCount: Number(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newGoals">New Goals</Label>
                        <Input
                          id="newGoals"
                          type="number"
                          min="0"
                          value={formData.newGoalsCount}
                          onChange={(e) => setFormData({ ...formData, newGoalsCount: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="progressSummary">Overall Progress Summary</Label>
                      <Textarea
                        id="progressSummary"
                        placeholder="Summarize the client's overall progress since the last assessment..."
                        value={formData.progressSummary}
                        onChange={(e) => setFormData({ ...formData, progressSummary: e.target.value })}
                        rows={6}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="domains" className="space-y-6">
                {currentAssessmentType ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{currentAssessmentType.name} - Domain Scores</CardTitle>
                          <CardDescription>Enter current scores for each domain</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImportType("scores")
                            setIsImportModalOpen(true)
                          }}
                          className="gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Import Scores
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(formData.domains || []).map((domain, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{domain.domain}</h4>
                            {previousAssessment?.domains?.[index] && (
                              <Badge variant="outline" className="text-xs">
                                Previous: {previousAssessment.domains[index].score}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Score</Label>
                              <Input
                                type="number"
                                min="0"
                                max={domain.maxScore}
                                value={domain.score}
                                onChange={(e) => updateDomain(index, "score", Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Notes</Label>
                              <Input
                                placeholder="Progress notes..."
                                value={domain.notes}
                                onChange={(e) => updateDomain(index, "notes", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground py-8">
                        <ClipboardListIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Select an assessment type to enter domain scores</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSave}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
            <Button onClick={handleNext}>
              Continue to Goals
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetSection="reassessmentData"
        onDataExtracted={handleAIDataExtracted}
      />
    </div>
  )
}
