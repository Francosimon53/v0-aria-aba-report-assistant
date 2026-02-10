"use client"

import type React from "react"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AITextarea } from "@/components/ui/ai-textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DailyScheduleTable } from "@/components/daily-schedule-table"
import { CheckCircle2Icon, DownloadIcon, FileTextIcon, SaveIcon, ArrowRightIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AssessmentTypeBadge } from "./assessment-type-badge"

const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-[150px] border rounded-lg bg-gray-50 animate-pulse" />,
})

interface BackgroundHistoryData {
  reasonForReferral: string
  developmentalMilestones: {
    motorSkills: string
    communication: string
    social: string
    regressions: boolean
    regressionDetails: string
  }
  educationStatus: {
    currentSchool: string
    gradeLevel: string
    hasIEP: boolean
    has504: boolean
    academicConcerns: string
    teacherReports: string
  }
  medicalHistory: {
    medications: { name: string; dosage: string }[]
    allergies: string
    conditions: string
    hospitalizations: string
    specialists: string
  }
  familyHistory: {
    familyStructure: string
    relevantHistory: string
    languagesSpoken: string
  }
  majorConcerns: string
  previousTreatments: {
    abaHistory: string
    speechTherapy: string
    otPt: string
    medicationsTried: string
    results: string
  }
  strengths: string
  weaknesses: string
}

interface BackgroundHistoryProps {
  clientData?: any
  onSave?: () => void
}

export default function BackgroundHistoryForm({ clientData, onSave }: BackgroundHistoryProps) {
  const { toast } = useToast()
  const [data, setData] = useState<BackgroundHistoryData>({
    reasonForReferral: "",
    developmentalMilestones: {
      motorSkills: "",
      communication: "",
      social: "",
      regressions: false,
      regressionDetails: "",
    },
    educationStatus: {
      currentSchool: "",
      gradeLevel: "",
      hasIEP: false,
      has504: false,
      academicConcerns: "",
      teacherReports: "",
    },
    medicalHistory: {
      medications: [],
      allergies: "",
      conditions: "",
      hospitalizations: "",
      specialists: "",
    },
    familyHistory: {
      familyStructure: "",
      relevantHistory: "",
      languagesSpoken: "",
    },
    majorConcerns: "",
    previousTreatments: {
      abaHistory: "",
      speechTherapy: "",
      otPt: "",
      medicationsTried: "",
      results: "",
    },
    strengths: "",
    weaknesses: "",
  })

  const [completedSections, setCompletedSections] = useState<string[]>([])

  // AI generation states for RichTextEditor fields
  const [isGeneratingReason, setIsGeneratingReason] = useState(false)
  const [isGeneratingMotorSkills, setIsGeneratingMotorSkills] = useState(false)
  const [isGeneratingCommunication, setIsGeneratingCommunication] = useState(false)
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    console.log("[ARIA] Loading Background & History data from localStorage")
    try {
      const stored = localStorage.getItem("aria-background-history")
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("[ARIA] Loaded Background & History data:", parsed)
        setData(parsed)
      }
    } catch (e) {
      console.error("[ARIA] Error loading background history data:", e)
    }
  }, [])

  // Auto-save data whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("[ARIA] Auto-saving Background & History data")
      localStorage.setItem("aria-background-history", JSON.stringify(data))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [data])

  const updateField = (section: keyof BackgroundHistoryData, field: string, value: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }))
  }

  const addMedication = () => {
    setData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: [...prev.medicalHistory.medications, { name: "", dosage: "" }],
      },
    }))
  }

  const removeMedication = (index: number) => {
    setData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        medications: prev.medicalHistory.medications.filter((_, i) => i !== index),
      },
    }))
  }

  const markSectionComplete = (section: string) => {
    if (!completedSections.includes(section)) {
      setCompletedSections([...completedSections, section])
    }
  }

  const handleSave = () => {
    localStorage.setItem("aria-background-history", JSON.stringify(data))
    toast({
      title: "Draft Saved",
      description: "Background & history has been saved successfully",
    })
    if (onSave) {
      onSave()
    }
  }

  const handleImport = () => {
    // Mock import from previous assessment
    toast({
      title: "Import Available",
      description: "Click to import data from previous assessment",
    })
  }

  const totalSections = 9
  const completedCount = completedSections?.length ?? 0

  // AI generation handler for RichTextEditor fields
  const generateAIContent = async (fieldName: string) => {
    console.log("[v0] AI generation started for field:", fieldName)

    const stateMap: Record<string, [boolean, React.Dispatch<React.SetStateAction<boolean>>, string]> = {
      reasonForReferral: [isGeneratingReason, setIsGeneratingReason, "reasonForReferral"],
      motorSkills: [isGeneratingMotorSkills, setIsGeneratingMotorSkills, "developmentalMilestones.motorSkills"],
      communication: [isGeneratingCommunication, setIsGeneratingCommunication, "developmentalMilestones.communication"],
      social: [isGeneratingSocial, setIsGeneratingSocial, "developmentalMilestones.social"],
    }

    const [, setIsGenerating, dataPath] = stateMap[fieldName] || []
    if (!setIsGenerating) {
      console.error("[v0] No state setter found for field:", fieldName)
      return
    }

    setIsGenerating(true)

    try {
      console.log("[v0] Calling AI API with context:", { fieldName, currentData: data })

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate professional ABA assessment content for the field: ${fieldName}. Context: Client background and history assessment.`,
            },
          ],
          isTextGeneration: true, // Get long-form responses
          clientData: data,
          currentStep: fieldName,
        }),
      })

      if (!response.ok) {
        console.error("[v0] AI API response not OK:", response.status, response.statusText)
        throw new Error("Failed to generate content")
      }

      const result = await response.json()
      console.log("[v0] AI generation successful, content length:", result.message?.length)

      // Update the appropriate field
      if (fieldName === "reasonForReferral") {
        setData({ ...data, reasonForReferral: result.message })
      } else if (dataPath.includes("developmentalMilestones")) {
        const field = dataPath.split(".")[1]
        setData({
          ...data,
          developmentalMilestones: {
            ...data.developmentalMilestones,
            [field]: result.message,
          },
        })
      }
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      toast({
        title: "AI Generation Failed",
        description: "Please try again or fill in the field manually.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Background & History</h1>
            <p className="text-muted-foreground mt-1">Comprehensive developmental and clinical history</p>
          </div>
          <AssessmentTypeBadge />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleImport} className="gap-2 bg-transparent">
            <DownloadIcon className="h-4 w-4" />
            Import Previous
          </Button>
          <Button onClick={handleSave} className="gap-2 bg-[#0D9488] hover:bg-[#0a6b62]">
            <SaveIcon className="h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-[#0D9488]/10 to-cyan-50 border-[#0D9488]/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <Badge variant="secondary" className="bg-[#0D9488] text-white">
              {completedCount} of {totalSections} sections
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#0D9488] h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalSections) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="space-y-6 pr-4">
          {/* 1. Reason for Referral */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-[#0D9488]" />
                  <CardTitle>Reason for Referral</CardTitle>
                </div>
                {completedSections.includes("referral") && <CheckCircle2Icon className="h-5 w-5 text-green-500" />}
              </div>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={data.reasonForReferral}
                onChange={(html) => {
                  setData({ ...data, reasonForReferral: html })
                  if (html.length > 50) markSectionComplete("referral")
                }}
                placeholder="Include presenting concerns, who referred the client, chief complaints, and goals for treatment..."
                onAIGenerate={() => generateAIContent("reasonForReferral")}
                isGenerating={isGeneratingReason}
              />
            </CardContent>
          </Card>

          {/* 2. Background Information - Accordion Sections */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-[#0D9488]" />
                Background Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full space-y-2">
                {/* Developmental Milestones */}
                <AccordionItem value="milestones" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Developmental Milestones</span>
                      {completedSections.includes("milestones") && (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label>Motor Skills (walking, fine motor development)</Label>
                      <RichTextEditor
                        value={data.developmentalMilestones.motorSkills}
                        onChange={(html) => {
                          updateField("developmentalMilestones", "motorSkills", html)
                          if (html.length > 20) markSectionComplete("milestones")
                        }}
                        placeholder="Describe motor skill development..."
                        onAIGenerate={() => generateAIContent("motorSkills")}
                        isGenerating={isGeneratingMotorSkills}
                      />
                    </div>
                    <div>
                      <Label>Communication (first words, current language level)</Label>
                      <RichTextEditor
                        value={data.developmentalMilestones.communication}
                        onChange={(html) => updateField("developmentalMilestones", "communication", html)}
                        placeholder="Describe communication milestones..."
                        onAIGenerate={() => generateAIContent("communication")}
                        isGenerating={isGeneratingCommunication}
                      />
                    </div>
                    <div>
                      <Label>Social (eye contact, joint attention, peer interaction)</Label>
                      <RichTextEditor
                        value={data.developmentalMilestones.social}
                        onChange={(html) => updateField("developmentalMilestones", "social", html)}
                        placeholder="Describe social development..."
                        onAIGenerate={() => generateAIContent("social")}
                        isGenerating={isGeneratingSocial}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="regressions"
                        checked={data.developmentalMilestones.regressions}
                        onCheckedChange={(checked) => updateField("developmentalMilestones", "regressions", checked)}
                      />
                      <Label htmlFor="regressions" className="font-normal cursor-pointer">
                        Any regressions noted?
                      </Label>
                    </div>
                    {data.developmentalMilestones.regressions && (
                      <AITextarea
                        fieldName="Developmental Regressions"
                        value={data.developmentalMilestones.regressionDetails}
                        onChange={(e) => updateField("developmentalMilestones", "regressionDetails", e.target.value)}
                        onValueChange={(value) => updateField("developmentalMilestones", "regressionDetails", value)}
                        placeholder="Describe regression details (when, what skills lost, circumstances)..."
                        className="mt-2"
                      />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Education Status */}
                <AccordionItem value="education" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Education Status</span>
                      {completedSections.includes("education") && (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Current School/Program</Label>
                        <Input
                          value={data.educationStatus.currentSchool}
                          onChange={(e) => {
                            updateField("educationStatus", "currentSchool", e.target.value)
                            if (e.target.value) markSectionComplete("education")
                          }}
                          placeholder="School name"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Grade Level</Label>
                        <Input
                          value={data.educationStatus.gradeLevel}
                          onChange={(e) => updateField("educationStatus", "gradeLevel", e.target.value)}
                          placeholder="e.g., 3rd grade"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasIEP"
                          checked={data.educationStatus.hasIEP}
                          onCheckedChange={(checked) => updateField("educationStatus", "hasIEP", checked)}
                        />
                        <Label htmlFor="hasIEP" className="font-normal cursor-pointer">
                          Has IEP
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has504"
                          checked={data.educationStatus.has504}
                          onCheckedChange={(checked) => updateField("educationStatus", "has504", checked)}
                        />
                        <Label htmlFor="has504" className="font-normal cursor-pointer">
                          Has 504 Plan
                        </Label>
                      </div>
                    </div>
                    <div>
                      <Label>Academic Concerns</Label>
                      <AITextarea
                        fieldName="Education Status - Academic Concerns"
                        value={data.educationStatus.academicConcerns}
                        onChange={(e) => updateField("educationStatus", "academicConcerns", e.target.value)}
                        onValueChange={(value) => updateField("educationStatus", "academicConcerns", value)}
                        placeholder="Reading, math, behavior in classroom, etc."
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Teacher Reports</Label>
                      <AITextarea
                        fieldName="Education Status - Teacher Reports"
                        value={data.educationStatus.teacherReports}
                        onChange={(e) => updateField("educationStatus", "teacherReports", e.target.value)}
                        onValueChange={(value) => updateField("educationStatus", "teacherReports", value)}
                        placeholder="Summary of teacher feedback and observations..."
                        className="mt-1.5"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Medical History */}
                <AccordionItem value="medical" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Medical History</span>
                      {completedSections.includes("medical") && <CheckCircle2Icon className="h-4 w-4 text-green-500" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label>Current Medications</Label>
                      <div className="space-y-2 mt-2">
                        {data.medicalHistory.medications.map((med, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="Medication name"
                              value={med.name}
                              onChange={(e) => {
                                const newMeds = [...data.medicalHistory.medications]
                                newMeds[index].name = e.target.value
                                updateField("medicalHistory", "medications", newMeds)
                                if (e.target.value) markSectionComplete("medical")
                              }}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Dosage"
                              value={med.dosage}
                              onChange={(e) => {
                                const newMeds = [...data.medicalHistory.medications]
                                newMeds[index].dosage = e.target.value
                                updateField("medicalHistory", "medications", newMeds)
                              }}
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedication(index)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addMedication} className="w-full bg-transparent">
                          + Add Medication
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Allergies</Label>
                      <RichTextEditor
                        value={data.medicalHistory.allergies}
                        onChange={(html) => updateField("medicalHistory", "allergies", html)}
                        placeholder="Food, medication, environmental allergies..."
                        fieldName="Medical History - Allergies"
                      />
                    </div>
                    <div>
                      <Label>Medical Conditions</Label>
                      <RichTextEditor
                        value={data.medicalHistory.conditions}
                        onChange={(html) => updateField("medicalHistory", "conditions", html)}
                        placeholder="Chronic conditions, diagnoses, etc."
                        fieldName="Medical History - Conditions"
                      />
                    </div>
                    <div>
                      <Label>Hospitalizations</Label>
                      <RichTextEditor
                        value={data.medicalHistory.hospitalizations}
                        onChange={(html) => updateField("medicalHistory", "hospitalizations", html)}
                        placeholder="Past hospitalizations, surgeries, or emergency visits..."
                        fieldName="Medical History - Hospitalizations"
                      />
                    </div>
                    <div>
                      <Label>Specialists Currently Seeing</Label>
                      <RichTextEditor
                        value={data.medicalHistory.specialists}
                        onChange={(html) => updateField("medicalHistory", "specialists", html)}
                        placeholder="Neurologist, psychiatrist, developmental pediatrician, etc."
                        fieldName="Medical History - Specialists"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Family History */}
                <AccordionItem value="family" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Family History</span>
                      {completedSections.includes("family") && <CheckCircle2Icon className="h-4 w-4 text-green-500" />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label>Family Structure</Label>
                      <RichTextEditor
                        value={data.familyHistory.familyStructure}
                        onChange={(html) => {
                          updateField("familyHistory", "familyStructure", html)
                          if (html.length > 20) markSectionComplete("family")
                        }}
                        placeholder="Parents, siblings, living situation, custody arrangements..."
                        fieldName="Family History - Family Structure"
                      />
                    </div>
                    <div>
                      <Label>Relevant Psychiatric/Developmental History</Label>
                      <RichTextEditor
                        value={data.familyHistory.relevantHistory}
                        onChange={(html) => updateField("familyHistory", "relevantHistory", html)}
                        placeholder="Family history of ASD, ADHD, learning disabilities, mental health conditions..."
                        fieldName="Family History - Relevant History"
                      />
                    </div>
                    <div>
                      <Label>Languages Spoken at Home</Label>
                      <RichTextEditor
                        value={data.familyHistory.languagesSpoken}
                        onChange={(html) => updateField("familyHistory", "languagesSpoken", html)}
                        placeholder="English, Spanish, bilingual household, etc."
                        fieldName="Family History - Languages Spoken"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Major Concerns */}
                <AccordionItem value="concerns" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Major Concerns</span>
                      {completedSections.includes("concerns") && (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <RichTextEditor
                      value={data.majorConcerns}
                      onChange={(html) => {
                        setData({ ...data, majorConcerns: html })
                        if (html.length > 50) markSectionComplete("concerns")
                      }}
                      placeholder="List current problem behaviors, impact on daily life, safety concerns, previous incidents..."
                      fieldName="Major Concerns"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Previous/Current Treatments */}
                <AccordionItem value="treatments" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Previous/Current Treatments</span>
                      {completedSections.includes("treatments") && (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div>
                      <Label>ABA History</Label>
                      <AITextarea
                        fieldName="Previous Treatments - ABA History"
                        value={data.previousTreatments.abaHistory}
                        onChange={(e) => {
                          updateField("previousTreatments", "abaHistory", e.target.value)
                          if (e.target.value.length > 20) markSectionComplete("treatments")
                        }}
                        onValueChange={(value) => {
                          updateField("previousTreatments", "abaHistory", value)
                          if (value.length > 20) markSectionComplete("treatments")
                        }}
                        placeholder="When, where, duration, hours per week, progress made..."
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Speech Therapy</Label>
                      <AITextarea
                        fieldName="Previous Treatments - Speech Therapy"
                        value={data.previousTreatments.speechTherapy}
                        onChange={(e) => updateField("previousTreatments", "speechTherapy", e.target.value)}
                        onValueChange={(value) => updateField("previousTreatments", "speechTherapy", value)}
                        placeholder="Duration, frequency, areas addressed, progress..."
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>OT/PT</Label>
                      <AITextarea
                        fieldName="Previous Treatments - OT/PT"
                        value={data.previousTreatments.otPt}
                        onChange={(e) => updateField("previousTreatments", "otPt", e.target.value)}
                        onValueChange={(value) => updateField("previousTreatments", "otPt", value)}
                        placeholder="Occupational or physical therapy history..."
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Medications Tried</Label>
                      <AITextarea
                        fieldName="Previous Treatments - Medications Tried"
                        value={data.previousTreatments.medicationsTried}
                        onChange={(e) => updateField("previousTreatments", "medicationsTried", e.target.value)}
                        onValueChange={(value) => updateField("previousTreatments", "medicationsTried", value)}
                        placeholder="Previous medications and durations..."
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Results of Each Treatment</Label>
                      <AITextarea
                        fieldName="Previous Treatments - Results"
                        value={data.previousTreatments.results}
                        onChange={(e) => updateField("previousTreatments", "results", e.target.value)}
                        onValueChange={(value) => updateField("previousTreatments", "results", value)}
                        placeholder="What worked, what didn't, reasons for discontinuation..."
                        className="mt-1.5"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Strengths */}
                <AccordionItem value="strengths" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Strengths</span>
                      {completedSections.includes("strengths") && (
                        <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <AITextarea
                      fieldName="Strengths"
                      value={data.strengths}
                      onChange={(e) => {
                        setData({ ...data, strengths: e.target.value })
                        if (e.target.value.length > 30) markSectionComplete("strengths")
                      }}
                      onValueChange={(value) => {
                        setData({ ...data, strengths: value })
                        if (value.length > 30) markSectionComplete("strengths")
                      }}
                      placeholder="Child's areas of strength, preferred activities, motivators, learning style..."
                      className="min-h-[100px]"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Weaknesses */}
                <AccordionItem value="weaknesses" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Weaknesses & Skill Deficits</span>
                      {completedSections.includes("weaknesses") && (
                        <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <AITextarea
                      fieldName="Weaknesses"
                      value={data.weaknesses}
                      onChange={(e) => {
                        setData({ ...data, weaknesses: e.target.value })
                        if (e.target.value.length > 30) markSectionComplete("weaknesses")
                      }}
                      onValueChange={(value) => {
                        setData({ ...data, weaknesses: value })
                        if (value.length > 30) markSectionComplete("weaknesses")
                      }}
                      placeholder="Skill deficits, challenging situations, areas needing improvement..."
                      className="min-h-[100px]"
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* 3. Daily Schedule Table */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-[#0D9488]" />
                  <CardTitle>Daily Schedule</CardTitle>
                </div>
                {completedSections.includes("schedule") && <CheckCircle2Icon className="h-5 w-5 text-green-500" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Document the client's typical daily routine and activities
              </p>
            </CardHeader>
            <CardContent>
              <DailyScheduleTable
                onSave={(scheduleData) => {
                  markSectionComplete("schedule")
                  toast({
                    title: "Schedule Saved",
                    description: "Daily schedule has been added to background history",
                  })
                }}
              />
            </CardContent>
          </Card>

          {/* Continue button at the bottom right */}
          <div className="flex justify-end mt-6 pb-6">
            <Button
              onClick={() => {
                if (onSave) onSave()
                toast({
                  title: "Progress Saved",
                  description: "Moving to the next section...",
                })
              }}
              className="gap-2 bg-[#0D9488] hover:bg-[#0a6b62] text-white px-6"
              size="lg"
            >
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { BackgroundHistoryForm as BackgroundHistory }
